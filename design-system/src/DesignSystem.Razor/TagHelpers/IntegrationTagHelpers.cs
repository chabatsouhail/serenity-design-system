using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Text.Encodings.Web;

namespace DesignSystem.Razor.TagHelpers;

[HtmlTargetElement("design-system-styles", TagStructure = TagStructure.WithoutEndTag)]
public sealed class StylesTagHelper : TagHelper
{
    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "link";
        output.TagMode = TagMode.SelfClosing;
        output.Attributes.Clear();
        output.Attributes.SetAttribute("rel", "stylesheet");
        output.Attributes.SetAttribute("href", AssetPath(ViewContext, "css/design-system.css"));
    }

    internal static string AssetPath(ViewContext viewContext, string asset)
    {
        var pathBase = viewContext.HttpContext.Request.PathBase.Value?.TrimEnd('/') ?? string.Empty;
        return $"{pathBase}/_content/DesignSystem.Razor/{asset}?v={DesignSystemInfo.Version}";
    }
}

[HtmlTargetElement("design-system-scripts", TagStructure = TagStructure.WithoutEndTag)]
public sealed class ScriptsTagHelper : TagHelper
{
    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "script";
        output.TagMode = TagMode.StartTagAndEndTag;
        output.Attributes.Clear();
        output.Attributes.SetAttribute("type", "module");
        output.Attributes.SetAttribute("src", StylesTagHelper.AssetPath(ViewContext, "js/design-system.js"));
        output.Attributes.SetAttribute("data-design-system-entry", string.Empty);
        output.Content.Clear();
    }
}

[HtmlTargetElement("design-system-theme-bootstrap", TagStructure = TagStructure.WithoutEndTag)]
public sealed class ThemeBootstrapTagHelper : TagHelper
{
    internal const string BootstrapScript = """
        (() => {
            const root = document.documentElement;
            root.dataset.designSystemRuntime = "loading";
            let preference = "system";
            try {
                preference = localStorage.getItem("design-system-theme") || "system";
            } catch {
                // Storage can be unavailable; the system preference remains a complete fallback.
            }

            const theme = preference === "light" || preference === "dark"
                ? preference
                : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            root.dataset.designSystemTheme = theme;
            root.dataset.designSystemThemePreference = preference;
            root.style.colorScheme = theme;

            addEventListener("error", event => {
                if (event.target instanceof HTMLScriptElement && event.target.hasAttribute("data-design-system-entry")) {
                    root.dataset.designSystemRuntime = "failed";
                    root.dispatchEvent(new CustomEvent("design-system:runtimeerror", {
                        bubbles: true,
                        detail: { reason: "entry-load" }
                    }));
                }
            }, true);
        })();
        """;

    public string? Nonce { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "script";
        output.TagMode = TagMode.StartTagAndEndTag;
        output.Attributes.Clear();
        if (!string.IsNullOrWhiteSpace(Nonce))
        {
            output.Attributes.SetAttribute("nonce", Nonce);
        }

        output.Content.SetHtmlContent(BootstrapScript);
    }
}

[HtmlTargetElement("design-system-assets", TagStructure = TagStructure.WithoutEndTag)]
public sealed class AssetsTagHelper : TagHelper
{
    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public string? Nonce { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var encodedNonce = string.IsNullOrWhiteSpace(Nonce)
            ? string.Empty
            : $" nonce=\"{HtmlEncoder.Default.Encode(Nonce)}\"";
        var stylesheet = HtmlEncoder.Default.Encode(StylesTagHelper.AssetPath(ViewContext, "css/design-system.css"));
        var script = HtmlEncoder.Default.Encode(StylesTagHelper.AssetPath(ViewContext, "js/design-system.js"));

        output.TagName = null;
        output.Content.SetHtmlContent(
            $"<script{encodedNonce}>{ThemeBootstrapTagHelper.BootstrapScript}</script>" +
            $"<link rel=\"stylesheet\" href=\"{stylesheet}\">" +
            $"<script type=\"module\" src=\"{script}\" data-design-system-entry{encodedNonce}></script>");
    }
}
