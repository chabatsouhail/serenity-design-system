# Foundation Anatomy grid design QA

## Typography Anatomy · Four decision subsections

- Source problem evidence: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-13900521-bf97-48ad-91cb-ff4e5699369e.png`
- Browser-rendered implementation: `C:\Users\micro\.codex\visualizations\2026\08\23\design-system-typography-four-decisions\01-overview.png`
- Supporting implementation state: `C:\Users\micro\.codex\visualizations\2026\08\23\design-system-typography-four-decisions\02-weight-line-height.png`
- Route: `http://127.0.0.1:5092/foundations/typography#anatomy`
- State: light Theme, Foundations navigation expanded, Typography Anatomy visible
- Source pixels: 515 × 296; implementation pixels: 1265 × 712 at the browser's 1280 × 720 CSS viewport and device-pixel-ratio 1
- Normalization: the source is focused problem evidence rather than a full-page target. It was reviewed together with the browser render to verify that the duplicated Type Style specimen was removed and that the replacement follows the user's four-subsection information architecture.

### Full-view comparison evidence

The source repeated Heading 1, Body Large, and Caption examples already documented in Reading Type Styles. The implementation removes that duplicate specimen and the umbrella Typography Decisions panel. Typography Anatomy now contains four direct, sequential Subsections: Font Family, Font Size, Font Weight, and Line Height. Each Subsection explains one design system decision and shows only the Values relevant to that decision.

### Focused region evidence

The first implementation capture verifies Font Family and the seven-step Font Size scale. The supporting capture verifies the separate Font Weight and Line Height Subsections. Together they show all four headings, bounded visual examples, consistent Subsection spacing, and no repeated Reading Type Style catalog.

### Required fidelity surfaces

- Fonts and Typography: IBM Plex Sans and the Monospace stack render as their real Families. The Size scale uses the authored 11, 12, 13, 14, 16, 20, and 28px Primitive Values; Weight examples use 400 and 500; Line Height examples use 1, 1.25, and 1.5.
- Spacing and layout rhythm: each decision follows the same Heading, Sublabel, and bordered-example rhythm. Content determines height; no decision Card uses a fixed block height.
- Colors and visual Tokens: all Surfaces, Boundaries, and text colors use existing design system Semantic Tokens.
- Image quality and asset fidelity: this instructional Section needs no raster or icon assets; all evidence is selectable HTML text styled with the real Typography Tokens.
- Copy and content: the four decision names are explicit. Reading Type Styles remains the sole later catalog of composed Heading, Body, Caption, and Code Styles.

### Findings

No actionable P0, P1, or P2 issue remains. The earlier duplicate-example design was removed. Browser inspection confirms the four requested Subsections, no console warnings or errors, and no obsolete Typography Decisions, Typefaces, or Weight and Rhythm heading.

### Comparison history

1. The earlier left specimen repeated three entries from Reading Type Styles and did not explain a distinct concept.
2. A proposed single Type Style composition diagram was rejected because the Section's subject is the design system's four Typography decisions, not one Token's assembly.
3. The final implementation promotes Font Family, Font Size, Font Weight, and Line Height to four peer Subsections and gives each one its own focused evidence.

## Typography Decisions · Version 2

- Source visual truth: `C:\Users\micro\.codex\visualizations\2026\08\23\design-system-typography-decisions-v2\01-reference.png`
- Problem evidence for this iteration: `C:\Users\micro\.codex\visualizations\2026\08\23\design-system-typography-decisions-v2\problem-evidence-unannotated-specimen.png`
- Browser-rendered implementation: `C:\Users\micro\.codex\visualizations\2026\08\23\design-system-typography-decisions-v2\06-annotated-specimen.png`
- Route: `http://127.0.0.1:5092/foundations/typography#anatomy`
- State: light Theme, Typography Decisions and Typefaces visible, navigation expanded
- Source pixels: 1663 × 946; implementation pixels: 1265 × 712
- Implementation viewport: 1280 × 720 CSS pixels at device-pixel-ratio 1
- Normalization: the two full-page captures were reviewed together at fit width. The source is a wider presentation mockup rather than a browser capture, so proportions and hierarchy were compared instead of claiming pixel identity.

### Full-view comparison evidence

The selected Version 2 and the browser render share the same dominant composition: one rounded, bordered panel; a real-world Customer record specimen on the left; and a narrower ordered decision rail on the right. The implementation preserves the selected 6:5 column balance, four numbered rows, light separators, restrained blue decision Values, and the unchanged Typefaces Section below. The revised specimen fixes the user's evidence that the original example communicated no meaning: it now labels the Rendered text and Type Style columns, identifies Heading 1, Body Large, and Caption, and exposes each Style's Size, Weight, and Line Height beside the result.

### Focused region evidence

The Typography Decisions panel itself fills the readable region in both captures, so a separate crop was unnecessary. Its detailed copy, number markers, border, radius, Font hierarchy, decision spacing, and left/right alignment are all readable in the full-view comparison.

### Required fidelity surfaces

