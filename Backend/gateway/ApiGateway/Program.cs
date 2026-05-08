using SharedKernel.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Add YARP services and load configuration from appsettings.json
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseRouting();

app.UseCors("AllowAll");

app.MapGet("/", () => "Online Learning Management System API Gateway is running!");

// Map the reverse proxy middleware
app.MapReverseProxy();

var portStr = Environment.GetEnvironmentVariable("PORT") ?? "8000";
if (!int.TryParse(portStr, out int port)) port = 8000;

PortReclaimer.Reclaim(port);

Console.WriteLine($"🚀 API Gateway is running on port {port}");

// Dynamic display of routes based on configuration
var proxyConfig = builder.Configuration.GetSection("ReverseProxy:Clusters");
Console.WriteLine("🔗 Routing Overview:");
foreach (var cluster in proxyConfig.GetChildren())
{
    var address = cluster.GetSection("Destinations:destination1:Address").Value;
    Console.WriteLine($"  - {cluster.Key}: {address}");
}

app.Run($"http://0.0.0.0:{port}");
