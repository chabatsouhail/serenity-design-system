# Changelog

## 18.1.0

- Rebuilt the Button reference around an enlarged, measured production specimen, five content compositions, Variant comparisons, a Style availability matrix, state examples, an interactive configuration playground, generated HTML, and searchable Token mappings. The page retains all five tabs and makes their server-rendered content available without JavaScript.
- Added Filled Negative Buttons as a supported public combination, with dedicated solid danger background Tokens, Hover treatment, validation coverage, contrast checks, and complete Anatomy documentation for Normal, Hover, Pressed, Focused, and Disabled states.
- Completed the reference catalog for all 46 reusable Components. Every navigation destination now has Anatomy, Variants, Style, Preview, and Tokens tabs, component-specific contracts, a real production specimen, responsive and keyboard guidance, and a nested reference table of contents.

## 18.0.0

- Removed the former product name from every user-facing surface; documentation now refers to the product simply as the design system.
- Renamed the NuGet package, assembly, namespaces, projects, solution, Razor partial paths, browser API, storage keys, events, public Tag Helpers, CSS classes, behavior hooks, Tokens, manifests, and entry assets to the generic `DesignSystem` / `design-system` identity.
- Renamed the project root to `Custom Design System` and removed the old generated packages and build artifacts so no legacy identity ships with the new major release.
- Flattened the Foundations navigation to the ten declared Foundation Groups and removed the Visual, Interaction, and Content category branches and their unrelated placeholder destinations.
- Completed the Layout, Shape, Elevation, Icons, Motion, and Timing reference pages with the same Anatomy, Tokens, numbering, compact header, nested reference TOC, illustration, and fixed table contracts used by Color and Typography.

## 17.1.2

- Standardized every Segmented Button on the Navigation visual language: the container now uses the Navigation Surface, and the selected segment uses the current Navigation destination background and foreground.
- Removed the Color documentation's local Segmented Button color override so the Theme control and Typography preview controls consume the same reusable component contract.

## 17.1.1

- Restored visible Segmented Button hover and press feedback, including compact press motion for toggle Buttons and a distinct hover treatment for the selected segment.

## 17.1.0

- Increased the public Tab panel block Padding from 16px to 32px so Tab content starts and ends with the same approved section spacing.
- Added IBM Plex Serif as the shipped editorial Typeface, including genuine 400, 500, 600, and 700 normal and italic faces, a public Primitive Font Family Token, documentation, pinned hashes, and license provenance.
- Added Normal and Italic comparisons to the Font Size, Font Weight, and Line Height Anatomy illustrations.
- Added Font Style to the Typography Composition model with value-named Normal and Italic Primitive Tokens; complete Semantic Type Styles now declare their Normal Style explicitly.

## 17.0.0

- Removed the standalone `--design-system-semantic-typography-emphasis-weight` Token without a compatibility alias because it only renamed Primitive Weight 500 and could not express relative emphasis.
- Migrated every existing 400-weight Body and Caption consumer to `--design-system-primitive-typography-weight-500` directly, preserving the resolved visual result.
- Defined emphasis as a usage rule that chooses the next available Primitive Weight directly: 400 → 500, 500 → 600, and 600 → 700.
- Removed the Typography Text Treatment manifest and documentation category, and added exact audit registration for every deliberate direct Primitive Weight consumer.

## 16.0.0

- Renamed every Primitive Spacing Token so its suffix serializes the actual pixel Value: for example, `--design-system-primitive-spacing-2` is now `2px`, and `--design-system-primitive-spacing-16` is now `16px`.
- Migrated every reusable Component, Layout, Semantic Token, visual harness, audit, and documentation consumer to the Value-named Spacing scale without compatibility aliases.
- Added exact architecture enforcement for the complete Primitive Spacing name-to-Value mapping.
- Updated the Spacing documentation and measure previews to describe and display actual pixel Values instead of 2px base-unit step numbers.

## 15.0.0

