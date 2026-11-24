$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

$root = Split-Path -Parent $PSScriptRoot
$solution = Join-Path $root "DesignSystem.slnx"
$project = Join-Path $root "src/DesignSystem.Razor/DesignSystem.Razor.csproj"
$contractTests = Join-Path $root "tests/DesignSystem.ContractTests/DesignSystem.ContractTests.csproj"
$output = Join-Path $root "artifacts/package"
$manifest = Get-Content -LiteralPath (Join-Path $root "src/DesignSystem.Razor/wwwroot/tokens/design-system.tokens.json") -Raw | ConvertFrom-Json
$version = $manifest.version
$consumerRoot = $null
$consumerProcess = $null
$portableRoot = $null
$harnessProcess = $null
$harnessStdOut = $null
$harnessStdErr = $null
$browserProfile = $null

Push-Location $root
try {
    $sdk = (& dotnet --version).Trim()
    if ($sdk -ne "10.0.400") {
        throw "Expected .NET SDK 10.0.400, found $sdk."
    }

    & (Join-Path $PSScriptRoot "audit.ps1")
    node (Join-Path $PSScriptRoot "audit-contrast.mjs")
    Get-ChildItem -LiteralPath (Join-Path $root "src/DesignSystem.Razor/wwwroot/js") -Recurse -Filter *.js |
        ForEach-Object { node --check $_.FullName }

    if (Test-Path -LiteralPath $output) {
        Remove-Item -LiteralPath $output -Recurse -Force
    }
    New-Item -ItemType Directory -Path $output -Force | Out-Null

    dotnet restore $solution
    dotnet build $solution --configuration Release --no-restore
    dotnet run --project $contractTests --configuration Release --no-build

    $browser = $env:DESIGN_SYSTEM_BROWSER
    if ([string]::IsNullOrWhiteSpace($browser)) {
        $browser = @(
            'C:/Program Files/Google/Chrome/Application/chrome.exe',
            'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
            'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
        ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    }
    if ([string]::IsNullOrWhiteSpace($browser) -or -not (Test-Path -LiteralPath $browser)) {
        throw 'A Chromium browser is required for the interaction smoke. Set DESIGN_SYSTEM_BROWSER to its executable path.'
    }

    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $harnessPort = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
    $listener.Stop()
    $harnessUrl = "http://127.0.0.1:$harnessPort"
    $harnessAssembly = Join-Path $root 'tests/DesignSystem.VisualHarness/bin/Release/net10.0/DesignSystem.VisualHarness.dll'
    $harnessStdOut = Join-Path ([IO.Path]::GetTempPath()) "design-system-harness-$([Guid]::NewGuid().ToString('N')).stdout.log"
    $harnessStdErr = [IO.Path]::ChangeExtension($harnessStdOut, '.stderr.log')
    $harnessProcess = Start-Process -FilePath 'dotnet' -ArgumentList @("`"$harnessAssembly`"", '--urls', $harnessUrl) `
        -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $harnessStdOut -RedirectStandardError $harnessStdErr -PassThru
    $harnessReady = $false
    for ($attempt = 0; $attempt -lt 40 -and -not $harnessReady; $attempt++) {
        if ($harnessProcess.HasExited) { throw 'The visual harness exited before the browser smoke.' }
        try { $harnessReady = (Invoke-WebRequest -Uri $harnessUrl -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200 }
        catch { Start-Sleep -Milliseconds 200 }
    }
    if (-not $harnessReady) { throw 'The visual harness did not become ready for the browser smoke.' }

    $browserProfile = Join-Path ([IO.Path]::GetTempPath()) "design-system-browser-$([Guid]::NewGuid().ToString('N'))"
    $browserDump = Join-Path $browserProfile 'dump.html'
    $browserError = Join-Path $browserProfile 'browser.stderr.log'
    New-Item -ItemType Directory -Path $browserProfile | Out-Null
    $browserProcess = Start-Process -FilePath $browser -ArgumentList @(
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        "--user-data-dir=$browserProfile", '--virtual-time-budget=5000', '--dump-dom', "$harnessUrl/?smoke=1"
    ) -WindowStyle Hidden -RedirectStandardOutput $browserDump -RedirectStandardError $browserError -PassThru -Wait
    $browserMarkup = Get-Content -LiteralPath $browserDump -Raw
    if ($browserProcess.ExitCode -ne 0 -or -not $browserMarkup.Contains('data-harness-interactions="passed"', [StringComparison]::Ordinal)) {
        $browserDiagnostics = Get-Content -LiteralPath $browserError -Raw -ErrorAction SilentlyContinue
        throw "The system-wide browser interaction smoke failed.$([Environment]::NewLine)$browserDiagnostics$([Environment]::NewLine)$browserMarkup"
    }
    Write-Output 'System-wide browser interaction smoke passed.'
    Stop-Process -Id $harnessProcess.Id
    Wait-Process -Id $harnessProcess.Id -ErrorAction SilentlyContinue
    $harnessProcess = $null

    dotnet pack $project --configuration Release --no-build --output $output

    $package = Join-Path $output "DesignSystem.Razor.$version.nupkg"
    $symbols = Join-Path $output "DesignSystem.Razor.$version.snupkg"
    if (-not (Test-Path -LiteralPath $package) -or
        -not (Test-Path -LiteralPath $symbols)) {
        throw "Expected library and symbol packages were not produced."
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($package)
    try {
        $packagedAssets = @($archive.Entries | Where-Object { $_.FullName.StartsWith('staticwebassets/', [StringComparison]::Ordinal) } |
            ForEach-Object { $_.FullName.Substring('staticwebassets/'.Length) } | Sort-Object)
        $sourceAssets = @(Get-ChildItem -LiteralPath (Join-Path $root "src/DesignSystem.Razor/wwwroot") -Recurse -File |
            ForEach-Object { [IO.Path]::GetRelativePath((Join-Path $root "src/DesignSystem.Razor/wwwroot"), $_.FullName).Replace('\', '/') } | Sort-Object)
        if (Compare-Object $sourceAssets $packagedAssets -CaseSensitive) {
            throw "The NuGet static-web-asset graph differs from the source graph."
        }
        foreach ($requiredEntry in 'README.md', 'LICENSE', 'THIRD-PARTY-NOTICES.md') {
            if (@($archive.Entries | Where-Object FullName -CEQ $requiredEntry).Count -ne 1) {
                throw "The NuGet package must contain exactly one $requiredEntry."
            }
        }
        if (@($archive.Entries | Where-Object { $_.FullName -match '(^|/)(?:tests?|documentation|artifacts|bin|obj|global\.json)(/|$)' }).Count -gt 0) {
            throw "The NuGet package contains workspace, test, or generated files."
        }
    }
    finally {
        $archive.Dispose()
    }

    $consumerRoot = Join-Path ([IO.Path]::GetTempPath()) "design-system-package-consumer-$([Guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Path $consumerRoot | Out-Null
    $consumerProject = Join-Path $consumerRoot "DesignSystem.PackageConsumer.csproj"
    $consumerPackages = Join-Path $consumerRoot '.packages'
    $escapedOutput = [Security.SecurityElement]::Escape($output)
    [IO.File]::WriteAllText($consumerProject, @"
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="DesignSystem.Razor" Version="$version" />
  </ItemGroup>
</Project>
"@)
    [IO.File]::WriteAllText((Join-Path $consumerRoot "Program.cs"), @"
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();

var app = builder.Build();
app.UseStaticFiles();
app.MapRazorPages();
app.Run();
"@)
    $consumerPages = Join-Path $consumerRoot 'Pages'
    New-Item -ItemType Directory -Path $consumerPages | Out-Null
    [IO.File]::WriteAllText((Join-Path $consumerPages '_ViewImports.cshtml'), @'
@using DesignSystem.Razor
@using DesignSystem.Razor.Models
@addTagHelper *, DesignSystem.Razor
'@)
    [IO.File]::WriteAllText((Join-Path $consumerPages 'Index.cshtml'), @'
@page
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="design-system-version" content="@DesignSystemInfo.Version" />
    <design-system-assets />
</head>
<body>
    <design-system-picker model="@(new PickerModel(
        "package-picker",
        "package-picker",
        "Package picker",
        new[] { new PickerOption("example", "Example") }))" />
</body>
</html>
'@)
    dotnet restore $consumerProject --source $escapedOutput --packages $consumerPackages
    dotnet build $consumerProject --configuration Release --no-restore
    $consumerPublish = Join-Path $consumerRoot 'publish'
    dotnet publish $consumerProject --configuration Release --no-restore --output $consumerPublish
    $publishedEntry = Join-Path $consumerPublish 'wwwroot/_content/DesignSystem.Razor/css/design-system.css'
    if (-not (Test-Path -LiteralPath $publishedEntry)) {
        throw 'The fresh consumer publish did not contain the design-system static assets.'
    }

    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $consumerPort = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
    $listener.Stop()
    $consumerUrl = "http://127.0.0.1:$consumerPort"
    $consumerAssembly = Join-Path $consumerPublish 'DesignSystem.PackageConsumer.dll'
    $consumerStdOut = Join-Path $consumerRoot 'consumer.stdout.log'
    $consumerStdErr = Join-Path $consumerRoot 'consumer.stderr.log'
    $consumerProcess = Start-Process -FilePath 'dotnet' `
        -ArgumentList @($consumerAssembly, '--urls', $consumerUrl, '--contentRoot', $consumerPublish) `
        -WorkingDirectory $consumerPublish `
        -WindowStyle Hidden `
        -RedirectStandardOutput $consumerStdOut `
        -RedirectStandardError $consumerStdErr `
        -PassThru

    $consumerResponse = $null
    for ($attempt = 0; $attempt -lt 40 -and $null -eq $consumerResponse; $attempt++) {
        if ($consumerProcess.HasExited) {
            $consumerFailure = @(
                Get-Content -LiteralPath $consumerStdOut -Raw -ErrorAction SilentlyContinue
                Get-Content -LiteralPath $consumerStdErr -Raw -ErrorAction SilentlyContinue
            ) -join [Environment]::NewLine
            throw "The packaged Razor consumer exited before responding.$([Environment]::NewLine)$consumerFailure"
        }
        try {
            $consumerResponse = Invoke-WebRequest -Uri $consumerUrl -UseBasicParsing -TimeoutSec 1
        }
        catch {
            Start-Sleep -Milliseconds 200
        }
    }
    if ($null -eq $consumerResponse -or $consumerResponse.StatusCode -ne 200) {
        throw 'The packaged Razor consumer did not return a successful page.'
    }
    foreach ($requiredMarkup in @(
        ('content="' + $version + '"'),
        'data-design-system-picker',
        ('/_content/DesignSystem.Razor/css/design-system.css?v=' + $version),
        ('/_content/DesignSystem.Razor/js/design-system.js?v=' + $version),
        'data-design-system-entry',
        'root.dataset.designSystemRuntime = "loading"'
    )) {
        if (-not $consumerResponse.Content.Contains($requiredMarkup, [StringComparison]::Ordinal)) {
            throw "The packaged Razor consumer is missing '$requiredMarkup'. Returned HTML:$([Environment]::NewLine)$($consumerResponse.Content)"
        }
    }
    if ($consumerResponse.Content.Contains('<design-system-', [StringComparison]::Ordinal)) {
        throw 'A public design system Tag Helper reached the browser without rendering.'
    }

    $servedAssetCount = 0
    $runtimeAssets = @('css/design-system.css', 'js/design-system.js') + @(
        $sourceAssets | Where-Object { $_ -match '^(?:css|js)/' -and $_ -notin @('css/design-system.css', 'js/design-system.js') }
    )
    foreach ($asset in $runtimeAssets) {
        $assetUrl = "${consumerUrl}/_content/DesignSystem.Razor/${asset}?v=$version"
        try {
            $assetResponse = Invoke-WebRequest -Uri $assetUrl -UseBasicParsing -TimeoutSec 5
        }
        catch {
            throw "Packaged asset '$asset' could not be served from '$assetUrl': $($_.Exception.Message)"
        }
        if ($assetResponse.StatusCode -ne 200) {
            throw "Packaged asset '$asset' did not return HTTP 200 from the fresh consumer."
        }
        $servedAssetCount++
    }
    Write-Output "Served $servedAssetCount packaged CSS and JavaScript assets from the fresh consumer."

    Write-Output "Consumed and rendered the design system $version from NuGet on .NET 10."
    Stop-Process -Id $consumerProcess.Id
    Wait-Process -Id $consumerProcess.Id -ErrorAction SilentlyContinue
    $consumerProcess = $null

    $portableRoot = Join-Path ([IO.Path]::GetTempPath()) "design-system-portable-$([Guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Path $portableRoot | Out-Null
    foreach ($file in Get-ChildItem -LiteralPath $root -Recurse -File) {
        $relative = [IO.Path]::GetRelativePath($root, $file.FullName)
        if ($relative -match '(^|[\\/])(?:artifacts|bin|obj|\.git)([\\/]|$)') { continue }
        $destination = Join-Path $portableRoot $relative
        $destinationDirectory = Split-Path -Parent $destination
        if (-not (Test-Path -LiteralPath $destinationDirectory)) {
            New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        }
        Copy-Item -LiteralPath $file.FullName -Destination $destination
    }
    Push-Location $portableRoot
    try {
        dotnet restore "DesignSystem.slnx"
        dotnet build "DesignSystem.slnx" --configuration Release --no-restore
    }
    finally {
        Pop-Location
    }

    Write-Output "The design system verification passed with SDK $sdk."
}
finally {
    Pop-Location
    if ($null -ne $consumerProcess -and -not $consumerProcess.HasExited) {
        Stop-Process -Id $consumerProcess.Id -ErrorAction SilentlyContinue
        Wait-Process -Id $consumerProcess.Id -ErrorAction SilentlyContinue
    }
    if ($null -ne $harnessProcess -and -not $harnessProcess.HasExited) {
        Stop-Process -Id $harnessProcess.Id -ErrorAction SilentlyContinue
        Wait-Process -Id $harnessProcess.Id -ErrorAction SilentlyContinue
    }
    foreach ($temporaryRoot in @($consumerRoot, $portableRoot)) {
        if (-not [string]::IsNullOrWhiteSpace($temporaryRoot) -and
            $temporaryRoot.StartsWith([IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase) -and
            (Test-Path -LiteralPath $temporaryRoot)) {
            Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
        }
    }
    if (-not [string]::IsNullOrWhiteSpace($browserProfile) -and
        $browserProfile.StartsWith([IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $browserProfile)) {
        Remove-Item -LiteralPath $browserProfile -Recurse -Force
    }
    foreach ($harnessLog in @($harnessStdOut, $harnessStdErr)) {
        if (-not [string]::IsNullOrWhiteSpace($harnessLog) -and
            $harnessLog.StartsWith([IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase) -and
            (Test-Path -LiteralPath $harnessLog)) {
            Remove-Item -LiteralPath $harnessLog -Force
        }
    }
}
