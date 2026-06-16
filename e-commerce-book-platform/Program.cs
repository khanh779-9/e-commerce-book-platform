using System.Security.Claims;
using System.Text;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Middleware;
using ECommerceBookPlatform.Services.Implementations;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Authentication (JWT) ─────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKeyForECommerceBookPlatform2024!@#$%";

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
    };
});

builder.Services.AddAuthorization(options =>
{
    // Employee role policies
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("EmployeeRole", "admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireAssertion(context =>
        context.User.HasClaim(c => c.Type == "EmployeeRole" && (c.Value == "admin" || c.Value == "quanly"))));
    options.AddPolicy("EmployeeAccess", policy => policy.RequireAssertion(context =>
        context.User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value.StartsWith("employee_"))));
});

// ── Services ─────────────────────────────────────
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmployeeAuthService, EmployeeAuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// ── AutoMapper ───────────────────────────────────
//builder.Services.AddAutoMapper( Action<AutoMapper.IMapperConfigurationExpression> Type);

// ── CORS ─────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── Controllers + Swagger ────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
       
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "E-Commerce Book Platform API",
        Version = "v1",
        Description = "API cho nền tảng bán sách trực tuyến"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Nhập JWT token: Bearer {your_token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

var app = builder.Build();

// ── Middleware Pipeline ──────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseMiddleware<EmployeeAuthorizationMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

// ── Auto-migrate + seed on startup ──────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Seed default admin employee
    if (!db.Employees.Any())
    {
        db.Employees.Add(new ECommerceBookPlatform.Models.Employee
        {
            FirstName = "Admin",
            LastName = "System",
            Email = "admin@bookstore.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "admin",
            Status = "dang_lam",
            StartDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        });
        db.SaveChanges();
    }

    // Seed reference data for demo
    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new ECommerceBookPlatform.Models.Category { Name = "Văn học", Description = "Văn học trong nước và quốc tế", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Category { Name = "Khoa học", Description = "Sách khoa học tự nhiên và xã hội", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Category { Name = "Giáo dục", Description = "Sách giáo khoa và tham khảo", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Category { Name = "Kinh tế", Description = "Kinh tế, khởi nghiệp, tài chính", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();
    }

    if (!db.Units.Any())
    {
        db.Units.AddRange(
            new ECommerceBookPlatform.Models.Unit { Name = "Quyển", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Unit { Name = "Bộ", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Unit { Name = "Cuốn", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();
    }

    if (!db.BookTypes.Any())
    {
        db.BookTypes.AddRange(
            new ECommerceBookPlatform.Models.BookType { Code = "novel", Name = "Tiểu thuyết", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.BookType { Code = "poem", Name = "Thơ", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.BookType { Code = "textbook", Name = "Giáo khoa", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.BookType { Code = "reference", Name = "Sách tham khảo", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.BookType { Code = "comic", Name = "Truyện tranh", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();
    }

    if (!db.Authors.Any())
    {
        db.Authors.AddRange(
            new ECommerceBookPlatform.Models.Author { FirstName = "Nguyễn", MiddleName = "Nhật", LastName = "Ánh", Email = "nna@example.com", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Author { FirstName = "Paulo", MiddleName = "", LastName = "Coelho", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Author { FirstName = "Harper", MiddleName = "", LastName = "Lee", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Author { FirstName = "George", MiddleName = "", LastName = "Orwell", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();
    }

    if (!db.Publishers.Any())
    {
        db.Publishers.AddRange(
            new ECommerceBookPlatform.Models.Publisher { Name = "NXB Trẻ", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Publisher { Name = "NXB Kim Đồng", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Publisher { Name = "NXB Giáo Dục", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Publisher { Name = "NXB Thế Giới", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();
    }

    if (!db.Providers.Any())
    {
        db.Providers.AddRange(
            new ECommerceBookPlatform.Models.Provider { Name = "Công ty Sách ABC", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new ECommerceBookPlatform.Models.Provider { Name = "Phát hành sách XYZ", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        db.SaveChanges();
    }

    // Seed demo products
    if (!db.Products.Any())
    {
        var catVanHoc = db.Categories.First(c => c.Name == "Văn học");
        var catKhoaHoc = db.Categories.First(c => c.Name == "Khoa học");
        var catGiaoDuc = db.Categories.First(c => c.Name == "Giáo dục");
        var catKinhTe = db.Categories.First(c => c.Name == "Kinh tế");
        var unitQuyen = db.Units.First(u => u.Name == "Quyển");
        var unitBo = db.Units.First(u => u.Name == "Bộ");
        var provABC = db.Providers.First(p => p.Name!.StartsWith("Công ty"));

        var product1 = new ECommerceBookPlatform.Models.Product
        {
            Name = "Cho tôi xin một vé đi tuổi thơ",
            CategoryId = catVanHoc.CategoryId, UnitId = unitQuyen.UnitId,
            ProviderId = provABC.ProviderId, Price = 85000, StockQuantity = 100,
            Description = "Tác phẩm nổi tiếng của nhà văn Nguyễn Nhật Ánh",
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
            Book = new ECommerceBookPlatform.Models.Book
            {
                Title = "Cho tôi xin một vé đi tuổi thơ",
                AuthorId = db.Authors.First(a => a.LastName == "Ánh").AuthorId,
                PublisherId = db.Publishers.First(p => p.Name == "NXB Trẻ").PublisherId,
                PublishedYear = 2010, BookTypeCode = "novel",
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            }
        };

        var product2 = new ECommerceBookPlatform.Models.Product
        {
            Name = "Nhà giả kim (The Alchemist)",
            CategoryId = catVanHoc.CategoryId, UnitId = unitQuyen.UnitId,
            ProviderId = provABC.ProviderId, Price = 65000, StockQuantity = 50,
            Description = "Tác phẩm nổi tiếng nhất của Paulo Coelho",
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
            Book = new ECommerceBookPlatform.Models.Book
            {
                Title = "Nhà giả kim",
                AuthorId = db.Authors.First(a => a.LastName == "Coelho").AuthorId,
                PublisherId = db.Publishers.First(p => p.Name == "NXB Thế Giới").PublisherId,
                PublishedYear = 1988, BookTypeCode = "novel",
                CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            }
        };

        db.Products.AddRange(product1, product2);
        db.SaveChanges();
    }
}

app.Run();