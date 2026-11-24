using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;
using DesignSystem.Razor;
using DesignSystem.Razor.Contracts;
using DesignSystem.Razor.Models;
using DesignSystem.Razor.TagHelpers;

var tests = new (string Name, Func<Task> Run)[]
{
    ("Assembly identity", TestAssemblyIdentity),
    ("Enum contract values", TestEnumContractValues),
    ("Icon contract values", TestIconContractValues),
    ("Public surface shape", TestPublicSurfaceShape),
    ("Integration Tag Helper rendering", TestIntegrationTagHelperRendering),
    ("Pagination model", TestPaginationModel),
    ("Model defaults", TestModelDefaults),
    ("Button rendering", TestButtonRendering),
    ("Button validation", TestButtonValidation),
    ("Icon rendering", TestIconRendering),
    ("Badge rendering", TestBadgeRendering),
    ("Alert rendering", TestAlertRendering),
    ("Spinner rendering", TestSpinnerRendering),
    ("Accessible-name validation", TestAccessibleNameValidation)
};

var failures = new List<string>();
foreach (var test in tests)
{
    try
    {
        await test.Run();
        Console.WriteLine($"PASS {test.Name}");
    }
    catch (Exception exception)
    {
        failures.Add($"{test.Name}: {exception.Message}");
        Console.Error.WriteLine($"FAIL {test.Name}: {exception}");
    }
}

if (failures.Count > 0)
{
    throw new InvalidOperationException(
        $"{failures.Count} design system contract test(s) failed.{Environment.NewLine}{string.Join(Environment.NewLine, failures)}");
}

Console.WriteLine($"The design system contract tests passed ({tests.Length} groups).");

static Task TestAssemblyIdentity()
{
    Equal("18.1.0", DesignSystemInfo.Version, "Public contract version");
    var assembly = typeof(DesignSystemInfo).Assembly.GetName();
    Equal("DesignSystem.Razor", assembly.Name, "Assembly name");
    Equal("DesignSystem.Razor", typeof(DesignSystemInfo).Namespace, "Root namespace");
    return Task.CompletedTask;
}

static Task TestEnumContractValues()
{
    AssertMappings<ButtonVariant>(
        value => value.ToContractValue(),
        (ButtonVariant.Filled, "filled"),
        (ButtonVariant.Tonal, "tonal"),
        (ButtonVariant.Text, "text"));
    AssertMappings<ButtonAlignment>(
        value => value.ToContractValue(),
        (ButtonAlignment.Center, "center"),
        (ButtonAlignment.Start, "start"));
    AssertMappings<SemanticTone>(
        value => value.ToContractValue(),
        (SemanticTone.Neutral, "neutral"),
        (SemanticTone.Accent, "accent"),
        (SemanticTone.Success, "success"),
        (SemanticTone.Warning, "warning"),
        (SemanticTone.Danger, "danger"),
        (SemanticTone.Info, "info"));
    AssertMappings<ComponentSize>(
        value => value.ToContractValue(),
        (ComponentSize.Small, "small"),
        (ComponentSize.Medium, "medium"),
        (ComponentSize.Large, "large"));
    AssertMappings<BadgeAppearance>(
        value => value.ToContractValue(),
        (BadgeAppearance.Subtle, "subtle"),
        (BadgeAppearance.Solid, "solid"),
        (BadgeAppearance.Outline, "outline"));
    AssertMappings<PickerPresentation>(
        value => value.ToContractValue(),
        (PickerPresentation.Field, "field"),
        (PickerPresentation.Inline, "inline"),
        (PickerPresentation.Button, "button"));
    AssertMappings<LiveRegionMode>(
        value => value.ToContractValue(),
        (LiveRegionMode.Off, "off"),
        (LiveRegionMode.Polite, "polite"),
        (LiveRegionMode.Assertive, "assertive"));
    return Task.CompletedTask;
}