- Fonts and Typography: IBM Plex Sans is active. The specimen uses the real design system Heading 1, Body Large, and Caption Type Styles and visibly reports their computed `28px · 500 · 1.25`, `14px · 400 · 1.5`, and `11px · 400 · 1.5` compositions. The decision rail uses Heading 4, Body Large, Body, and Label styles.
- Spacing and layout rhythm: the desktop panel measures 1001 × 429 CSS pixels with 545px and 454px tracks, tokenized Padding, four equal decision rows, and no document overflow.
- Colors and visual Tokens: the implementation uses only the design system Semantic Surface, Boundary, Foreground, Accent, and Subtle Surface Tokens. Dark Theme resolves the panel to `rgb(16, 18, 22)` and decision Values to `rgb(147, 197, 253)`.
- Image quality and asset fidelity: neither the source nor the implementation needs image or icon assets for this Section; all visible content is real HTML text and CSS styling.
- Copy and content: the left side now explains what the reader is looking at, while all four decision names, Values, and explanations retain the approved Version 2 direction.

### Findings

No actionable P0, P1, or P2 differences remain. The first browser pass exposed one undefined Surface Token that made the panel background transparent; it was replaced with the authored `--design-system-semantic-color-surface-background` Token. The user's next review exposed a P2 communication gap: the realistic specimen displayed three Styles but did not identify or explain them. The annotated revision maps each Rendered text line to its Type Style and complete numeric composition. The final pass confirms an owned white Surface in light Theme, the correct dark Surface, four decision rows, three annotated specimen rows, and zero horizontal overflow.

### Comparison history

1. Initial implementation matched the structure but used an undefined `surface-background-primary` Token.
2. The panel now uses the authored Semantic Surface Token.
3. Post-fix browser evidence `05-handoff.png` had the expected background and composition, but the left specimen still lacked explanatory mapping.
4. The final annotated browser evidence is `06-annotated-specimen.png`; it names the Rendered text and Type Style columns and pairs all three examples with their Size, Weight, and Line Height.

- Typography render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\typography-anatomy-value-example-map.png`
- Spacing render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\spacing-anatomy-2x2.jpg`
- Sizing Decisions render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\sizing-decisions-2x2.jpg`
- Sizing Behavior render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\sizing-behavior-2x2.jpg`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\foundation-anatomy-grid-comparison.jpg`
- Routes: `http://127.0.0.1:5092/foundations/typography#anatomy`, `http://127.0.0.1:5092/foundations/spacing#anatomy`, and `http://127.0.0.1:5092/foundations/sizing#anatomy`
- State: light Theme with the Anatomy sections visible; illustrative Controls are static documentation examples

## Full-view comparison evidence

Typography Anatomy, Spacing Anatomy, Sizing Decisions, and Sizing Behavior use the same connected, rounded 2 × 2 tile model at desktop width. Typography now gives each tile one predictable reading order: decision name, plain-language explanation, then a bordered Value-to-Example map. The map uses spacing rather than row separators to keep each pairing readable.

The Font Family map pairs `IBM Plex Sans` with interface copy and `Monospace` with an identifier. Browser-computed styles confirm that each example uses its actual Font Family rather than a shared display Font.

## Measured browser evidence

- Desktop viewport: 1280 × 720 CSS pixels.
- Spacing Anatomy grid: 1001 × 348.5 CSS pixels with two 499.5px columns.
- Spacing Anatomy tile rows: two tiles at 163.5px followed by two tiles at 183px.
- Narrow viewport: 390 × 760 CSS pixels.
- At 390px, Spacing Anatomy and Typography Anatomy collapse to one 341px column with no horizontal overflow.
- Every Typography Value remains paired with its Example at both tested widths.
- Browser console errors: none.

## Required fidelity surfaces

- Fonts and Typography: existing design system Label, Caption, Body, and Control Type Styles are preserved.
- Spacing and layout rhythm: all four grids use the same tokenized tile Padding and Gaps.
- Colors and visual Tokens: existing Semantic Surface, Boundary, Foreground, and Action Tokens are unchanged.
- Image quality and asset fidelity: no raster content or new icon assets are used by the Pages; the illustrations use existing design system Components and CSS-rendered examples.
- Copy and content: all original Anatomy names, explanations, and examples are preserved.

## Findings

No actionable P0, P1, P2, or P3 mismatch remains. The .NET 10 Release build succeeds with 0 warnings and 0 errors.

## Comparison history

1. Earlier Spacing and Sizing implementations used four full-width rows.
2. Final implementation uses four connected tiles arranged 2 × 2, matching Typography Anatomy.
3. Typography Values and Examples previously floated in separate areas of each tile; they are now paired row by row under explicit Value and Example labels.

## Subsection heading audit

Every documentation Section containing multiple Subsections now gives the first Subsection the same explicit Heading treatment as the Subsections that follow it. The corrected first Subsections are Typography Decisions, Layer Progression, Token Levels, and Add the Package. A browser audit across all eight implemented documentation routes found no unlabelled Subsections, duplicate IDs, horizontal overflow, or console errors.

## Typography example-content audit

Typography Anatomy uses realistic interface copy and maps every Value directly to the result it produces: a Customer profile and identifier for Font Family, page/supporting/metadata text for Font Size, instructional and Action text for Font Weight, and a reading sentence plus compact Heading for Line Height. The verified render is `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\typography-anatomy-value-example-map.png`. Desktop and 390px checks show no document, tile, or comparison-panel overflow and no console errors.

## Physical Spacing diagrams

