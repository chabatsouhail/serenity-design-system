namespace DesignSystem.Razor.Contracts;

/// <summary>Visual variant for an action.</summary>
public enum ButtonVariant
{
    Filled,
    Tonal,
    Text
}

/// <summary>Horizontal alignment of button content.</summary>
public enum ButtonAlignment
{
    Center,
    Start
}

/// <summary>Semantic intent communicated by a component.</summary>
public enum SemanticTone
{
    Neutral,
    Accent,
    Success,
    Warning,
    Danger,
    Info
}

/// <summary>Supported component density sizes.</summary>
public enum ComponentSize
{
    Small,
    Medium,
    Large
}

/// <summary>Visual variant for a badge.</summary>
public enum BadgeAppearance
{
    Subtle,
    Solid,
    Outline
}

/// <summary>How a picker is presented before its list is opened.</summary>
public enum PickerPresentation
{
    Field,
    Inline,
    Button
}

/// <summary>Announcement behavior for live feedback.</summary>
public enum LiveRegionMode
{
    Off,
    Polite,
    Assertive
}

/// <summary>Converts strongly typed public contracts to stable HTML values.</summary>
public static class ComponentContractExtensions
{
    public static string ToContractValue(this ButtonVariant value) => value switch
    {
        ButtonVariant.Filled => "filled",
        ButtonVariant.Tonal => "tonal",
        ButtonVariant.Text => "text",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown button variant.")
    };

    public static string ToContractValue(this ButtonAlignment value) => value switch
    {
        ButtonAlignment.Center => "center",
        ButtonAlignment.Start => "start",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown button alignment.")
    };

    public static string ToContractValue(this SemanticTone value) => value switch
    {
        SemanticTone.Neutral => "neutral",
        SemanticTone.Accent => "accent",
        SemanticTone.Success => "success",
        SemanticTone.Warning => "warning",
        SemanticTone.Danger => "danger",
        SemanticTone.Info => "info",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown semantic tone.")
    };

    public static string ToContractValue(this ComponentSize value) => value switch
    {
        ComponentSize.Small => "small",
        ComponentSize.Medium => "medium",
        ComponentSize.Large => "large",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown component size.")
    };

    public static string ToContractValue(this BadgeAppearance value) => value switch
    {
        BadgeAppearance.Subtle => "subtle",
        BadgeAppearance.Solid => "solid",
        BadgeAppearance.Outline => "outline",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown badge appearance.")
    };

    public static string ToContractValue(this PickerPresentation value) => value switch
    {
        PickerPresentation.Field => "field",
        PickerPresentation.Inline => "inline",
        PickerPresentation.Button => "button",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown picker presentation.")
    };

    public static string ToContractValue(this LiveRegionMode value) => value switch
    {
        LiveRegionMode.Off => "off",
        LiveRegionMode.Polite => "polite",
        LiveRegionMode.Assertive => "assertive",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown live-region mode.")
    };
}
