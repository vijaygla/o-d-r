using System.Text;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NotificationService.Application.Configurations;
using NotificationService.Application.Consumers;
using NotificationService.Application.Interfaces;
using NotificationService.Application.Services;
using NotificationService.Infrastructure.Data;
using NotificationService.Infrastructure.Services;
using SharedKernel.Utilities;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

var builder = WebApplication.CreateBuilder(args);

// Clean logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Warning);
builder.Logging.AddFilter("Microsoft", LogLevel.Warning);
builder.Logging.AddFilter("MassTransit", LogLevel.Error);
builder.Logging.AddFilter("Microsoft.Hosting.Lifetime", LogLevel.None);

builder.Services.AddControllers();

// Enable CORS
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:4200";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(frontendUrl)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Database Configuration
var connectionString = ConnectionStringHelper.ConvertToNpgsql(
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")!);
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseNpgsql(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(30), null);
    }));

// Email Configuration
builder.Services.Configure<EmailSettings>(options =>
{
    options.Host = Environment.GetEnvironmentVariable("Smtp__Host") ?? Environment.GetEnvironmentVariable("SMTP_HOST") ?? builder.Configuration["Smtp:Host"] ?? "localhost";
    options.Port = int.Parse(Environment.GetEnvironmentVariable("Smtp__Port") ?? Environment.GetEnvironmentVariable("SMTP_PORT") ?? builder.Configuration["Smtp:Port"] ?? "1025");
    options.Username = Environment.GetEnvironmentVariable("Smtp__Username") ?? Environment.GetEnvironmentVariable("SMTP_USER") ?? builder.Configuration["Smtp:Username"] ?? "";
    options.SenderEmail = Environment.GetEnvironmentVariable("Smtp__SenderEmail") ?? Environment.GetEnvironmentVariable("SMTP_SENDER_EMAIL") ?? builder.Configuration["Smtp:SenderEmail"] ?? "noreply@lms.com";
    options.SenderName = Environment.GetEnvironmentVariable("Smtp__SenderName") ?? Environment.GetEnvironmentVariable("SMTP_SENDER_NAME") ?? builder.Configuration["Smtp:SenderName"] ?? "LMS Notifications";
    options.Password = Environment.GetEnvironmentVariable("Smtp__Password") ?? Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? builder.Configuration["Smtp:Password"] ?? "";
});

// Dependency Injection
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, InAppNotificationService>();

// MassTransit Configuration
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<EnrollmentCreatedConsumer>();
    x.AddConsumer<UserCreatedConsumer>();
    x.AddConsumer<ForgotPasswordConsumer>();
    x.AddConsumer<CourseApprovedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitHost = Environment.GetEnvironmentVariable("RabbitMQ__Host") ?? "localhost";
        var rabbitUser = Environment.GetEnvironmentVariable("RabbitMQ__User") ?? "guest";
        var rabbitPass = Environment.GetEnvironmentVariable("RabbitMQ__Password") ?? "guest";
        var rabbitVHost = Environment.GetEnvironmentVariable("RabbitMQ__VHost") ?? "/";

        cfg.Host(rabbitHost, rabbitVHost, h =>
        {
            h.Username(rabbitUser);
            h.Password(rabbitPass);
        });

        cfg.ReceiveEndpoint("enrollment-created-queue", e =>
        {
            e.ConfigureConsumer<EnrollmentCreatedConsumer>(context);
        });

        cfg.ReceiveEndpoint("user-created-queue", e =>
        {
            e.ConfigureConsumer<UserCreatedConsumer>(context);
        });

        cfg.ReceiveEndpoint("forgot-password-queue", e =>
        {
            e.ConfigureConsumer<ForgotPasswordConsumer>(context);
        });

        cfg.ReceiveEndpoint("course-approved-queue", e =>
        {
            e.ConfigureConsumer<CourseApprovedConsumer>(context);
        });
    });
});

// Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET")
             ?? builder.Configuration["Jwt:Key"]
             ?? "THIS_IS_SECRET_KEY_CHANGE_IT_1234567890";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "IdentityService";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "IdentityServiceClients";

var key = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Notification Service API", Version = "v1" });
});

var app = builder.Build();

// Ensure Database and Tables exist
_ = Task.Run(async () =>
{
    await Task.Delay(5000); // Wait 5 seconds for the service to start listening
    using var scope = app.Services.CreateScope();
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
        var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();
        if (!databaseCreator.Exists()) databaseCreator.Create();
        try { databaseCreator.CreateTables(); } catch { }
        Console.WriteLine("✅ Database initialized successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database initialization error: {ex.Message}");
    }
});

app.UseSwagger();
app.UseSwaggerUI(options => { options.SwaggerEndpoint("v1/swagger.json", "Notification Service API v1"); options.RoutePrefix = "swagger"; });

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/", () => Results.Redirect("/swagger"));
app.MapControllers();

var port = "8010";
PortReclaimer.Reclaim(int.Parse(port));

Console.WriteLine($"🚀 Notification Service is running on port {port}");
Console.WriteLine($"📖 Swagger UI: http://localhost:{port}/swagger");

app.Run($"http://0.0.0.0:{port}");