Spacing Anatomy uses the connected 2×2 Anatomy frame and makes the empty space itself visible. The highlighted regions measure 16px Padding, 16px Content Gap, 24px Section Gap, and 6px Overlay Gap. The Padding example uses a neutral Container outline with light blue restricted to its 16px Padding region; the content area remains the normal white Surface. The content has no second Surface element, border, radius, or additional Padding, so it cannot be mistaken for a nested Container. The Content, Section, and Overlay Gap examples retain their measured separators. Desktop and 390px checks show no document or Anatomy overflow and no console errors.

## Semantic Spacing consistency

The Semantic Spacing table contains exactly four roles: Padding, Content Gap, Section Gap, and Overlay Gap. Padding is backed by `--design-system-semantic-spacing-container-padding`; Content Gap remains `--design-system-semantic-spacing-content-gap`. The separate Semantic example Cards were removed so the Section presents the Token contract directly. Browser checks confirm four table rows, zero example Cards, no page overflow at desktop or 390px, an internally scrollable mobile table, and no console errors.

## Sizing indicators

Every Sizing Role and Sizing Behavior example includes a dimension indicator. Fixed dimensions show their exact approved Values. Content-driven and Fluid axes are labeled Content Width or Available Width instead of inventing a fixed pixel Value. Fixed measures both axes, while Compact Action measures its 24px action. The obsolete separate Minimum Target role is removed; Relaxed Control Height is the single 44px coarse-pointer Control contract. Every tile uses the same 16px Copy-to-example Gap, and each ruler is aligned to the exact start and end of the dimension it measures.

## Constrained illustration · Fluid replica

- Source visual truth: the Fluid illustration immediately beside Constrained on the same rendered Page.
- Browser-rendered comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\documentation\artifacts\design-qa\sizing-constrained-fluid-replica.png`
- Route: `http://127.0.0.1:5092/foundations/sizing#anatomy`
- Viewport: 1280 × 720 CSS pixels at device-pixel-ratio 1.5; browser capture 1265 × 712 pixels
- State: light Theme, Fluid and Constrained Sizing Behaviors visible side by side

### Full-view and focused comparison evidence

Fluid and Constrained now use identical illustration markup: Available Height ruler, one fluid Panel, and Available Width ruler. The final browser capture includes both source and implementation side by side, so no separate focused crop is necessary. The only visual difference is the dashed Panel boundary: Fluid uses the neutral Boundary Token and Constrained uses the design system's danger-red Token.

### Required fidelity surfaces

- Fonts and Typography: both illustrations use the same Caption and Body Type Styles.
- Spacing and layout rhythm: both Panels measure 44px high; both Height rulers measure 44px and both Width rulers measure 21px. Their subpixel Width difference comes from the center grid Boundary, not different illustration rules.
- Colors and visual Tokens: Fluid resolves to neutral `rgb(217, 222, 230)` and Constrained to danger red `rgb(180, 35, 24)`; both retain the same white Surface.
- Image quality and asset fidelity: the illustrations require no image assets or icons.
- Copy and content: the labels are identical (`Available Height`, `Available Width`); only the Panel content name and boundary color distinguish the two Behaviors.

### Findings and comparison history

1. The earlier range diagram was explicitly superseded.
2. Constrained was rebuilt as an exact Fluid illustration replica with one additional red-boundary class.
3. Final browser measurement reports matching structure and dimensions, zero page overflow, and no console warnings or errors. No actionable P0, P1, or P2 mismatch remains.

## Color Semantic Tokens · Inline Theme Picker

- Source visual truth: `C:\Users\micro\OneDrive\Pictures\Screenshots\Screenshot 2026-08-19 071902.png`
- Browser-rendered implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\design-qa-color-theme-picker.png`
- Route: `http://127.0.0.1:5092/foundations/color`
- State: Semantic Tokens tab selected, light Theme active, Theme Picker open
- Source pixels: 344 × 222; implementation pixels: 1280 × 720 at a 1280 × 720 CSS viewport and device-pixel-ratio 1
- Normalization: the source is a focused component-pattern reference, while the implementation capture preserves the complete documentation context. The Picker itself was compared at its rendered 34px Control Height with the same label/value/menu relationship.

### Full-view comparison evidence

The Color Tokens section now uses the public design system Tabs contract for Primitive and Semantic Token types. The Theme Picker sits at the start of the Semantic panel, before its explanatory copy and independently headed Token-group tables. Its trigger contains the muted `Theme` label, emphasized selected `Light` Value, and Chevron. Opening it displays the public design system listbox directly beneath the trigger with Light and Dark options and the selected checkmark.

### Focused region evidence

The source and implementation were opened together in one comparison input. Both use one trigger containing the label and selected Value, a downward/upward Chevron state, a rounded elevated option Surface, full-width option rows, and a selected checkmark. The implementation uses the design system's Text variant so the closed trigger has a transparent background, while the open state retains clear interaction feedback.

### Required fidelity surfaces

