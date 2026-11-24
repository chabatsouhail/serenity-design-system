namespace DesignSystem.Documentation.FoundationPages;

public static class FoundationCatalog
{
    public static FoundationPageDefinition Layout { get; } = new(
        "layout",
        "Layout",
        "Layout gives content a readable measure, repeatable structure, and responsive boundaries without owning application-specific composition.",
        "Composition",
        "Layout describes how content occupies available space. Measures constrain reading, grids organize peers, and state regions reserve a stable place for feedback.",
        [
            new("content-measure", "Content Measure", "A maximum inline measure keeps reading comfortable while allowing the surrounding page to remain fluid.", "layout-measure", "Three text lines constrained to a readable content measure"),
            new("responsive-grid", "Responsive Grid", "Columns repeat while space permits and collapse without changing the relationship between peer items.", "layout-grid", "Three equal grid columns that collapse as available width narrows"),
            new("state-region", "State Region", "Empty, error, and busy states receive a minimum height and a narrower content measure for stable placement.", "layout-state", "A centered empty-state message inside a reserved region")
        ],
        [
            Group("measures", "Measures", "Raw content and structural dimensions available to Layout.",
                P("72ch", "--design-system-primitive-layout-measure-72ch", "measure", "Readable line-length measure"),
                P("48ch", "--design-system-primitive-layout-measure-48ch", "measure", "Compact state-content measure"),
                P("1180px", "--design-system-primitive-layout-measure-1180", "measure", "Wide content boundary"),
                P("180px", "--design-system-primitive-layout-measure-180", "measure", "Minimum structural dimension"))
        ],
        [
            Group("content-measures", "Content Measures", "Maximum widths for primary reading and wide page content.",
                S("Readable Content", "Comfortable maximum line length for long-form content.", "72ch", "--design-system-semantic-layout-content-measure-readable", "measure", "--design-system-primitive-layout-measure-72ch"),
                S("Wide Content", "Maximum width for broad documentation and application regions.", "1180px", "--design-system-semantic-layout-content-measure-wide", "measure", "--design-system-primitive-layout-measure-1180")),
            Group("structural-measures", "Structural Measures", "Minimum dimensions that stabilize repeated grids and state regions.",
                S("Grid Column Minimum", "Smallest preferred width of an automatically repeated grid column.", "180px", "--design-system-semantic-layout-grid-column-minimum", "measure", "--design-system-primitive-layout-measure-180"),
                S("State Minimum Height", "Reserved minimum height for empty, error, and busy regions.", "180px", "--design-system-semantic-layout-state-minimum-height", "measure", "--design-system-primitive-layout-measure-180"),
                S("State Content Measure", "Maximum width of explanatory state content.", "48ch", "--design-system-semantic-layout-state-content-measure", "measure", "--design-system-primitive-layout-measure-48ch"))
        ]);

    public static FoundationPageDefinition Shape { get; } = new(
        "shape",
        "Shape",
        "Shape defines corner character and boundary strength so Controls, Containers, overlays, and focus remain visually related.",
        "Geometry",
        "Shape combines corner radius and boundary width. Radius communicates the kind of object; boundaries separate, contain, or focus it.",
        [
            new("control-shape", "Control Shape", "Interactive Controls use a compact radius that supports dense layouts without looking sharp.", "shape-control", "A field and button using the shared control radius"),
            new("container-shape", "Container Shape", "Containers and floating Surfaces use a slightly broader radius to establish a larger visual unit.", "shape-container", "A container and floating overlay using their shared radius"),
            new("boundary-focus", "Boundary and Focus", "Subtle, standard, and focus widths create increasing emphasis without changing the object itself.", "shape-boundary", "Subtle boundary, standard boundary, and focus ring examples")
        ],
        [
            Group("corner-radius", "Corner Radius", "Raw radius Values from compact corners to a fully rounded pill.",
                P("6px", "--design-system-primitive-shape-radius-6", "radius", "Small corner radius"),
                P("8px", "--design-system-primitive-shape-radius-8", "radius", "Control corner radius"),
                P("10px", "--design-system-primitive-shape-radius-10", "radius", "Container and overlay corner radius"),
                P("12px", "--design-system-primitive-shape-radius-12", "radius", "Large corner radius"),
                P("999px", "--design-system-primitive-shape-radius-999", "radius", "Fully rounded geometry")),
            Group("border-width", "Border Width", "Raw line widths for subtle boundaries, standard boundaries, and focus.",
                P("0.5px", "--design-system-primitive-shape-border-width-0-5", "border", "Hairline boundary"),
                P("1px", "--design-system-primitive-shape-border-width-1", "border", "Standard boundary"),
                P("2px", "--design-system-primitive-shape-border-width-2", "border", "Strong or focus boundary"))
        ],
        [
            Group("radii", "Radii", "Purpose-based corner geometry for interactive and containing objects.",
                S("Control Radius", "Buttons, fields, tabs, and compact interactive objects.", "8px", "--design-system-semantic-shape-control-radius", "radius", "--design-system-primitive-shape-radius-8"),
                S("Container Radius", "Cards, panels, and bounded content regions.", "10px", "--design-system-semantic-shape-container-radius", "radius", "--design-system-primitive-shape-radius-10"),
                S("Overlay Radius", "Menus, popovers, dialogs, and other floating Surfaces.", "10px", "--design-system-semantic-shape-overlay-radius", "radius", "--design-system-primitive-shape-radius-10")),
            Group("boundaries", "Boundaries and Focus", "Purpose-based line strengths for separation and keyboard focus.",
                S("Focus Width", "Visible keyboard focus ring thickness.", "2px", "--design-system-semantic-shape-focus-width", "border", "--design-system-primitive-shape-border-width-2"),
                S("Boundary Width", "Standard Component and Container boundary.", "1px", "--design-system-semantic-shape-boundary-width", "border", "--design-system-primitive-shape-border-width-1"),
                S("Subtle Boundary", "Hairline separation between adjacent internal regions.", "0.5px", "--design-system-semantic-shape-boundary-width-subtle", "border", "--design-system-primitive-shape-border-width-0-5"))
        ]);

