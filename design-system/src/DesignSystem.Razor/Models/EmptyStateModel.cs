using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.Models;

/// <summary>Content for a neutral empty result or first-use state.</summary>
public sealed record EmptyStateModel(string Title, string Description)
{
    public string? ActionLabel { get; init; }

    public string? ActionHref { get; init; }

    public IconName Icon { get; init; } = IconName.Inbox;

    public int HeadingLevel { get; init; } = 2;
}
