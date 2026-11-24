using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.TagHelpers;

/// <summary>Renders compact status or categorization text.</summary>
[HtmlTargetElement("design-system-badge")]
public sealed class BadgeTagHelper : TagHelper
{
    public SemanticTone Tone { get; set; } = SemanticTone.Neutral;

    public BadgeAppearance Appearance { get; set; } = BadgeAppearance.Subtle;

    public ComponentSize Size { get; set; } = ComponentSize.Medium;

    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        var childContent = await output.GetChildContentAsync();
        if (!TagHelperContract.HasVisibleText(childContent.GetContent()))
        {
            throw new InvalidOperationException("<design-system-badge> requires visible text.");
        }

        var tone = Tone.ToContractValue();
        var appearance = Appearance.ToContractValue();
        var size = Size.ToContractValue();
        output.TagName = "span";
        output.TagMode = TagMode.StartTagAndEndTag;
        TagHelperContract.AddClasses(
            output,
            "design-system-badge",
            $"design-system-badge--{tone}",
            $"design-system-badge--{appearance}",
            $"design-system-badge--{size}");
        output.Attributes.SetAttribute("data-design-system-badge", string.Empty);
        output.Attributes.SetAttribute("data-design-system-tone", tone);
        output.Attributes.SetAttribute("data-design-system-appearance", appearance);
        output.Attributes.SetAttribute("data-design-system-size", size);
        output.Content.SetHtmlContent(childContent);
        TagHelperContract.RemoveInputAttributes(output, "tone", "appearance", "size");
    }
}
