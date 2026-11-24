using System.Globalization;

namespace DesignSystem.Razor.Models;

/// <summary>Canonical pagination links for a server-rendered result set.</summary>
public sealed record PaginationModel
{
    public PaginationModel(int currentPage, int totalPages, string urlTemplate)
    {
        if (totalPages < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(totalPages), "Total pages must be at least one.");
        }

        if (currentPage < 1 || currentPage > totalPages)
        {
            throw new ArgumentOutOfRangeException(nameof(currentPage), "Current page must be within the available page range.");
        }

        if (string.IsNullOrWhiteSpace(urlTemplate) || !urlTemplate.Contains("{page}", StringComparison.Ordinal))
        {
            throw new ArgumentException("The URL template must contain the literal {page} placeholder.", nameof(urlTemplate));
        }

        CurrentPage = currentPage;
        TotalPages = totalPages;
        UrlTemplate = urlTemplate;
    }

    public int CurrentPage { get; }

    public int TotalPages { get; }

    public string UrlTemplate { get; }

    public string Label { get; init; } = "Pagination";

    public string PreviousLabel { get; init; } = "Previous page";

    public string NextLabel { get; init; } = "Next page";

    public string PreviousText { get; init; } = "Previous";

    public string NextText { get; init; } = "Next";

    public string PageLabelTemplate { get; init; } = "Page {0}";

    public string GetPageLabel(int page)
    {
        if (page < 1 || page > TotalPages)
        {
            throw new ArgumentOutOfRangeException(nameof(page));
        }

        if (string.IsNullOrWhiteSpace(PageLabelTemplate))
        {
            throw new InvalidOperationException("The page-label template is required.");
        }

        return string.Format(CultureInfo.CurrentCulture, PageLabelTemplate, page);
    }

    public string GetPageUrl(int page)
    {
        if (page < 1 || page > TotalPages)
        {
            throw new ArgumentOutOfRangeException(nameof(page));
        }

        return UrlTemplate.Replace("{page}", page.ToString(CultureInfo.InvariantCulture), StringComparison.Ordinal);
    }

    /// <summary>Returns page numbers and null entries for visual ellipses.</summary>
    public IReadOnlyList<int?> GetVisiblePages()
    {
        if (TotalPages <= 7)
        {
            return Enumerable.Range(1, TotalPages).Select(static page => (int?)page).ToArray();
        }

        var pages = new SortedSet<int> { 1, TotalPages };
        for (var page = Math.Max(2, CurrentPage - 1); page <= Math.Min(TotalPages - 1, CurrentPage + 1); page++)
        {
            pages.Add(page);
        }

        var result = new List<int?>();
        int? previous = null;
        foreach (var page in pages)
        {
            if (previous is not null && page - previous.Value > 1)
            {
                result.Add(null);
            }

            result.Add(page);
            previous = page;
        }

        return result;
    }
}