static Task TestIconContractValues()
{
    var icons = Enum.GetValues<IconName>();
    Equal(26, icons.Length, "Icon count");
    var values = icons.Select(value => value.ToContractValue()).ToArray();
    Equal(values.Length, values.Distinct(StringComparer.Ordinal).Count(), "Unique icon contract values");
    True(values.All(value => value == value.ToLowerInvariant() && !value.Contains('_')), "Icon values use stable kebab case");
    Equal("adjustments-horizontal", IconName.Adjustments.ToContractValue(), "Adjustments icon");
    Equal("external-link", IconName.ExternalLink.ToContractValue(), "External link icon");
    Equal("alert-triangle", IconName.Warning.ToContractValue(), "Warning icon");
    return Task.CompletedTask;
}

static Task TestPublicSurfaceShape()
{
    var tagHelpers = new[]
    {
        (Type: typeof(ButtonTagHelper), Tag: "design-system-button"),
        (Type: typeof(IconTagHelper), Tag: "design-system-icon"),
        (Type: typeof(BadgeTagHelper), Tag: "design-system-badge"),
        (Type: typeof(AlertTagHelper), Tag: "design-system-alert"),
        (Type: typeof(SpinnerTagHelper), Tag: "design-system-spinner"),
        (Type: typeof(PickerTagHelper), Tag: "design-system-picker"),
        (Type: typeof(DatePickerTagHelper), Tag: "design-system-date-picker"),
        (Type: typeof(FileUploadTagHelper), Tag: "design-system-file-upload"),
        (Type: typeof(PaginationTagHelper), Tag: "design-system-pagination"),
        (Type: typeof(EmptyStateTagHelper), Tag: "design-system-empty-state"),
        (Type: typeof(ThemeToggleTagHelper), Tag: "design-system-theme-toggle"),
        (Type: typeof(ToastHostTagHelper), Tag: "design-system-toast-host"),
        (Type: typeof(AssetsTagHelper), Tag: "design-system-assets"),
        (Type: typeof(StylesTagHelper), Tag: "design-system-styles"),
        (Type: typeof(ScriptsTagHelper), Tag: "design-system-scripts"),
        (Type: typeof(ThemeBootstrapTagHelper), Tag: "design-system-theme-bootstrap")
    };

    foreach (var (type, tag) in tagHelpers)
    {
        True(type.IsPublic && type.IsSealed, $"{type.Name} is a public sealed contract");
        Equal("DesignSystem.Razor.TagHelpers", type.Namespace, $"{type.Name} namespace");
        var target = type.GetCustomAttributes<HtmlTargetElementAttribute>().Single();
        Equal(tag, target.Tag, $"{type.Name} target element");
    }

    var models = new[]
    {
        typeof(PickerModel), typeof(PickerOption), typeof(DatePickerModel), typeof(FileUploadModel),
        typeof(PaginationModel), typeof(EmptyStateModel), typeof(ThemeToggleModel), typeof(ToastHostModel)
    };
    foreach (var type in models)
    {
        True(type.IsPublic && type.IsSealed, $"{type.Name} is a public sealed model");
        Equal("DesignSystem.Razor.Models", type.Namespace, $"{type.Name} namespace");
    }

    var modelBackedTags = new[]
    {
        (Type: typeof(PickerTagHelper), Model: typeof(PickerModel)),
        (Type: typeof(DatePickerTagHelper), Model: typeof(DatePickerModel)),
        (Type: typeof(FileUploadTagHelper), Model: typeof(FileUploadModel)),
        (Type: typeof(PaginationTagHelper), Model: typeof(PaginationModel)),
        (Type: typeof(EmptyStateTagHelper), Model: typeof(EmptyStateModel)),
        (Type: typeof(ThemeToggleTagHelper), Model: typeof(ThemeToggleModel)),
        (Type: typeof(ToastHostTagHelper), Model: typeof(ToastHostModel))
    };
    foreach (var (type, model) in modelBackedTags)
    {
        Equal(model, type.GetProperty("Model")?.PropertyType, $"{type.Name} model contract");
    }

    return Task.CompletedTask;
}

