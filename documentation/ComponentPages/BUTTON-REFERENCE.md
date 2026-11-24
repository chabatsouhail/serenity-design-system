# Button reference presentation

The five reference tabs separate five questions: construction, emphasis, intent and state, live configuration, and Token ownership. The existing reusable Button contract is unchanged.

The anatomy illustration magnifies the real Button and reads its rendered geometry. SVG guides are documentation annotations; their coordinates and adaptive magnification are measured data. Values shown in guides describe the unscaled component. The normal mouse/keyboard baseline is 34px; the actual illustrated height follows the production coarse-pointer minimum when applicable.

The playground composes public classes and attributes. It uses the public preview-state hook for simulated Hover, Pressed, and Focused appearances and excludes those hooks from exported HTML. Loading reproduces the server helper's Spinner, retained Label, status message, and disabled contract. Page theme controls use the public Theme API and stay synchronized with the navigation theme switch.

All tab panels are delivered without a hidden attribute. The Tabs module hides unselected panels after enhancement, so all content remains visible without JavaScript. Small screens use 16px page insets; only the comparison matrix, Token wrappers, and unwrapped long-label specimen may scroll horizontally.

Verification: run the existing reusable-library verification and `documentation/tests/button-reference.smoke.cjs` with Playwright available on NODE_PATH. The reference smoke covers configuration constraints, actual measurements, copied markup, keyboard activation, theme synchronization, filtering, seven widths, long Labels, reduced motion, forced colors, no JavaScript, and coarse pointers.
