using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/units")]
[Authorize]
public class UnitController : ControllerBase
{
    private readonly AppDbContext _db;

    public UnitController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.Units.OrderBy(u => u.Name);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<UnitResponse>
        {
            Items = items.Select(u => new UnitResponse { UnitId = u.UnitId, Name = u.Name }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUnitRequest request)
    {
        var unit = new Unit { Name = request.Name };
        _db.Units.Add(unit);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<UnitResponse>
        {
            Message = "Thêm đơn vị tính thành công!",
            Data = new UnitResponse { UnitId = unit.UnitId, Name = unit.Name }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateUnitRequest request)
    {
        var unit = await _db.Units.FindAsync(id);
        if (unit == null) return NotFound();

        unit.Name = request.Name;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<UnitResponse>
        {
            Message = "Cập nhật đơn vị tính thành công!",
            Data = new UnitResponse { UnitId = unit.UnitId, Name = unit.Name }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var unit = await _db.Units.FindAsync(id);
        if (unit == null) return NotFound();

        _db.Units.Remove(unit);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa đơn vị tính thành công!" });
    }
}