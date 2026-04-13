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
[Route("api/v1/employee/providers")]
[Authorize(Policy = "EmployeeAccess")]
public class ProviderController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IDistributedCache _cache;

    public ProviderController(AppDbContext db, IDistributedCache cache)
    {
        _db = db;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20,
        [FromQuery] string? q = null)
    {
        var query = _db.Providers.AsQueryable();
        if (!string.IsNullOrEmpty(q))
            query = query.Where(p => p.Name!.Contains(q));
        query = query.OrderBy(p => p.Name);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<ProviderResponse>
        {
            Items = items.Select(p => new ProviderResponse { ProviderId = p.ProviderId, Name = p.Name, Address = p.Address, Phone = p.Phone, Email = p.Email }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProviderRequest request)
    {
        var provider = new Provider { Name = request.Name, Address = request.Address, Phone = request.Phone, Email = request.Email };
        _db.Providers.Add(provider);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("providers");

        return Ok(new ApiResponse<ProviderResponse> { Message = "Thêm nhà cung cấp thành công!" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateProviderRequest request)
    {
        var provider = await _db.Providers.FindAsync(id);
        if (provider == null) return NotFound();

        provider.Name = request.Name;
        provider.Address = request.Address;
        provider.Phone = request.Phone;
        provider.Email = request.Email;
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("providers");

        return Ok(new ApiResponse<ProviderResponse> { Message = "Cập nhật nhà cung cấp thành công!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var provider = await _db.Providers.FindAsync(id);
        if (provider == null) return NotFound();

        _db.Providers.Remove(provider);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("providers");

        return Ok(new ApiResponse<object> { Message = "Xóa nhà cung cấp thành công!" });
    }

    private async Task InvalidateRefCacheAsync(string key)
    {
        await _cache.RemoveAsync($"ref:{key}");
    }
}