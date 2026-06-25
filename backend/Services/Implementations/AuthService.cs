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
    private readonly IWebHostEnvironment _env;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IEmailService _emailService;

    private static readonly TimeSpan ResetCodeExpiry = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan AccessTokenExpiry = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshTokenExpiry = TimeSpan.FromDays(30);
    private static readonly TimeSpan EmailVerificationExpiry = TimeSpan.FromHours(24);

    public AuthService(AppDbContext db, IConfiguration config, INotificationService notificationService, IMemoryCache cache, IWebHostEnvironment env, IRefreshTokenService refreshTokenService, IEmailService emailService)
    {
        _db = db;
        _config = config;
        _notificationService = notificationService;
        _cache = cache;
        _env = env;
        _refreshTokenService = refreshTokenService;
        _emailService = emailService;
    }

    public async Task<LoginResponse> LoginAsync(string email, string password, string? userAgent, string? ip)
    {
        var normalizedEmail = email.Trim().ToLower();
        var customer = await _db.Customers.FirstOrDefaultAsync(x => x.Email == normalizedEmail);

        if (customer == null || !BCrypt.Net.BCrypt.Verify(password, customer.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        var accessToken = GenerateAccessToken(customer.CustomerId, customer.Email!, "customer");
        var refreshToken = await _refreshTokenService.GenerateRefreshTokenAsync(customer.CustomerId, "customer", RefreshTokenExpiry, ip, userAgent);

        customer.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var details = $"Thiết bị: {userAgent ?? "Không xác định"}\nIP: {ip ?? "Không xác định"}";
        await _notificationService.SendNotificationAsync(
            customer.CustomerId, null,
            "Đăng nhập thành công",
            $"Chào mừng bạn quay trở lại! Bạn vừa đăng nhập vào hệ thống.\n{details}",
            "he_thong");

        return new LoginResponse
        {
            Message = "Đăng nhập thành công!",
            Token = accessToken,
            RefreshToken = refreshToken,
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
            JoinedAt = DateTime.UtcNow,
            EmailVerifiedAt = null // Sẽ được set khi verify email
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        var accessToken = GenerateAccessToken(customer.CustomerId, customer.Email!, "customer");
        var refreshToken = await _refreshTokenService.GenerateRefreshTokenAsync(customer.CustomerId, "customer", RefreshTokenExpiry, ip, userAgent);

        // Generate email verification token
        var verificationToken = GenerateEmailVerificationToken(customer.CustomerId);
        var verificationLink = $"{_config["Email:BaseUrl"] ?? "https://bookzone.vn"}/verify-email?token={verificationToken}";
        
        // Send verification email (fire and forget)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendEmailVerificationAsync(customer.Email!, customer.FullName, verificationLink);
            }
            catch (Exception ex)
            {
                // Log but don't fail registration
                Console.WriteLine($"Failed to send verification email: {ex.Message}");
            }
        });

        var details = $"Thiết bị: {userAgent ?? "Không xác định"}\nIP: {ip ?? "Không xác định"}";
        await _notificationService.SendNotificationAsync(
            customer.CustomerId, null,
            "Đăng ký tài khoản thành công",
            $"Chào mừng bạn đến với BookZone! Tài khoản của bạn đã được khởi tạo thành công.\n{details}",
            "he_thong");

        return new LoginResponse
        {
            Message = "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
            Token = accessToken,
            RefreshToken = refreshToken,
            Data = MapCustomer(customer)
        };
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var cacheKey = $"email_verify:{token}";
        if (!_cache.TryGetValue(cacheKey, out int customerId))
            return false;

        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null)
            return false;

        customer.EmailVerifiedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        _cache.Remove(cacheKey);

        // Send welcome email
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendWelcomeAsync(customer.Email!, customer.FullName);
            }
            catch { /* ignore */ }
        });

        return true;
    }

    public async Task ResendVerificationEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        var customer = await _db.Customers.FirstOrDefaultAsync(x => x.Email == normalizedEmail);
        if (customer == null || customer.EmailVerifiedAt != null)
            return;

        var verificationToken = GenerateEmailVerificationToken(customer.CustomerId);
        var verificationLink = $"{_config["Email:BaseUrl"] ?? "https://bookzone.vn"}/verify-email?token={verificationToken}";

        await _emailService.SendEmailVerificationAsync(customer.Email!, customer.FullName, verificationLink);
    }

    private string GenerateEmailVerificationToken(int customerId)
    {
        var tokenBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        
        var cacheKey = $"email_verify:{token}";
        _cache.Set(cacheKey, customerId, EmailVerificationExpiry);
        
        return token;
    }

    public async Task LogoutAsync(int customerId)
    {
        await _refreshTokenService.RevokeAllUserTokensAsync(customerId, "customer");
    }

    public async Task<LoginResponse> RefreshTokenAsync(string refreshToken, string? userAgent, string? ip)
    {
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.ExpiresAt > DateTime.UtcNow);

        if (storedToken == null || storedToken.TokenableType != "App\\Models\\Customer")
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

        var customerId = (int)storedToken.TokenableId;
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null)
            throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        // Rotate refresh token
        var newRefreshTokenBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(newRefreshTokenBytes);
        var newRefreshToken = Convert.ToBase64String(newRefreshTokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");

        var rotated = await _refreshTokenService.RotateRefreshTokenAsync(refreshToken, newRefreshToken, customerId, "customer");
        if (!rotated)
            throw new UnauthorizedAccessException("Không thể làm mới token.");

        var newAccessToken = GenerateAccessToken(customer.CustomerId, customer.Email!, "customer");

        return new LoginResponse
        {
            Message = "Token đã được làm mới!",
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            Data = MapCustomer(customer)
        };
    }

    public async Task<string> ForgotPasswordAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        var customer = await _db.Customers.FirstOrDefaultAsync(x => x.Email == normalizedEmail);
        if (customer == null) return "ok";

        // Dùng RNG an toàn, tránh đoán được mã qua Random theo thời gian
        var code = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var cacheKey = $"pwd_reset:{normalizedEmail}";

        _cache.Set(cacheKey, code, ResetCodeExpiry);

        // Chỉ trả mã về client khi chạy môi trường Development (chưa có hệ thống email).
        // Production sẽ gửi email và không trả mã trong response để tránh bị chiếm quyền tài khoản.
        return _env.IsDevelopment() ? code : "ok";
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

        // Revoke all refresh tokens after password change
        await _refreshTokenService.RevokeAllUserTokensAsync(customer.CustomerId, "customer");

        _cache.Remove(cacheKey);

        return true;
    }

    private string GenerateAccessToken(int id, string email, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes((string?)_config["Jwt:Secret"] ?? throw new InvalidOperationException("Không đọc được Jwt:Secret.")));
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
            expires: DateTime.UtcNow.Add(AccessTokenExpiry),
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
        JoinedAt = c.JoinedAt,
        AvatarUrl = c.AvatarUrl,
        LoyaltyPoints = c.LoyaltyPoints
    };
}