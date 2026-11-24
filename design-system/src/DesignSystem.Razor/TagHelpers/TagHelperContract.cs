using System.Net;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace DesignSystem.Razor.TagHelpers;

internal static partial class TagHelperContract
{
    public static void AddClasses(TagHelperOutput output, params string?[] classes)
    {
        var values = new HashSet<string>(StringComparer.Ordinal);
        if (output.Attributes.TryGetAttribute("class", out var existing))
        {
            foreach (var value in existing.Value?.ToString()?.Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? [])
            {
                values.Add(value);
            }
        }

        foreach (var cssClass in classes)
        {
            if (string.IsNullOrWhiteSpace(cssClass))
            {
                continue;
            }

            foreach (var value in cssClass.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                values.Add(value);
            }
        }

        output.Attributes.SetAttribute("class", string.Join(' ', values));
    }

    public static bool HasAccessibleName(TagHelperOutput output, string? explicitLabel, string? content)
    {
        if (HasExplicitAccessibleName(output, explicitLabel))
        {
            return true;
        }

        return HasVisibleText(content);
    }

    public static bool HasVisibleText(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return false;
        var withoutHiddenMarkup = HiddenMarkupPattern().Replace(content, " ");
        var withoutMarkup = MarkupPattern().Replace(withoutHiddenMarkup, " ");
        return !string.IsNullOrWhiteSpace(WebUtility.HtmlDecode(withoutMarkup).Replace('\u00a0', ' '));
    }

    public static bool HasExplicitAccessibleName(TagHelperOutput output, string? explicitLabel) =>
        !string.IsNullOrWhiteSpace(explicitLabel) ||
        HasAttributeValue(output, "aria-label") ||
        HasAttributeValue(output, "aria-labelledby");

    public static void RequireAccessibleName(
        TagHelperOutput output,
        string component,
        string? explicitLabel,
        string? content)
    {
        if (!HasAccessibleName(output, explicitLabel, content))
        {
            throw new InvalidOperationException(
                $"<{component}> requires visible text, accessible-label, aria-label, or aria-labelledby.");
        }
    }

    public static void RemoveInputAttributes(TagHelperOutput output, params string[] names)
    {
        foreach (var name in names)
        {
            output.Attributes.RemoveAll(name);
        }
    }

    private static bool HasAttributeValue(TagHelperOutput output, string name) =>
        output.Attributes.TryGetAttribute(name, out var attribute) &&
        !string.IsNullOrWhiteSpace(attribute.Value?.ToString());

    [GeneratedRegex("<[^>]+>", RegexOptions.CultureInvariant)]
    private static partial Regex MarkupPattern();

    [GeneratedRegex("""<(?<tag>[A-Za-z][A-Za-z0-9:-]*)\b(?=[^>]*(?:\saria-hidden\s*=\s*(?:"true"|'true'|true)|\shidden(?:\s|=|/?>)))[^>]*>.*?</\k<tag>\s*>""", RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.CultureInvariant)]
    private static partial Regex HiddenMarkupPattern();
}