- Fonts and Typography: the trigger uses the design system's Control Type Style; the internal label remains regular/muted and the selected Value uses the established emphasized accent treatment.
- Spacing and layout rhythm: the Semantic panel toolbar keeps a 12px Gap between the Picker and its explanatory copy. The compact option Surface uses 8px panel Padding (`design-system-component-picker-panel-padding` → Primitive Spacing 4). The listbox itself uses 0px Padding and each option retains 8px block / 10px inline Padding.
- Colors and visual Tokens: the trigger, Hover/Expanded state, option Surface, Boundaries, focus ring, and selected text use existing design system Semantic Tokens.
- Image quality and asset fidelity: no raster assets were needed; the Chevron and Check use the packaged design system Icon contract.
- Copy and content: the Picker says `Theme Light` or `Theme Dark`, and the table changes to show only the selected Theme's Primitive compositions.

### Interaction and responsive evidence

- Mouse opening exposed both options and the selected checkmark.
- Primitive and Semantic tabs switch the complete Token type with the selected tab, Arrow keys, Home, and End using the public Tabs runtime.
- Keyboard Arrow navigation plus Enter changed Light to Dark, updated the native select, and swapped the table's visible Theme rows.
- Selecting Light restored the initial table state.
- The native label remains visible without JavaScript; successful Inline enhancement moves the same label inside the trigger.
- Browser console warnings and errors: none.

### Findings and comparison history

1. The previous layout pushed the Picker to the far right and rendered `Theme` as a separate field label.
2. The reusable Inline Picker contract now renders its label inside the enhanced trigger while preserving progressive enhancement.
3. The Color page groups the Heading and Picker in one inline title row and keeps the explanation below.
4. Redundant Light/Dark Chips were removed from table rows because the Picker already establishes the active Theme.
5. The final browser comparison measured an 8px option-Surface Padding, verified Light/Dark switching, and found no console errors or actionable P0, P1, or P2 mismatch.

## Color Semantic Tokens · Header-aligned Theme Picker

- Source layout cue: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-9a9d2ad2-ad0f-4806-9714-ba8a003934fb.png`
- Full browser render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\design-qa-theme-picker-full.png`
- Focused browser render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\design-qa-theme-picker-header.png`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\design-qa-theme-picker-comparison.png`
- Route: `http://127.0.0.1:5092/foundations/color?qa=theme-picker-header`
- State: Color Tokens tab selected, Semantic Tokens visible, Light selected, enhanced Inline Theme Picker closed
- Source pixels: 169 × 59; browser viewport: 1280 × 720 CSS pixels at device-pixel-ratio 1

### Full-view and focused comparison evidence

The Picker now belongs to the Semantic Tokens heading row. The heading begins at the left edge and the existing Inline Picker is aligned to the right edge of that same row. The explanation remains on the following row and spans the available width. Browser geometry reports a zero-pixel vertical offset between the Heading and Picker, confirms the Picker is inside the Heading container and outside the table-content container, and reports zero horizontal overflow.

### Required fidelity surfaces

- Fonts and Typography: the Semantic Tokens heading, supporting copy, and Picker retain their existing design system Type Styles.
- Spacing and layout rhythm: the Heading row uses the existing tokenized Grid Gap; the Picker is right-aligned without adding a fixed content width.
- Colors and visual Tokens: the Text-style Picker keeps its transparent resting state and existing selected-Value color.
- Image quality and asset fidelity: the Chevron remains the packaged design system Icon; no raster UI asset was introduced.
- Copy and content: the Picker still reads `Theme Light` or `Theme Dark`, and the supporting Theme instruction is unchanged.

### Interaction and responsive evidence

- Opening the Picker sets `aria-expanded` to true.
- Choosing Dark changes the native select and trigger to Dark; choosing Light restores both to Light.
- Light and Dark Primitive compositions continue to switch with the selected Theme.
- The 1280px browser render has zero document overflow.
- The .NET 10 Release documentation build succeeds with 0 warnings and 0 errors.

### Findings and comparison history

1. The previous implementation placed the Picker at the start of the Semantic Tokens content beneath the heading.
2. The final implementation moves the same public Picker into the Semantic Tokens heading row and aligns it on the right.
3. No actionable P0, P1, or P2 issue remains.

## Foundation tab-section numbering