    public static FoundationPageDefinition Elevation { get; } = new(
        "elevation",
        "Elevation",
        "Elevation establishes which Surface is above another through Layer order, shadow, scrim, and controlled Surface progression.",
        "Depth",
        "Elevation is relational. Surface Layering establishes the visible hierarchy, shadows separate floating objects, and Layer values resolve overlap.",
        [
            new("surface-layering", "Surface Layering", "The Page Canvas sits below contained Surfaces; floating and selected Surfaces become progressively distinct from what they cover.", "elevation-surfaces", "Page, surface, elevated surface, and selected surface shown as nested layers"),
            new("shadow-depth", "Shadow Depth", "Overlay and Dialog shadows communicate different separation distances without replacing Surface contrast.", "elevation-shadow", "Overlay and dialog cards using their respective shadows"),
            new("layer-order", "Layer Order", "Overlay, Dialog, and Toast layers create a predictable stacking order for temporary interface regions.", "elevation-layer", "Overlapping overlay, dialog, and toast layers in ascending order")
        ],
        [
            Group("shadow-geometry", "Shadow Geometry", "Raw shadow offsets and blur radii; color and opacity are composed later.",
                P("0 12px 30px", "--design-system-primitive-elevation-shadow-0-12-30", "shadow-primitive", "Overlay shadow geometry"),
                P("0 20px 60px", "--design-system-primitive-elevation-shadow-0-20-60", "shadow-primitive", "Dialog shadow geometry")),
            Group("layer-order", "Layer Order", "Raw stacking Values reserved for increasingly dominant temporary interface layers.",
                P("20", "--design-system-primitive-elevation-layer-20", "layer", "Sticky content layer"),
                P("40", "--design-system-primitive-elevation-layer-40", "layer", "Overlay layer source"),
                P("50", "--design-system-primitive-elevation-layer-50", "layer", "Intermediate stacking source"),
                P("70", "--design-system-primitive-elevation-layer-70", "layer", "Dialog layer source"),
                P("90", "--design-system-primitive-elevation-layer-90", "layer", "Toast layer source"))
        ],
        [
            Group("effects", "Shadows and Scrim", "Composed depth effects that add Color and Opacity to Primitive geometry.",
                S("Overlay Shadow", "Shadow under menus, pickers, and popovers.", "0 12px 30px · 14%", "--design-system-semantic-elevation-overlay-shadow", "shadow-semantic", "--design-system-primitive-elevation-shadow-0-12-30", "--design-system-primitive-color-gray-950", "--design-system-primitive-opacity-14"),
                S("Dialog Shadow", "Stronger shadow under modal Dialogs.", "0 20px 60px · 22%", "--design-system-semantic-elevation-dialog-shadow", "shadow-semantic", "--design-system-primitive-elevation-shadow-0-20-60", "--design-system-primitive-color-gray-950", "--design-system-primitive-opacity-22"),
                S("Scrim Background", "Translucent layer separating modal content from the Page below.", "Gray 950 · 34%", "--design-system-semantic-elevation-scrim-background", "scrim", "--design-system-primitive-color-gray-950", "--design-system-primitive-opacity-34")),
            Group("semantic-layers", "Semantic Layers", "Named overlap priorities for temporary interface regions.",
                S("Overlay Layer", "Menus, pickers, popovers, and tooltips.", "40", "--design-system-semantic-elevation-overlay-layer", "layer", "--design-system-primitive-elevation-layer-40"),
                S("Dialog Layer", "Modal dialogs and their contained interactions.", "70", "--design-system-semantic-elevation-dialog-layer", "layer", "--design-system-primitive-elevation-layer-70"),
                S("Toast Layer", "Time-sensitive messages that must remain above other temporary content.", "90", "--design-system-semantic-elevation-toast-layer", "layer", "--design-system-primitive-elevation-layer-90"))
        ]);