static Task TestIntegrationTagHelperRendering()
{
    var viewContext = new ViewContext { HttpContext = new DefaultHttpContext() };
    viewContext.HttpContext.Request.PathBase = "/sample";

    var styles = new StylesTagHelper { ViewContext = viewContext };
    var output = Output("design-system-styles");
    styles.Process(Context(), output);
    Equal("link", output.TagName, "Styles element");
    Equal("stylesheet", Attribute(output, "rel"), "Styles relation");
    Equal("/sample/_content/DesignSystem.Razor/css/design-system.css?v=18.1.0", Attribute(output, "href"), "Versioned styles path base");

    var scripts = new ScriptsTagHelper { ViewContext = viewContext };
    output = Output("design-system-scripts");
    scripts.Process(Context(), output);
    Equal("script", output.TagName, "Scripts element");
    Equal("module", Attribute(output, "type"), "Scripts module type");
    Equal("/sample/_content/DesignSystem.Razor/js/design-system.js?v=18.1.0", Attribute(output, "src"), "Versioned scripts path base");
    True(output.Attributes.ContainsName("data-design-system-entry"), "Scripts entry failure hook");

    var bootstrap = new ThemeBootstrapTagHelper { Nonce = "test-nonce" };
    output = Output("design-system-theme-bootstrap");
    bootstrap.Process(Context(), output);
    Equal("script", output.TagName, "Theme bootstrap element");
    Equal("test-nonce", Attribute(output, "nonce"), "Theme bootstrap nonce");
    True(output.Content.GetContent().Contains("designSystemThemePreference", StringComparison.Ordinal), "Theme bootstrap behavior");
    True(output.Content.GetContent().Contains("designSystemRuntime", StringComparison.Ordinal), "Theme bootstrap runtime state");

    var assets = new AssetsTagHelper { ViewContext = viewContext, Nonce = "assets-nonce" };
    output = Output("design-system-assets");
    assets.Process(Context(), output);
    var assetsMarkup = output.Content.GetContent();
    True(output.TagName is null, "Assets emits sibling integration elements");
    True(assetsMarkup.Contains("design-system.css?v=18.1.0", StringComparison.Ordinal), "Assets includes versioned CSS");
    True(assetsMarkup.Contains("design-system.js?v=18.1.0", StringComparison.Ordinal), "Assets includes versioned JavaScript");
    True(assetsMarkup.Contains("data-design-system-entry", StringComparison.Ordinal), "Assets includes runtime error hook");
    Equal(2, assetsMarkup.Split("nonce=\"assets-nonce\"", StringSplitOptions.None).Length - 1, "Assets nonce covers inline and module scripts");
    return Task.CompletedTask;
}

static Task TestPaginationModel()
{
    var compact = new PaginationModel(3, 5, "/records?page={page}");
    SequenceEqual<int?>([1, 2, 3, 4, 5], compact.GetVisiblePages(), "Compact pages");
    Equal("/records?page=4", compact.GetPageUrl(4), "Page URL");
    Equal("Page 4", compact.GetPageLabel(4), "Page accessible label");
    Equal("Seite 4", (compact with { PageLabelTemplate = "Seite {0}" }).GetPageLabel(4), "Localized page accessible label");

    var first = new PaginationModel(1, 20, "/records/{page}");
    SequenceEqual<int?>([1, 2, null, 20], first.GetVisiblePages(), "First-page ellipsis");
    var middle = new PaginationModel(10, 20, "/records/{page}");
    SequenceEqual<int?>([1, null, 9, 10, 11, null, 20], middle.GetVisiblePages(), "Middle-page ellipses");
    var last = new PaginationModel(20, 20, "/records/{page}");
    SequenceEqual<int?>([1, null, 19, 20], last.GetVisiblePages(), "Last-page ellipsis");

    Throws<ArgumentOutOfRangeException>(() => new PaginationModel(0, 1, "/{page}"), "Current page lower bound");
    Throws<ArgumentOutOfRangeException>(() => new PaginationModel(2, 1, "/{page}"), "Current page upper bound");
    Throws<ArgumentOutOfRangeException>(() => new PaginationModel(1, 0, "/{page}"), "Total page lower bound");
    Throws<ArgumentException>(() => new PaginationModel(1, 1, "/records"), "URL placeholder requirement");
    Throws<ArgumentOutOfRangeException>(() => compact.GetPageUrl(6), "Page URL bounds");
    Throws<FormatException>(() => (compact with { PageLabelTemplate = "Page {" }).GetPageLabel(1), "Page label template format");
    return Task.CompletedTask;
}

