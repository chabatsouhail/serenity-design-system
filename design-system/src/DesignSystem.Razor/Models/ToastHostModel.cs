using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.Models;

/// <summary>Announcement behavior for the toast host.</summary>
public sealed record ToastHostModel
{
    public string Label { get; init; } = "Notifications";

    public LiveRegionMode LiveMode { get; init; } = LiveRegionMode.Polite;
}
