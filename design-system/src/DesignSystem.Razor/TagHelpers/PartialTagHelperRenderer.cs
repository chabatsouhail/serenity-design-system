using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace DesignSystem.Razor.TagHelpers;

internal static class PartialTagHelperRenderer
{
    public static async Task RenderAsync<TModel>(
        IHtmlHelper htmlHelper,
        ViewContext viewContext,
        TagHelperOutput output,
        string partialName,
        TModel model)
    {
        if (htmlHelper is not IViewContextAware contextAware)
        {
            throw new InvalidOperationException("The Razor HTML helper cannot be contextualized.");
        }

        contextAware.Contextualize(viewContext);
        var content = await htmlHelper.PartialAsync(partialName, model, viewContext.ViewData);

        output.TagName = null;
        output.Attributes.Clear();
        output.Content.SetHtmlContent(content);
    }
}
