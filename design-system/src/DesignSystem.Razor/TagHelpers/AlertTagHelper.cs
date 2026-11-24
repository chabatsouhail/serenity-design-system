using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor.Contracts;

namespace DesignSystem.Razor.TagHelpers;

/// <summary>Renders contextual feedback with optional live-region and dismissal behavior.</summary>
[HtmlTargetElement("design-system-alert")]
public sealed class AlertTagHelper : TagHelper
{
    public SemanticTone Tone { get; set; } = SemanticTone.Info;

    public string? Title { get; set; }

    public bool Dismissible { get; set; }

    [HtmlAttributeName("dismiss-label")]
    public string DismissLabel { get; set; } = "Dismiss notification";

    [HtmlAttributeName("live-mode")]
    public LiveRegionMode LiveMode { get; set; } = LiveRegionMode.Polite;

    [HtmlAttributeName("accessible-label")]
    public string? AccessibleLabel { get; set; }

    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        var childContent = await output.GetChildContentAsync();
        var childMarkup = childContent.GetContent();
        TagHelperContract.RequireAccessibleName(output, "design-system-alert", AccessibleLabel, $"{Title} {childMarkup}");
        if (Dismissible && string.IsNullOrWhiteSpace(DismissLabel))
        {
            throw new InvalidOperationException("A dismissible alert requires a dismiss-label.");
        }

        var tone = Tone.ToContractValue();
        output.TagName = "div";
        output.TagMode = TagMode.StartTagAndEndTag;
        TagHelperContract.AddClasses(output, "design-system-alert", $"design-system-alert--{tone}");
        output.Attributes.SetAttribute("data-design-system-alert", string.Empty);
        output.Attributes.SetAttribute("data-design-system-tone", tone);

        switch (LiveMode)
        {
            case LiveRegionMode.Polite:
                output.Attributes.SetAttribute("role", "status");
                output.Attributes.SetAttribute("aria-live", "polite");
                break;
            case LiveRegionMode.Assertive:
                output.Attributes.SetAttribute("role", "alert");
                output.Attributes.SetAttribute("aria-live", "assertive");
                break;
            case LiveRegionMode.Off:
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(LiveMode), LiveMode, "Unknown live-region mode.");
        }

        if (!string.IsNullOrWhiteSpace(AccessibleLabel))
        {
            output.Attributes.SetAttribute("aria-label", AccessibleLabel);
        }

        var composed = new DefaultTagHelperContent();
        composed.AppendHtml("<div class=\"design-system-alert__content\">");
        if (!string.IsNullOrWhiteSpace(Title))
        {
            composed.AppendHtml($"<div class=\"design-system-alert__title\">{HtmlEncoder.Default.Encode(Title)}</div>");
        }

        if (!string.IsNullOrWhiteSpace(childMarkup))
        {
            composed.AppendHtml("<div class=\"design-system-alert__message\">");
            composed.AppendHtml(childContent);
            composed.AppendHtml("</div>");
        }

        composed.AppendHtml("</div>");
        if (Dismissible)
        {
            composed.AppendHtml(
                "<button class=\"design-system-alert__dismiss\" type=\"button\" data-design-system-alert-dismiss data-design-system-js-only " +
                $"aria-label=\"{HtmlEncoder.Default.Encode(DismissLabel)}\">" +
                "<span class=\"design-system-icon design-system-icon--small\" data-design-system-icon=\"x\" data-design-system-size=\"small\" aria-hidden=\"true\"></span>" +
                "</button>");
        }

        output.Content.SetHtmlContent(composed);
        TagHelperContract.RemoveInputAttributes(output, "tone", "title", "dismissible", "dismiss-label", "live-mode", "accessible-label");
    }
}
