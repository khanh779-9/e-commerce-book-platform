using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerModel = ECommerceBookPlatform.Models.Customer;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly AppDbContext _db;

    public AuthController(IAuthService authService, AppDbContext db)
    {
        _authService = authService;
        _db = db;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(
                request.Email, request.Password,
                Request.Headers.UserAgent.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(
                request.FirstName, request.MiddleName, request.LastName,
                request.Email, request.Password, request.Phone, request.Address,
                Request.Headers.UserAgent.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var code = await _authService.ForgotPasswordAsync(request.Email);
        return Ok(new ApiResponse<object>
        {
            Message = "Nếu email tồn tại, mã xác minh đã được gửi.",
            Data = new { code }
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var ok = await _authService.ResetPasswordAsync(request.Email, request.Code, request.Password);
        if (!ok)
            return UnprocessableEntity(new ApiResponse<object> { Message = "Mã xác minh không hợp lệ hoặc đã hết hạn." });

        return Ok(new ApiResponse<object> { Message = "Đổi mật khẩu thành công." });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var customerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await _authService.LogoutAsync(customerId);
        return Ok(new ApiResponse<object> { Message = "Đăng xuất thành công!" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var customerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy khách hàng" });

        return Ok(new ApiResponse<CustomerResponse>
        {
            Message = "OK",
            Data = MapCustomer(customer)
        });
    }

    private static CustomerResponse MapCustomer(CustomerModel c) => new()
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