static Task TestModelDefaults()
{
    var picker = new PickerModel("customer", "customer", "Customer", [new PickerOption("1", "Ada")]);
    Equal("Select an option", picker.Placeholder, "Picker placeholder");
    Equal("No matching options", picker.NoResultsLabel, "Picker no-results label");
    Equal("Search options", picker.SearchLabel, "Picker search label");
    Equal("Required", picker.RequiredLabel, "Picker required label");
    Equal(PickerPresentation.Field, picker.Presentation, "Picker presentation");
    False(picker.Searchable, "Picker search default");
    False(picker.IsFilterActive, "Picker filter default");

    var date = new DatePickerModel("date", "date", "Date");
    Equal("Choose a date", date.EmptyLabel, "Date empty label");
    Equal("Choose a date", date.DialogLabel, "Date dialog label");
    Equal("Previous month", date.PreviousMonthLabel, "Date previous-month label");
    Equal("Next month", date.NextMonthLabel, "Date next-month label");
    Equal("Today", date.TodayLabel, "Date today label");
    Equal("Clear", date.ClearLabel, "Date clear label");
    Equal("Required", date.RequiredLabel, "Date required label");
    False(date.Required, "Date required default");

    var file = new FileUploadModel("file", "file", "Attachment");
    Equal("Choose file", file.BrowseLabel, "File browse label");
    Equal("No file selected", file.EmptyLabel, "File empty label");
    Equal("Required", file.RequiredLabel, "File required label");
    False(file.Multiple, "File multiple default");

    var empty = new EmptyStateModel("No records", "Create one to begin.");
    Equal(IconName.Inbox, empty.Icon, "Empty-state icon");
    Equal(2, empty.HeadingLevel, "Empty-state heading level");

    var theme = new ThemeToggleModel();
    Equal("Dark theme", theme.Label, "Theme label");
    True(theme.ShowLabel, "Theme visible-label default");
    Equal(ComponentSize.Medium, theme.Size, "Theme size");

    var toasts = new ToastHostModel();
    Equal("Notifications", toasts.Label, "Toast-host label");
    Equal(LiveRegionMode.Polite, toasts.LiveMode, "Toast-host live mode");
    return Task.CompletedTask;
}