- Source visual truth: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-815f50c5-2cc1-40ac-9106-b63cbd6cf9fb.png`
- Browser-rendered implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\foundation-section-numbering.png`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\foundation-section-numbering-comparison.png`
- Routes: `/foundations/color`, `/foundations/typography`, `/foundations/spacing`, and `/foundations/sizing`
- State: light Theme; Anatomy and Tokens tabs checked; Color Semantic Tokens Theme Picker retained
- Source pixels: 331 × 60. Implementation pixels: 650 × 61 from a 650 × 61 CSS-pixel heading clip in a 1920 × 1065 viewport at device-pixel-ratio 1.5.
- Normalization: the source is a focused numbering-and-heading relationship rather than a full page. Both regions were aligned at the same visible height in the combined comparison; the implementation intentionally retains the design system's existing Foundation heading size and adds only the source's numbered hierarchy.

### Full-view and focused comparison evidence

The focused comparison confirms a small two-digit Monospace number to the left of the existing section title, with equivalent baseline alignment and horizontal separation to the source. Full-page browser inspection confirms that the pattern appears on every Foundation Anatomy section and that Token categories restart at `01` inside each Tokens tab.

### Required fidelity surfaces

- Fonts and Typography: section numbers use IBM Plex Mono at the existing 14px Primitive size and Regular weight. Existing Foundation section-title and description Typography remains unchanged.
- Spacing and layout rhythm: the number occupies a 24px track with a 16px Gap before the title. Descriptions align with the title rather than beneath the number.
- Colors and visual Tokens: numbers use the existing Semantic accent-foreground Token; no raw Color was introduced.
- Image quality and asset fidelity: the reference contains no image or icon asset. The number remains selectable HTML-generated text rather than a raster replacement.
- Copy and content: Anatomy titles remain Palette, Composition, Spacing Anatomy, and Sizing Behavior. Tokens tabs retain Primitive Tokens and Semantic Tokens as `01` and `02`.

### Interaction and responsive evidence

- Anatomy and Tokens tab switching was exercised on all four Foundation pages.
- The Color Theme Picker remains aligned in the numbered Semantic Tokens heading.
- At 390 × 844 CSS pixels, the numbered heading and Theme Picker produce zero document overflow; the number/title and title/description alignment remains exact.
- Browser console warnings and errors: none.
- The .NET 10 Release documentation build succeeds with 0 warnings and 0 errors.

### Findings and comparison history

1. Initial implementation added the shared counter, number track, and title alignment without changing the established Foundation heading Typography.
2. Desktop and narrow browser comparisons found no actionable P0, P1, or P2 mismatch.

## Color Semantic Tokens · Numbered header normalization

- Source issue evidence: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-fae67dc0-e7b8-4359-84cf-09a0f348ca69.png`
- Browser-rendered implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-semantic-header-normalized.png`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-semantic-header-comparison.png`
- Route: `/foundations/color`, Tokens tab, Semantic Tokens section, Light Theme Picker closed
- Source pixels: 876 × 123. Implementation pixels: 1024 × 69 from a focused clip in a 1280 × 720 CSS-pixel viewport at device-pixel-ratio 1.5.
- Normalization: the source is a cropped issue reference at a different display density. Geometry was therefore compared against the adjacent numbered Primitive Tokens header in the same rendered page as the authoritative established pattern.

### Full-view and focused comparison evidence

The Theme Picker no longer participates in the header's first Grid row. Primitive Tokens and Semantic Tokens now both measure 24px + 960.667px columns, 45.5px total Heading height, a 6px title-to-description Gap, and identical title and description left edges. The Picker remains independently anchored to the upper-right edge.

### Required fidelity surfaces

- Fonts and Typography: the number, title, description, and Picker retain the existing design system Type Styles and weights.
- Spacing and layout rhythm: the Picker no longer enlarges the title row; numbered title and description rhythm exactly matches the Primitive Tokens header.
- Colors and visual Tokens: no Color or Theme mapping changed.
- Image quality and asset fidelity: no new asset was introduced; the Picker retains the packaged design system Chevron.
- Copy and content: the Semantic Tokens title, purpose text, and Theme choices are unchanged.

### Interaction and responsive evidence

- The 1280 × 720 desktop render has zero horizontal overflow and the Picker remains aligned on the right.
- At 390 × 844, the title and description retain the shared header rhythm, the Picker moves to a third row aligned with the title, and the page has zero horizontal overflow.
- Browser console warnings and errors: none.
- The .NET 10 Release documentation build succeeds with 0 warnings and 0 errors.

### Findings and comparison history

1. The Picker previously contributed its 34px Height to the first Grid row, vertically displacing the description relative to every other numbered section header.
2. The initial correction removed the Height displacement but reserved 180px inside the content track; the final correction removed that width reservation so the desktop Grid columns exactly match other headers.
3. No actionable P0, P1, or P2 issue remains.

## Typography · Compact Font Family specimens

