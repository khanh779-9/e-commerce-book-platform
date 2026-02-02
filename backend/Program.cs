using System.Security.Claims;
using System.Text;
using DotNetEnv;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Middleware;
using ECommerceBookPlatform.Services.Implementations;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using FluentValidation;
using FluentValidation.AspNetCore;
using Serilog;
using StackExchange.Redis;
using System.Threading.RateLimiting;

// Load .env file early (before builder.Configuration is built)
Env.Load(); // loads .env from project root or current directory

var builder = WebApplication.CreateBuilder(args);

// ── Serilog ────────────────────────────────────────────
builder.Host.UseSerilog((ctx, services, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console()
);

// ── Configuration: Environment-specific appsettings + .env ────
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()       // System env vars (highest priority)
    .AddUserSecrets<Program>(optional: true); // User secrets (dev only)

// ── Database ──
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Redis ──────────────────────────────────────────────
var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
var redisConnectTimeout = builder.Configuration.GetValue<int>("Redis:ConnectTimeoutMs", 5000);
var redisInstanceName = builder.Configuration["Redis:InstanceName"] ?? "BookZone:";
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var config = ConfigurationOptions.Parse(redisConnection, true);
    config.AbortOnConnectFail = false;
    config.ConnectRetry = 3;
    config.ConnectTimeout = redisConnectTimeout;
    return ConnectionMultiplexer.Connect(config);
});
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisConnection;
    options.InstanceName = redisInstanceName;
});

// ── Rate Limiting (ASP.NET Core 9 built-in) ──
var rateLimitGlobalPermit = builder.Configuration.GetValue<int>("RateLimit:Global:PermitLimit", 200);
var rateLimitGlobalWindow = builder.Configuration.GetValue<int>("RateLimit:Global:WindowMinutes", 1);
var rateLimitGlobalQueue = builder.Configuration.GetValue<int>("RateLimit:Global:QueueLimit", 10);
var rateLimitAuthPermit = builder.Configuration.GetValue<int>("RateLimit:Auth:PermitLimit", 5);
var rateLimitAuthWindow = builder.Configuration.GetValue<int>("RateLimit:Auth:WindowMinutes", 1);
var rateLimitAuthQueue = builder.Configuration.GetValue<int>("RateLimit:Auth:QueueLimit", 2);
var rateLimitRegisterPermit = builder.Configuration.GetValue<int>("RateLimit:Register:PermitLimit", 3);
var rateLimitRegisterWindow = builder.Configuration.GetValue<int>("RateLimit:Register:WindowMinutes", 1);
var rateLimitRegisterQueue = builder.Configuration.GetValue<int>("RateLimit:Register:QueueLimit", 1);
var rateLimitRetryAfter = builder.Configuration.GetValue<int>("RateLimit:RetryAfterSeconds", 60);

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rateLimitGlobalPermit,
                Window = TimeSpan.FromMinutes(rateLimitGlobalWindow),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = rateLimitGlobalQueue
            }));

    options.AddPolicy("auth", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rateLimitAuthPermit,
                Window = TimeSpan.FromMinutes(rateLimitAuthWindow),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = rateLimitAuthQueue
            }));

    options.AddPolicy("register", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rateLimitRegisterPermit,
                Window = TimeSpan.FromMinutes(rateLimitRegisterWindow),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = rateLimitRegisterQueue
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (ctx, token) =>
    {
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsJsonAsync(new
        {
            Message = "Qua nhieu yeu cau. Vui long thu lai sau.",
            RetryAfter = rateLimitRetryAfter
        }, cancellationToken: token);
    };
});

// ── Authentication (JWT) ──
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException(
        "Thieu cau hinh Jwt:Secret. Dat bien moi truong Jwt__Secret hoac dotnet user-secrets set \"Jwt:Secret\" \"...\".");