static async Task TestButtonRendering()
{
    var filled = new ButtonTagHelper
    {
        Variant = ButtonVariant.Filled,
        Tone = SemanticTone.Accent,
        Size = ComponentSize.Large,
        Alignment = ButtonAlignment.Start,
        Block = true
    };
    var output = Output("design-system-button", "Save", ("class", "consumer-class"));
    await filled.ProcessAsync(Context(), output);
    Equal("button", output.TagName, "Button element");
    Equal("button", Attribute(output, "type"), "Button type");
    ContainsClasses(output, "consumer-class", "design-system-button");
    HasAttribute(output, "data-design-system-button");
    Equal("filled", Attribute(output, "data-design-system-variant"), "Button variant hook");
    Equal("Save", output.Content.GetContent(), "Button content");

    var filledDanger = new ButtonTagHelper
    {
        Variant = ButtonVariant.Filled,
        Tone = SemanticTone.Danger
    };
    output = Output("design-system-button", "Delete");
    await filledDanger.ProcessAsync(Context(), output);
    Equal("filled", Attribute(output, "data-design-system-variant"), "Filled danger variant hook");
    Equal("danger", Attribute(output, "data-design-system-tone"), "Filled danger tone hook");

    var explicitlyEnabled = new ButtonTagHelper { Disabled = false };
    output = Output("design-system-button", "Continue", ("disabled", "false"));
    await explicitlyEnabled.ProcessAsync(Context(), output);
    MissingAttribute(output, "disabled");

    var link = new ButtonTagHelper { Href = "/records", Target = "_blank" };
    output = Output("design-system-button", "Open");
    await link.ProcessAsync(Context(), output);
    Equal("a", output.TagName, "Link action element");
    Equal("/records", Attribute(output, "href"), "Link href");
    Equal("noopener noreferrer", Attribute(output, "rel"), "Blank-target relation");
    MissingAttribute(output, "type");

    var disabledLink = new ButtonTagHelper { Href = "/records", Disabled = true };
    output = Output("design-system-button", "Unavailable");
    await disabledLink.ProcessAsync(Context(), output);
    MissingAttribute(output, "href");
    Equal("true", Attribute(output, "aria-disabled"), "Disabled link semantics");
    Equal("-1", Attribute(output, "tabindex"), "Disabled link tab stop");

    var loading = new ButtonTagHelper { Loading = true, LoadingLabel = "Saving changes" };
    output = Output("design-system-button", "Save");
    await loading.ProcessAsync(Context(), output);
    Equal("true", Attribute(output, "aria-busy"), "Loading busy state");
    HasAttribute(output, "disabled");
    True(output.Content.GetContent().Contains("design-system-button__spinner", StringComparison.Ordinal), "Loading spinner markup");
    True(output.Content.GetContent().Contains("Saving changes", StringComparison.Ordinal), "Loading announcement");

    var toggle = new ButtonTagHelper { Toggle = true, Pressed = true };
    output = Output("design-system-button", "Pinned");
    await toggle.ProcessAsync(Context(), output);
    Equal("true", Attribute(output, "aria-pressed"), "Toggle pressed state");
    HasAttribute(output, "data-design-system-toggle");
}

static async Task TestButtonValidation()
{
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        var helper = new ButtonTagHelper { Variant = ButtonVariant.Filled, Tone = SemanticTone.Neutral };
        await helper.ProcessAsync(Context(), Output("design-system-button", "Invalid"));
    }, "Filled rejects neutral");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        var helper = new ButtonTagHelper { Tone = SemanticTone.Success };
        await helper.ProcessAsync(Context(), Output("design-system-button", "Invalid"));
    }, "Unsupported button tone");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        var helper = new ButtonTagHelper { Type = "menu" };
        await helper.ProcessAsync(Context(), Output("design-system-button", "Invalid"));
    }, "Native button type allow-list");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        var helper = new ButtonTagHelper { Href = "/", Toggle = true };
        await helper.ProcessAsync(Context(), Output("design-system-button", "Invalid"));
    }, "Links cannot be toggles");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        var helper = new ButtonTagHelper { Loading = true, LoadingLabel = " " };
        await helper.ProcessAsync(Context(), Output("design-system-button", "Invalid"));
    }, "Loading label requirement");
}

static Task TestIconRendering()
{
    var decorative = new IconTagHelper { Name = IconName.Search };
    var output = Output("design-system-icon");
    decorative.Process(Context(), output);
    Equal("span", output.TagName, "Icon element");
    Equal("true", Attribute(output, "aria-hidden"), "Decorative icon semantics");
    Equal("search", Attribute(output, "data-design-system-icon"), "Icon hook");
    Equal(string.Empty, output.Content.GetContent(), "Icon uses the packaged mask glyph");

    var named = new IconTagHelper { Name = IconName.Info, Decorative = false, AccessibleLabel = "Information" };
    output = Output("design-system-icon");
    named.Process(Context(), output);
    Equal("img", Attribute(output, "role"), "Meaningful icon role");
    Equal("Information", Attribute(output, "aria-label"), "Meaningful icon label");

    Throws<InvalidOperationException>(() => new IconTagHelper().Process(Context(), Output("design-system-icon")), "Icon name requirement");
    Throws<InvalidOperationException>(() => new IconTagHelper { Name = IconName.Info, Decorative = false }.Process(Context(), Output("design-system-icon")), "Meaningful icon label requirement");
    return Task.CompletedTask;
}

