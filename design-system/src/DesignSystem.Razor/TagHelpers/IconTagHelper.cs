using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.TagHelpers;

/// <summary>Renders a design system line icon from the packaged, licensed icon set.</summary>
[HtmlTargetElement("design-system-icon")]
public sealed class IconTagHelper : TagHelper
{
    public IconName? Name { get; set; }

    public ComponentSize Size { get; set; } = ComponentSize.Medium;

    [HtmlAttributeName("accessible-label")]
    public string? AccessibleLabel { get; set; }

    public bool? Decorative { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        if (Name is null)
        {
            throw new InvalidOperationException("<design-system-icon> requires a name.");
        }

        var hasAccessibleName = TagHelperContract.HasAccessibleName(output, AccessibleLabel, null);
        var decorative = Decorative ?? !hasAccessibleName;
        if (!decorative && string.IsNullOrWhiteSpace(AccessibleLabel))
        {
            TagHelperContract.RequireAccessibleName(output, "design-system-icon", AccessibleLabel, null);
        }

        var iconName = Name.Value.ToContractValue();
        var size = Size.ToContractValue();
        output.TagName = "span";
        output.TagMode = TagMode.StartTagAndEndTag;
        TagHelperContract.AddClasses(output, "design-system-icon", $"design-system-icon--{size}");
        output.Attributes.SetAttribute("data-design-system-icon", iconName);
        output.Attributes.SetAttribute("data-design-system-size", size);

        if (decorative)
        {
            output.Attributes.RemoveAll("aria-label");
            output.Attributes.RemoveAll("aria-labelledby");
            output.Attributes.SetAttribute("aria-hidden", "true");
        }
        else
        {
            output.Attributes.SetAttribute("role", "img");
            if (!string.IsNullOrWhiteSpace(AccessibleLabel))
            {
                output.Attributes.SetAttribute("aria-label", AccessibleLabel);
            }
        }

        output.Content.SetHtmlContent(string.Empty);
        TagHelperContract.RemoveInputAttributes(output, "name", "size", "accessible-label", "decorative");
    }
}