- Source issue evidence: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-204873b7-d5d8-4f59-8fd0-8d7b9a310d77.png`
- Supplied visual references: `C:\Users\micro\Downloads\IBM_Plex_Sans_sample.svg` and `C:\Users\micro\Downloads\IBM_Plex_Mono_sample.svg`
- Browser-rendered implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\typography-family-specimens-compact.jpg`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\typography-family-specimens-comparison.png`
- Route: `/foundations/typography`, Anatomy tab, Font Family subsection
- Browser viewport: 1280 × 720 CSS pixels

### Full-view and focused comparison evidence

The supplied SVGs are portrait specimen sheets with substantial whitespace inside their own view boxes. Embedding them directly would preserve that whitespace and detach the specimens from the Font Family content. The implementation instead follows their visual structure with live text rendered by the design system's shipped IBM Plex Sans and IBM Plex Mono files: paired upright and italic glyphs, a focal lowercase `a`, the source classifications, and a compact character band.

### Required fidelity surfaces

- Fonts and Typography: the two cards resolve to the actual IBM Plex Sans and IBM Plex Mono families, including real italic files.
- Spacing and layout rhythm: the specimens fill the available two-column card and measure approximately 280px high with no unused lower canvas.
- Colors and visual Tokens: the character band uses the existing Semantic action background and inverse foreground Tokens; the remaining text and boundaries use existing Theme-aware Tokens.
- Image quality and asset fidelity: no scaled raster or SVG is embedded, so glyphs remain sharp at every zoom level.
- Copy and content: the supplied `Mainframe` and `Typewriter` classifications are retained as specimen labels.

### Interaction and responsive evidence

- Light and Dark Theme renders were inspected; both retain legible surfaces and the Blue character band.
- The 1280px render has zero component or document horizontal overflow.
- The .NET 10 Release documentation build succeeds with 0 warnings and 0 errors after restarting the existing documentation host that had locked the executable.

### Findings and comparison history

1. The former cards distributed a short alphabet sample across a wide horizontal canvas, creating large detached empty regions.
2. Direct use of the supplied SVGs was rejected because their portrait canvases contain the same kind of unused whitespace.
3. The final live specimens carry materially more Typeface information in less Height while preserving the established two-card layout.
4. No actionable P0, P1, or P2 issue remains.

## Color Semantic Tokens · Reserved Picker width

- Source issue evidence: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-5dc3be85-0f0d-4553-84d0-4d8e91c3f413.png`
- Browser-rendered implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-semantic-header-constrained.jpg`
- Focused browser render: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-semantic-header-constrained-crop.jpg`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-semantic-header-constrained-comparison.png`
- Route: `/foundations/color`, Tokens tab, Semantic Tokens section, Light Theme Picker closed
- Browser viewport: 1280 × 720 CSS pixels

### Full-view and focused comparison evidence

The numbered title and description now use a maximum width calculated from their existing content track minus the 180px approved Layout measure. The absolutely positioned Theme Picker continues to sit at the upper-right edge without participating in the Heading rows. Browser geometry reports a 780.667px title and description width, a 125.167px Picker width, a 54.833px clear Gap between copy and Picker, and zero overlap.

### Required fidelity surfaces

- Fonts and Typography: the existing Section number, Heading, description, and Picker Type Styles are unchanged.
- Spacing and layout rhythm: the shared numbered Heading rows remain 45.5px tall; only the available text measure is constrained.
- Colors and visual Tokens: no Color or Theme mapping changed.
- Image quality and asset fidelity: no image or icon asset changed.
- Copy and content: all Heading, description, Theme, and table content remains unchanged.

### Interaction and responsive evidence

- The Theme Picker remains interactive and anchored at the right edge.
- At widths above 760px, the reserved 180px measure prevents Heading or description overlap.
- At 760px and below, the existing responsive rule places the Picker in its own third Grid row and removes the desktop text-width constraint.
- The page has zero document horizontal overflow at the verified desktop viewport.
- The isolated .NET 10 Release documentation build succeeds with 0 warnings and 0 errors.

### Findings and comparison history

1. The prior absolute positioning preserved shared Heading Height but allowed the text boxes to extend underneath the Picker.
2. The final rule reserves the Picker region without adding a third desktop Grid column or changing vertical rhythm.
3. No actionable P0, P1, or P2 issue remains.

## Documentation · Standardized section numbering

- Discover implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\section-numbering-standardized-discover.png`
- Foundations implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\section-numbering-standardized-foundations.png`
- Verified routes: `/`, `/discover/tokens`, `/discover/getting-started`, `/discover/version-control`, `/foundations/color`, `/foundations/typography`, `/foundations/spacing`, and `/foundations/sizing`

### Full-view and focused comparison evidence

Discover and Foundations now use generated CSS counters with the same visual contract: IBM Plex Mono at 14px and weight 400, a 24px number track, a 16px Heading Gap, and the Theme-aware muted foreground role. Discover resets its counter once per Page; every Foundation tab and Token category list retains its local restart behavior.

### Required fidelity surfaces

- Fonts and Typography: every Section number uses the same IBM Plex Mono Type treatment.
- Spacing and layout rhythm: every Section number uses the same 24px track and 16px Gap without changing Heading semantics.
- Colors and visual Tokens: every Section number resolves through `design-system-semantic-color-text-foreground-muted`; unrelated accent labels are unchanged.
- Image quality and asset fidelity: no image or icon asset was added.
- Copy and content: numbering is generated, so the visible Section copy remains the source of truth and hard-coded number spans are no longer required.

### Interaction and responsive evidence

- All eight implemented Discover and Foundation routes resolve the Section number to `rgb(93, 102, 115)` in Light Theme.
- Discover and Foundations both resolve the same Theme-aware muted value, `rgb(143, 150, 163)`, in Dark Theme.
- Every inspected route resolves the same 14px Font Size, 24px minimum number track, and 16px column Gap.
- All inspected routes report zero document horizontal overflow.
- The isolated .NET 10 Release documentation build succeeds with 0 warnings and 0 errors.

### Findings and comparison history

1. Discover previously used hard-coded 11px muted labels while Foundations used generated 14px Blue labels.
2. Discover now uses the Foundation counter mechanism and the Foundation tint now uses the same muted foreground role.
3. Numbering remains decorative and generated; Page and Section Heading semantics are unchanged.
4. No actionable P0, P1, or P2 issue remains.

## Typography · Direct Primitive emphasis weights

- Verified route: `/foundations/typography`, Anatomy and Tokens tabs
- Package version: `17.0.0`
- Removed public Token: `design-system-semantic-typography-emphasis-weight`

### Architecture and presentation evidence

The standalone Semantic emphasis Token has been removed from the Token source, manifest, documentation, and implementation consumers. Existing emphasized text now uses `design-system-primitive-typography-weight-500` directly, preserving the current result because every migrated consumer begins from a 400-weight Body, Body Large, or Caption Type Style. Typography guidance now presents emphasis as a relative Primitive Weight step: 400 to 500, 500 to 600, and 600 to 700.

### Interaction and responsive evidence

- The live Typography page identifies Preview `17.0.0`.
- Neither the Anatomy nor Tokens tab contains the removed Token or a Text Emphasis Semantic subsection.
- The Semantic category contains only Reading Type Styles and Interface Type Styles.
- The live page reports zero document horizontal overflow.
- The architecture audit passes with 110 Primitive, 88 Semantic, and 68 Component Tokens.
- The full .NET 10 verification passes: Release build, 14 contract-test groups, browser interaction smoke, NuGet pack, fresh NuGet consumer, and isolated portable-copy build all succeed with 0 warnings and 0 errors.

### Findings

1. Emphasis no longer has a misleading universal Semantic meaning.
2. Existing visuals are unchanged; only ownership and documentation changed.
3. Future direct 600 or 700 consumers must be deliberately registered by the architecture audit.
4. No actionable P0, P1, or P2 issue remains.

## Color Tokens · Floating reference TOC

- Source visual truth: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-71be7785-2c20-4b90-ba80-4acfbee9a88f.png`
- Browser-rendered implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-tokens-reference-toc-after.png`
- Responsive implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-tokens-reference-toc-narrow.png`
- Dark Theme implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-tokens-reference-toc-dark.png`
- Scroll-motion implementation: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-tokens-reference-toc-motion.png`
- Combined comparison: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-tokens-reference-toc-comparison.png`
- Route: `/foundations/color`, Tokens tab
- Source pixels: 2316 × 705. Implementation pixels: 1920 × 900 at a 1920 × 900 CSS-pixel viewport and device-pixel-ratio 1.
- Normalization: the source was resized proportionally to 1920 × 584 and placed above the 1920 × 900 implementation in one comparison image. The source supplies the persistent right-side subsection-navigation concept; the design system intentionally retains its own typography, tokens, page shell, and Token-table content.

### Full-view and focused comparison evidence

The Color Tokens page now has a distinct right-hand reference rail. Primitive Tokens and Semantic Tokens retain the established 1180px content measure, while the TOC occupies the additional 180px rail. The Page Header spans the full Documentation Main width and owns 48px Padding. The outer Anatomy/Tokens Tab List also spans the full width, so its separator reaches both Main edges while the Tab labels remain aligned to the same 48px inset. Both Color Tab panels use a deliberate 48px top Padding test override; the Anatomy subsection and Token-category list do not add a second top inset.

### Required fidelity surfaces

- Fonts and Typography: the TOC reuses the public `.design-system-tab-list` and `.design-system-tab` contracts, including their approved Label Type Style, Weight, interaction states, and focus treatment.
- Spacing and layout rhythm: the content retains the 1180px wide measure. A 32px Gap separates it from the independent 180px TOC rail, so the rail does not reduce the Token-table width at the verified desktop viewport.
- Colors and visual Tokens: the vertical rail adapts the public Tab separator and selected indicator to the inline axis; Hover, pressed, focus, text, and Boundary colors continue to resolve through the Tab component's existing design system Tokens in Light and Dark Themes.
- Image quality and asset fidelity: the reference contains no required image or icon assets; the implementation is native selectable HTML and CSS.
- Copy and content: the two links match the actual first-level Token categories and use an accessible `On this page` navigation label.

### Interaction and responsive evidence

- Both links use ordinary fragment anchors, so the reference TOC remains a subsection shortcut rather than a second content-switching Tab system and retains a no-JavaScript navigation fallback.
- The TOC targets the actual `primitive-color-tokens-title` and `semantic-color-tokens-title` Headings rather than their differently padded Section containers. While scrolled, both titles land 48px below the combined 56px global Header and 56px compact page-context row through one 160px scroll margin.
- Clicking Semantic Tokens updates the URL to `#semantic-color-tokens-title`, scrolls smoothly to that Heading, and moves `aria-current="location"` from Primitive Tokens to Semantic Tokens. The motion becomes immediate when `prefers-reduced-motion: reduce` is active.
- The rail remains sticky beside the content while scrolling through the Tokens view.
- At 700 × 900 CSS pixels, the rail moves above the content as a vertical list so it cannot overlap or compress the Token tables.
- Light and Dark Theme renders were inspected.
- Browser console errors: none.
- The .NET 10 Release library and documentation builds succeed with 0 warnings and 0 errors. The full architecture, contrast, contract, browser-smoke, NuGet-consumer, and portable-folder verification suite passes.

