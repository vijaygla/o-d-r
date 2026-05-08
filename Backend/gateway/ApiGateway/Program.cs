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

// Must be before UseRouting to handle all preflights and errors correctly
app.UseCors("AllowAll");

app.UseRouting();

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("v1/swagger.json", "OLMS API Gateway v1");
    options.RoutePrefix = "swagger";
});

// Redirect root to swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

// Map the reverse proxy middleware
app.MapReverseProxy();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8000";

Console.WriteLine($"🚀 API Gateway is running on port {port}");

app.Run($"http://0.0.0.0:{port}");
