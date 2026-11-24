using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.TagHelpers;

/// <summary>Renders a design system action as a button or link while retaining native semantics.</summary>
[HtmlTargetElement("design-system-button")]
public sealed class ButtonTagHelper : TagHelper
{
    public ButtonVariant Variant { get; set; } = ButtonVariant.Tonal;

    public SemanticTone Tone { get; set; } = SemanticTone.Neutral;

    public ComponentSize Size { get; set; } = ComponentSize.Medium;

    public ButtonAlignment Alignment { get; set; } = ButtonAlignment.Center;

    public bool Block { get; set; }

    public bool Disabled { get; set; }

    public bool Loading { get; set; }

    [HtmlAttributeName("loading-label")]
    public string LoadingLabel { get; set; } = "Loading";

    public bool Toggle { get; set; }

    public bool? Pressed { get; set; }

    [HtmlAttributeName("icon-only")]
    public bool IconOnly { get; set; }

    [HtmlAttributeName("accessible-label")]
    public string? AccessibleLabel { get; set; }

    public string Type { get; set; } = "button";

    public string? Href { get; set; }

    public string? Target { get; set; }

    public string? Rel { get; set; }

    public string? Name { get; set; }

    public string? Value { get; set; }

    public string? Form { get; set; }

    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        var childContent = await output.GetChildContentAsync();
        var childMarkup = childContent.GetContent();
        if (IconOnly && !TagHelperContract.HasExplicitAccessibleName(output, AccessibleLabel))
        {
            throw new InvalidOperationException(
                "An icon-only <design-system-button> requires accessible-label, aria-label, or aria-labelledby.");
        }
        TagHelperContract.RequireAccessibleName(output, "design-system-button", AccessibleLabel, childMarkup);

        if (Tone is not (SemanticTone.Neutral or SemanticTone.Accent or SemanticTone.Danger))
        {
            throw new InvalidOperationException("<design-system-button> supports Neutral, Accent, and Danger tones.");
        }

        if (Variant == ButtonVariant.Filled && Tone is not (SemanticTone.Accent or SemanticTone.Danger))
        {
            throw new InvalidOperationException("The Filled variant supports Accent and Danger tones.");
        }

        if (Loading && string.IsNullOrWhiteSpace(LoadingLabel))
        {
            throw new InvalidOperationException("A loading button requires a loading-label.");
        }

        var rendersLink = !string.IsNullOrWhiteSpace(Href);
        if (rendersLink && (Toggle || Pressed.HasValue))
        {
            throw new InvalidOperationException("A toggle action must render as a button, not a link.");
        }

        output.TagName = rendersLink ? "a" : "button";
        output.TagMode = TagMode.StartTagAndEndTag;

        var variant = Variant.ToContractValue();
        var tone = Tone.ToContractValue();
        var size = Size.ToContractValue();
        var alignment = Alignment.ToContractValue();

        TagHelperContract.AddClasses(
            output,
            "design-system-button",
            IconOnly ? "design-system-icon-button" : null);

        output.Attributes.SetAttribute("data-design-system-button", string.Empty);
        output.Attributes.SetAttribute("data-design-system-variant", variant);
        output.Attributes.SetAttribute("data-design-system-tone", tone);
        output.Attributes.SetAttribute("data-design-system-size", size);
        output.Attributes.SetAttribute("data-design-system-align", alignment);

        if (!string.IsNullOrWhiteSpace(AccessibleLabel))
        {
            output.Attributes.SetAttribute("aria-label", AccessibleLabel);
        }

        if (Block)
        {
            output.Attributes.SetAttribute("data-design-system-block", string.Empty);
        }

        if (IconOnly)
        {
            output.Attributes.SetAttribute("data-design-system-icon-only", string.Empty);
        }

        var effectivelyDisabled = Disabled || Loading;
        if (rendersLink)
        {
            output.Attributes.RemoveAll("type");
            output.Attributes.RemoveAll("name");
            output.Attributes.RemoveAll("value");
            output.Attributes.RemoveAll("form");
            output.Attributes.RemoveAll("disabled");
            if (effectivelyDisabled)
            {
                output.Attributes.RemoveAll("href");
                output.Attributes.SetAttribute("aria-disabled", "true");
                output.Attributes.SetAttribute("tabindex", "-1");
                output.Attributes.SetAttribute("data-design-system-disabled", string.Empty);
            }
            else
            {
                output.Attributes.SetAttribute("href", Href);
            }

            if (!string.IsNullOrWhiteSpace(Target))
            {
                output.Attributes.SetAttribute("target", Target);
            }

            var relation = Rel;
            if (string.Equals(Target, "_blank", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(relation))
            {
                relation = "noopener noreferrer";
            }

            if (!string.IsNullOrWhiteSpace(relation))
            {
                output.Attributes.SetAttribute("rel", relation);
            }
        }
        else
        {
            output.Attributes.RemoveAll("href");
            output.Attributes.RemoveAll("target");
            output.Attributes.RemoveAll("rel");
            output.Attributes.RemoveAll("disabled");
            var type = Type.ToLowerInvariant();
            if (type is not ("button" or "submit" or "reset"))
            {
                throw new InvalidOperationException("Button type must be button, submit, or reset.");
            }

            output.Attributes.SetAttribute("type", type);
            if (effectivelyDisabled)
            {
                output.Attributes.SetAttribute("disabled", "disabled");
                output.Attributes.SetAttribute("data-design-system-disabled", string.Empty);
            }

            if (!string.IsNullOrWhiteSpace(Name))
            {
                output.Attributes.SetAttribute("name", Name);
            }

            if (Value is not null)
            {
                output.Attributes.SetAttribute("value", Value);
            }

            if (!string.IsNullOrWhiteSpace(Form))
            {
                output.Attributes.SetAttribute("form", Form);
            }

            if (Toggle || Pressed.HasValue)
            {
                output.Attributes.SetAttribute("data-design-system-toggle", string.Empty);
                output.Attributes.SetAttribute("data-design-system-js-only", string.Empty);
                output.Attributes.SetAttribute("aria-pressed", (Pressed ?? false) ? "true" : "false");
            }
        }

        if (Loading)
        {
            output.Attributes.SetAttribute("aria-busy", "true");
            output.Attributes.SetAttribute("data-design-system-loading", string.Empty);
            var loadingContent = new DefaultTagHelperContent();
            loadingContent.AppendHtml("<span class=\"design-system-button__spinner design-system-spinner design-system-spinner--small\" aria-hidden=\"true\"><span class=\"design-system-spinner__track\"></span></span>");
            loadingContent.AppendHtml("<span class=\"design-system-button__label design-system-button-label\">");
            loadingContent.AppendHtml(childContent);
            loadingContent.AppendHtml("</span>");
            loadingContent.AppendHtml($"<span class=\"design-system-visually-hidden\" role=\"status\">{HtmlEncoder.Default.Encode(LoadingLabel)}</span>");
            output.Content.SetHtmlContent(loadingContent);
        }
        else
        {
            output.Content.SetHtmlContent(childContent);
        }
        TagHelperContract.RemoveInputAttributes(
            output,
            "variant", "tone", "size", "alignment", "block", "loading", "loading-label", "toggle", "pressed",
            "icon-only", "accessible-label");
    }
}
