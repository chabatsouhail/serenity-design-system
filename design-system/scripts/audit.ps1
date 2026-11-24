$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$library = Join-Path $root "src/DesignSystem.Razor"
$webRoot = Join-Path $library "wwwroot"
$cssRoot = Join-Path $webRoot "css"
$entryPath = Join-Path $cssRoot "design-system.css"
$manifestPath = Join-Path $webRoot "tokens/design-system.tokens.json"
$componentManifestPath = Join-Path $webRoot "components/design-system.components.json"
$errors = [System.Collections.Generic.List[string]]::new()

function Add-AuditError([string]$message) {
    $errors.Add($message)
}

if (-not (Test-Path -LiteralPath $manifestPath)) {
    Add-AuditError "Missing public token manifest."
}
if (-not (Test-Path -LiteralPath $componentManifestPath)) {
    Add-AuditError "Missing public component manifest."
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$foundationGroups = @($manifest.foundationGroups)
$supportingPrimitiveGroups = @($manifest.supportingPrimitiveGroups)
$primitiveGroups = @($foundationGroups + $supportingPrimitiveGroups)
$componentGroups = @($manifest.componentGroups)
$componentManifest = Get-Content -LiteralPath $componentManifestPath -Raw | ConvertFrom-Json
$projectText = Get-Content -LiteralPath (Join-Path $library "DesignSystem.Razor.csproj") -Raw
$identityText = Get-Content -LiteralPath (Join-Path $library "DesignSystemInfo.cs") -Raw
$scriptEntryText = Get-Content -LiteralPath (Join-Path $webRoot "js/design-system.js") -Raw
$projectVersion = [regex]::Match($projectText, '<Version>(?<value>[^<]+)</Version>').Groups['value'].Value
$identityVersion = [regex]::Match($identityText, 'Version\s*=\s*"(?<value>[^"]+)"').Groups['value'].Value
$scriptVersion = [regex]::Match($scriptEntryText, "VERSION\s*=\s*'(?<value>[^']+)'").Groups['value'].Value
if ([string]::IsNullOrWhiteSpace($projectVersion) -or
    $projectVersion -cne $manifest.version -or
    $projectVersion -cne $componentManifest.version -or
    $projectVersion -cne $identityVersion -or
    $projectVersion -cne $scriptVersion) {
    Add-AuditError "Package, assembly, JavaScript, and public manifests must share one version."
}
$expectedCatalogCounts = [ordered]@{ Actions = 4; Fields = 11; Navigation = 7; Data = 8; Feedback = 9; Overlays = 7 }
if ($componentManifest.version -cne $manifest.version) {
    Add-AuditError "Token and component manifests have different versions."
}
foreach ($group in $expectedCatalogCounts.Keys) {
    $catalogGroup = @($componentManifest.groups | Where-Object name -CEQ $group)
    if ($catalogGroup.Count -ne 1 -or @($catalogGroup[0].components).Count -ne $expectedCatalogCounts[$group]) {
        Add-AuditError "Component manifest group '$group' must contain exactly $($expectedCatalogCounts[$group]) destinations."
    }
}
if (@($componentManifest.groups.components).Count -ne 46) {
    Add-AuditError "The component manifest must contain exactly 46 destinations."
}
$libraryContractText = @(Get-ChildItem -LiteralPath $library -Recurse -File | Where-Object {
    $_.FullName -notmatch '[\\/](?:bin|obj)[\\/]' -and $_.Extension -in '.css', '.js', '.cs', '.cshtml'
} | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw }) -join "`n"
$harnessPath = Join-Path $root "tests/DesignSystem.VisualHarness/Pages/Index.cshtml"
$harnessText = Get-Content -LiteralPath $harnessPath -Raw
$componentSlugs = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($component in $componentManifest.groups.components) {
    if ([string]::IsNullOrWhiteSpace($component.slug) -or $component.slug -cnotmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$' -or -not $componentSlugs.Add($component.slug)) {
        Add-AuditError "Component '$($component.name)' requires one unique kebab-case slug."
    }
    $anchors = @([regex]::Matches($component.selector, '(?:\.(?<class>design-system-[a-z0-9_-]+)|\[(?<hook>data-design-system-[a-z0-9-]+))') | ForEach-Object {
        if ($_.Groups['class'].Success) { $_.Groups['class'].Value } else { $_.Groups['hook'].Value }
    } | Sort-Object -Unique)
    if ($anchors.Count -eq 0) {
        Add-AuditError "Component '$($component.name)' has no public implementation anchor."
    }
    foreach ($literal in $anchors) {
        if (-not $libraryContractText.Contains($literal, [StringComparison]::Ordinal)) {
            Add-AuditError "Component '$($component.name)' is missing implementation anchor '$literal'."
        }
    }
    $harnessMarker = "data-harness-component=`"$($component.slug)`""
    if (@([regex]::Matches($harnessText, [regex]::Escape($harnessMarker))).Count -ne 1) {
        Add-AuditError "Component '$($component.name)' must have exactly one '$harnessMarker' specimen."
    }
}

$expectedTagHelperTargets = @(
    'design-system-alert',
    'design-system-assets',
    'design-system-badge',
    'design-system-button',
    'design-system-date-picker',
    'design-system-empty-state',
    'design-system-file-upload',
    'design-system-icon',
    'design-system-pagination',
    'design-system-picker',
    'design-system-scripts',
    'design-system-spinner',
    'design-system-styles',
    'design-system-theme-bootstrap',
    'design-system-theme-toggle',
    'design-system-toast-host'
)
$tagHelperText = @(Get-ChildItem -LiteralPath (Join-Path $library 'TagHelpers') -Filter *.cs -File |
    ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw }) -join "`n"
$actualTagHelperTargets = @([regex]::Matches($tagHelperText, 'HtmlTargetElement\("(?<tag>design-system-[a-z0-9-]+)"') |
    ForEach-Object { $_.Groups['tag'].Value } | Sort-Object -Unique)
if (Compare-Object $expectedTagHelperTargets $actualTagHelperTargets -CaseSensitive) {
    Add-AuditError 'The public Tag Helper targets do not match the rendering architecture contract.'
}

$designSystemViews = Join-Path $library 'Pages/Shared/DesignSystem'
$publicPartialFiles = @(Get-ChildItem -LiteralPath $designSystemViews -File -Filter *.cshtml)
if ($publicPartialFiles.Count -gt 0) {
    Add-AuditError 'Pages/Shared/DesignSystem may contain no directly invokable public partials.'
}
$expectedInternalRenderers = @(
    '_DatePicker.cshtml',
    '_EmptyState.cshtml',
    '_FileUpload.cshtml',
    '_Pagination.cshtml',
    '_Picker.cshtml',
    '_ThemeToggle.cshtml',
    '_ToastHost.cshtml'
)
$actualInternalRenderers = @(Get-ChildItem -LiteralPath (Join-Path $designSystemViews 'Internal') -File -Filter *.cshtml |
    ForEach-Object Name | Sort-Object)
if (Compare-Object $expectedInternalRenderers $actualInternalRenderers -CaseSensitive) {
    Add-AuditError 'Internal Razor renderers do not match the controlled component contract.'
}
if ($libraryContractText -match '<partial\s+name="DesignSystem/_|PartialAsync\("DesignSystem/_') {
    Add-AuditError 'Library consumers must not be given a second public partial-view component API.'
}

$iconContractPath = Join-Path $library "Contracts/IconName.cs"
$iconStylePath = Join-Path $cssRoot "foundations/iconography.css"
$iconContractText = Get-Content -LiteralPath $iconContractPath -Raw
$iconStyleText = Get-Content -LiteralPath $iconStylePath -Raw
$iconContractValues = @([regex]::Matches($iconContractText, 'IconName\.[A-Za-z0-9_]+\s*=>\s*"(?<value>[a-z0-9]+(?:-[a-z0-9]+)*)"') |
    ForEach-Object { $_.Groups['value'].Value })
$iconMappings = @([regex]::Matches($iconStyleText, 'data-design-system-icon="(?<value>[a-z0-9]+(?:-[a-z0-9]+)*)"[^}]+url\("\.\./\.\./icons/(?<file>[a-z0-9]+(?:-[a-z0-9]+)*)\.svg"\)') |
    ForEach-Object { [pscustomobject]@{ Value = $_.Groups['value'].Value; File = $_.Groups['file'].Value } })
$iconAssets = @(Get-ChildItem -LiteralPath (Join-Path $webRoot "icons") -Filter *.svg | ForEach-Object BaseName)
foreach ($set in @(
    [pscustomobject]@{ Name = 'Icon contract values'; Values = $iconContractValues },
    [pscustomobject]@{ Name = 'Icon CSS mappings'; Values = @($iconMappings.Value) },
    [pscustomobject]@{ Name = 'Packaged icon assets'; Values = $iconAssets }
)) {
    if (@($set.Values | Sort-Object -Unique).Count -ne @($set.Values).Count) {
        Add-AuditError "$($set.Name) contain duplicate identities."
    }
}
if (Compare-Object ($iconContractValues | Sort-Object) ($iconAssets | Sort-Object) -CaseSensitive) {
    Add-AuditError "IconName contract values and packaged SVG basenames must match exactly."
}
if (Compare-Object ($iconContractValues | Sort-Object) (@($iconMappings.Value) | Sort-Object) -CaseSensitive) {
    Add-AuditError "IconName contract values and iconography CSS mappings must match exactly."
}
foreach ($mapping in $iconMappings) {
    if ($mapping.Value -cne $mapping.File) {
        Add-AuditError "Icon '$($mapping.Value)' maps to a differently named asset '$($mapping.File)'."
    }
}

$fontStylePath = Join-Path $cssRoot 'foundations/fonts.css'
$fontStyleText = Get-Content -LiteralPath $fontStylePath -Raw
$fontContracts = [ordered]@{
    'ibm-plex-sans/regular.woff2' = [pscustomobject]@{ Hash = 'BA711A3085FF9F27440B6B9C4550CFC47C97BF36591D5DA958B975BB3ADD8C1A'; Family = 'IBM Plex Sans'; Style = 'normal'; Weight = '400' }
    'ibm-plex-sans/italic.woff2' = [pscustomobject]@{ Hash = '13284FAB1821BA6E3652C1580FCF2BBFD8C9309520C69B3D1224DAB40B37C597'; Family = 'IBM Plex Sans'; Style = 'italic'; Weight = '400' }
    'ibm-plex-sans/medium.woff2' = [pscustomobject]@{ Hash = '5660F8A658F8BB50DBC005232F885EADFFD2BC1C235C4F6FBB63469D1F9CDE6D'; Family = 'IBM Plex Sans'; Style = 'normal'; Weight = '500' }
    'ibm-plex-sans/medium-italic.woff2' = [pscustomobject]@{ Hash = '16F11AB3543E3D1E2704407378AAFA4DDB570AD11F6A476EEAA4EC6E67FC30E8'; Family = 'IBM Plex Sans'; Style = 'italic'; Weight = '500' }
    'ibm-plex-sans/semibold.woff2' = [pscustomobject]@{ Hash = 'F78048030EAB62E860EFA39A0DF79E2E5581BF122EB95B9BC42C0B8A4988D205'; Family = 'IBM Plex Sans'; Style = 'normal'; Weight = '600' }
    'ibm-plex-sans/semibold-italic.woff2' = [pscustomobject]@{ Hash = 'D875A0705B4596532250BEEB66D9A2B8866A25F78B5B249B3D3293B5F922E50E'; Family = 'IBM Plex Sans'; Style = 'italic'; Weight = '600' }
    'ibm-plex-sans/bold.woff2' = [pscustomobject]@{ Hash = 'FA7130D854A660B39A7FC9E6E0F2DC23DBA5F1346E2ADEA3E1FE37B6D884133D'; Family = 'IBM Plex Sans'; Style = 'normal'; Weight = '700' }
    'ibm-plex-sans/bold-italic.woff2' = [pscustomobject]@{ Hash = '73D57000EE0FA7D6E1DD3A9FE5901C2D7C71904AF9A935DBBC1D44ABC9574C1F'; Family = 'IBM Plex Sans'; Style = 'italic'; Weight = '700' }
    'ibm-plex-mono/regular.woff2' = [pscustomobject]@{ Hash = '49CE58B41A0E1CB921C0F58D9A5B8B96A2CC21437C7066F3BA4F24873076D131'; Family = 'IBM Plex Mono'; Style = 'normal'; Weight = '400' }
    'ibm-plex-mono/italic.woff2' = [pscustomobject]@{ Hash = '6AFC2A6EDD9A1D1F8104DAF139A5062392F47DA2F97FE19CB18A6A5A1FA67EC3'; Family = 'IBM Plex Mono'; Style = 'italic'; Weight = '400' }
    'ibm-plex-mono/medium.woff2' = [pscustomobject]@{ Hash = '8C2C290CBD998FA1F647E4572ACA6EBBD72589551B0F3F9F8BB8628FBB8219D5'; Family = 'IBM Plex Mono'; Style = 'normal'; Weight = '500' }
    'ibm-plex-mono/medium-italic.woff2' = [pscustomobject]@{ Hash = 'C82B35693328411C756B51C7B5CB48B6CD1F4F24A0B1261857831B137E6202B5'; Family = 'IBM Plex Mono'; Style = 'italic'; Weight = '500' }
    'ibm-plex-mono/semibold.woff2' = [pscustomobject]@{ Hash = 'ED5EACA7522336959D6C3810BD9BB78424F0D964082D581BFBEA169EE08D14E3'; Family = 'IBM Plex Mono'; Style = 'normal'; Weight = '600' }
    'ibm-plex-mono/semibold-italic.woff2' = [pscustomobject]@{ Hash = 'E5C910DE162E970D4237D5050DF1AB58CAED903CBB9F9B3EC07D0ED26FB4CADE'; Family = 'IBM Plex Mono'; Style = 'italic'; Weight = '600' }
    'ibm-plex-mono/bold.woff2' = [pscustomobject]@{ Hash = '5788454F0BA4BD6300752C474215C4DD926682FA173AE1C6252D57828B6A235D'; Family = 'IBM Plex Mono'; Style = 'normal'; Weight = '700' }
    'ibm-plex-mono/bold-italic.woff2' = [pscustomobject]@{ Hash = 'B0BFAA05C90C662C164CA0515EC42BADDAC93129EAB1AF067F8872D84F10DF46'; Family = 'IBM Plex Mono'; Style = 'italic'; Weight = '700' }
    'ibm-plex-serif/regular.woff2' = [pscustomobject]@{ Hash = '8E1906E5BD1C981F7FB837540A95A754E86524F317AB4523976406B6A4128B6B'; Family = 'IBM Plex Serif'; Style = 'normal'; Weight = '400' }
    'ibm-plex-serif/italic.woff2' = [pscustomobject]@{ Hash = 'EAEBF4B31EA65B071A3EFF38B7832084436E62D6E0E6A7D4BFBC6DC4D31C013D'; Family = 'IBM Plex Serif'; Style = 'italic'; Weight = '400' }
    'ibm-plex-serif/medium.woff2' = [pscustomobject]@{ Hash = '2EB75E035155EA1D0805FAFAA012F7083E5034F935F17CFCC650B17BDF530C2D'; Family = 'IBM Plex Serif'; Style = 'normal'; Weight = '500' }
    'ibm-plex-serif/medium-italic.woff2' = [pscustomobject]@{ Hash = '4E2F4ABD7970EC8D957041100DAC8EEE78E70EFB94BFE3E4356628B833E78A30'; Family = 'IBM Plex Serif'; Style = 'italic'; Weight = '500' }
    'ibm-plex-serif/semibold.woff2' = [pscustomobject]@{ Hash = '45495BA3E86AEDE56963E08D20FEAA30C789A87C774A6C1C8313D25EBD63BE69'; Family = 'IBM Plex Serif'; Style = 'normal'; Weight = '600' }
    'ibm-plex-serif/semibold-italic.woff2' = [pscustomobject]@{ Hash = '01584D4356EC3492524AF961FA45FC967FAC4C1A971AD5BD51B05323E51ECF51'; Family = 'IBM Plex Serif'; Style = 'italic'; Weight = '600' }
    'ibm-plex-serif/bold.woff2' = [pscustomobject]@{ Hash = '1BA2FA015458F36EFE822137627F75DF1EE340E6D1C0D92C7CA5A3B423DB75D9'; Family = 'IBM Plex Serif'; Style = 'normal'; Weight = '700' }
    'ibm-plex-serif/bold-italic.woff2' = [pscustomobject]@{ Hash = 'CF7E4359CDFC697D90EA785091A9FA289DB8F064AED5C099001B08DBA97C1805'; Family = 'IBM Plex Serif'; Style = 'italic'; Weight = '700' }
}
$fontRoot = Join-Path $webRoot 'fonts'
$actualFontFiles = @(Get-ChildItem -LiteralPath (Join-Path $fontRoot 'ibm-plex-sans'), (Join-Path $fontRoot 'ibm-plex-mono'), (Join-Path $fontRoot 'ibm-plex-serif') -File -Filter *.woff2 |
    ForEach-Object { [IO.Path]::GetRelativePath($fontRoot, $_.FullName).Replace('\', '/') } | Sort-Object)
if (Compare-Object @($fontContracts.Keys | Sort-Object) $actualFontFiles -CaseSensitive) {
    Add-AuditError 'Packaged IBM Plex Sans, IBM Plex Serif, and IBM Plex Mono webfont files must match the approved 400, 500, 600, and 700 normal/italic set.'
}
foreach ($relativeFontPath in $fontContracts.Keys) {
    $contract = $fontContracts[$relativeFontPath]
    $fontPath = Join-Path $fontRoot $relativeFontPath
    if (-not (Test-Path -LiteralPath $fontPath) -or (Get-FileHash -LiteralPath $fontPath -Algorithm SHA256).Hash -cne $contract.Hash) {
        Add-AuditError "$relativeFontPath does not match the pinned official IBM Plex 1.1.0 asset."
        continue
    }
    $fontUrl = '../../fonts/' + $relativeFontPath
    $facePattern = '(?s)@font-face\s*\{(?=[^}]*font-family:\s*"' + [regex]::Escape($contract.Family) + '")(?=[^}]*src:\s*url\("' + [regex]::Escape($fontUrl) + '"\)\s*format\("woff2"\))(?=[^}]*font-style:\s*' + $contract.Style + ')(?=[^}]*font-weight:\s*' + $contract.Weight + ')[^}]*\}'
    if ($fontStyleText -cnotmatch $facePattern) {
        Add-AuditError "$relativeFontPath is not registered as $($contract.Family) $($contract.Weight) $($contract.Style) in foundations/fonts.css."
    }
}
if (@([regex]::Matches($fontStyleText, '@font-face\s*\{')).Count -ne $fontContracts.Count) {
    Add-AuditError 'foundations/fonts.css must contain exactly one @font-face for every approved IBM Plex asset.'
}

$expectedFoundationGroups = @("color", "typography", "spacing", "sizing", "layout", "shape", "elevation", "icons", "motion", "timing")
$expectedSupportingPrimitiveGroups = @("opacity")
$expectedDensityModes = @("compact", "normal", "relaxed")
$expectedComponentGroups = @(
    "button", "shell", "table", "textarea", "number-field", "choice", "switch", "picker", "date-picker",
    "navigation-list", "badge", "status", "card", "toast", "progress", "spinner", "skeleton", "empty-state", "tooltip"
)

if (Compare-Object $expectedFoundationGroups $foundationGroups -CaseSensitive) {
    Add-AuditError "The Foundation Group manifest does not match the architecture contract."
}
if (Compare-Object $expectedSupportingPrimitiveGroups $supportingPrimitiveGroups -CaseSensitive) {
    Add-AuditError "The Supporting Primitive Group manifest must contain exactly Opacity."
}
if (Compare-Object $expectedDensityModes @($manifest.densityModes) -CaseSensitive) {
    Add-AuditError "The Density Mode manifest must contain exactly Compact, Normal, and Relaxed."
}
if (Compare-Object $expectedComponentGroups $componentGroups -CaseSensitive) {
    Add-AuditError "The Component Group manifest does not match the architecture contract."
}
if ($manifest.naming.primitive -cne "--design-system-primitive-{primitive-group}-{optional-property-or-family}-{value}" -or
    $manifest.naming.semantic -cne "--design-system-semantic-{foundation-group}-{role}-{property}-{optional-variant}-{optional-tone}-{optional-state}" -or
    $manifest.naming.semanticTypography -cne "--design-system-semantic-typography-{type-style}" -or
    $manifest.naming.component -cne "--design-system-component-{component-group}-{property}-{optional-variant}-{optional-tone}-{optional-state}") {
    Add-AuditError "The public token naming formulas do not match the architecture contract."
}

foreach ($group in $expectedFoundationGroups) {
    foreach ($level in "primitive", "semantic") {
        if (-not (Test-Path -LiteralPath (Join-Path $cssRoot "tokens/$level/$group.css"))) {
            Add-AuditError "Missing $level token source for Foundation Group '$group'."
        }
    }
}
foreach ($group in $expectedSupportingPrimitiveGroups) {
    if (-not (Test-Path -LiteralPath (Join-Path $cssRoot "tokens/primitive/$group.css"))) {
        Add-AuditError "Missing Primitive token source for Supporting Primitive Group '$group'."
    }
    if (Test-Path -LiteralPath (Join-Path $cssRoot "tokens/semantic/$group.css")) {
        Add-AuditError "Supporting Primitive Group '$group' must not publish a Semantic token source."
    }
}
foreach ($group in $expectedComponentGroups) {
    if (-not (Test-Path -LiteralPath (Join-Path $cssRoot "tokens/component/$group.css"))) {
        Add-AuditError "Missing token source for Component Group '$group'."
    }
}
$actualComponentGroupFiles = @(Get-ChildItem -LiteralPath (Join-Path $cssRoot "tokens/component") -Filter *.css |
    ForEach-Object { $_.BaseName })
if (Compare-Object $expectedComponentGroups $actualComponentGroupFiles -CaseSensitive) {
    Add-AuditError "Component token sources must match the declared actual-component groups exactly."
}
$cssFiles = @(Get-ChildItem -LiteralPath $cssRoot -Recurse -Filter *.css | Sort-Object FullName)
$tokenFiles = @($cssFiles | Where-Object { $_.FullName -like "*\css\tokens\*" })

$allDeclarations = @{}
$baseDeclarations = @{}
$uses = [System.Collections.Generic.List[object]]::new()

foreach ($file in $cssFiles) {
    $relative = [IO.Path]::GetRelativePath($root, $file.FullName).Replace('\', '/')
    $text = Get-Content -LiteralPath $file.FullName -Raw

    if ($text -match '--ds-|\.ds-|data-ds-|<ds-') {
        Add-AuditError "$relative contains a retired public identity."
    }

    if ($file.FullName -ne (Join-Path $cssRoot "tokens/primitive/color.css")) {
        $withoutComments = [regex]::Replace($text, '/\*[\s\S]*?\*/', '')
        if ($withoutComments -match '#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(') {
            Add-AuditError "$relative contains a raw color outside the Color Primitive Group."
        }
    }

    $declarationMatches = [regex]::Matches($text, '(?m)(?<name>--design-system-(?<level>primitive|semantic|component)-[a-z0-9-]+)\s*:\s*(?<value>[^;]+);')
    foreach ($match in $declarationMatches) {
        $name = $match.Groups['name'].Value
        $level = $match.Groups['level'].Value
        $value = $match.Groups['value'].Value.Trim()
        if (-not $allDeclarations.ContainsKey($name)) {
            $allDeclarations[$name] = [System.Collections.Generic.List[object]]::new()
        }
        $allDeclarations[$name].Add([pscustomobject]@{ Path = $relative; Level = $level; Value = $value })
        if ($relative -notlike 'src/*/wwwroot/css/tokens/themes/*' -and $relative -notlike 'src/*/wwwroot/css/tokens/modes/*') {
            if ($baseDeclarations.ContainsKey($name)) {
                Add-AuditError "$name has more than one base owner."
            } else {
                $baseDeclarations[$name] = [pscustomobject]@{ Path = $relative; Level = $level; Value = $value }
            }
        }
    }

    foreach ($match in [regex]::Matches($text, 'var\(\s*(?<name>--design-system-(?:primitive|semantic|component)-[a-z0-9-]+)')) {
        $uses.Add([pscustomobject]@{ Name = $match.Groups['name'].Value; Path = $relative })
    }
}

foreach ($name in $baseDeclarations.Keys) {
    $declaration = $baseDeclarations[$name]
    $parts = $name.Substring('--design-system-'.Length).Split('-')
    $level = $declaration.Level
    if ($level -eq 'primitive') {
        if ($parts.Count -lt 3 -or $parts[0] -ne 'primitive' -or $primitiveGroups -notcontains $parts[1]) {
            Add-AuditError "$name does not follow the Primitive naming contract."
        }
        if ($declaration.Value -match 'var\(') {
            Add-AuditError "$name is Primitive but aliases another token."
        }
    } elseif ($level -eq 'semantic') {
        $isCompositeTypographyStyle = $name.StartsWith('--design-system-semantic-typography-', [StringComparison]::Ordinal)
        if (($parts.Count -lt 4 -and -not $isCompositeTypographyStyle) -or $foundationGroups -notcontains $parts[1]) {
            Add-AuditError "$name does not follow the Semantic naming contract."
        }
    } elseif ($level -eq 'component') {
        $matchingComponentGroups = @($componentGroups |
            Where-Object { $name.StartsWith("--design-system-component-$_-", [StringComparison]::Ordinal) } |
            Sort-Object { $_.Length } -Descending)
        if ($parts.Count -lt 3 -or $matchingComponentGroups.Count -eq 0) {
            Add-AuditError "$name does not follow the Component naming contract."
        } else {
            $owningComponentGroup = $matchingComponentGroups[0]
            if ($declaration.Path -cne "src/DesignSystem.Razor/wwwroot/css/tokens/component/$owningComponentGroup.css") {
                Add-AuditError "$name is not owned by its longest exact Component Group '$owningComponentGroup'."
            }
        }
    }
}

$expectedValueNamedPrimitiveTokens = [ordered]@{
    '--design-system-primitive-typography-family-ibm-plex-sans' = '"IBM Plex Sans", "Segoe UI", Arial, sans-serif'
    '--design-system-primitive-typography-family-ibm-plex-serif' = '"IBM Plex Serif", Georgia, "Times New Roman", serif'
    '--design-system-primitive-typography-family-ibm-plex-mono' = '"IBM Plex Mono", "Cascadia Code", "SFMono-Regular", Consolas, monospace'
    '--design-system-primitive-typography-style-normal' = 'normal'
    '--design-system-primitive-typography-style-italic' = 'italic'
    '--design-system-primitive-typography-size-11' = '11px'
    '--design-system-primitive-typography-size-12' = '12px'
    '--design-system-primitive-typography-size-13' = '13px'
    '--design-system-primitive-typography-size-14' = '14px'
    '--design-system-primitive-typography-size-16' = '16px'
    '--design-system-primitive-typography-size-20' = '20px'
    '--design-system-primitive-typography-size-28' = '28px'
    '--design-system-primitive-typography-line-height-1' = '1'
    '--design-system-primitive-typography-line-height-1-25' = '1.25'
    '--design-system-primitive-typography-line-height-1-5' = '1.5'
    '--design-system-primitive-typography-weight-400' = '400'
    '--design-system-primitive-typography-weight-500' = '500'
    '--design-system-primitive-typography-weight-600' = '600'
    '--design-system-primitive-typography-weight-700' = '700'
    '--design-system-primitive-typography-underline-offset-0-2em' = '.2em'
    '--design-system-primitive-spacing-0' = '0'
    '--design-system-primitive-spacing-2' = '2px'
    '--design-system-primitive-spacing-4' = '4px'
    '--design-system-primitive-spacing-6' = '6px'
    '--design-system-primitive-spacing-8' = '8px'
    '--design-system-primitive-spacing-10' = '10px'
    '--design-system-primitive-spacing-12' = '12px'
    '--design-system-primitive-spacing-14' = '14px'
    '--design-system-primitive-spacing-16' = '16px'
    '--design-system-primitive-spacing-20' = '20px'
    '--design-system-primitive-spacing-24' = '24px'
    '--design-system-primitive-spacing-32' = '32px'
    '--design-system-primitive-spacing-48' = '48px'
    '--design-system-primitive-sizing-24' = '24px'
    '--design-system-primitive-sizing-30' = '30px'
    '--design-system-primitive-sizing-34' = '34px'
    '--design-system-primitive-sizing-44' = '44px'
    '--design-system-primitive-sizing-56' = '56px'
    '--design-system-primitive-shape-radius-6' = '6px'
    '--design-system-primitive-shape-radius-8' = '8px'
    '--design-system-primitive-shape-radius-10' = '10px'
    '--design-system-primitive-shape-radius-12' = '12px'
    '--design-system-primitive-shape-radius-999' = '999px'
    '--design-system-primitive-shape-border-width-0-5' = '.5px'
    '--design-system-primitive-shape-border-width-1' = '1px'
    '--design-system-primitive-shape-border-width-2' = '2px'
    '--design-system-primitive-icons-size-14' = '14px'
    '--design-system-primitive-icons-size-16' = '16px'
    '--design-system-primitive-icons-size-20' = '20px'
    '--design-system-primitive-layout-measure-48ch' = '48ch'
    '--design-system-primitive-layout-measure-72ch' = '72ch'
    '--design-system-primitive-layout-measure-180' = '180px'
    '--design-system-primitive-layout-measure-1180' = '1180px'
    '--design-system-primitive-motion-scale-0-5' = '.5'
    '--design-system-primitive-motion-scale-0-95' = '.95'
    '--design-system-primitive-motion-scale-0-97' = '.97'
    '--design-system-primitive-timing-duration-0-01ms' = '.01ms'
    '--design-system-primitive-timing-duration-80ms' = '80ms'
    '--design-system-primitive-timing-duration-120ms' = '120ms'
    '--design-system-primitive-timing-duration-200ms' = '200ms'
    '--design-system-primitive-timing-easing-cubic-bezier-0-2-0-0-1' = 'cubic-bezier(.2, 0, 0, 1)'
    '--design-system-primitive-timing-easing-cubic-bezier-0-0-0-2-1' = 'cubic-bezier(0, 0, .2, 1)'
    '--design-system-primitive-elevation-shadow-0-12-30' = '0 12px 30px'
    '--design-system-primitive-elevation-shadow-0-20-60' = '0 20px 60px'
    '--design-system-primitive-elevation-layer-20' = '20'
    '--design-system-primitive-elevation-layer-40' = '40'
    '--design-system-primitive-elevation-layer-50' = '50'
    '--design-system-primitive-elevation-layer-70' = '70'
    '--design-system-primitive-elevation-layer-90' = '90'
    '--design-system-primitive-opacity-14' = '14%'
    '--design-system-primitive-opacity-22' = '22%'
    '--design-system-primitive-opacity-34' = '34%'
    '--design-system-primitive-opacity-48' = '48%'
    '--design-system-primitive-opacity-58' = '58%'
}
$valueNamedPrimitiveGroups = @('typography', 'spacing', 'sizing', 'shape', 'icons', 'layout', 'motion', 'timing', 'elevation', 'opacity')
foreach ($group in $valueNamedPrimitiveGroups) {
    $prefix = "--design-system-primitive-$group-"
    $expectedNames = @($expectedValueNamedPrimitiveTokens.Keys | Where-Object { $_.StartsWith($prefix, [StringComparison]::Ordinal) } | Sort-Object)
    $actualNames = @($baseDeclarations.Keys | Where-Object { $_.StartsWith($prefix, [StringComparison]::Ordinal) } | Sort-Object)
    if (Compare-Object $expectedNames $actualNames -CaseSensitive) {
        Add-AuditError "Primitive $group Tokens must use their serialized Values, not purpose or size labels."
    }
}
foreach ($name in $expectedValueNamedPrimitiveTokens.Keys) {
    if (-not $baseDeclarations.ContainsKey($name) -or $baseDeclarations[$name].Value -cne $expectedValueNamedPrimitiveTokens[$name]) {
        Add-AuditError "$name must keep the Value encoded by its name: $($expectedValueNamedPrimitiveTokens[$name])."
    }
}

$expectedElevationEffectTokens = [ordered]@{
    '--design-system-semantic-elevation-overlay-shadow' = 'var(--design-system-primitive-elevation-shadow-0-12-30) color-mix(in srgb, var(--design-system-primitive-color-gray-950) var(--design-system-primitive-opacity-14), transparent)'
    '--design-system-semantic-elevation-dialog-shadow' = 'var(--design-system-primitive-elevation-shadow-0-20-60) color-mix(in srgb, var(--design-system-primitive-color-gray-950) var(--design-system-primitive-opacity-22), transparent)'
    '--design-system-semantic-elevation-scrim-background' = 'color-mix(in srgb, var(--design-system-primitive-color-gray-950) var(--design-system-primitive-opacity-34), transparent)'
}
foreach ($name in $expectedElevationEffectTokens.Keys) {
    if (-not $baseDeclarations.ContainsKey($name) -or
        $baseDeclarations[$name].Path -cne 'src/DesignSystem.Razor/wwwroot/css/tokens/semantic/elevation.css' -or
        $baseDeclarations[$name].Value -cne $expectedElevationEffectTokens[$name]) {
        Add-AuditError "$name must be owned by Semantic Elevation and preserve its approved Light Theme composition."
    }
}
if (@($baseDeclarations.Keys | Where-Object {
    $_ -like '--design-system-semantic-color-shadow-*' -or $_ -ceq '--design-system-semantic-color-overlay-background-scrim'
}).Count -gt 0) {
    Add-AuditError 'Color must not own Shadow or Scrim Semantic tokens; those effects belong to Elevation.'
}

$readingTypeStyleSources = [ordered]@{
    'heading-1' = @('style-normal', 'weight-500', 'size-28', 'line-height-1-25', 'family-ibm-plex-sans')
    'heading-2' = @('style-normal', 'weight-500', 'size-20', 'line-height-1-25', 'family-ibm-plex-sans')
    'heading-3' = @('style-normal', 'weight-500', 'size-16', 'line-height-1-25', 'family-ibm-plex-sans')
    'heading-4' = @('style-normal', 'weight-500', 'size-14', 'line-height-1-25', 'family-ibm-plex-sans')
    'body-small' = @('style-normal', 'weight-400', 'size-12', 'line-height-1-5', 'family-ibm-plex-sans')
    'body' = @('style-normal', 'weight-400', 'size-13', 'line-height-1-5', 'family-ibm-plex-sans')
    'body-large' = @('style-normal', 'weight-400', 'size-14', 'line-height-1-5', 'family-ibm-plex-sans')
    'caption' = @('style-normal', 'weight-400', 'size-11', 'line-height-1-5', 'family-ibm-plex-sans')
    'code' = @('style-normal', 'weight-400', 'size-12', 'line-height-1-5', 'family-ibm-plex-mono')
}
$interfaceTypeStyleSources = [ordered]@{
    'label' = @('style-normal', 'weight-500', 'size-12', 'line-height-1-5', 'family-ibm-plex-sans')
    'label-compact' = @('style-normal', 'weight-500', 'size-12', 'line-height-1', 'family-ibm-plex-sans')
    'caption-compact' = @('style-normal', 'weight-500', 'size-11', 'line-height-1', 'family-ibm-plex-sans')
    'control' = @('style-normal', 'weight-400', 'size-13', 'line-height-1', 'family-ibm-plex-sans')
    'action-small' = @('style-normal', 'weight-500', 'size-12', 'line-height-1', 'family-ibm-plex-sans')
    'action' = @('style-normal', 'weight-500', 'size-13', 'line-height-1', 'family-ibm-plex-sans')
    'action-large' = @('style-normal', 'weight-500', 'size-14', 'line-height-1', 'family-ibm-plex-sans')
}
if (Compare-Object @($readingTypeStyleSources.Keys) @($manifest.typographyReadingStyles) -CaseSensitive) {
    Add-AuditError 'The public Typography Reading Type Style manifest does not match the documented reading hierarchy.'
}
if (Compare-Object @($interfaceTypeStyleSources.Keys) @($manifest.typographyInterfaceStyles) -CaseSensitive) {
    Add-AuditError 'The public Typography Interface Type Style manifest does not match the reusable interface treatments.'
}
if ($null -ne $manifest.PSObject.Properties['typographyTextTreatments'] -or
    $null -ne $manifest.naming.PSObject.Properties['semanticTypographyTreatment']) {
    Add-AuditError 'Typography must not publish a standalone Text Treatment contract; relative Weight changes consume Primitive Weight tokens directly.'
}
$typeStyleSources = [ordered]@{}
foreach ($style in $readingTypeStyleSources.Keys) { $typeStyleSources[$style] = $readingTypeStyleSources[$style] }
foreach ($style in $interfaceTypeStyleSources.Keys) { $typeStyleSources[$style] = $interfaceTypeStyleSources[$style] }
$expectedSemanticTypography = [ordered]@{}
foreach ($style in $typeStyleSources.Keys) {
    $sources = $typeStyleSources[$style]
    $expectedSemanticTypography["--design-system-semantic-typography-$style"] =
        "var(--design-system-primitive-typography-$($sources[0])) var(--design-system-primitive-typography-$($sources[1])) var(--design-system-primitive-typography-$($sources[2])) / var(--design-system-primitive-typography-$($sources[3])) var(--design-system-primitive-typography-$($sources[4]))"
}
$actualSemanticTypography = @($baseDeclarations.Keys |
    Where-Object { $_.StartsWith('--design-system-semantic-typography-', [StringComparison]::Ordinal) } |
    Sort-Object)
if (Compare-Object @($expectedSemanticTypography.Keys | Sort-Object) $actualSemanticTypography -CaseSensitive) {
    Add-AuditError 'Semantic Typography tokens must contain exactly the approved complete one-token Type Styles.'
}
foreach ($name in $expectedSemanticTypography.Keys) {
    if (-not $baseDeclarations.ContainsKey($name)) { continue }
    $declaration = $baseDeclarations[$name]
    if ($declaration.Path -cne 'src/DesignSystem.Razor/wwwroot/css/tokens/semantic/typography.css' -or
        $declaration.Value -cne $expectedSemanticTypography[$name]) {
        Add-AuditError "$name must be owned by Semantic Typography and map directly to $($expectedSemanticTypography[$name])."
    }
}

$expectedPrimitiveSizingTokens = [ordered]@{
    '--design-system-primitive-sizing-24' = '24px'
    '--design-system-primitive-sizing-30' = '30px'
    '--design-system-primitive-sizing-34' = '34px'
    '--design-system-primitive-sizing-44' = '44px'
    '--design-system-primitive-sizing-56' = '56px'
}
$actualPrimitiveSizingTokens = @($baseDeclarations.Keys |
    Where-Object { $_.StartsWith('--design-system-primitive-sizing-', [StringComparison]::Ordinal) } |
    Sort-Object)
if (Compare-Object @($expectedPrimitiveSizingTokens.Keys | Sort-Object) $actualPrimitiveSizingTokens -CaseSensitive) {
    Add-AuditError 'Primitive Sizing must contain exactly the approved 24, 30, 34, 44, and 56px Values.'
}
foreach ($name in $expectedPrimitiveSizingTokens.Keys) {
    if (-not $baseDeclarations.ContainsKey($name) -or $baseDeclarations[$name].Value -cne $expectedPrimitiveSizingTokens[$name]) {
        Add-AuditError "$name must keep the approved Sizing Value $($expectedPrimitiveSizingTokens[$name])."
    }
}

$expectedSizingRoleTokens = [ordered]@{
    '--design-system-semantic-sizing-action-size-compact' = 'var(--design-system-primitive-sizing-24)'
    '--design-system-component-shell-header-height-compact' = 'var(--design-system-primitive-sizing-56)'
}
foreach ($name in $expectedSizingRoleTokens.Keys) {
    if (-not $baseDeclarations.ContainsKey($name) -or $baseDeclarations[$name].Value -cne $expectedSizingRoleTokens[$name]) {
        Add-AuditError "$name must keep the approved Sizing scale mapping $($expectedSizingRoleTokens[$name])."
    }
}

$expectedSharedSpacingTokens = [ordered]@{
    '--design-system-semantic-spacing-control-padding-inline' = 'var(--design-system-primitive-spacing-14)'
    '--design-system-semantic-spacing-item-padding-block' = 'var(--design-system-primitive-spacing-8)'
    '--design-system-semantic-spacing-item-padding-inline' = 'var(--design-system-primitive-spacing-10)'
    '--design-system-semantic-spacing-container-padding' = 'var(--design-system-primitive-spacing-16)'
}
foreach ($name in $expectedSharedSpacingTokens.Keys) {
    if (-not $baseDeclarations.ContainsKey($name) -or $baseDeclarations[$name].Value -cne $expectedSharedSpacingTokens[$name]) {
        Add-AuditError "$name must keep the approved shared Spacing mapping $($expectedSharedSpacingTokens[$name])."
    }
}

$expectedDensityTokens = [ordered]@{
    '--design-system-semantic-sizing-control-height-compact' = 'var(--design-system-primitive-sizing-30)'
    '--design-system-semantic-sizing-control-height-normal' = 'var(--design-system-primitive-sizing-34)'
    '--design-system-semantic-sizing-control-height-relaxed' = 'var(--design-system-primitive-sizing-44)'
}
foreach ($name in $expectedDensityTokens.Keys) {
    if (-not $baseDeclarations.ContainsKey($name) -or $baseDeclarations[$name].Value -cne $expectedDensityTokens[$name]) {
        Add-AuditError "$name must keep the approved Density mapping $($expectedDensityTokens[$name])."
    }
}

$densityModePath = Join-Path $cssRoot 'tokens/modes/density.css'
if (-not (Test-Path -LiteralPath $densityModePath)) {
    Add-AuditError 'Density modes require tokens/modes/density.css.'
} else {
    $densityModeText = Get-Content -LiteralPath $densityModePath -Raw
    foreach ($mode in $expectedDensityModes) {
        if (@([regex]::Matches($densityModeText, "\[data-design-system-density=`"$mode`"\]")).Count -ne 1) {
            Add-AuditError "Density mode '$mode' must have exactly one scoped selector."
        }
    }
    foreach ($mode in $expectedDensityModes) {
        $assignment = "--_design-system-density-control-height: var(--design-system-semantic-sizing-control-height-$mode);"
        if (@([regex]::Matches($densityModeText, [regex]::Escape($assignment))).Count -ne 1) {
            Add-AuditError "Density mode '$mode' must route Control Height through its exact Semantic token."
        }
    }
    if ($densityModeText -match '--_design-system-density-(?:control-padding|item-padding|container-padding)') {
        Add-AuditError 'Density modes must not route Spacing; each Semantic Spacing responsibility has one stable Value.'
    }
}


foreach ($use in $uses) {
    if (-not $baseDeclarations.ContainsKey($use.Name)) {
        Add-AuditError "$($use.Path) references undefined token $($use.Name)."
    }
}

$tokenDependencies = @{}
foreach ($name in $baseDeclarations.Keys) {
    $declaration = $baseDeclarations[$name]
    $dependencies = @([regex]::Matches($declaration.Value, 'var\(\s*(?<name>--design-system-(?:primitive|semantic|component)-[a-z0-9-]+)') |
        ForEach-Object { $_.Groups['name'].Value } | Sort-Object -Unique)
    $tokenDependencies[$name] = $dependencies
    if ($declaration.Level -eq 'semantic' -and @($dependencies | Where-Object { $_.StartsWith('--design-system-component-', [StringComparison]::Ordinal) }).Count -gt 0) {
        Add-AuditError "$name reverses the dependency graph by consuming a Component token."
    }
}

$visitState = @{}
function Visit-Token([string]$name, [string[]]$trail) {
    if ($visitState[$name] -eq 2) { return }
    if ($visitState[$name] -eq 1) {
        Add-AuditError "Token cycle detected: $([string]::Join(' -> ', @($trail + $name)))."
        return
    }
    $visitState[$name] = 1
    foreach ($dependency in @($tokenDependencies[$name])) {
        if ($baseDeclarations.ContainsKey($dependency)) {
            Visit-Token $dependency @($trail + $name)
        }
    }
    $visitState[$name] = 2
}
foreach ($name in $baseDeclarations.Keys) {
    Visit-Token $name @()
}

foreach ($file in $tokenFiles) {
    $relative = [IO.Path]::GetRelativePath($cssRoot, $file.FullName).Replace('\', '/')
    $text = Get-Content -LiteralPath $file.FullName -Raw
    if ($relative -like 'tokens/primitive/*' -and $text -notmatch '@layer\s+design-system\.primitive\s*\{') {
        Add-AuditError "$relative is not owned by the Primitive layer."
    }
    if ($relative -like 'tokens/semantic/*' -and $text -notmatch '@layer\s+design-system\.semantic\s*\{') {
        Add-AuditError "$relative is not owned by the Semantic layer."
    }
    if ($relative -like 'tokens/themes/*' -and $text -notmatch '@layer\s+design-system\.theme\s*\{') {
        Add-AuditError "$relative is not owned by the Theme layer."
    }
    if ($relative -like 'tokens/component/*' -and $text -notmatch '@layer\s+design-system\.component-tokens\s*\{') {
        Add-AuditError "$relative is not owned by the Component Token layer."
    }

    if ($relative -like 'tokens/themes/*' -or $relative -like 'tokens/modes/*') {
        foreach ($match in [regex]::Matches($text, '(?<name>--(?:design-system-(?:primitive|semantic|component)|_design-system)-[a-z0-9-]+)\s*:')) {
            $name = $match.Groups['name'].Value
            $isDensityRouter = $relative -ceq 'tokens/modes/density.css' -and
                $name -cin @(
                    '--_design-system-density-control-height'
                )
            if (-not $name.StartsWith('--design-system-semantic-', [StringComparison]::Ordinal) -and -not $isDensityRouter) {
                Add-AuditError "$relative may override Semantic tokens only."
            }
        }
        if ($text -match '(?m)^\s*\.(?:design-system|ds)-|\[data-design-system-(?!(?:theme|density)\b)') {
            Add-AuditError "$relative targets a component or behavior selector."
        }
    }
}

$primitiveTypographyOwner = Join-Path $cssRoot 'tokens/primitive/typography.css'
$semanticTypographyOwner = Join-Path $cssRoot 'tokens/semantic/typography.css'
$allowedDirectPrimitiveTypographyConsumers = @{
    'foundations/document.css' = @('--design-system-primitive-typography-underline-offset-0-2em', '--design-system-primitive-typography-weight-500')
    'components/actions/toolbar.css' = @('--design-system-primitive-typography-weight-500')
    'components/data/list.css' = @('--design-system-primitive-typography-weight-500')
    'components/data/table.css' = @('--design-system-primitive-typography-weight-500')
    'components/feedback/alert.css' = @('--design-system-primitive-typography-weight-500')
    'components/feedback/empty-state.css' = @('--design-system-primitive-typography-weight-500')
    'components/feedback/inline-message.css' = @('--design-system-primitive-typography-weight-500')
    'components/feedback/toast.css' = @('--design-system-primitive-typography-weight-500')
    'components/fields/date-picker.css' = @('--design-system-primitive-typography-weight-500')
    'components/fields/picker.css' = @('--design-system-primitive-typography-weight-500')
    'components/navigation/link.css' = @('--design-system-primitive-typography-underline-offset-0-2em', '--design-system-primitive-typography-weight-500')
    'components/navigation/menu.css' = @('--design-system-primitive-typography-weight-500')
    'components/navigation/navigation-list.css' = @('--design-system-primitive-typography-weight-500')
    'components/navigation/side-navigation.css' = @('--design-system-primitive-typography-weight-500')
    'components/navigation/tabs.css' = @('--design-system-primitive-typography-weight-500')
    'components/overlays/popover.css' = @('--design-system-primitive-typography-weight-500')
}
$matchedDirectPrimitiveTypographyConsumers = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($file in $cssFiles | Where-Object { $_.FullName -notin @($primitiveTypographyOwner, $semanticTypographyOwner) }) {
    $text = Get-Content -LiteralPath $file.FullName -Raw
    $relative = [IO.Path]::GetRelativePath($cssRoot, $file.FullName).Replace('\', '/')
    $primitiveTypographyReferences = @([regex]::Matches(
        $text,
        'var\(\s*(?<name>--design-system-primitive-typography-[a-z0-9-]+)'
    ) | ForEach-Object { $_.Groups['name'].Value } | Sort-Object -Unique)
    foreach ($name in $primitiveTypographyReferences) {
        if ($allowedDirectPrimitiveTypographyConsumers.ContainsKey($relative) -and
            $allowedDirectPrimitiveTypographyConsumers[$relative] -ccontains $name) {
            [void]$matchedDirectPrimitiveTypographyConsumers.Add("$relative|$name")
            continue
        }
        Add-AuditError "$relative bypasses the Semantic Type Style model by consuming Typography Primitive $name directly."
    }
}
foreach ($relative in $allowedDirectPrimitiveTypographyConsumers.Keys) {
    foreach ($name in $allowedDirectPrimitiveTypographyConsumers[$relative]) {
        if (-not $matchedDirectPrimitiveTypographyConsumers.Contains("$relative|$name")) {
            Add-AuditError "The direct Typography Primitive exception $relative|$name is stale."
        }
    }
}

$layerContracts = @{
    'foundations' = @('design-system.foundation', 'design-system.reset')
    'layouts' = @('design-system.layout')
    'components' = @('design-system.component')
    'utilities' = @('design-system.utility')
}
foreach ($directory in $layerContracts.Keys) {
    foreach ($file in Get-ChildItem -LiteralPath (Join-Path $cssRoot $directory) -Recurse -Filter *.css) {
        if ($directory -eq 'foundations' -and $file.Name -ceq 'fonts.css') {
            continue
        }
        $text = Get-Content -LiteralPath $file.FullName -Raw
        $hasLayer = @($layerContracts[$directory] | Where-Object { $text -match "@layer\s+$([regex]::Escape($_))\s*\{" }).Count -gt 0
        if (-not $hasLayer) {
            Add-AuditError "$([IO.Path]::GetRelativePath($cssRoot, $file.FullName)) is not wrapped in its registered cascade layer."
        }
    }
}

$implementationFiles = @($cssFiles | Where-Object { $_.FullName -notlike "*\css\tokens\*" -and $_.FullName -ne $entryPath -and $_.Name -ne '00-layers.css' })
foreach ($file in $implementationFiles) {
    $text = Get-Content -LiteralPath $file.FullName -Raw
    if ($text -match '(?<name>--design-system-(?:primitive|semantic|component)-[a-z0-9-]+)\s*:') {
        Add-AuditError "$([IO.Path]::GetRelativePath($cssRoot, $file.FullName)) declares public tokens outside a registered token source."
    }
    if ($text -match 'var\(\s*--design-system-primitive-color-') {
        Add-AuditError "$([IO.Path]::GetRelativePath($cssRoot, $file.FullName)) consumes a Color Primitive directly instead of a Semantic or Component token."
    }
}

$entryText = Get-Content -LiteralPath $entryPath -Raw
$importMatches = @([regex]::Matches($entryText, '@import\s+url\("(?<path>\./[^"?]+\.css)\?v=(?<version>[^"]+)"\)\s*;'))
$imports = @($importMatches | ForEach-Object { $_.Groups['path'].Value })
$expectedImports = @($cssFiles | Where-Object { $_.FullName -ne $entryPath } | ForEach-Object {
    './' + [IO.Path]::GetRelativePath($cssRoot, $_.FullName).Replace('\', '/')
})

if (@([regex]::Matches($entryText, '@import\b')).Count -ne $importMatches.Count) {
    Add-AuditError 'Every design-system.css import must use the canonical versioned URL form.'
}
foreach ($importMatch in $importMatches) {
    if ($importMatch.Groups['version'].Value -cne $projectVersion) {
        Add-AuditError "CSS import '$($importMatch.Groups['path'].Value)' must use package version '$projectVersion'."
    }
}
foreach ($expected in $expectedImports) {
    if (@($imports | Where-Object { $_ -ceq $expected }).Count -ne 1) {
        Add-AuditError "design-system.css must import $expected exactly once."
    }
}
if ($imports.Count -ne $expectedImports.Count) {
    Add-AuditError "design-system.css has an unexpected import count."
}

$jsRoot = Join-Path $webRoot 'js'
$jsFiles = @(Get-ChildItem -LiteralPath $jsRoot -Recurse -File -Filter *.js)
$jsRelativePaths = @($jsFiles | ForEach-Object { [IO.Path]::GetRelativePath($jsRoot, $_.FullName).Replace('\', '/') })
$jsEdges = @{}
foreach ($file in $jsFiles) {
    $relative = [IO.Path]::GetRelativePath($jsRoot, $file.FullName).Replace('\', '/')
    $text = Get-Content -LiteralPath $file.FullName -Raw
    $targets = [System.Collections.Generic.List[string]]::new()
    $specifierMatches = @([regex]::Matches($text, '(?m)^\s*import\s+(?:[^;]*?\s+from\s+)?["''](?<path>\.[^"''?]+\.js)\?v=(?<version>[^"'']+)["'']\s*;'))
    $specifiers = @($specifierMatches | ForEach-Object { $_.Groups['path'].Value })
    if (@([regex]::Matches($text, '(?m)^\s*import\s+')).Count -ne $specifierMatches.Count) {
        Add-AuditError "Every import in JavaScript module '$relative' must use the canonical versioned URL form."
    }
    foreach ($specifierMatch in $specifierMatches) {
        if ($specifierMatch.Groups['version'].Value -cne $projectVersion) {
            Add-AuditError "JavaScript import '$($specifierMatch.Groups['path'].Value)' in '$relative' must use package version '$projectVersion'."
        }
    }
    if (@($specifiers | Sort-Object -Unique).Count -ne $specifiers.Count) {
        Add-AuditError "JavaScript module '$relative' imports the same dependency more than once."
    }
    foreach ($specifier in $specifiers) {
        if (-not $specifier.EndsWith('.js', [StringComparison]::Ordinal)) {
            Add-AuditError "JavaScript module '$relative' has a non-canonical import '$specifier'."
            continue
        }
        $resolved = [IO.Path]::GetFullPath((Join-Path $file.DirectoryName $specifier))
        if (-not $resolved.StartsWith(([IO.Path]::GetFullPath($jsRoot) + [IO.Path]::DirectorySeparatorChar), [StringComparison]::OrdinalIgnoreCase)) {
            Add-AuditError "JavaScript module '$relative' imports outside the public module root."
            continue
        }
        $target = [IO.Path]::GetRelativePath($jsRoot, $resolved).Replace('\', '/')
        if (@($jsRelativePaths | Where-Object { $_ -ceq $target }).Count -ne 1) {
            Add-AuditError "JavaScript module '$relative' imports missing or incorrectly cased '$specifier'."
            continue
        }
        $targets.Add($target)
    }
    $jsEdges[$relative] = @($targets)
}

$reachableJs = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
$pendingJs = [System.Collections.Generic.Stack[string]]::new()
$pendingJs.Push('design-system.js')
while ($pendingJs.Count -gt 0) {
    $current = $pendingJs.Pop()
    if (-not $reachableJs.Add($current)) { continue }
    foreach ($target in @($jsEdges[$current])) { $pendingJs.Push($target) }
}
if (Compare-Object ($jsRelativePaths | Sort-Object) (@($reachableJs) | Sort-Object) -CaseSensitive) {
    Add-AuditError 'Every JavaScript module must be reachable from js/design-system.js.'
}

$jsEntryText = Get-Content -LiteralPath (Join-Path $jsRoot 'design-system.js') -Raw
$componentBindings = @([regex]::Matches($jsEntryText, '(?m)^\s*import\s+(?<binding>[A-Za-z_$][A-Za-z0-9_$]*)\s*(?:,\s*\{[^}]+\})?\s+from\s+["'']\./components/[a-z0-9-]+\.js\?v=[^"'']+["'']\s*;') |
    ForEach-Object { $_.Groups['binding'].Value } | Sort-Object -Unique)
$registeredBindings = @([regex]::Matches($jsEntryText, '(?m)^\s*register\((?<binding>[A-Za-z_$][A-Za-z0-9_$]*)\);') |
    ForEach-Object { $_.Groups['binding'].Value } | Sort-Object -Unique)
if (Compare-Object $componentBindings $registeredBindings -CaseSensitive) {
    Add-AuditError 'Every component module imported by js/design-system.js must be registered exactly once.'
}

$activeTextFiles = @(Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    ($_.FullName -notmatch '[\\/](?:bin|obj|artifacts)[\\/]') -and
    ($_.Extension -in '.cs', '.cshtml', '.css', '.js', '.json', '.md', '.ps1', '.csproj') -and
    ($_.FullName -ne $PSCommandPath)
})
foreach ($file in $activeTextFiles) {
    $text = Get-Content -LiteralPath $file.FullName -Raw
    if ($text -match '--ds-|\.ds-[a-z]|data-ds-|<ds-|--serenity-|\.serenity-[a-z]|data-serenity-|<serenity-|window\.SerenityDesignSystem') {
        Add-AuditError "$([IO.Path]::GetRelativePath($root, $file.FullName)) contains a retired compatibility identity."
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    throw "The design system architecture audit failed with $($errors.Count) error(s)."
}

$primitiveCount = @($baseDeclarations.Values | Where-Object Level -eq 'primitive').Count
$semanticCount = @($baseDeclarations.Values | Where-Object Level -eq 'semantic').Count
$componentCount = @($baseDeclarations.Values | Where-Object Level -eq 'component').Count
Write-Output "Architecture audit passed: $primitiveCount Primitive, $semanticCount Semantic, and $componentCount Component tokens."
