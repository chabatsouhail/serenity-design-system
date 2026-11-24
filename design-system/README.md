# Design System

The design system is a portable ASP.NET Core .NET 10 Razor Class Library. This folder is the complete reusable product; it has no dependency on the separate documentation website.

## What the package provides

- Server-rendered Tag Helpers for controlled components and integration assets.
- Native HTML contracts for open compositions such as tables, lists, tabs, menus, dialogs, and layouts.
- One layered CSS entry: `css/design-system.css`.
- One idempotent JavaScript entry: `js/design-system.js`.
- Light and Dark Themes, reduced motion, forced colors, keyboard operation, coarse-pointer targets, and 320px layouts.
- Native no-JavaScript fallbacks for picker, date-picker, file-upload, forms, and navigation.
- Public token and component manifests under `wwwroot/tokens` and `wwwroot/components`.

The public identity is consistent throughout: `design-system-*` CSS classes, `data-design-system-*` behavior hooks, `--design-system-*` tokens, `<design-system-*>` Tag Helpers, `design-system:*` events, and `window.DesignSystem`.

## Install and load

```xml
<PackageReference Include="DesignSystem.Razor" Version="18.0.0" />
```

Enable the Tag Helpers in `_ViewImports.cshtml`:

```razor
@addTagHelper *, DesignSystem.Razor
```

Load the public entries from the application layout:

```razor
<head>
    <!-- existing application metadata -->
    <design-system-assets />
</head>
```

`<design-system-assets />` is the canonical integration. It emits the pre-paint theme bootstrap, stylesheet, and deferred JavaScript module together, in that order. An application with a Content Security Policy supplies its nonce with `<design-system-assets nonce="@nonce" />`.

The lower-level `<design-system-theme-bootstrap />`, `<design-system-styles />`, and `<design-system-scripts />` tags remain available for unusual host layouts, but all three are required. Their URLs include the package version so a browser or CDN cannot silently combine assets from different releases.

## Structure

```text
design-system/
├── src/DesignSystem.Razor/
│   ├── Contracts, Models, TagHelpers
│   ├── Pages/Shared/DesignSystem/Internal
│   └── wwwroot
│       ├── tokens
│       ├── css/foundations
│       ├── css/layouts
│       ├── css/components
│       ├── js
│       ├── fonts
│       └── icons
├── tests/
└── scripts/
```

Primitive, Semantic, Theme, Component Token, Foundation, Layout, Component, and Utility layers have separate owners. The public entry fixes their cascade order so a consuming application does not need to assemble individual files.

## Rendering contracts

The design system uses one rule instead of forcing every UI pattern through one server abstraction:

- Use a public `<design-system-*>` Tag Helper when the design system must generate or validate a controlled component.
- Use native HTML with the design system classes and `data-design-system-*` hooks for open compositions whose internal content belongs to the application.
- Treat every Razor template under `Pages/Shared/DesignSystem/Internal` as a private renderer behind a Tag Helper. Applications do not invoke those templates directly.
- Use an application-owned View Component only when a feature genuinely needs server-side data or rendering logic. The design-system library does not fetch application data.

Model-backed controls still have one predictable markup form:

```razor
<design-system-picker model="Model.CustomerPicker" />
<design-system-date-picker model="Model.StartDate" />
<design-system-file-upload model="Model.Attachment" />
<design-system-pagination model="Model.ResultsPagination" />
```

Open compositions preserve the native HTML language:

```razor
<div class="design-system-table-wrap" role="region" aria-label="Customers">
    <table class="design-system-table">
        <!-- application-owned headings and rows -->
    </table>
</div>
```

## Tokens in plain language

- A **Primitive Token** stores a raw value such as a blue, a spacing step, or a duration.
- A **Semantic Token** gives that value a shared purpose such as action background or control height.
- A **Semantic Type Style** is one complete CSS `font` Value. It combines Primitive Font Family, Font Size, Line Height, and Font Weight Values under one readable name such as `--design-system-semantic-typography-heading-1`.
- **Reading Type Styles** establish Page hierarchy and reading rhythm: Headings, Body sizes, Caption, and Code.
- **Interface Type Styles** fit functional interface text: Labels, Controls, compact metadata, and Actions.
- **Text Treatments** modify one deliberate property inside an existing Style without replacing it. The design system currently exposes Emphasis Weight as the only Semantic treatment.
- A **Component Token** is Optional. It creates one public override point when a product may need to reskin that Component independently.
- A Private `--_design-system-*` Variable is only a local CSS implementation detail; it is not part of the public Token API.

The normal flow for a value with shared meaning—especially color, control sizing, State, and Theme behavior—is:

```text
Primitive → Semantic → CSS Property
```

The optional independent-override flow is:

```text
Primitive → Semantic → Component → CSS Property
```

Component Tokens do not require artificial extra aliases. A genuinely Component-local default may live directly in its Component Token; a decision shared by multiple Components belongs in Semantic.

