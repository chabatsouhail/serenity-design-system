using DesignSystem.Razor.Contracts;

namespace DesignSystem.Documentation.ComponentPages;

public sealed record ButtonSpecimen(
    ButtonVariant Variant = ButtonVariant.Filled,
    SemanticTone Tone = SemanticTone.Accent,
    ComponentSize Size = ComponentSize.Medium,
    string Composition = "both",
    string State = "normal",
    string Label = "Save changes",
    bool Block = false,
    bool Wrap = false)
{
    public bool IconOnly => Composition == "icon";
    public bool Leading => Composition is "leading" or "both" or "icon";
    public bool Trailing => Composition is "trailing" or "both";
    public string? PreviewState => State switch { "hover" => "hover", "pressed" => "active", "focused" => "focus", _ => null };
}

public sealed record ButtonReferenceOption(string Value, string Label);
public sealed record ButtonReferenceControl(string Property, string Label, string Selected, ButtonReferenceOption[] Options);
