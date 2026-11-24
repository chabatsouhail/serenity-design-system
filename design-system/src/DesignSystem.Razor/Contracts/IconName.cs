namespace DesignSystem.Razor.Contracts;

/// <summary>Icons included in the portable design system component contract.</summary>
public enum IconName
{
    Adjustments,
    Api,
    ArrowLeft,
    ArrowRight,
    ArrowsSort,
    Bookmark,
    Calendar,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Close,
    ExternalLink,
    File,
    Inbox,
    Info,
    LayoutSidebarCollapse,
    Library,
    Menu,
    Moon,
    Plus,
    Refresh,
    Search,
    Sun,
    Upload,
    Warning
}

public static class IconNameExtensions
{
    public static string ToContractValue(this IconName value) => value switch
    {
        IconName.Adjustments => "adjustments-horizontal",
        IconName.Api => "api",
        IconName.ArrowLeft => "arrow-left",
        IconName.ArrowRight => "arrow-right",
        IconName.ArrowsSort => "arrows-sort",
        IconName.Bookmark => "bookmark",
        IconName.Calendar => "calendar",
        IconName.Check => "check",
        IconName.ChevronDown => "chevron-down",
        IconName.ChevronLeft => "chevron-left",
        IconName.ChevronRight => "chevron-right",
        IconName.Close => "x",
        IconName.ExternalLink => "external-link",
        IconName.File => "file",
        IconName.Inbox => "inbox",
        IconName.Info => "info-circle",
        IconName.LayoutSidebarCollapse => "layout-sidebar-right-collapse",
        IconName.Library => "library",
        IconName.Menu => "menu-2",
        IconName.Moon => "moon",
        IconName.Plus => "plus",
        IconName.Refresh => "refresh",
        IconName.Search => "search",
        IconName.Sun => "sun",
        IconName.Upload => "upload",
        IconName.Warning => "alert-triangle",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unknown icon.")
    };
}