static async Task TestBadgeRendering()
{
    var helper = new BadgeTagHelper { Tone = SemanticTone.Success, Appearance = BadgeAppearance.Outline, Size = ComponentSize.Small };
    var output = Output("design-system-badge", "Ready");
    await helper.ProcessAsync(Context(), output);
    Equal("span", output.TagName, "Badge element");
    ContainsClasses(output, "design-system-badge", "design-system-badge--success", "design-system-badge--outline", "design-system-badge--small");
    Equal("success", Attribute(output, "data-design-system-tone"), "Badge tone hook");
    Equal("outline", Attribute(output, "data-design-system-appearance"), "Badge appearance hook");
    Equal("Ready", output.Content.GetContent(), "Badge content");
}

static async Task TestAlertRendering()
{
    var helper = new AlertTagHelper
    {
        Tone = SemanticTone.Danger,
        Title = "Could not save",
        Dismissible = true,
        DismissLabel = "Dismiss error",
        LiveMode = LiveRegionMode.Assertive
    };
    var output = Output("design-system-alert", "Try again.");
    await helper.ProcessAsync(Context(), output);
    Equal("div", output.TagName, "Alert element");
    Equal("alert", Attribute(output, "role"), "Assertive alert role");
    Equal("assertive", Attribute(output, "aria-live"), "Assertive alert live mode");
    ContainsClasses(output, "design-system-alert", "design-system-alert--danger");
    True(output.Content.GetContent().Contains("design-system-alert__dismiss", StringComparison.Ordinal), "Alert dismiss action");
    True(output.Content.GetContent().Contains("Dismiss error", StringComparison.Ordinal), "Alert dismiss label");

    var silent = new AlertTagHelper { Title = "Static note", LiveMode = LiveRegionMode.Off };
    output = Output("design-system-alert", "No announcement.");
    await silent.ProcessAsync(Context(), output);
    MissingAttribute(output, "role");
    MissingAttribute(output, "aria-live");
}

static Task TestSpinnerRendering()
{
    var helper = new SpinnerTagHelper { Size = ComponentSize.Large, AccessibleLabel = "Loading records" };
    var output = Output("design-system-spinner");
    helper.Process(Context(), output);
    Equal("span", output.TagName, "Spinner element");
    Equal("status", Attribute(output, "role"), "Spinner role");
    Equal("Loading records", Attribute(output, "aria-label"), "Spinner label");
    ContainsClasses(output, "design-system-spinner", "design-system-spinner--large");

    helper = new SpinnerTagHelper { Decorative = true };
    output = Output("design-system-spinner");
    helper.Process(Context(), output);
    Equal("true", Attribute(output, "aria-hidden"), "Decorative spinner semantics");
    MissingAttribute(output, "role");

    helper = new SpinnerTagHelper();
    output = Output("design-system-spinner", attributes: [("aria-label", "Loading customers")]);
    helper.Process(Context(), output);
    Equal("Loading customers", Attribute(output, "aria-label"), "Authored spinner label preserved");
    return Task.CompletedTask;
}

static async Task TestAccessibleNameValidation()
{
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        await new ButtonTagHelper().ProcessAsync(Context(), Output("design-system-button", "<span aria-hidden=\"true\"></span>"));
    }, "Button accessible name");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        await new ButtonTagHelper().ProcessAsync(Context(), Output("design-system-button", "<span aria-hidden=\"true\">×</span>"));
    }, "Button hidden content is not an accessible name");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        await new ButtonTagHelper { IconOnly = true }.ProcessAsync(Context(), Output("design-system-button", "<span aria-hidden=\"true\">×</span>"));
    }, "Icon-only button explicit accessible name");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        await new BadgeTagHelper().ProcessAsync(Context(), Output("design-system-badge", " "));
    }, "Badge accessible name");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        await new BadgeTagHelper().ProcessAsync(Context(), Output("design-system-badge", "<span hidden>Hidden label</span>"));
    }, "Badge hidden content is not an accessible name");
    var visibleBadge = Output("design-system-badge", "<span aria-hidden=\"false\">Visible label</span>");
    await new BadgeTagHelper().ProcessAsync(Context(), visibleBadge);
    True(visibleBadge.Content.GetContent().Contains("Visible label", StringComparison.Ordinal), "Visible ARIA content remains valid badge text");
    await ThrowsAsync<InvalidOperationException>(async () =>
    {
        await new AlertTagHelper().ProcessAsync(Context(), Output("design-system-alert", " "));
    }, "Alert accessible name");
    Throws<InvalidOperationException>(() => new SpinnerTagHelper { AccessibleLabel = " " }.Process(Context(), Output("design-system-spinner")), "Spinner accessible name");

    var output = Output("design-system-button", string.Empty, ("aria-label", "Add record"));
    await new ButtonTagHelper { IconOnly = true }.ProcessAsync(Context(), output);
    Equal("Add record", Attribute(output, "aria-label"), "Authored aria-label preserved");
    ContainsClasses(output, "design-system-button", "design-system-icon-button");
}

