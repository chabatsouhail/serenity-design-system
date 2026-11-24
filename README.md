# Design System

A portable, accessible ASP.NET Core `.NET 10` Razor Class Library (`DesignSystem.Razor` v18.1.0) paired with a separate documentation website (`DesignSystem.Documentation`).

The workspace separates the reusable library from its reference host:

- **`design-system/`** is the complete, standalone reusable product. It has no dependency on `documentation/` and can be packaged or copied on its own.
- **`documentation/`** is the Razor Pages documentation website. It consumes and demonstrates the real library without duplicating component implementations.

## Prerequisites

- **.NET SDK `10.0.400`** (pinned in `design-system/global.json` and `documentation/global.json`)
- **Node.js** (for contrast audits, JavaScript syntax checks, and optional Playwright smoke tests)
- **Chromium browser** (Chrome or Edge, or set `DESIGN_SYSTEM_BROWSER` to the executable path) for `design-system/scripts/verify.ps1`
- **Playwright** on `NODE_PATH` (only if running `documentation/tests/button-reference.smoke.cjs`)

## Run the documentation website

From the workspace root:

```powershell
cd .\documentation
dotnet run --urls http://127.0.0.1:5092
```

Open [http://127.0.0.1:5092](http://127.0.0.1:5092). Specifying `http://127.0.0.1:5092` matches the URL expected by `documentation/tests/button-reference.smoke.cjs`. There is no `launchSettings.json`, so omitting `--urls` binds to `http://localhost:5000`.

The documentation site covers:

- **Discover:** Overview, Getting Started, Tokens, and Version Control
- **Foundations:** All 10 foundation groups (`Color`, `Typography`, `Spacing`, `Sizing`, `Layout`, `Shape`, `Elevation`, `Icons`, `Motion`, and `Timing`)
- **Components:** All 46 reusable components across 6 groups (`Actions`, `Fields`, `Navigation`, `Data`, `Feedback`, and `Overlays`), including the measured Button reference playground

You can also run the visual test harness directly from the workspace root:

```powershell
dotnet run --project .\design-system\tests\DesignSystem.VisualHarness\DesignSystem.VisualHarness.csproj
```

## Workspace structure

```text
.
├── design-system/                              Portable Razor Class Library & verification
│   ├── DesignSystem.slnx                       Solution for library, contract tests, and visual harness
│   ├── src/DesignSystem.Razor/                 Library source, Tag Helpers, partials, CSS, JS, tokens, fonts, icons
│   ├── tests/
│   │   ├── DesignSystem.ContractTests/         Server & contract verification tests
│   │   └── DesignSystem.VisualHarness/         Interactive browser smoke test host
│   ├── scripts/                                Audit and verification scripts
│   ├── docs/COMPONENT-STATUS.md                Release coverage for all 46 components
│   ├── README.md                               Standalone NuGet package documentation
│   ├── CHANGELOG.md                            Release history
│   ├── LICENSE                                 MIT License
│   └── THIRD-PARTY-NOTICES.md                  Font and icon notices
├── documentation/                              Documentation website host
│   ├── DesignSystem.Documentation.csproj       ASP.NET Core .NET 10 web project
│   ├── Pages/                                  Discover, Foundations, Components, and shared layout pages
│   ├── FoundationPages/                        Foundation page definitions and catalog
│   ├── ComponentPages/                         Component catalog and Button reference docs
│   └── tests/button-reference.smoke.cjs        Playwright smoke test for the Button reference page
├── # design-system-overview.md                 System architecture overview notes
├── design-qa.md                                Design QA notes
├── notes.md                                    Foundation working notes
└── artifacts/                                  Design audit and QA artifacts
```

## Use the library in an application

Add the package reference (or reference the project locally during development):

```xml
<!-- NuGet package -->
<PackageReference Include="DesignSystem.Razor" Version="18.1.0" />

<!-- Or local project reference -->
<ProjectReference Include="..\design-system\src\DesignSystem.Razor\DesignSystem.Razor.csproj" />
```

To produce a local `.nupkg` and `.snupkg` under `design-system\artifacts\package`:

```powershell
dotnet pack .\design-system\src\DesignSystem.Razor\DesignSystem.Razor.csproj -c Release -o .\design-system\artifacts\package
```

Enable the Tag Helpers in `Pages/_ViewImports.cshtml`:

```razor
@addTagHelper *, DesignSystem.Razor
```

Load the canonical assets inside `<head>` in your layout (supply `nonce="@nonce"` if using a Content Security Policy):

```razor
<design-system-assets />
```

### Public contract summary

- **Public surface:** `design-system-*` CSS classes, `data-design-system-*` behavior hooks, `--design-system-*` tokens, `<design-system-*>` Tag Helpers, `design-system:*` events, and `window.DesignSystem`.
- **Rendering boundary:** Use `<design-system-*>` Tag Helpers for controlled components (such as Picker, Date Picker, File Upload, and Pagination), and native HTML with `design-system-*` classes and `data-design-system-*` hooks for open compositions (such as tables, lists, tabs, menus, dialogs, and layouts). Do not invoke internal templates under `Pages/Shared/DesignSystem/Internal` directly.

See [the standalone library README](design-system/README.md) for full details on token architecture, density modes, naming conventions, and progressive enhancement.

## Build and verify

### Full library verification

Run from the `design-system/` folder:

```powershell
cd .\design-system
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

This runs token ownership and contrast audits, JavaScript syntax checks, a Release solution build, contract tests, a headless Chromium interaction smoke test against the visual harness, NuGet `.nupkg`/`.snupkg` packing and static-web-asset verification, a fresh `.NET 10` NuGet consumer build/publish/serve check, and an isolated portable-folder build.

### Build the documentation host

From the workspace root:

```powershell
dotnet build .\documentation\DesignSystem.Documentation.csproj
```

### Run the Button reference smoke test

With the documentation site running at `http://127.0.0.1:5092` and Playwright installed on `NODE_PATH`:

```powershell
node .\documentation\tests\button-reference.smoke.cjs
```

## Documentation and licensing

- [Library package guide](design-system/README.md)
- [Changelog](design-system/CHANGELOG.md)
- [Component status](design-system/docs/COMPONENT-STATUS.md)
- [Button reference notes](documentation/ComponentPages/BUTTON-REFERENCE.md)

Licensed under the [MIT License](design-system/LICENSE). Redistributed assets are documented in [Third-party notices](design-system/THIRD-PARTY-NOTICES.md): IBM Plex Sans, IBM Plex Serif, and IBM Plex Mono under the SIL Open Font License 1.1, and Tabler Icons under the MIT License.
