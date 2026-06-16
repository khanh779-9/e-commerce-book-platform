using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;

namespace ECommerceBookPlatform.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly INotificationService _notificationService;
    private readonly IMemoryCache _cache;

    private static readonly TimeSpan ResetCodeExpiry = TimeSpan.FromMinutes(10);

    public AuthService(AppDbContext db, IConfiguration config, INotificationService notificationService, IMemoryCache cache)
    {
        _db = db;
        _config = config;
        _notificationService = notificationService;
        _cache = cache;
    }

    public async Task<LoginResponse> LoginAsync(string email, string password, string? userAgent, string? ip)
    {
        var normalizedEmail = email.Trim().ToLower();
        var customer = await _db.Customers.FirstOrDefaultAsync(x => x.Email == normalizedEmail);

        if (customer == null || !BCrypt.Net.BCrypt.Verify(password, customer.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        var token = GenerateToken(customer.CustomerId, customer.Email!, "customer");

        var details = $"Thiết bị: {userAgent ?? "Không xác định"}\nIP: {ip ?? "Không xác định"}";
        await _notificationService.SendNotificationAsync(
            customer.CustomerId, null,
            "Đăng nhập thành công",
            $"Chào mừng bạn quay trở lại! Bạn vừa đăng nhập vào hệ thống.\n{details}",
            "he_thong");

        return new LoginResponse
        {
            Message = "Đăng nhập thành công!",
            Token = token,
            Data = MapCustomer(customer)
        };
    }

    public async Task<LoginResponse> RegisterAsync(string firstName, string? middleName, string lastName,
        string email, string password, string? phone, string? address, string? userAgent, string? ip)
    {
        var normalizedEmail = email.Trim().ToLower();
        if (await _db.Customers.AnyAsync(x => x.Email == normalizedEmail))
            throw new InvalidOperationException("Email đã được sử dụng.");

        var customer = new Customer
        {
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Phone = phone,
            Address = address,
            JoinedAt = DateTime.UtcNow
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        var token = GenerateToken(customer.CustomerId, customer.Email!, "customer");

        var details = $"Thiết bị: {userAgent ?? "Không xác định"}\nIP: {ip ?? "Không xác định"}";
        await _notificationService.SendNotificationAsync(
            customer.CustomerId, null,
            "Đăng ký tài khoản thành công",
            $"Chào mừng bạn đến với BookZone! Tài khoản của bạn đã được khởi tạo thành công.\n{details}",
            "he_thong");

        return new LoginResponse
        {
            Message = "Đăng ký thành công!",
            Token = token,
            Data = MapCustomer(customer)
        };
    }

    public Task LogoutAsync(int customerId)
    {
        return Task.CompletedTask;
    }

    public async Task<string> ForgotPasswordAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        var customer = await _db.Customers.FirstOrDefaultAsync(x => x.Email == normalizedEmail);
        if (customer == null) return "ok";

        var code = new Random().Next(100000, 999999).ToString();
        var cacheKey = $"pwd_reset:{normalizedEmail}";

        _cache.Set(cacheKey, code, ResetCodeExpiry);

        // In production: send email with code here
        // For dev: return code directly
        return code;
    }

    public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
    {
        var normalizedEmail = email.Trim().ToLower();
        var customer = await _db.Customers.FirstOrDefaultAsync(x => x.Email == normalizedEmail);
        if (customer == null) return false;

        var cacheKey = $"pwd_reset:{normalizedEmail}";
        if (!_cache.TryGetValue(cacheKey, out string? storedCode) || storedCode != code)
            return false;

        customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _db.SaveChangesAsync();

        _cache.Remove(cacheKey);

        return true;
    }

    private string GenerateToken(int id, string email, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "SuperSecretKeyForECommerceBookPlatform2024!@#$%"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "ECommerceBookPlatform",
            audience: _config["Jwt:Audience"] ?? "ECommerceBookPlatform",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static CustomerResponse MapCustomer(Customer c) => new()
    {
        Id = c.CustomerId,
        FirstName = c.FirstName,
        MiddleName = c.MiddleName,
        LastName = c.LastName,
        FullName = c.FullName,
        DisplayName = c.DisplayName,
        Email = c.Email,
        Phone = c.Phone,
        Address = c.Address,
        BirthDate = c.BirthDate,
        Gender = c.Gender,
        JoinedAt = c.JoinedAt
    };
}