using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using MassTransit;
using SharedKernel.Utilities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = ConnectionStringHelper.ConvertToNpgsql(
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")!);

var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET")
             ?? builder.Configuration["Jwt:Key"]
             ?? "THIS_IS_SECRET_KEY_CHANGE_IT_1234567890";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "IdentityService";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "IdentityServiceClients";

// DbContexts
Action<DbContextOptionsBuilder> dbOptions = options =>
    options.UseNpgsql(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
        sqlOptions.CommandTimeout(10);
    });

builder.Services.AddDbContext<AssessmentService.Infrastructure.Data.AssessmentDbContext>(dbOptions);
builder.Services.AddDbContext<CategoryService.Infrastructure.Data.CategoryDbContext>(dbOptions);
builder.Services.AddDbContext<CertificateService.Infrastructure.Data.CertificateDbContext>(dbOptions);
builder.Services.AddDbContext<ContentService.Infrastructure.Data.ContentDbContext>(dbOptions);
builder.Services.AddDbContext<CourseService.Infrastructure.Data.CourseDbContext>(dbOptions);
builder.Services.AddDbContext<DiscussionService.Infrastructure.Data.DiscussionDbContext>(dbOptions);
builder.Services.AddDbContext<EnrollmentService.Infrastructure.Data.EnrollmentDbContext>(dbOptions);
builder.Services.AddDbContext<IdentityService.Infrastructure.Data.AppDbContext>(dbOptions);
builder.Services.AddDbContext<MediaService.Infrastructure.Data.MediaDbContext>(dbOptions);
builder.Services.AddDbContext<NotificationService.Infrastructure.Data.NotificationDbContext>(dbOptions);
builder.Services.AddDbContext<PaymentService.Infrastructure.Data.PaymentDbContext>(dbOptions);
builder.Services.AddDbContext<ProgressService.Infrastructure.Data.ProgressDbContext>(dbOptions);
builder.Services.AddDbContext<ReviewService.Infrastructure.Data.ReviewDbContext>(dbOptions);
builder.Services.AddDbContext<UserService.Infrastructure.Data.UserDbContext>(dbOptions);

// Repositories
builder.Services.AddScoped<AssessmentService.Application.Interfaces.IAssessmentRepository, AssessmentService.Infrastructure.Repositories.AssessmentRepository>();
builder.Services.AddScoped<CategoryService.Application.Interfaces.ICategoryRepository, CategoryService.Infrastructure.Repositories.CategoryRepository>();
builder.Services.AddScoped<CertificateService.Application.Interfaces.ICertificateRepository, CertificateService.Infrastructure.Repositories.CertificateRepository>();
builder.Services.AddScoped<ContentService.Application.Interfaces.ILessonRepository, ContentService.Infrastructure.Repositories.LessonRepository>();
builder.Services.AddScoped<CourseService.Application.Interfaces.ICourseRepository, CourseService.Infrastructure.Repositories.CourseRepository>();
builder.Services.AddScoped<DiscussionService.Application.Interfaces.IDiscussionRepository, DiscussionService.Infrastructure.Repositories.DiscussionRepository>();
builder.Services.AddScoped<EnrollmentService.Application.Interfaces.IEnrollmentRepository, EnrollmentService.Infrastructure.Repositories.EnrollmentRepository>();
builder.Services.AddScoped<IdentityService.Application.Interfaces.IUserRepository, IdentityService.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<MediaService.Application.Interfaces.IMediaRepository, MediaService.Infrastructure.Repositories.MediaRepository>();
builder.Services.AddScoped<PaymentService.Application.Interfaces.IPaymentRepository, PaymentService.Infrastructure.Repositories.PaymentRepository>();
builder.Services.AddScoped<ProgressService.Application.Interfaces.IProgressRepository, ProgressService.Infrastructure.Repositories.ProgressRepository>();
builder.Services.AddScoped<ReviewService.Application.Interfaces.IReviewRepository, ReviewService.Infrastructure.Repositories.ReviewRepository>();
builder.Services.AddScoped<UserService.Application.Interfaces.IUserProfileRepository, UserService.Infrastructure.Repositories.UserProfileRepository>();

