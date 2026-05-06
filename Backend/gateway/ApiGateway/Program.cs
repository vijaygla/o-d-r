using SharedKernel.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Add YARP services and load configuration from appsettings.json
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// --- Manual CORS Middleware ---
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "*";
app.Use(async (context, next) =>
{
    context.Response.Headers["Access-Control-Allow-Origin"] = frontendUrl;
    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    context.Response.Headers["Access-Control-Allow-Headers"] = "*";
    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";

    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204; // No Content
        await context.Response.CompleteAsync();
        return;
    }

    await next();
});

app.UseRouting();

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
