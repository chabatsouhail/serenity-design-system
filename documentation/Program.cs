var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseStaticWebAssets();
builder.Services.AddRazorPages();

var app = builder.Build();
app.UseStaticFiles();
app.MapRazorPages();
app.Run();

