using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/authors")]
[Authorize(Policy = "EmployeeAccess")]
public class AuthorController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IDistributedCache _cache;

    public AuthorController(AppDbContext db, IDistributedCache cache)
    {
        _db = db;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.Authors.OrderBy(a => a.LastName);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<AuthorResponse>
        {
            Items = items.Select(MapAuthor).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAuthorRequest request)
    {
        var author = new Author
        {
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email,
        };
        _db.Authors.Add(author);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("authors");

        return Ok(new ApiResponse<AuthorResponse> { Message = "Thêm tác giả thành công!", Data = MapAuthor(author) });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateAuthorRequest request)
    {
        var author = await _db.Authors.FindAsync(id);
        if (author == null) return NotFound();

        author.FirstName = request.FirstName;
        author.MiddleName = request.MiddleName;
        author.LastName = request.LastName;
        author.Address = request.Address;
        author.Phone = request.Phone;
        author.Email = request.Email;
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("authors");

        return Ok(new ApiResponse<AuthorResponse> { Message = "Cập nhật tác giả thành công!", Data = MapAuthor(author) });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var author = await _db.Authors.FindAsync(id);
        if (author == null) return NotFound();

        _db.Authors.Remove(author);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("authors");

        return Ok(new ApiResponse<object> { Message = "Xóa tác giả thành công!" });
    }

    private async Task InvalidateRefCacheAsync(string key)
    {
        await _cache.RemoveAsync($"ref:{key}");
    }

    private static AuthorResponse MapAuthor(Author a) => new()
    {
        AuthorId = a.AuthorId,
        FirstName = a.FirstName,
        MiddleName = a.MiddleName,
        LastName = a.LastName,
        FullName = a.FullName,
        Address = a.Address,
        Phone = a.Phone,
        Email = a.Email
    };
}