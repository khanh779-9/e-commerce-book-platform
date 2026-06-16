using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using EmployeeModel = ECommerceBookPlatform.Models.Employee;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/employees")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly AppDbContext _db;

    public EmployeeController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.Employees.OrderByDescending(e => e.EmployeeId);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<EmployeeResponse>
        {
            Items = items.Select(e => new EmployeeResponse
            {
                Id = e.EmployeeId,
                FirstName = e.FirstName,
                MiddleName = e.MiddleName,
                LastName = e.LastName,
                FullName = e.FullName,
                Email = e.Email,
                Phone = e.Phone,
                Role = e.Role,
                Status = e.Status,
            }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request)
    {
        var employee = new EmployeeModel
        {
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role ?? "nhanvien",
            Status = "dang_lam",
            StartDate = DateTime.UtcNow,
        };
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<EmployeeResponse>
        {
            Message = "Thêm nhân viên thành công!",
            Data = new EmployeeResponse
            {
                Id = employee.EmployeeId,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                FullName = employee.FullName,
                Email = employee.Email,
                Role = employee.Role,
            }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequest request)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        if (request.FirstName != null) employee.FirstName = request.FirstName;
        if (request.MiddleName != null) employee.MiddleName = request.MiddleName;
        if (request.LastName != null) employee.LastName = request.LastName;
        if (request.Email != null) employee.Email = request.Email;
        if (request.Role != null) employee.Role = request.Role;
        if (request.Status != null) employee.Status = request.Status;
        if (!string.IsNullOrEmpty(request.Password))
            employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Cập nhật nhân viên thành công!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa nhân viên thành công!" });
    }
}