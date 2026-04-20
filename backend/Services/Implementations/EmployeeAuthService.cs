using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ECommerceBookPlatform.Services.Implementations;

public class EmployeeAuthService : IEmployeeAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly INotificationService _notificationService;
    private readonly IRefreshTokenService _refreshTokenService;

    private static readonly TimeSpan AccessTokenExpiry = TimeSpan.FromHours(8);
    private static readonly TimeSpan RefreshTokenExpiry = TimeSpan.FromDays(30);

    public EmployeeAuthService(AppDbContext db, IConfiguration config, INotificationService notificationService, IRefreshTokenService refreshTokenService)
    {
        _db = db;
        _config = config;
        _notificationService = notificationService;
        _refreshTokenService = refreshTokenService;
    }

    public async Task<EmployeeLoginResponse> LoginAsync(int employeeId, string password, string? userAgent, string? ip)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
        if (employee == null || !BCrypt.Net.BCrypt.Verify(password, employee.PasswordHash))
            throw new UnauthorizedAccessException("Mã nhân viên hoặc mật khẩu không đúng.");

        if (employee.Status != "dang_lam")
            throw new UnauthorizedAccessException("Tài khoản của bạn không hoạt động.");

        var accessToken = GenerateAccessToken(employee.EmployeeId, employee.Email!, $"employee_{employee.Role}");
        var refreshToken = await _refreshTokenService.GenerateRefreshTokenAsync(employee.EmployeeId, "employee", RefreshTokenExpiry, ip, userAgent);

        var details = $"Thiết bị: {userAgent ?? "Không xác định"}\nIP: {ip ?? "Không xác định"}";
        await _notificationService.SendNotificationAsync(
            null, employee.EmployeeId,
            "Đăng nhập thành công",
            $"Bạn đã đăng nhập vào hệ thống.\n{details}",
            "noi_bo");

        return new EmployeeLoginResponse
        {
            Message = "Đăng nhập thành công!",
            Token = accessToken,
            RefreshToken = refreshToken,
            Data = new EmployeeResponse
            {
                Id = employee.EmployeeId,
                FirstName = employee.FirstName,
                MiddleName = employee.MiddleName,
                LastName = employee.LastName,
                FullName = employee.FullName,
                Email = employee.Email,
                Phone = employee.Phone,
                Role = employee.Role,
                Status = employee.Status
            }
        };
    }

    public async Task<EmployeeLoginResponse> RefreshTokenAsync(string refreshToken, string? userAgent, string? ip)
    {
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.ExpiresAt > DateTime.UtcNow);

        if (storedToken == null || storedToken.TokenableType != "App\\Models\\Employee")
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

        var employeeId = (int)storedToken.TokenableId;
        var employee = await _db.Employees.FindAsync(employeeId);
        if (employee == null || employee.Status != "dang_lam")
            throw new UnauthorizedAccessException("Nhân viên không tồn tại hoặc tài khoản đã bị khóa.");

        // Rotate refresh token
        var newRefreshTokenBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(newRefreshTokenBytes);
        var newRefreshToken = Convert.ToBase64String(newRefreshTokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");

        var rotated = await _refreshTokenService.RotateRefreshTokenAsync(refreshToken, newRefreshToken, employeeId, "employee");
        if (!rotated)
            throw new UnauthorizedAccessException("Không thể làm mới token.");

        var newAccessToken = GenerateAccessToken(employee.EmployeeId, employee.Email!, $"employee_{employee.Role}");

        return new EmployeeLoginResponse
        {
            Message = "Token đã được làm mới!",
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            Data = new EmployeeResponse
            {
                Id = employee.EmployeeId,
                FirstName = employee.FirstName,
                MiddleName = employee.MiddleName,
                LastName = employee.LastName,
                FullName = employee.FullName,
                Email = employee.Email,
                Phone = employee.Phone,
                Role = employee.Role,
                Status = employee.Status
            }
        };
    }

    public async Task LogoutAsync(int employeeId)
    {
        await _refreshTokenService.RevokeAllUserTokensAsync(employeeId, "employee");
    }

    private string GenerateAccessToken(int id, string? email, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes((string?)_config["Jwt:Secret"] ?? throw new InvalidOperationException("Không đọc được Jwt:Secret.")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString()),
            new Claim(ClaimTypes.Email, email ?? ""),
            new Claim(ClaimTypes.Role, role),
            new Claim("EmployeeRole", role.Replace("employee_", "")),
            new Claim("EmployeeStatus", "dang_lam"),
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
}