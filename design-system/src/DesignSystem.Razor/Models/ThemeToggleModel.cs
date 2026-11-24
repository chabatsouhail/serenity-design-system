using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.Models;

/// <summary>Content and layout options for the theme-toggle component.</summary>
public sealed record ThemeToggleModel
{
    public string Label { get; init; } = "Dark theme";

    public bool ShowLabel { get; init; } = true;

    public ComponentSize Size { get; init; } = ComponentSize.Medium;

    public bool Block { get; init; }

    public ButtonAlignment Alignment { get; init; } = ButtonAlignment.Center;
}