static TagHelperContext Context() => new(
    new TagHelperAttributeList(),
    new Dictionary<object, object>(),
    Guid.NewGuid().ToString("N"));

static TagHelperOutput Output(string tagName, string? content = null, params (string Name, object? Value)[] attributes)
{
    var list = new TagHelperAttributeList();
    foreach (var (name, value) in attributes)
    {
        list.Add(name, value);
    }

    return new TagHelperOutput(
        tagName,
        list,
        (_, _) =>
        {
            var child = new DefaultTagHelperContent();
            child.SetHtmlContent(content ?? string.Empty);
            return Task.FromResult<TagHelperContent>(child);
        });
}

static string Attribute(TagHelperOutput output, string name)
{
    if (!output.Attributes.TryGetAttribute(name, out var attribute))
    {
        throw new InvalidOperationException($"Expected attribute '{name}' was not rendered.");
    }

    return attribute.Value?.ToString() ?? string.Empty;
}

static void HasAttribute(TagHelperOutput output, string name) =>
    True(output.Attributes.ContainsName(name), $"Expected attribute '{name}'");

static void MissingAttribute(TagHelperOutput output, string name) =>
    False(output.Attributes.ContainsName(name), $"Unexpected attribute '{name}'");

static void ContainsClasses(TagHelperOutput output, params string[] expected)
{
    var actual = Attribute(output, "class").Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet(StringComparer.Ordinal);
    foreach (var cssClass in expected)
    {
        True(actual.Contains(cssClass), $"Expected CSS class '{cssClass}'");
    }
}

static void AssertMappings<T>(Func<T, string> converter, params (T Value, string Contract)[] expected)
    where T : struct, Enum
{
    Equal(expected.Length, Enum.GetValues<T>().Length, $"{typeof(T).Name} member count");
    foreach (var (value, contract) in expected)
    {
        Equal(contract, converter(value), $"{typeof(T).Name}.{value} contract");
    }
}

static void SequenceEqual<T>(IEnumerable<T> expected, IEnumerable<T> actual, string message)
{
    if (!expected.SequenceEqual(actual))
    {
        throw new InvalidOperationException($"{message}: expected [{string.Join(", ", expected)}], actual [{string.Join(", ", actual)}].");
    }
}

static void Equal<T>(T expected, T actual, string message)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
    {
        throw new InvalidOperationException($"{message}: expected '{expected}', actual '{actual}'.");
    }
}

static void True(bool condition, string message)
{
    if (!condition)
    {
        throw new InvalidOperationException(message);
    }
}

static void False(bool condition, string message) => True(!condition, message);

static void Throws<TException>(Action action, string message)
    where TException : Exception
{
    try
    {
        action();
    }
    catch (TException)
    {
        return;
    }

    throw new InvalidOperationException($"{message}: expected {typeof(TException).Name}.");
}

static async Task ThrowsAsync<TException>(Func<Task> action, string message)
    where TException : Exception
{
    try
    {
        await action();
    }
    catch (TException)
    {
        return;
    }

    throw new InvalidOperationException($"{message}: expected {typeof(TException).Name}.");
}
