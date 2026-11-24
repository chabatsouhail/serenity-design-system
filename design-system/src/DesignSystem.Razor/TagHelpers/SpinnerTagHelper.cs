using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.TagHelpers;

/// <summary>Renders an indeterminate progress indicator.</summary>
[HtmlTargetElement("design-system-spinner")]
public sealed class SpinnerTagHelper : TagHelper
{
    public ComponentSize Size { get; set; } = ComponentSize.Medium;

    [HtmlAttributeName("accessible-label")]
    public string AccessibleLabel { get; set; } = "Loading";

    public bool Decorative { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        if (!Decorative && !TagHelperContract.HasExplicitAccessibleName(output, AccessibleLabel))
        {
            TagHelperContract.RequireAccessibleName(output, "design-system-spinner", AccessibleLabel, null);
        }

        var size = Size.ToContractValue();
        output.TagName = "span";
        output.TagMode = TagMode.StartTagAndEndTag;
        TagHelperContract.AddClasses(output, "design-system-spinner", $"design-system-spinner--{size}");
        output.Attributes.SetAttribute("data-design-system-spinner", string.Empty);
        output.Attributes.SetAttribute("data-design-system-size", size);
        if (Decorative)
        {
            output.Attributes.RemoveAll("role");
            output.Attributes.RemoveAll("aria-label");
            output.Attributes.RemoveAll("aria-labelledby");
            output.Attributes.SetAttribute("aria-hidden", "true");
        }
        else
        {
            output.Attributes.SetAttribute("role", "status");
            if (!output.Attributes.ContainsName("aria-label") && !output.Attributes.ContainsName("aria-labelledby"))
            {
                output.Attributes.SetAttribute("aria-label", AccessibleLabel);
            }
        }

        output.Content.SetHtmlContent("<span class=\"design-system-spinner__track\" aria-hidden=\"true\"></span>");
        TagHelperContract.RemoveInputAttributes(output, "size", "accessible-label", "decorative");
    }
}
