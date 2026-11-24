namespace DesignSystem.Razor.Models;

/// <summary>Server-rendered date input state.</summary>
public sealed record DatePickerModel(string Id, string Name, string Label)
{
    public DateOnly? Value { get; init; }

    public DateOnly? Minimum { get; init; }

    public DateOnly? Maximum { get; init; }

    public string? Hint { get; init; }

    public string? Error { get; init; }

    public bool Disabled { get; init; }

    public bool Required { get; init; }

    public string RequiredLabel { get; init; } = "Required";

    public string EmptyLabel { get; init; } = "Choose a date";

    public string DialogLabel { get; init; } = "Choose a date";

    public string PreviousMonthLabel { get; init; } = "Previous month";

    public string NextMonthLabel { get; init; } = "Next month";

    public string TodayLabel { get; init; } = "Today";

    public string ClearLabel { get; init; } = "Clear";
}
