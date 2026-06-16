using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = new DashboardStats
        {
            Revenue = await _db.Orders.Where(o => o.Status != "da_huy").SumAsync(o => (decimal?)o.TotalAmount) ?? 0,
            Orders = await _db.Orders.CountAsync(),
            Products = await _db.Products.CountAsync(),
            Customers = await _db.Customers.CountAsync(),
        };

        var recentOrders = await _db.Orders
            .Include(o => o.Customer)
            .OrderByDescending(o => o.OrderId)
            .Take(5)
            .Select(o => new OrderListResponse
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer!.FullName,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
            })
            .ToListAsync();

        return Ok(new DashboardResponse
        {
            Stats = stats,
            RecentOrders = recentOrders
        });
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var empId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var employee = await _db.Employees.FindAsync(empId);
        if (employee == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy nhân viên" });

        return Ok(new ApiResponse<EmployeeResponse>
        {
            Message = "OK",
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
                Status = employee.Status,
            }
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateEmployeeRequest request)
    {
        var empId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var employee = await _db.Employees.FindAsync(empId);
        if (employee == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy nhân viên" });

        if (request.FirstName != null) employee.FirstName = request.FirstName;
        if (request.MiddleName != null) employee.MiddleName = request.MiddleName;
        if (request.LastName != null) employee.LastName = request.LastName;
        if (request.Email != null) employee.Email = request.Email;

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Cập nhật thông tin cá nhân thành công!" });
    }
}