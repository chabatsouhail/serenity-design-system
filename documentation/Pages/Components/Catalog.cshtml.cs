using System.Text.RegularExpressions;
using DesignSystem.Documentation.ComponentPages;
using DesignSystem.Razor.Contracts;
using DesignSystem.Razor.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DesignSystem.Documentation.Pages.Components;

public sealed record ComponentTokenReference(string Role, string Name, string Resolution);

public sealed class CatalogModel(IWebHostEnvironment environment) : PageModel
{
    private static readonly Regex TokenReferencePattern = new(
        @"--design-system-(?:component|semantic|primitive)-[a-z0-9-]+",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private static readonly Regex TokenDeclarationPattern = new(
        @"(?<name>--design-system-component-[a-z0-9-]+)\s*:\s*(?<value>[^;]+);",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private static readonly IReadOnlyDictionary<string, string> PartDescriptions = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["Container"] = "Owns the component boundary, layout, and shared visual state.",
        ["Accessible Name"] = "Names an Icon-only or otherwise unlabeled interactive control for assistive technology.",
        ["Icon"] = "Reinforces meaning without replacing the accessible text contract.",
        ["Leading Icon"] = "Optional Icon placed before the Label in reading order.",
        ["Trailing Icon"] = "Optional Icon placed after the Label in reading order.",
        ["Field Group"] = "Associates the Label, native control, Hint, and Error as one form unit.",
        ["Label"] = "Names the control or content in visible reading order.",
        ["Input"] = "The native form authority for value, focus, validation, and submission.",
        ["Password Input"] = "The native password authority for secure entry and autocomplete.",
        ["Textarea"] = "The native multi-line form authority.",
        ["Hint"] = "Provides optional supporting guidance through an explicit description relationship.",
        ["Error"] = "Explains invalid input and participates in the accessible description.",
        ["Trigger"] = "Opens or closes the related floating or modal Surface.",
        ["Popover"] = "Anchors the temporary option Surface to its trigger.",
        ["Option"] = "Represents one selectable value with native-equivalent state.",
        ["Native Select"] = "Preserves form submission and no-JavaScript operation.",
        ["Native Date Input"] = "Preserves date semantics, validation, and no-JavaScript operation.",
        ["Native File Input"] = "Owns the chooser and submitted file value.",
        ["Browse Action"] = "Invokes the native file chooser after enhancement.",
        ["Selection"] = "Reports the currently selected file name or empty state.",
        ["Mark"] = "Draws the visible selected, indeterminate, or unselected state.",
        ["Track"] = "Shows the available range or switch body.",
        ["Thumb"] = "Moves between the off and on positions.",
        ["Tablist"] = "Groups peer Tabs and supplies the arrow-key navigation boundary.",
        ["Tab"] = "Selects exactly one associated Tab Panel.",
        ["Tab Panel"] = "Contains the content associated with one Tab.",
        ["Selection Indicator"] = "Marks the selected destination without changing layout.",
        ["Navigation Landmark"] = "Names the navigation region for assistive technology.",
        ["Ordered List"] = "Preserves hierarchy and sequence in native document structure.",
        ["Current Page"] = "Identifies the non-link destination represented by the current view.",
        ["Scroll Region"] = "Owns Table overflow, its accessible name, and keyboard focus.",
        ["Table"] = "Owns native row-and-column relationships.",
        ["Row"] = "Groups the Cells belonging to one record.",
        ["Cell"] = "Contains one value at a Row and Column intersection.",
        ["Header"] = "Names or controls the content region that follows.",
        ["Body"] = "Contains the component’s primary content.",
        ["Footer"] = "Holds supporting or completion Actions after the Body.",
        ["Title"] = "Provides the component’s primary heading or identity.",
        ["Description"] = "Provides supporting context below the primary identity.",
        ["Actions"] = "Contains the controls that operate on the component content.",
        ["Dismiss Action"] = "Removes dismissible feedback without obscuring its message.",
        ["Status Label"] = "Announces the current progress or busy condition.",
        ["Overlay"] = "Visually separates pending or modal content from its surroundings.",
        ["Dialog Surface"] = "Owns modal semantics, focus containment, and visual elevation.",
        ["Drawer Surface"] = "Owns the side-anchored modal Surface and focus containment.",
        ["Menu Surface"] = "Owns the temporary Action list and keyboard-navigation boundary.",
        ["Menu Item"] = "Represents one Action inside the Menu keyboard model.",
        ["Separator"] = "Visually groups related content without becoming an interactive stop."
    };

    public ComponentDefinition Definition { get; private set; } = null!;
    public IReadOnlyList<ComponentTokenReference> ComponentTokens { get; private set; } = [];
    public IReadOnlyList<ComponentTokenReference> FoundationTokens { get; private set; } = [];

    public PickerModel Picker { get; } = new(
        "catalog-picker", "picker", "Customer",
        [new("customer-1", "Ada Lovelace", Description: "Primary customer"), new("customer-2", "Grace Hopper", Description: "Active account"), new("customer-3", "Unavailable example", Disabled: true)])
    {
        Value = "customer-1",
        Hint = "The native select remains the form authority.",
        Searchable = true,
        Required = true
    };

    public DatePickerModel DatePicker { get; } = new("catalog-date", "date", "Review date")
    {
        Value = new DateOnly(2026, 9, 4),
        Minimum = new DateOnly(2026, 1, 1),
        Maximum = new DateOnly(2026, 12, 31),
        Hint = "Choose a date in 2026.",
        Required = true
    };

    public FileUploadModel FileUpload { get; } = new("catalog-file", "attachment", "Attachment")
    {
        Accept = ".pdf,.png",
        Hint = "PDF or PNG, up to the application limit.",
        Required = true
    };

    public PaginationModel Pagination { get; } = new(5, 12, "?page={page}")
    {
        Label = "Example result pages"
    };

    public EmptyStateModel EmptyState { get; } = new("No records yet", "Create the first record to begin using this view.")
    {
        ActionLabel = "Create record",
        ActionHref = "#catalog-live-example-title",
        Icon = IconName.Inbox,
        HeadingLevel = 4
    };

    public IActionResult OnGet(string? group, string? slug)
    {
        Definition = ComponentCatalog.Find(group, slug)!;
        if (Definition is null || string.Equals(Definition.Slug, "button", StringComparison.OrdinalIgnoreCase)) return NotFound();

        (ComponentTokens, FoundationTokens) = ReadTokens(Definition);
        ViewData["Title"] = Definition.Name;
        return Page();
    }

    public string DescribePart(string part) =>
        PartDescriptions.TryGetValue(part, out var description)
            ? description
            : $"Provides the {part.ToLowerInvariant()} responsibility within the component contract.";

    public string EnhancementModel => Definition.Slug switch
    {
        "picker" or "date-picker" or "file-upload" => "Progressive enhancement over a native form control",
        "search" or "number-field" or "tabs" or "segmented" or "navigation-list" or "side-navigation" => "Native structure with idempotent JavaScript enhancement",
        "menu" or "context-menu" or "popover" or "tooltip" or "dialog" or "drawer" or "confirmation-dialog" or "toast" => "JavaScript-enhanced interaction with explicit public hooks",
        _ => "Native HTML behavior with design-system presentation"
    };

    public string KeyboardContract => Definition.Group switch
    {
        "Fields" => "The native form control owns Tab focus, editing, validation, and submission. Enhancement preserves those semantics.",
        "Navigation" => "Tab reaches destinations or the active control; arrow keys operate only inside components whose public keyboard model defines them.",
        "Overlays" => "The trigger remains keyboard reachable; open Surfaces manage focus and restore it to the trigger when closed.",
        "Actions" => "Tab reaches each enabled Action; Enter and Space activate native Buttons.",
        _ => "Native reading and focus order remain authoritative; interactive descendants retain their own keyboard contracts."
    };

    public string ResponsiveContract => Definition.Group switch
    {
        "Fields" => "The control fills its parent’s available width without changing its value or validation meaning.",
        "Navigation" => "Content may wrap or scroll only where the component contract explicitly owns overflow.",
        "Overlays" => "The Surface remains inside the viewport and reduces its available measure before content is clipped.",
        "Data" => "Content reflows where safe; Tables keep their native structure and place overflow on the named wrapper.",
        _ => "The component keeps its semantic meaning at 320px and lets its parent composition decide wrapping or stacking."
    };

    public string NoJavaScriptContract => Definition.Slug switch
    {
        "picker" => "The native select remains visible and fully operable.",
        "date-picker" => "The native date input remains visible and fully operable.",
        "file-upload" => "The native file input remains visible and submits the selected file.",
        "tabs" => "Every server-rendered panel remains available in document order.",
        "side-navigation" or "navigation-list" => "Native links and disclosure elements remain usable.",
        "menu" or "context-menu" or "popover" or "tooltip" or "dialog" or "drawer" or "confirmation-dialog" or "toast" => "Triggers without a native destination stay hidden until their behavior is connected.",
        _ => "The component keeps its native content, focus, and form or navigation behavior."
    };

    private (IReadOnlyList<ComponentTokenReference> Component, IReadOnlyList<ComponentTokenReference> Foundation) ReadTokens(ComponentDefinition definition)
    {
        var text = string.Join(Environment.NewLine, definition.AssetPaths.Select(ReadAsset));
        var declarations = TokenDeclarationPattern.Matches(text)
            .Select(match => new
            {
                Name = match.Groups["name"].Value,
                Resolution = Regex.Replace(match.Groups["value"].Value.Trim(), @"\s+", " ")
            })
            .GroupBy(token => token.Name, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.First().Resolution, StringComparer.Ordinal);

        var names = TokenReferencePattern.Matches(text).Select(match => match.Value).Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
        var component = names
            .Where(name => name.StartsWith("--design-system-component-", StringComparison.Ordinal))
            .Select(name => new ComponentTokenReference(ToRole(name), name, declarations.GetValueOrDefault(name, "Referenced component contract")))
            .ToArray();
        var foundation = names
            .Where(name => !name.StartsWith("--design-system-component-", StringComparison.Ordinal))
            .Select(name => new ComponentTokenReference(ToRole(name), name, name.StartsWith("--design-system-semantic-", StringComparison.Ordinal) ? "Shared Semantic input" : "Approved Primitive value"))
            .ToArray();
        return (component, foundation);
    }

    private string ReadAsset(string asset)
    {
        var file = environment.WebRootFileProvider.GetFileInfo($"_content/DesignSystem.Razor/css/{asset}");
        if (!file.Exists) return string.Empty;
        using var stream = file.CreateReadStream();
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    private static string ToRole(string token)
    {
        var tail = token.Replace("--design-system-component-", string.Empty, StringComparison.Ordinal)
            .Replace("--design-system-semantic-", string.Empty, StringComparison.Ordinal)
            .Replace("--design-system-primitive-", string.Empty, StringComparison.Ordinal);
        return string.Join(' ', tail.Split('-', StringSplitOptions.RemoveEmptyEntries).TakeLast(4).Select(word => char.ToUpperInvariant(word[0]) + word[1..]));
    }
}
