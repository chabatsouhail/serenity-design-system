using Microsoft.AspNetCore.Mvc.RazorPages;
using DesignSystem.Razor.Contracts;
using DesignSystem.Razor.Models;

namespace DesignSystem.VisualHarness.Pages;

public sealed class IndexModel : PageModel
{
    public PickerModel Picker { get; } = new(
        "harness-picker-control",
        "picker",
        "Customer",
        [
            new("customer-1", "Ada Lovelace", Description: "Primary customer"),
            new("customer-2", "Grace Hopper", Description: "Active account"),
            new("customer-3", "Disabled example", Disabled: true)
        ])
    {
        Value = "customer-1",
        Hint = "The native select remains the form authority.",
        Searchable = true,
        Required = true
    };

    public DatePickerModel DatePicker { get; } = new(
        "harness-date-control",
        "date",
        "Review date")
    {
        Value = new DateOnly(2026, 8, 21),
        Minimum = new DateOnly(2026, 1, 1),
        Maximum = new DateOnly(2026, 12, 31),
        Hint = "Choose a date in 2026.",
        Required = true
    };

    public FileUploadModel FileUpload { get; } = new(
        "harness-file-control",
        "attachment",
        "Attachment")
    {
        Accept = ".pdf,.png",
        Hint = "PDF or PNG, up to the application limit.",
        Required = true
    };

    public PaginationModel Pagination { get; } = new(5, 12, "/?page={page}#component-pagination");

    public EmptyStateModel EmptyState { get; } = new(
        "No records yet",
        "Create the first record to begin using this view.")
    {
        ActionLabel = "Create record",
        ActionHref = "#component-empty-state",
        Icon = IconName.Inbox
    };

    public void OnGet()
    {
    }
}
