using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee")]
public class AuthController : ControllerBase
{
    private readonly IEmployeeAuthService _employeeAuthService;

    public AuthController(IEmployeeAuthService employeeAuthService)
    {
        _employeeAuthService = employeeAuthService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] EmployeeLoginRequest request)
    {
        try
        {
            var result = await _employeeAuthService.LoginAsync(
                request.EmployeeId, request.Password,
                Request.Headers.UserAgent.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var empId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        await _employeeAuthService.LogoutAsync(empId);
        return Ok(new ApiResponse<object> { Message = "Đăng xuất thành công!" });
    }
}