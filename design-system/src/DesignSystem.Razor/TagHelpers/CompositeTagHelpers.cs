using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor.Models;

namespace DesignSystem.Razor.TagHelpers;

[HtmlTargetElement("design-system-picker", TagStructure = TagStructure.WithoutEndTag)]
public sealed class PickerTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public PickerTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public PickerModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_Picker",
            Model ?? throw new InvalidOperationException("<design-system-picker> requires a model."));
}

[HtmlTargetElement("design-system-date-picker", TagStructure = TagStructure.WithoutEndTag)]
public sealed class DatePickerTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public DatePickerTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public DatePickerModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_DatePicker",
            Model ?? throw new InvalidOperationException("<design-system-date-picker> requires a model."));
}

[HtmlTargetElement("design-system-file-upload", TagStructure = TagStructure.WithoutEndTag)]
public sealed class FileUploadTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public FileUploadTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public FileUploadModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_FileUpload",
            Model ?? throw new InvalidOperationException("<design-system-file-upload> requires a model."));
}

[HtmlTargetElement("design-system-pagination", TagStructure = TagStructure.WithoutEndTag)]
public sealed class PaginationTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public PaginationTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public PaginationModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_Pagination",
            Model ?? throw new InvalidOperationException("<design-system-pagination> requires a model."));
}

[HtmlTargetElement("design-system-empty-state", TagStructure = TagStructure.WithoutEndTag)]
public sealed class EmptyStateTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public EmptyStateTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public EmptyStateModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_EmptyState",
            Model ?? throw new InvalidOperationException("<design-system-empty-state> requires a model."));
}

[HtmlTargetElement("design-system-theme-toggle", TagStructure = TagStructure.WithoutEndTag)]
public sealed class ThemeToggleTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public ThemeToggleTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public ThemeToggleModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_ThemeToggle",
            Model ?? new ThemeToggleModel());
}

[HtmlTargetElement("design-system-toast-host", TagStructure = TagStructure.WithoutEndTag)]
public sealed class ToastHostTagHelper : TagHelper
{
    private readonly IHtmlHelper _htmlHelper;

    public ToastHostTagHelper(IHtmlHelper htmlHelper) => _htmlHelper = htmlHelper;

    [HtmlAttributeName("model")]
    public ToastHostModel? Model { get; set; }

    [HtmlAttributeNotBound]
    [ViewContext]
    public ViewContext ViewContext { get; set; } = null!;

    public override Task ProcessAsync(TagHelperContext context, TagHelperOutput output) =>
        PartialTagHelperRenderer.RenderAsync(
            _htmlHelper,
            ViewContext,
            output,
            "DesignSystem/Internal/_ToastHost",
            Model ?? new ToastHostModel());
}