    public static FoundationPageDefinition Icons { get; } = new(
        "icons",
        "Icons",
        "Icons provide compact visual cues while preserving text, accessible names, and predictable Control alignment.",
        "Icon System",
        "Icons use one visual family and three approved sizes. Their meaning comes from context and accessible naming, not from the glyph alone.",
        [
            new("icon-form", "Form", "Every icon uses the same stroke character, view box, and optical alignment so mixed actions feel related.", "icons-form", "A selection of system icons shown with consistent stroke and alignment"),
            new("icon-size", "Size", "Small, Medium, and Large sizes align icons with the Type Style and Control that contains them.", "icons-size", "The same information icon shown at small, medium, and large sizes"),
            new("icon-meaning", "Meaning and Naming", "Decorative icons are hidden from assistive technology; standalone icons receive an accessible name that states the action or information.", "icons-meaning", "A labeled action icon and a decorative icon beside visible text")
        ],
        [
            Group("icon-sizes", "Icon Sizes", "Raw square dimensions for the shipped icon set.",
                P("14px", "--design-system-primitive-icons-size-14", "icon", "Small icon box"),
                P("16px", "--design-system-primitive-icons-size-16", "icon", "Medium icon box"),
                P("20px", "--design-system-primitive-icons-size-20", "icon", "Large icon box"))
        ],
        [
            Group("control-icon-sizes", "Control Icon Sizes", "Purpose-based icon dimensions aligned to Component sizes.",
                S("Small Control Icon", "Icons in compact Actions and dense supporting Controls.", "14px", "--design-system-semantic-icons-control-size-small", "icon", "--design-system-primitive-icons-size-14"),
                S("Medium Control Icon", "Default icon size for standard Controls.", "16px", "--design-system-semantic-icons-control-size-medium", "icon", "--design-system-primitive-icons-size-16"),
                S("Large Control Icon", "Icons in prominent or relaxed Controls.", "20px", "--design-system-semantic-icons-control-size-large", "icon", "--design-system-primitive-icons-size-20"))
        ]);

    public static FoundationPageDefinition Motion { get; } = new(
        "motion",
        "Motion",
        "Motion communicates response and continuity through restrained scale changes that never become required for understanding.",
        "Transformation",
        "Motion describes what changes between states. Press feedback compresses an object; indicators reveal from a reduced scale; reduced-motion mode removes nonessential travel.",
        [
            new("press-feedback", "Press Feedback", "A brief scale reduction confirms that a pointer or key press reached an interactive Control.", "motion-press", "A control shown at rest and at its pressed scale"),
            new("indicator-reveal", "Indicator Reveal", "Selection and activity indicators can reveal from a smaller scale while their final position remains stable.", "motion-indicator", "An indicator transitioning from half scale to full scale"),
            new("reduced-motion", "Reduced Motion", "When reduced motion is requested, transformations become effectively instantaneous while state changes remain visible.", "motion-reduced", "The same state change presented without visible travel")
        ],
        [
            Group("scale-values", "Scale Values", "Raw scale factors used for press feedback and hidden indicators.",
                P("0.97", "--design-system-primitive-motion-scale-0-97", "scale", "Standard pressed scale"),
                P("0.95", "--design-system-primitive-motion-scale-0-95", "scale", "Compact pressed scale"),
                P("0.5", "--design-system-primitive-motion-scale-0-5", "scale", "Hidden indicator scale"))
        ],
        [
            Group("interaction-scale", "Interaction Scale", "Purpose-based transformations for standard and compact Controls.",
                S("Press Scale", "Pressed transformation for a standard interactive Control.", "0.97", "--design-system-semantic-motion-interaction-scale-press", "scale", "--design-system-primitive-motion-scale-0-97"),
                S("Compact Press Scale", "Stronger pressed transformation for a small interactive Control.", "0.95", "--design-system-semantic-motion-interaction-scale-press-compact", "scale", "--design-system-primitive-motion-scale-0-95")),
            Group("indicator-scale", "Indicator Scale", "Transformation used before an indicator becomes visible.",
                S("Hidden Indicator Scale", "Starting scale of a selection or activity indicator before reveal.", "0.5", "--design-system-semantic-motion-indicator-scale-hidden", "scale", "--design-system-primitive-motion-scale-0-5"))
        ]);

