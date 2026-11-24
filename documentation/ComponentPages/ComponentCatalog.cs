namespace DesignSystem.Documentation.ComponentPages;

public sealed record ComponentDefinition(
    string Group,
    string Slug,
    string Name,
    string Purpose,
    string[] Parts,
    string[] Variants,
    string[] Styles,
    string[] States,
    string[] AssetPaths);

public sealed record ComponentGroup(string Name, string Slug, IReadOnlyList<ComponentDefinition> Components);

public static class ComponentCatalog
{
    private static ComponentDefinition Define(
        string group,
        string slug,
        string name,
        string purpose,
        string[] parts,
        string[] variants,
        string[] styles,
        string[] states,
        params string[] assets) =>
        new(group, slug, name, purpose, parts, variants, styles, states, assets);

    private static readonly string[] InteractiveStates = ["Normal", "Hover", "Pressed", "Focused", "Disabled"];
    private static readonly string[] FieldStates = ["Empty", "Filled", "Focused", "Invalid", "Disabled", "Read-only"];
    private static readonly string[] ChoiceStates = ["Unselected", "Selected", "Focused", "Invalid", "Disabled"];
    private static readonly string[] FeedbackStyles = ["Info", "Success", "Warning", "Negative"];

    public static IReadOnlyList<ComponentGroup> Groups { get; } =
    [
        new("Actions", "actions",
        [
            Define("Actions", "button", "Button", "Triggers an immediate Action or submits a choice.", ["Container", "Label", "Leading Icon", "Trailing Icon"], ["Filled", "Tonal", "Text"], ["Tint", "Neutral", "Negative"], InteractiveStates, "components/actions/button.css", "tokens/component/button.css"),
            Define("Actions", "icon-button", "Icon Button", "Runs a compact Action whose visible content is a single Icon.", ["Container", "Icon", "Accessible Name"], ["Filled", "Tonal", "Text"], ["Tint", "Neutral", "Negative"], InteractiveStates, "components/actions/button.css", "components/actions/icon-button.css", "tokens/component/button.css"),
            Define("Actions", "button-group", "Button Group", "Orders related Actions and preserves their relationship while they wrap.", ["Group", "Primary Action", "Supporting Actions"], ["Content width", "Block"], ["Start", "Center", "Spread"], ["Default", "Wrapped"], "components/actions/button-group.css"),
            Define("Actions", "toolbar", "Toolbar", "Collects a title and a concise set of related controls into one horizontal Action region.", ["Container", "Title", "Action Group", "Separator"], ["Title and Actions", "Actions only"], ["Default"], ["Default", "Wrapped"], "components/actions/toolbar.css")
        ]),
        new("Fields", "fields",
        [
            Define("Fields", "text-field", "Text Field", "Collects a single line of free-form text using a native input.", ["Field Group", "Label", "Input", "Hint", "Error"], ["Optional", "Required"], ["Normal", "Compact", "Relaxed"], FieldStates, "components/fields/field.css"),
            Define("Fields", "password-field", "Password Field", "Collects secret text while retaining native password and autocomplete semantics.", ["Field Group", "Label", "Password Input", "Hint", "Error"], ["Current password", "New password"], ["Normal", "Compact", "Relaxed"], FieldStates, "components/fields/field.css"),
            Define("Fields", "textarea", "Textarea", "Collects longer free-form content that may span multiple lines.", ["Field Group", "Label", "Textarea", "Hint", "Error"], ["Fixed rows", "Resizable"], ["Default"], FieldStates, "components/fields/field.css", "tokens/component/textarea.css"),
            Define("Fields", "search", "Search", "Filters or locates content while keeping the native search input authoritative.", ["Container", "Search Icon", "Input", "Clear Action"], ["Empty", "With value"], ["Default"], ["Empty", "Filled", "Focused", "Invalid", "Disabled"], "components/fields/search.css"),
            Define("Fields", "number-field", "Number Field", "Collects a bounded numeric value with native input semantics and explicit step Actions.", ["Field Group", "Label", "Number Input", "Step Actions"], ["Integer", "Decimal", "Bounded"], ["Default"], FieldStates, "components/fields/number-field.css", "tokens/component/number-field.css"),
            Define("Fields", "checkbox", "Checkbox", "Lets a user select zero, one, or several independent options.", ["Native Checkbox", "Mark", "Label"], ["Unchecked", "Checked", "Indeterminate"], ["Default"], ChoiceStates, "components/fields/choice.css", "tokens/component/choice.css"),
            Define("Fields", "radio", "Radio", "Lets a user choose exactly one option from a named native group.", ["Fieldset", "Legend", "Native Radio", "Mark", "Label"], ["Unselected", "Selected"], ["Default"], ChoiceStates, "components/fields/choice.css", "tokens/component/choice.css"),
            Define("Fields", "switch", "Switch", "Changes an immediate on/off setting using native checkbox authority.", ["Native Checkbox", "Track", "Thumb", "Label"], ["Off", "On"], ["Default"], ChoiceStates, "components/fields/switch.css", "tokens/component/switch.css"),
            Define("Fields", "picker", "Picker", "Selects one value from a list while preserving a native select fallback.", ["Field Group", "Label", "Native Select", "Trigger", "Popover", "Search", "Option"], ["Field", "Inline", "Button"], ["Default", "Searchable"], ["Empty", "Selected", "Open", "Focused", "Invalid", "Disabled"], "components/fields/picker.css", "tokens/component/picker.css"),
            Define("Fields", "date-picker", "Date Picker", "Selects a date through an enhanced calendar while preserving a native date input.", ["Field Group", "Label", "Native Date Input", "Trigger", "Calendar", "Day"], ["Optional", "Required", "Bounded"], ["Default"], ["Empty", "Selected", "Open", "Focused", "Invalid", "Disabled"], "components/fields/date-picker.css", "tokens/component/date-picker.css"),
            Define("Fields", "file-upload", "File Upload", "Chooses one or more files while the native file input remains the form authority.", ["Field Group", "Label", "Native File Input", "Browse Action", "Selection"], ["Single", "Multiple"], ["Default"], ["Empty", "Selected", "Invalid", "Disabled"], "components/fields/file-upload.css")
        ]),
        new("Navigation", "navigation",
        [
            Define("Navigation", "link", "Link", "Navigates to another location without implying an immediate Action.", ["Anchor", "Label", "Optional Icon"], ["Internal", "External", "Disabled"], ["Inline"], ["Normal", "Hover", "Focused", "Visited", "Disabled"], "components/navigation/link.css"),
            Define("Navigation", "breadcrumb", "Breadcrumb", "Shows the current location within a hierarchy and links to its ancestors.", ["Navigation Landmark", "Ordered List", "Ancestor Link", "Separator", "Current Page"], ["Short path", "Long path"], ["Default"], ["Default", "Wrapped"], "components/navigation/breadcrumb.css"),
            Define("Navigation", "pagination", "Pagination", "Moves between canonical server-rendered result pages.", ["Navigation Landmark", "Previous", "Page Items", "Ellipsis", "Next"], ["First page", "Middle page", "Last page"], ["Default"], ["Available", "Current", "Unavailable"], "components/navigation/pagination.css"),
            Define("Navigation", "navigation-list", "Navigation List", "Organizes destinations into expandable hierarchy levels and exposes the current path.", ["Tree", "Branch", "Summary", "Disclosure Icon", "Destination"], ["Top level", "Subgroup", "Component"], ["Default", "Current path", "Current destination"], InteractiveStates, "components/navigation/navigation-list.css", "tokens/component/navigation-list.css"),
            Define("Navigation", "tabs", "Tabs", "Switches among peer panels while keeping one panel selected at a time.", ["Tablist", "Tab", "Selection Indicator", "Tab Panel"], ["Two tabs", "Scrollable tabs"], ["Default"], ["Normal", "Hover", "Pressed", "Focused", "Selected", "Disabled"], "components/navigation/tabs.css"),
            Define("Navigation", "segmented", "Segmented Control", "Chooses one view or mode from a compact set of mutually exclusive options.", ["Container", "Segment", "Selected Segment"], ["Text", "Icon"], ["Regular", "Compact"], ["Normal", "Hover", "Pressed", "Focused", "Selected", "Disabled"], "components/navigation/segmented.css", "tokens/component/button.css", "tokens/component/navigation-list.css"),
            Define("Navigation", "side-navigation", "Side Navigation", "Provides a persistent or responsive shell region for hierarchical navigation.", ["Container", "Header", "Scrollable Body", "Navigation Tree", "Footer"], ["Persistent", "Panel", "Popover"], ["Start side"], ["Open", "Closed", "Compact"], "components/navigation/side-navigation.css", "tokens/component/shell.css")
        ]),
        new("Data", "data",
        [
            Define("Data", "badge", "Badge", "Labels compact metadata, categories, or status without becoming an Action.", ["Container", "Label"], ["Subtle", "Solid", "Outline"], ["Neutral", "Info", "Success", "Warning", "Negative"], ["Default"], "components/data/badge.css", "tokens/component/badge.css"),
            Define("Data", "status", "Status", "Pairs a text label with a redundant visual indicator for current state.", ["Container", "Indicator", "Label"], ["Label only", "Custom indicator"], ["Neutral", "Info", "Success", "Warning", "Negative"], ["Default"], "components/data/status.css", "tokens/component/status.css"),
            Define("Data", "card", "Card", "Groups related content, metadata, media, and Actions into one bounded Surface.", ["Container", "Media", "Body", "Title", "Description", "Metadata", "Actions"], ["Content only", "With media", "Interactive"], ["Default"], ["Default", "Focused"], "components/data/card.css", "tokens/component/card.css"),
            Define("Data", "chip", "Chip", "Represents a compact filter, selection, or removable value.", ["Container", "Label", "Optional Remove Action"], ["Choice", "Selected", "Removable"], ["Default"], ["Normal", "Hover", "Pressed", "Focused", "Selected", "Disabled"], "components/fields/chip.css"),
            Define("Data", "list", "List", "Presents related records whose individual items may expose selection or navigation.", ["List", "Item", "Primary Content", "Description", "Action"], ["Static", "Action", "Selectable"], ["Default"], ["Normal", "Hover", "Pressed", "Focused", "Selected", "Disabled"], "components/data/list.css"),
            Define("Data", "table", "Table", "Presents structured data while its wrapper owns horizontal overflow semantics.", ["Scroll Region", "Table", "Header", "Body", "Row", "Cell"], ["Plain", "Row banding", "Column banding", "Compact"], ["Primary header", "Secondary header"], ["Normal", "Hover", "Selected", "Disabled"], "components/data/table.css", "tokens/component/table.css"),
            Define("Data", "row", "Row", "Groups one record across related Table Columns and carries row-level state.", ["Row", "Row Header", "Cells"], ["Data", "Selectable", "Disabled"], ["Default"], ["Normal", "Hover", "Selected", "Disabled"], "components/data/table.css", "tokens/component/table.css"),
            Define("Data", "column", "Column", "Defines a Table field, alignment, sorting, and optional filtering behavior.", ["Column Header", "Sort Action", "Sort Icon", "Filter", "Cells"], ["Text", "Numeric", "Sortable", "Filterable"], ["Start", "Center", "End"], ["Unsorted", "Ascending", "Descending"], "components/data/table.css", "tokens/component/table.css")
        ]),
        new("Feedback", "feedback",
        [
            Define("Feedback", "alert", "Alert", "Communicates persistent contextual feedback with an appropriate live-region policy.", ["Container", "Icon", "Content", "Title", "Message", "Dismiss Action"], ["Persistent", "Dismissible"], FeedbackStyles, ["Default", "Dismissed"], "components/feedback/alert.css"),
            Define("Feedback", "inline-message", "Inline Message", "Places concise feedback beside the content or control it explains.", ["Container", "Icon", "Content", "Title", "Message"], ["Title and message", "Message only"], FeedbackStyles, ["Default"], "components/feedback/inline-message.css"),
            Define("Feedback", "toast", "Toast", "Announces transient, non-blocking feedback through a managed notification host.", ["Toast Host", "Container", "Icon", "Content", "Title", "Message", "Dismiss Action"], ["Timed", "Persistent"], FeedbackStyles, ["Entering", "Visible", "Leaving"], "components/feedback/toast.css", "tokens/component/toast.css"),
            Define("Feedback", "progress", "Progress", "Reports the completion of an ongoing process with a text equivalent.", ["Container", "Label", "Value Label", "Track", "Value"], ["Determinate", "Indeterminate", "Native progress"], FeedbackStyles, ["Running", "Complete"], "components/feedback/progress.css", "tokens/component/progress.css"),
            Define("Feedback", "spinner", "Spinner", "Indicates short indeterminate activity when progress cannot be quantified.", ["Indicator", "Accessible Label"], ["Small", "Normal", "Large", "Decorative"], ["Default"], ["Running", "Reduced motion"], "components/feedback/spinner.css", "tokens/component/spinner.css"),
            Define("Feedback", "skeleton", "Skeleton", "Reserves the shape of pending content without pretending that data already exists.", ["Placeholder", "Shimmer"], ["Text line", "Block", "Circle"], ["Default"], ["Loading", "Reduced motion"], "components/feedback/skeleton.css", "tokens/component/skeleton.css"),
            Define("Feedback", "empty-state", "Empty State", "Explains an empty result or first-use condition and offers one clear next step when appropriate.", ["Container", "Icon", "Content", "Title", "Description", "Optional Action"], ["Informational", "Actionable"], ["Default"], ["Default"], "components/feedback/empty-state.css", "tokens/component/empty-state.css"),
            Define("Feedback", "error-state", "Error State", "Explains a recoverable failure and presents an explicit recovery Action.", ["Container", "Icon", "Content", "Title", "Description", "Recovery Actions"], ["Inline", "Page region"], ["Negative"], ["Default", "Retrying"], "components/feedback/error-state.css"),
            Define("Feedback", "busy-region", "Busy Region", "Temporarily prevents interaction with pending content while announcing its busy status.", ["Region", "Inert Content", "Overlay", "Spinner", "Status Label"], ["Inline", "Overlay"], ["Default"], ["Idle", "Busy"], "components/feedback/busy-state.css")
        ]),
        new("Overlays", "overlays",
        [
            Define("Overlays", "menu", "Menu", "Presents a temporary list of Actions anchored to a trigger.", ["Trigger", "Menu Surface", "Label", "Menu Item", "Separator", "Metadata"], ["Text item", "Icon item", "Described item", "Danger item"], ["Below", "Above", "Start aligned"], ["Closed", "Open", "Focused item", "Disabled item"], "components/navigation/menu.css"),
            Define("Overlays", "context-menu", "Context Menu", "Opens a Menu near a pointer invocation point without replacing keyboard-accessible Actions.", ["Invocation Target", "Menu Surface", "Menu Item", "Metadata"], ["Pointer", "Keyboard fallback"], ["Invocation point"], ["Closed", "Open", "Focused item"], "components/navigation/menu.css"),
            Define("Overlays", "popover", "Popover", "Keeps supplemental interactive content close to its trigger.", ["Trigger", "Anchored Surface", "Header", "Body", "Footer"], ["Informational", "Interactive"], ["Above", "Below", "Start aligned"], ["Closed", "Open", "Focused"], "components/overlays/popover.css"),
            Define("Overlays", "tooltip", "Tooltip", "Provides a concise accessible name or description on Hover and Focus.", ["Trigger", "Tooltip Surface", "Text"], ["Label", "Description"], ["Above", "Below"], ["Hidden", "Visible"], "components/overlays/tooltip.css", "tokens/component/tooltip.css"),
            Define("Overlays", "dialog", "Dialog", "Contains a modal task with a title, bounded body, and ordered Actions.", ["Dialog Surface", "Header", "Title", "Close Action", "Body", "Footer"], ["Small", "Normal", "Large"], ["Modal"], ["Closed", "Opening", "Open", "Closing"], "components/overlays/dialog.css"),
            Define("Overlays", "drawer", "Drawer", "Presents a secondary modal task or detail view from one side of the viewport.", ["Drawer Surface", "Header", "Title", "Close Action", "Body", "Footer"], ["Start side", "End side"], ["Modal"], ["Closed", "Opening", "Open", "Closing"], "components/overlays/drawer.css"),
            Define("Overlays", "confirmation-dialog", "Confirmation Dialog", "Requests an explicit decision before a consequential or destructive Action.", ["Dialog Surface", "Title", "Consequence", "Cancel Action", "Confirm Action"], ["Standard", "Destructive"], ["Compact modal"], ["Closed", "Open", "Confirmed", "Cancelled"], "components/overlays/dialog.css")
        ])
    ];

    public static IReadOnlyList<ComponentDefinition> All { get; } = Groups.SelectMany(group => group.Components).ToArray();

    public static ComponentDefinition? Find(string? group, string? slug) =>
        All.FirstOrDefault(component =>
            string.Equals(component.Group, group, StringComparison.OrdinalIgnoreCase)
            && string.Equals(component.Slug, slug, StringComparison.OrdinalIgnoreCase));
}
