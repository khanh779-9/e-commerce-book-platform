using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/publishers")]
[Authorize]
public class PublisherController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublisherController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.Publishers.OrderBy(p => p.Name);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<PublisherResponse>
        {
            Items = items.Select(p => new PublisherResponse { PublisherId = p.PublisherId, Name = p.Name, Address = p.Address, Phone = p.Phone, Email = p.Email }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePublisherRequest request)
    {
        var publisher = new Publisher { Name = request.Name, Address = request.Address, Phone = request.Phone, Email = request.Email };
        _db.Publishers.Add(publisher);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<PublisherResponse> { Message = "Thêm nhà xuất bản thành công!", Data = new PublisherResponse { PublisherId = publisher.PublisherId, Name = publisher.Name } });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePublisherRequest request)
    {
        var publisher = await _db.Publishers.FindAsync(id);
        if (publisher == null) return NotFound();

        publisher.Name = request.Name;
        publisher.Address = request.Address;
        publisher.Phone = request.Phone;
        publisher.Email = request.Email;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<PublisherResponse> { Message = "Cập nhật nhà xuất bản thành công!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var publisher = await _db.Publishers.FindAsync(id);
        if (publisher == null) return NotFound();

        _db.Publishers.Remove(publisher);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa nhà xuất bản thành công!" });
    }
}