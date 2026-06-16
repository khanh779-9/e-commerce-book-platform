using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ECommerceBookPlatform.Services.Implementations;

public class EmployeeAuthService : IEmployeeAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly INotificationService _notificationService;

    public EmployeeAuthService(AppDbContext db, IConfiguration config, INotificationService notificationService)
    {
        _db = db;
        _config = config;
        _notificationService = notificationService;
    }

    public async Task<EmployeeLoginResponse> LoginAsync(int employeeId, string password, string? userAgent, string? ip)
    {
        var employee = await _db.Employees.FirstOrDefaultAsync(x => x.EmployeeId == employeeId);
        if (employee == null || !BCrypt.Net.BCrypt.Verify(password, employee.PasswordHash))
            throw new UnauthorizedAccessException("Mã nhân viên hoặc mật khẩu không đúng.");

        if (employee.Status != "dang_lam")
            throw new UnauthorizedAccessException("Tài khoản của bạn không hoạt động.");

        var token = GenerateToken(employee.EmployeeId, employee.Email!, $"employee_{employee.Role}");

        var details = $"Thiết bị: {userAgent ?? "Không xác định"}\nIP: {ip ?? "Không xác định"}";
        await _notificationService.SendNotificationAsync(
            null, employee.EmployeeId,
            "Đăng nhập thành công",
            $"Bạn đã đăng nhập vào hệ thống.\n{details}",
            "noi_bo");

        return new EmployeeLoginResponse
        {
            Message = "Đăng nhập thành công!",
            Token = token,
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

    public Task LogoutAsync(int employeeId) => Task.CompletedTask;

    private string GenerateToken(int id, string? email, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "SuperSecretKeyForECommerceBookPlatform2024!@#$%"));
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
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}