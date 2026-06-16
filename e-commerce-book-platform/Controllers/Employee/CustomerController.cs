using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/customers")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomerController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.Customers.OrderByDescending(c => c.CustomerId);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<CustomerResponse>
        {
            Items = items.Select(c => new CustomerResponse
            {
                Id = c.CustomerId,
                FirstName = c.FirstName,
                MiddleName = c.MiddleName,
                LastName = c.LastName,
                FullName = c.FullName,
                DisplayName = c.DisplayName,
                Email = c.Email,
                Phone = c.Phone,
                JoinedAt = c.JoinedAt,
            }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }
}