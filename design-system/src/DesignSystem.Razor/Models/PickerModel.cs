using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.Models;

/// <summary>An option rendered by the native and enhanced picker surfaces.</summary>
public sealed record PickerOption(
    string Value,
    string Label,
    bool Disabled = false,
    string? Description = null);

/// <summary>Server-rendered picker state. The native select is always the form authority.</summary>
public sealed record PickerModel(
    string Id,
    string Name,
    string Label,
    IReadOnlyList<PickerOption> Options)
{
    public string? Value { get; init; }

    public string? Hint { get; init; }

    public string? Error { get; init; }

    public bool Disabled { get; init; }

    public bool Required { get; init; }

    public string RequiredLabel { get; init; } = "Required";

    public bool Searchable { get; init; }

    public string Placeholder { get; init; } = "Select an option";

    public string NoResultsLabel { get; init; } = "No matching options";

    public string SearchLabel { get; init; } = "Search options";

    public PickerPresentation Presentation { get; init; } = PickerPresentation.Field;

    /// <summary>Indicates that this picker currently represents an applied filter.</summary>
    public bool IsFilterActive { get; init; }
}