var jwtClockSkewSeconds = builder.Configuration.GetValue<int>("Jwt:ClockSkewSeconds", 30);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ECommerceBookPlatform",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ECommerceBookPlatform",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.FromSeconds(jwtClockSkewSeconds)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            if (ctx.Request.Cookies.ContainsKey("access_token"))
                ctx.Token = ctx.Request.Cookies["access_token"];
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = ctx =>
        {
            if (ctx.Exception.GetType() == typeof(SecurityTokenExpiredException))
                ctx.Response.Headers.Append("Token-Expired", "true");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy
        .RequireClaim("EmployeeRole", "admin")
        .RequireClaim("EmployeeStatus", "dang_lam"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireAssertion(context =>
        context.User.HasClaim(c => c.Type == "EmployeeRole" && (c.Value == "admin" || c.Value == "quanly")) &&
        context.User.HasClaim(c => c.Type == "EmployeeStatus" && c.Value == "dang_lam")));
    options.AddPolicy("EmployeeAccess", policy => policy.RequireAssertion(context =>
        context.User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value.StartsWith("employee_")) &&
        context.User.HasClaim(c => c.Type == "EmployeeStatus" && c.Value == "dang_lam")));
});

// ── Services ──
builder.Services.AddMemoryCache();
// IDistributedCache (Redis) is registered by AddStackExchangeRedisCache above.
builder.Services.AddScoped<ICacheService>(sp => 
    new RedisCacheService(
        sp.GetRequiredService<IDistributedCache>(),
        sp.GetRequiredService<IConnectionMultiplexer>(),
        sp.GetRequiredService<ILogger<RedisCacheService>>()
    ));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmployeeAuthService, EmployeeAuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<ISettingService, SettingService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// ── Email Service ──
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailService, MailKitEmailService>();

// ── Payment Service (VNPay) ──
builder.Services.Configure<VnPaySettings>(builder.Configuration.GetSection("VnPay"));
builder.Services.AddScoped<IPaymentService, VnPayPaymentService>();

// ── Shipping Service ──
builder.Services.AddScoped<IShippingService, ShippingService>();

// ── File Storage Service ──
builder.Services.Configure<SeaweedFSOptions>(builder.Configuration.GetSection("SeaweedFS"));

if (builder.Environment.IsProduction() && !string.IsNullOrEmpty(builder.Configuration["SeaweedFS:MasterUrl"]))
{
    builder.Services.AddHttpClient<IFileStorageService, SeaweedFSStorageService>(client =>
    {
        var seaweedTimeout = builder.Configuration.GetValue<int>("SeaweedFS:HttpTimeoutSeconds", 30);
        client.Timeout = TimeSpan.FromSeconds(seaweedTimeout);
    });
}
else
{
    builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
}

// ── CORS ──
// Support comma-separated env var: Cors__AllowedOrigins=http://localhost:4200,http://localhost:3000
var corsOriginsConfig = builder.Configuration["Cors:AllowedOrigins"];
var allowedOrigins = !string.IsNullOrWhiteSpace(corsOriginsConfig)
    ? corsOriginsConfig.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    : builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? (builder.Environment.IsDevelopment() ? Array.Empty<string>() : Array.Empty<string>());

builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        else
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
    });
});

// ── Controllers + Swagger ──
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ── Request validation (FluentValidation) ──
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// ── Health Checks ──
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")!, name: "sqlserver")
    .AddRedis(redisConnection, name: "redis")
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "E-Commerce Book Platform API",
        Version = "v1",
        Description = "API cho ngan sach truc tuyen"
    });

    // JWT Bearer auth for Swagger (simplified - no security requirement due to OpenAPI version)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Nhap JWT token: Bearer {your_token}",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
});

var app = builder.Build();

// ── Middleware Pipeline ──
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "E-Commerce Book Platform API v1");
        c.DisplayRequestDuration();
        c.EnableTryItOutByDefault();
    });
}

app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.GetLevel = (httpContext, elapsed, ex) => ex != null ? Serilog.Events.LogEventLevel.Error : Serilog.Events.LogEventLevel.Information;
});

app.UseMiddleware<ExceptionMiddleware>();

// CORS - use production policy
app.UseCors("Production");

// Rate limiting
app.UseRateLimiter();

app.UseAuthentication();
app.UseMiddleware<EmployeeAuthorizationMiddleware>();
app.UseAuthorization();

