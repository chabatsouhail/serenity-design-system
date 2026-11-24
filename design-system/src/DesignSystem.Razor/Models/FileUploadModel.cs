namespace DesignSystem.Razor.Models;

/// <summary>Server-rendered file upload state.</summary>
public sealed record FileUploadModel(string Id, string Name, string Label)
{
    public string BrowseLabel { get; init; } = "Choose file";

    public string EmptyLabel { get; init; } = "No file selected";

    public string? Accept { get; init; }

    public string? Hint { get; init; }

    public string? Error { get; init; }

    public bool Multiple { get; init; }

    public bool Required { get; init; }

    public string RequiredLabel { get; init; } = "Required";

    public bool Disabled { get; init; }
}