- Replaced the ambiguous standalone Emphasis Token with the explicitly named Semantic Text Treatment `--design-system-semantic-typography-emphasis-weight`.
- Removed the Semantic Link underline-offset Token; the Link Component and document foundation now consume the Primitive underline-offset Value directly because underline placement is an implementation mechanic, not a shared Semantic role.
- Replaced the mixed Inline Text Decisions contract with a focused Text Treatments contract and updated the Typography documentation to present Text Emphasis separately from complete Type Styles.
- Added exact audit coverage for the two deliberate direct Primitive underline-offset consumers while continuing to reject every other direct Primitive Typography use outside Token owners.

## 14.0.0

- Replaced the system Monospace Primitive with the shipped IBM Plex Mono family and renamed its Primitive Token to `--design-system-primitive-typography-family-ibm-plex-mono` without a compatibility alias.
- Added genuine IBM Plex Sans and IBM Plex Mono Medium 500, Semibold 600, and Bold 700 webfont faces, with matching italics, so supported Weights are never synthesized by the browser.
- Added the Value-named Primitive Font Weight Tokens `--design-system-primitive-typography-weight-600` and `--design-system-primitive-typography-weight-700`; existing Semantic Type Styles keep their current 400 and 500 compositions.
- Added exact font-file hash and `@font-face` verification for the complete approved family, Weight, and style matrix.

## 13.0.0

- Removed Alpha Values, Shadow Colors, and the Scrim role from the Color token family and Color documentation; Color now contains only actual Palette and Semantic Color decisions.
- Added Opacity as an independent Supporting Primitive Group with the Value-named `--design-system-primitive-opacity-*` Tokens; removed the former `--design-system-primitive-color-opacity-*` names without compatibility aliases.
- Moved Scrim ownership to `--design-system-semantic-elevation-scrim-background` and removed the intermediate Semantic Shadow Color Tokens; the existing Overlay and Dialog Shadow Tokens now compose their Color and Opacity directly inside Elevation.
- Preserved the resolved Light and Dark Theme appearance of every Shadow and Scrim while updating Dialog, Drawer, and responsive Navigation consumers to the new Elevation contract.

## 12.0.0

- Renamed the Primitive Color family from `neutral` to `gray` across its public Token names, Theme mappings, and documentation without retaining compatibility aliases; the numeric Palette Steps and resolved Colors are unchanged.
- Renamed the Primitive warning Color family from `yellow` to `orange`, and corrected the Primitive palette headings to Green, Orange, and Red; Semantic Success, Warning, and Danger roles retain their purpose-based names.

## 11.0.0

- Completed the Inline Picker presentation by placing its label inside a Text-style enhanced trigger while preserving the visible native label before JavaScript enhancement.
- Reduced the Picker floating panel Padding from the shared 16px Container Padding to the component-specific 8px Primitive spacing Value; option rows retain their 8px block and 10px inline Item Padding.
- Renamed Primitive Typography, Sizing, Shape, Icon, Layout, Elevation, Motion, and Timing Tokens so their final segment serializes the raw Value instead of a Semantic purpose such as `medium`, `tight`, `sticky`, or `fast`.
- Consolidated duplicate Primitive Values: Typography Weight 500 now has one Primitive Token shared by Medium and Emphasis purposes, and Layout Measure 180 now serves both Grid and State Semantic roles.
- Kept Primitive Color names unchanged because their numeric suffixes are deliberate Palette Steps, such as Blue 600 and Neutral 100.
- Added architecture checks that reject purpose-named Primitive Tokens in every migrated Foundation Group.

## 10.0.0

- Replaced the Compact, Normal, and Relaxed Semantic Spacing variants with one stable Token for each Control, Item, and Container Padding responsibility.
- Kept the former Normal Values: 14px Control inline Padding, 8px Item block Padding, 10px Item inline Padding, and 16px Container Padding.
- Limited Density modes to Control Height; Density no longer changes Padding.
- Removed the twelve variant-specific Semantic Spacing Token names without compatibility aliases.

## 9.0.0

- Replaced numeric Primitive Sizing names with the five-step Extra Small, Small, Medium, Large, and Extra Large scale while preserving existing Component dimensions.
- Added the 56px Extra Large step and made the compact Shell header consume it instead of owning an isolated raw Value.
- Removed the numeric Primitive Sizing Token names without compatibility aliases.

## 8.0.0