Fixed scale choices may be consumed directly from Primitive Tokens when another name would add no meaning. Spacing is one example. Color and Typography never bypass their Semantic Roles: Color gains contextual meaning, while each Semantic Type Style assembles the complete text treatment that Foundations and Components consume.

Primitive Sizing Tokens expose the approved raw dimensions directly as 24, 30, 34, 44, and 56. Semantic Sizing Tokens assign readable purposes such as Compact Action Size and Normal or Relaxed Control Height to those Values. Coarse-pointer Controls use Relaxed Control Height directly instead of exposing a second name for the same 44px Control box.

### Density

Density changes the shared Control Height. Apply `data-design-system-density="compact"`, `"normal"`, or `"relaxed"` to a Page, Panel, or Component group. Descendants inherit the choice; Normal is the default. Semantic Spacing stays stable across all three modes: Controls keep one horizontal Padding, Items keep one block and inline Padding, and Containers keep one Padding.

Explicit Small and Large Component sizes remain local choices and take precedence over inherited Density for that Component.

Dark Theme Layering follows one enforced direction: the Application Canvas is darkest, each contained or floating Surface becomes progressively lighter, and Hover or Selected Surfaces become lighter than the Surface they affect. Components consume the shared Semantic Surface Roles; they do not reverse this direction locally.

### Naming

- Primitive: `--design-system-primitive-{primitive-group}-{optional-property-or-family}-{value}`
- Semantic: `--design-system-semantic-{foundation-group}-{role}-{property}-{optional-variant}-{optional-tone}-{optional-state}`
- Semantic Typography: `--design-system-semantic-typography-{type-style}`
- Component: `--design-system-component-{component-group}-{property}-{optional-variant}-{optional-tone}-{optional-state}`

The Primitive Value segment never carries a Semantic purpose such as `medium`, `tight`, `sticky`, or `fast`. Pixel dimensions use the number itself (`size-11`, `radius-8`, `sizing-34`), decimals replace the decimal point with a hyphen (`line-height-1-25`), and non-pixel units remain visible (`duration-120ms`, `measure-72ch`). Color is the deliberate exception: its established numeric Palette Steps, such as `blue-600`, are the Color Values.

Typography uses the shorter pattern because the Token is the complete Type Style, not one sub-property. The design system does not publish separate Semantic Font Family, Font Size, Line Height, Font Weight, or Emphasis Tokens for a Type Style.

Emphasis is relative to the surrounding Type Style and therefore uses the next available Primitive Font Weight directly: 400 → 500, 500 → 600, and 600 → 700. Text already at 700 remains at 700 and uses another appropriate distinction when more emphasis is necessary.

Link underline offset is a Link rendering mechanic, not a shared Semantic role. The Link Component and document foundation consume `--design-system-primitive-typography-underline-offset-0-2em` directly. A public Component Token should be introduced only if Link underline placement later needs an independent product override.

Foundation Groups are Color, Typography, Spacing, Sizing, Layout, Shape, Elevation, Icons, Motion, and Timing. Opacity is a Supporting Primitive Group used to compose Elevation Shadows and Scrims; it is not part of Color and does not publish Semantic Opacity roles. Component Groups are actual Components, never catalog umbrellas such as “feedback” or “forms,” and exist only where an independent override is useful.

## Progressive enhancement

The server-rendered contract is authoritative. JavaScript reveals or replaces a native control only after its behavior is wired successfully, and `DesignSystem.refresh(root)` safely initializes newly inserted content. The browser API also exposes theme, dialog, and toast helpers.

The document root reports the shared runtime state:

- `data-design-system-runtime="loading"` means assets were emitted but initialization has not completed.
- `data-design-system-runtime="ready"` means all registered modules initialized.
- `data-design-system-runtime="failed"` means the entry module failed to load or a module threw during initialization.

Every behavior that successfully connects marks its own root or trigger with `data-design-system-enhanced="true"`. Incomplete anatomy produces `data-design-system-enhancement-error`, a console warning, and a `design-system:enhancementerror` event instead of failing silently.

Use `data-design-system-js-only` only on an action that has no useful native behavior. The design system hides that action until its own enhancement succeeds. Keep links, submit controls, native form fields, and other real fallbacks visible; do not label them JS-only.

Component behavior falls into three explicit categories:

- **Native:** the browser owns the behavior; the design system supplies styling and semantics.
- **Progressively enhanced:** a native control remains authoritative until `data-design-system-enhanced="true"` appears.
- **JavaScript-only action:** mark the otherwise inert trigger with `data-design-system-js-only`, or provide a real link/form fallback.

## Verify

Run from this folder with .NET SDK 10.0.400:

```powershell
./scripts/verify.ps1
```

Verification audits token ownership and contrast, checks JavaScript syntax, builds with warnings as errors, runs server contract tests, packs the NuGet package, compares packaged static assets with source, compiles a fresh net10.0 NuGet consumer, and builds an isolated copy of the portable folder.
