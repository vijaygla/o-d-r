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

app.UseCors("AllowAll");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "OLMS API Gateway v1");
});

app.UseRouting();

// Redirect root to swagger
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));

app.MapReverseProxy();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8000";
app.Run($"http://0.0.0.0:{port}");
