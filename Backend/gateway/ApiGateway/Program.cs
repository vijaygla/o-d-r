using SharedKernel.Utilities;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "OLMS API Gateway", Version = "v1" });
});

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

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "OLMS API Gateway v1");
    options.RoutePrefix = "swagger";
});

app.MapGet("/", () => Results.Redirect("/swagger"));

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