- Added the scoped `data-design-system-density="compact|normal|relaxed"` contract; Normal remains the default.
- Added coordinated Semantic Density families for Control Height, Control Inline Padding, Item Block and Inline Padding, and Container Padding.
- Standardized Buttons, Fields, Tabs, Search, Menus, Pickers, Navigation, Lists, Tables, Cards, Panels, Dialogs, Drawers, Popovers, Alerts, Toasts, and Toolbars on the shared Density routing model.
- Renamed Small, Medium, and Large Semantic Control Heights to Compact, Normal, and Relaxed so Sizing and Spacing use one vocabulary.
- Replaced the single Container Padding role with Compact, Normal, and Relaxed Container Padding tokens.
- Removed `--design-system-semantic-sizing-control-height-small`, `--design-system-semantic-sizing-control-height-medium`, `--design-system-semantic-sizing-control-height-large`, and `--design-system-semantic-spacing-container-padding` without compatibility aliases.
- Preserved explicit Small and Large Component sizes as local overrides of a surrounding Density scope.
- Updated the Spacing and Sizing Foundation documentation to explain the three Padding responsibilities and show the three Density modes.
- Corrected disabled Navigation Links inside a Navigation Tree so the tree's base foreground no longer overrides the disabled foreground.
- Removed `--design-system-semantic-sizing-target-minimum`; coarse-pointer Controls now use Relaxed Control Height so the Component has one physical size contract.

## 8.0.0

- Added `--design-system-semantic-spacing-container-padding` as the shared Padding role for reusable layout Containers.
- Clarified `--design-system-semantic-spacing-content-gap` as the parent-owned distance between related children, separate from Padding.
- Established the shared Sizing scale used by Semantic Control and Action Roles.
- Added a Sizing Behavior model covering Fixed, Content-driven, Fluid, and Hybrid dimensions.
- Updated the Sizing Foundation documentation to distinguish raw dimensions, Semantic purposes, and axis behavior.

## 6.0.0

- Removed the mixed Disabled and Effects Color category.
- Replaced whole-Component disabled opacity with explicit disabled Text and Surface Colors so disabled appearance no longer changes with the parent background.
- Prevented the Read-only field state from overriding Disabled field styling when a disabled native input also matches `:read-only`.
- Renamed the disabled Surface role to `--design-system-semantic-color-surface-background-disabled` and moved it beside the other Surface roles.
- Removed the unused Muted opacity and the one-off Disabled, Compact Disabled, and Control Disabled opacity Tokens without compatibility aliases.
- Replaced the vague Effect Shadow roles with `--design-system-semantic-color-shadow-default` and `--design-system-semantic-color-shadow-strong` in a dedicated Shadow Colors group.
- Clarified that Primitive Color Alpha Values compose Scrim and Shadow Colors and are never applied to complete Components.
- Replaced 34 Semantic Typography sub-Tokens with 16 complete Type Style Tokens plus the standalone Emphasis and Link underline decisions.
- Made every Type Style one valid CSS `font` Value composed directly from Primitive Font Family, Font Size, Line Height, and Font Weight Tokens.
- Organized the Typography API into Reading Type Styles, Interface Type Styles, and Inline Text Decisions.
- Removed the duplicated Body Emphasis, Body Large Emphasis, and Caption Emphasis Type Styles; Components now combine the applicable base Style with the standalone Emphasis decision.
- Added the Interface `--design-system-semantic-typography-label-compact` Style and stopped using the Action Small Style for large Badge labels.
- Migrated reusable Foundations and Components to the new categorization and prohibited direct Primitive Typography consumption outside the Semantic Typography owner.
- Added the Primitive Solid Line Height Value `1` for single-line Controls and Actions.
- Added the public `.design-system-body` Type Style class.
- Added the public `.design-system-body-small` and `.design-system-body-large` Reading Type Style classes.
- Removed every old Semantic Font Family, Font Size, Line Height, and Font Weight sub-Token without compatibility aliases.
- Updated the Typography Foundation documentation to distinguish Reading Type Styles, Interface Type Styles, and Inline Text Decisions.

## 5.0.1