    public static FoundationPageDefinition Timing { get; } = new(
        "timing",
        "Timing",
        "Timing controls how quickly interaction feedback begins, resolves, and settles so the interface feels responsive and coherent.",
        "Temporal Rhythm",
        "Timing describes when a visual change occurs. Short press and release durations confirm input; a standard duration and easing curve preserve continuity.",
        [
            new("press-timing", "Press", "Press feedback begins quickly so the interface acknowledges input without perceived delay.", "timing-press", "A short bar representing the press duration"),
            new("release-timing", "Release and Change", "Release is slightly longer than press, while standard changes have enough time to remain legible.", "timing-duration", "Press, release, and standard durations compared as three bars"),
            new("easing", "Easing", "Press easing settles into the active state; standard easing produces a controlled deceleration for ordinary transitions.", "timing-easing", "Two motion paths comparing press and standard easing")
        ],
        [
            Group("durations", "Durations", "Raw time Values for interaction feedback and reduced motion.",
                P("80ms", "--design-system-primitive-timing-duration-80ms", "duration", "Fast feedback duration"),
                P("120ms", "--design-system-primitive-timing-duration-120ms", "duration", "Release feedback duration"),
                P("200ms", "--design-system-primitive-timing-duration-200ms", "duration", "Standard transition duration"),
                P("0.01ms", "--design-system-primitive-timing-duration-0-01ms", "duration", "Effective duration under reduced motion")),
            Group("easing-curves", "Easing Curves", "Raw cubic Bézier curves that shape acceleration and deceleration.",
                P("cubic-bezier(.2, 0, 0, 1)", "--design-system-primitive-timing-easing-cubic-bezier-0-2-0-0-1", "easing", "Standard deceleration curve"),
                P("cubic-bezier(0, 0, .2, 1)", "--design-system-primitive-timing-easing-cubic-bezier-0-0-0-2-1", "easing", "Press response curve"))
        ],
        [
            Group("interaction-durations", "Interaction Durations", "Purpose-based durations for the phases of an interaction.",
                S("Press Duration", "Time used to enter a pressed state.", "80ms", "--design-system-semantic-timing-interaction-duration-press", "duration", "--design-system-primitive-timing-duration-80ms"),
                S("Release Duration", "Time used to leave a pressed state.", "120ms", "--design-system-semantic-timing-interaction-duration-release", "duration", "--design-system-primitive-timing-duration-120ms"),
                S("Standard Duration", "Default duration for ordinary state transitions.", "200ms", "--design-system-semantic-timing-interaction-duration-standard", "duration", "--design-system-primitive-timing-duration-200ms")),
            Group("interaction-easing", "Interaction Easing", "Purpose-based curves for press feedback and standard transitions.",
                S("Press Easing", "Curve used while entering a pressed state.", "cubic-bezier(0, 0, .2, 1)", "--design-system-semantic-timing-interaction-easing-press", "easing", "--design-system-primitive-timing-easing-cubic-bezier-0-0-0-2-1"),
                S("Standard Easing", "Curve used for ordinary state transitions.", "cubic-bezier(.2, 0, 0, 1)", "--design-system-semantic-timing-interaction-easing-standard", "easing", "--design-system-primitive-timing-easing-cubic-bezier-0-2-0-0-1"))
        ]);

    private static FoundationTokenGroupDefinition Group(
        string slug,
        string name,
        string purpose,
        params FoundationTokenDefinition[] tokens) => new(slug, name, purpose, tokens);

    private static FoundationTokenDefinition P(string value, string token, string preview, string purpose) =>
        FoundationTokenDefinition.Primitive(value, token, preview, purpose);

    private static FoundationTokenDefinition S(
        string name,
        string purpose,
        string value,
        string token,
        string preview,
        params string[] sources) => FoundationTokenDefinition.Semantic(name, purpose, value, token, preview, sources);
}
