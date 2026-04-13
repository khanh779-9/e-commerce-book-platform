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
[Route("api/v1/employee/categories")]
[Authorize(Policy = "EmployeeAccess")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IDistributedCache _cache;

    public CategoryController(AppDbContext db, IDistributedCache cache)
    {
        _db = db;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20,
        [FromQuery] string? q = null)
    {
        var query = _db.Categories.AsQueryable();
        if (!string.IsNullOrEmpty(q))
            query = query.Where(c => c.Name.Contains(q));
        query = query.OrderBy(c => c.Name);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<CategoryResponse>
        {
            Items = items.Select(c => new CategoryResponse { CategoryId = c.CategoryId, Name = c.Name, Description = c.Description }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        var category = new Category { Name = request.Name, Description = request.Description };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("categories");

        return Ok(new ApiResponse<CategoryResponse>
        {
            Message = "Thêm danh mục thành công!",
            Data = new CategoryResponse { CategoryId = category.CategoryId, Name = category.Name, Description = category.Description }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCategoryRequest request)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null) return NotFound();

        category.Name = request.Name;
        category.Description = request.Description;
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("categories");

        return Ok(new ApiResponse<CategoryResponse>
        {
            Message = "Cập nhật danh mục thành công!",
            Data = new CategoryResponse { CategoryId = category.CategoryId, Name = category.Name, Description = category.Description }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category == null) return NotFound();

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("categories");

        return Ok(new ApiResponse<object> { Message = "Xóa danh mục thành công!" });
    }

    private async Task InvalidateRefCacheAsync(string key)
    {
        await _cache.RemoveAsync($"ref:{key}");
    }
}