### Findings and comparison history

1. The first implementation incorrectly presented the links as a horizontal strip inside the content flow.
2. The rail was rebuilt as a vertically stacked reference TOC on the right and made sticky for persistent desktop access.
3. The first right-rail layout reduced the Token-table column. The Color page now expands by the approved 180px rail plus a 32px Gap, preserving the complete 1180px content measure.
4. The Color Page was expanded beyond the shared Page Region inset so the Header and outer Tab List can own their layout independently: the Header uses 48px Padding and the Tab separator reaches both Documentation Main edges.
5. The reference TOC now consumes the public design system Tab classes instead of a separate visual style, while vertical orientation and `aria-current="location"` preserve its reference-navigation meaning.
6. The public Tab-panel block Padding is 32px. Color Anatomy and Tokens deliberately override the top edge to 48px for this test, and their first content containers no longer duplicate that space.
7. No actionable P0, P1, or P2 issue remains.

## Color page · Compact sticky context

- Expanded state: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-page-context-expanded.png`
- Compact state: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-page-context-compact.png`
- Narrow compact state: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-page-context-compact-narrow.png`
- Dark Theme compact state: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-page-context-compact-dark.png`

The full Page Header remains in normal document flow. Its existing TabList occupies one stable 56px context row and becomes sticky below the global Header. Once its sentinel reaches the bottom boundary of the global Header, the row reveals an aria-hidden compact `Color` title beside the same real Anatomy and Tokens controls. The row height does not change, so the transition does not move the Tab panels.

