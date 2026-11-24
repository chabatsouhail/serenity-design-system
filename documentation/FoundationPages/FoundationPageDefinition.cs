namespace DesignSystem.Documentation.FoundationPages;

public sealed record FoundationPageDefinition(
    string Slug,
    string Name,
    string Description,
    string AnatomyTitle,
    string AnatomyPurpose,
    IReadOnlyList<FoundationConceptDefinition> Concepts,
    IReadOnlyList<FoundationTokenGroupDefinition> PrimitiveGroups,
    IReadOnlyList<FoundationTokenGroupDefinition> SemanticGroups);

public sealed record FoundationConceptDefinition(
    string Slug,
    string Name,
    string Purpose,
    string Preview,
    string AccessibleLabel);

public sealed record FoundationTokenGroupDefinition(
    string Slug,
    string Name,
    string Purpose,
    IReadOnlyList<FoundationTokenDefinition> Tokens);

public sealed record FoundationTokenDefinition(
    string Name,
    string Purpose,
    string Value,
    string Token,
    string Preview,
    IReadOnlyList<string> Sources)
{
    public static FoundationTokenDefinition Primitive(
        string value,
        string token,
        string preview,
        string purpose) => new(value, purpose, value, token, preview, []);

    public static FoundationTokenDefinition Semantic(
        string name,
        string purpose,
        string value,
        string token,
        string preview,
        params string[] sources) => new(name, purpose, value, token, preview, sources);
}