- Corrected the public `.design-system-heading-1` through `.design-system-heading-4` classes so they apply the same foreground, 500 Font Weight, and Tight Line Height as their native Heading counterparts.
- Added complete Typography Foundation documentation covering Anatomy, Typefaces, Weight, Rhythm, Hierarchy, Primitive Tokens, Semantic Tokens, and Usage Rules.

## 5.0.0

- Removed the Ink Primitive Color Token with no compatibility alias.
- Reassigned Light Theme primary text and Dark Theme solid Status foregrounds to Black.
- Removed Ink from the Color Foundation inventory and Layering examples.

## 4.0.0

- Removed the six precomposed Alpha Effect Color Tokens with no compatibility aliases.
- Standardized Scrims and Shadows on Neutral 950 plus independent Primitive opacity Tokens.
- Separated effect opacity from solid Color Palettes in the Color Foundation documentation.

## 3.0.0

- Removed the Slate Primitive Color family with no compatibility aliases.
- Reassigned Neutral Action backgrounds, Hover states, and foregrounds to the existing Neutral Gray family in both Themes.
- Removed Slate from the Color Foundation documentation and Primitive Color inventory.

## 2.1.1

- Rebuilt the Primitive Blue family as a smooth visual progression around the unchanged Blue 600 Primary Action Color.
- Updated every public and internal asset fingerprint so browsers and CDNs cannot retain the previous Blue values.

## 2.1.0

- Added `--design-system-primitive-typography-weight-emphasis` as the public Primitive Token for emphasized text.
- Made native `<strong>` elements use the exact shipped IBM Plex Sans 500 weight instead of the browser's uncontrolled `bolder` rendering.
- Standardized Dark Theme Layering so each added Surface becomes lighter and interactive Hover or Selected Surfaces never sink darker than their parent.
- Corrected Menu, Picker, Table, and Toast Surface roles to follow the shared Layering Model.
- Added automated Dark Theme luminance-order checks to prevent Layer direction regressions.

## 2.0.0

- Retargeted the reusable Razor Class Library and its verified package-consumer contract from .NET 8 to .NET 10.
- Retargeted all public CSS and JavaScript dependency fingerprints to the 2.0.0 package release.
- .NET 8 is no longer supported; consuming applications must target .NET 10 or later.

## 1.1.1

- Removed the Table wrapper's unused vertical scrollbar gutter so row surfaces and dividers reach the rounded boundary.
- Versioned every internal CSS import and JavaScript module dependency so browsers cannot retain component files from an older release.

## 1.1.0

- Added the canonical `<design-system-assets />` integration contract so theme bootstrap, CSS, and JavaScript cannot be accidentally installed as separate halves.
- Added package-version fingerprints to public CSS and JavaScript URLs.
- Added global `data-design-system-runtime="loading|ready|failed"` state and `design-system:runtimeerror` reporting.
- Added per-component `data-design-system-enhanced="true"` success markers and `design-system:enhancementerror` diagnostics for incomplete interactive markup.
- Added `data-design-system-js-only` gating so controls with no native action are revealed only after their behavior is connected.
- Preserved native form fallbacks for Search, Number Field, Picker, Date Picker, and File Upload.

## 1.0.0

- Greenfield Design System implementation.
- New Foundation Group, optional Component Group, token architecture, and `--design-system-*` naming contracts.
- Component Groups are owned by actual components; catalog umbrellas such as feedback, loading, selection, overlay, form control, and navigation are not token owners.
- Primitive naming explicitly supports an optional property or family segment.
- Forty-six component contracts across Actions, Fields, Navigation, Data, Feedback, and Overlays.
- One public rendering rule: Tag Helpers for controlled components and asset integration, native HTML for open compositions, and internal-only Razor rendering templates.
- Idempotent Vanilla JavaScript enhancement for fields, tabs, menus, overlays, tables, feedback, and responsive navigation.
- Light and dark themes, reduced motion, forced colors, keyboard operation, coarse pointers, and 320px layouts.
- Localizable field, date, pagination, validation, theme, and notification labels.
- Package, portable-copy, fresh consumer, token-ownership, contrast, and server-contract verification.
- No legacy aliases or compatibility layer.