app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        var result = new
        {
            Status = report.Status.ToString(),
            Checks = report.Entries.Select(e => new
            {
                Name = e.Key,
                Status = e.Value.Status.ToString(),
                Description = e.Value.Description,
                Duration = e.Value.Duration.TotalMilliseconds
            })
        };
        await ctx.Response.WriteAsJsonAsync(result);
    }
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new { Status = report.Status.ToString() });
    }
});
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new { Status = "Healthy" });
    }
});

app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

// ── Database Migration + Seed ──
//using (var scope = app.Services.CreateScope())
//{
//    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
//    try
//    {
//        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
//        if (pendingMigrations.Any())
//        {
//            logger.LogInformation("Applying database migrations...");
//            db.Database.Migrate();
//            logger.LogInformation("Database migrations applied successfully.");
//        }
//        else
//        {
//            logger.LogInformation("No migrations configured or pending - verifying database connectivity instead.");
//            await db.Database.CanConnectAsync();
//        }

//        if (!db.Employees.Any())
//        {
//            var adminPassword = builder.Configuration["Admin:DefaultPassword"] ?? "admin123";
//            db.Employees.Add(new ECommerceBookPlatform.Models.Employee
//            {
//                FirstName = "Admin",
//                LastName = "System",
//                Email = "admin@bookstore.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
//                Role = "admin",
//                Status = "dang_lam",
//                StartDate = DateTime.UtcNow,
//                CreatedAt = DateTime.UtcNow,
//                UpdatedAt = DateTime.UtcNow,
//            });
//            db.SaveChanges();
//            logger.LogInformation("Default admin employee seeded.");
//        }

//        await SeedSettingsAsync(db, scope.ServiceProvider.GetRequiredService<ISettingService>(), builder.Configuration);
//    }
//    catch (Exception ex)
//    {
//        logger.LogError(ex, "Database migration/seed failed");
//        throw;
//    }
//}

//async Task SeedSettingsAsync(AppDbContext db, ISettingService settingService, IConfiguration config)
//{
//    var settings = new Dictionary<string, (object Value, string Description, string Group, bool IsPublic)>
//    {
//        ["site:name"] = (config["Site:Name"] ?? "BookZone", "Ten website", "general", true),
//        ["site:description"] = (config["Site:Description"] ?? "Nha sach truc tuyen danh cho nguoi yeu doc", "Mo ta website", "general", true),
//        ["site:phone"] = (config["Site:Phone"] ?? "1900 6789", "So dien thoai ho tro", "contact", true),
//        ["site:email"] = (config["Site:Email"] ?? "support@bookzone.vn", "Email ho tro", "contact", true),
//        ["site:address"] = (config["Site:Address"] ?? "123 Duong Sach, Quan 1, TP.HCM", "Dia chi cua hang", "contact", true),
//        ["site:working_hours"] = (config["Site:WorkingHours"] ?? "08:00 - 21:00", "Gio lam viec", "contact", true),
//        ["shipping:free_threshold"] = (decimal.TryParse(config["Shipping:FreeThreshold"], out var ft) ? ft : 500000m, "Mien phi ship tu gia tri don hang", "shipping", false),
//        ["shipping:base_fee"] = (decimal.TryParse(config["Shipping:BaseFee"], out var bf) ? bf : 30000m, "Phi ship co ban", "shipping", false),
//        ["loyalty:points_per_1000_vnd"] = (int.TryParse(config["Loyalty:PointsPer1000Vnd"], out var pp) ? pp : 1, "Diem thuong tren 1000 VND", "loyalty", false),
//        ["loyalty:points_to_vnd_ratio"] = (int.TryParse(config["Loyalty:PointsToVndRatio"], out var pv) ? pv : 100, "100 diem = 1000 VND", "loyalty", false)
//    };

//    foreach (var (key, (value, description, group, isPublic)) in settings)
//    {
//        if (!db.Settings.Any(s => s.Key == key))
//        {
//            await settingService.SetAsync(key, value, description, group, isPublic);
//        }
//    }
//}

app.Run();

// Make Program class public for integration testing
public partial class Program { }