// Services
builder.Services.AddScoped<AssessmentService.Application.Interfaces.IAssessmentService, AssessmentService.Application.Services.AssessmentService>();
builder.Services.AddScoped<CategoryService.Application.Interfaces.ICategoryService, CategoryService.Application.Services.CategoryService>();
builder.Services.AddScoped<CertificateService.Application.Interfaces.ICertificateService, CertificateService.Application.Services.CertificateService>();
builder.Services.AddScoped<ContentService.Application.Interfaces.ILessonService, ContentService.Application.Services.LessonService>();
builder.Services.AddScoped<CourseService.Application.Interfaces.ICourseService, CourseService.Application.Services.CourseService>();
builder.Services.AddScoped<DiscussionService.Application.Interfaces.IDiscussionService, DiscussionService.Application.Services.DiscussionService>();
builder.Services.AddScoped<EnrollmentService.Application.Interfaces.IEnrollmentService, EnrollmentService.Application.Services.EnrollmentService>();
builder.Services.AddScoped<IdentityService.Application.Interfaces.IAuthService, IdentityService.Application.Services.AuthService>();
builder.Services.AddScoped<IdentityService.Application.Interfaces.IUserService, IdentityService.Application.Services.UserService>();
builder.Services.AddScoped<IdentityService.Application.Interfaces.ITokenService>(_ => new IdentityService.Infrastructure.Services.TokenService(jwtKey, jwtIssuer, jwtAudience));
builder.Services.AddScoped<MediaService.Application.Interfaces.IStorageService, MediaService.Infrastructure.Services.MinioStorageService>();
builder.Services.AddScoped<NotificationService.Application.Interfaces.IEmailService, NotificationService.Application.Services.EmailService>();
builder.Services.AddScoped<NotificationService.Application.Interfaces.INotificationService, NotificationService.Infrastructure.Services.InAppNotificationService>();
builder.Services.AddScoped<PaymentService.Application.Interfaces.IPaymentService, PaymentService.Application.Services.PaymentService>();
builder.Services.AddScoped<ProgressService.Application.Interfaces.IProgressService, ProgressService.Application.Services.ProgressService>();
builder.Services.AddScoped<ReviewService.Application.Interfaces.IReviewService, ReviewService.Application.Services.ReviewService>();
builder.Services.AddScoped<SearchService.Application.Interfaces.ISearchService, SearchService.Infrastructure.Services.MeiliSearchService>();
builder.Services.AddScoped<UserService.Application.Interfaces.IUserService, UserService.Application.Services.UserService>();

// MassTransit
builder.Services.AddMassTransit(x =>
{
    var consumerAssemblies = AppDomain.CurrentDomain.GetAssemblies()
        .Where(a => a.FullName!.Contains("Service")).ToArray();
    x.AddConsumers(consumerAssemblies);

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
        cfg.ConfigureEndpoints(context);
    });
});

var key = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
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

// --- Non-blocking Database Initialization ---
_ = Task.Run(async () =>
{
    await Task.Delay(5000); 
    using var scope = app.Services.CreateScope();
    var provider = scope.ServiceProvider;
    var dbContexts = new DbContext[]
    {
        provider.GetRequiredService<AssessmentService.Infrastructure.Data.AssessmentDbContext>(),
        provider.GetRequiredService<CategoryService.Infrastructure.Data.CategoryDbContext>(),
        provider.GetRequiredService<CertificateService.Infrastructure.Data.CertificateDbContext>(),
        provider.GetRequiredService<ContentService.Infrastructure.Data.ContentDbContext>(),
        provider.GetRequiredService<CourseService.Infrastructure.Data.CourseDbContext>(),
        provider.GetRequiredService<DiscussionService.Infrastructure.Data.DiscussionDbContext>(),
        provider.GetRequiredService<EnrollmentService.Infrastructure.Data.EnrollmentDbContext>(),
        provider.GetRequiredService<IdentityService.Infrastructure.Data.AppDbContext>(),
        provider.GetRequiredService<MediaService.Infrastructure.Data.MediaDbContext>(),
        provider.GetRequiredService<NotificationService.Infrastructure.Data.NotificationDbContext>(),
        provider.GetRequiredService<PaymentService.Infrastructure.Data.PaymentDbContext>(),
        provider.GetRequiredService<ProgressService.Infrastructure.Data.ProgressDbContext>(),
        provider.GetRequiredService<ReviewService.Infrastructure.Data.ReviewDbContext>(),
        provider.GetRequiredService<UserService.Infrastructure.Data.UserDbContext>()
    };

    foreach (var dbContext in dbContexts)
    {
        try
        {
            var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();
            if (!databaseCreator.Exists()) databaseCreator.Create();
            try { databaseCreator.CreateTables(); } catch { }
            Console.WriteLine($"? Database for {dbContext.GetType().Name} initialized.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"? Error initializing {dbContext.GetType().Name}: {ex.Message}");
        }
    }

    // Seed Admin User
    try
    {
        var identityDb = provider.GetRequiredService<IdentityService.Infrastructure.Data.AppDbContext>();
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@olms.com";
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "Admin@123";

        if (!identityDb.Users.Any(u => u.Email == adminEmail))
        {
            var adminUser = new IdentityService.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                Name = "System Admin",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = "Admin"
            };
            identityDb.Users.Add(adminUser);
            identityDb.SaveChanges();
            Console.WriteLine($"?? Admin user created: {adminEmail}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Admin seeding error: {ex.Message}");
    }
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8000";
app.Run($"http://0.0.0.0:{port}");