- The compact title uses the approved Heading 3 Type Style and existing foreground Tokens. A trailing Boundary divider separates page context from the actual Tab controls, so `Color` does not read as a third Tab.
- The compact title expands through a bounded width and opacity transition; reduced-motion preference removes that transition.
- The outer Tab separator remains full-width in both states.
- At 700px the compact title and both Tabs remain on one row without wrapping.
- The reference TOC now sits 24px below the complete sticky stack.
- Light, Dark, expanded, compact, desktop, and narrow states were inspected with no console errors.
- The .NET 10 Release documentation build succeeds with 0 warnings and 0 errors.
- Primitive Tokens boundary evidence: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-compact-title-primitive-boundary.png`
- The former `isIntersecting` gate treated edge contact as visible and removed compact mode when Primitive Tokens landed at `scrollY: 230px`. An attempted geometry check inside the observer corrected the downward boundary but could not release compact mode after the sentinel re-entered the observer region. Compact mode now uses the sentinel's physical position in a requestAnimationFrame-throttled scroll check, so it resolves correctly in both directions.
- Boundary-active evidence: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-compact-boundary-visible.png`
- Boundary-released evidence: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-compact-boundary-released.png`
- At `scrollY: 230px`, Primitive Tokens places the sentinel at `55.5–56px`; compact mode is active, title opacity is `1`, and the sticky row is `56.7px` high. Scrolling upward 8px moves the sentinel to `63.5–64px`; compact mode releases and title opacity becomes `0`. Scrolling back down to the same boundary restores compact mode. The row remains `56.7px` high throughout.

final result: passed

## Color page · Reference TOC across Tab panels

- Anatomy desktop evidence: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-anatomy-reference-toc.png`
- Anatomy narrow evidence: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-anatomy-reference-toc-mobile.png`
- Tokens evidence: `C:\Users\micro\OneDrive\Documents\ChatGPT\Custom Design System\artifacts\design-qa\color-tokens-reference-toc.png`
- Route: `http://127.0.0.1:5092/foundations/color`

Both Color Tab panels now own a Reference TOC. Anatomy routes to its single Section header, `Palette`; Tokens routes to `Primitive Tokens` and `Semantic Tokens`. Each destination uses the shared sticky-context offset so its Section title settles 48px below the compact Page context.

The clicked Reference TOC item becomes current immediately. While smooth scrolling is active, normal scroll tracking is locked for that TOC and cannot replace the clicked selection with an intermediate Section. A debounced scroll-settle release returns selection control to normal scroll tracking when motion ends or is interrupted.

- Downward navigation from Primitive Tokens to Semantic Tokens retained `Semantic Tokens` for every 40ms sample throughout the animation and after settling at its 159.7px title position.
- Reverse navigation retained `Primitive Tokens` throughout the animation and after settling at its 160.2px title position.
- Anatomy exposes only `Palette`, matching the Page hierarchy instead of linking to its Gray, Blue, and Alert Colors Subsections.
- The inactive Tab panel is excluded explicitly from Reference TOC scroll tracking.
- Desktop and 700px states were visually inspected; the .NET 10 Release build succeeds with 0 warnings and 0 errors, and the browser reports no console warnings or errors.

final result: passed

## Button Anatomy · full-width state recipes with token names

- Source visual truth: `C:\Users\micro\AppData\Local\Temp\codex-clipboard-0a4dceef-d0d4-444c-acda-153e93e79f0a.png`
- Implementation evidence: Codex in-app Browser capture; the browser surface did not expose a filesystem path.
- Route: `http://127.0.0.1:5092/components/actions/button#button-filled-tint-normal-title`
- Viewport: 1265 × 712 CSS pixels, light theme.
- Inspected state: Anatomy → Filled → Tint → Normal.

Each state recipe now occupies the full content row. Its five composition specimens use that width, followed by a three-column foundation recipe that preserves the Foundation and Summary content while adding the exact Token names used by the selected Variant, Style, and State.

- The wide layout presents all five compositions in one row; responsive layouts reduce the composition count without narrowing the state card itself.
- Foundation recipes use `Foundation | Token | Summary`; the Token column receives priority while the Summary remains visible.
- Filled Negative resolves to the public `filled-danger` component tokens, and other styles and states resolve to their corresponding component or semantic tokens.
- Long token names wrap at narrow widths instead of creating cell-level scrollbars.
- The original two-column reference and the updated implementation were inspected in the same turn. Automated pixel comparison was unavailable because the in-app Browser capture did not expose a file path.
- No actionable P0, P1, or P2 visual issues remain.
- The complete verification suite passed, including architecture, contrast, contracts, browser interactions, packaging, portability, and runtime rendering.

final result: passed
