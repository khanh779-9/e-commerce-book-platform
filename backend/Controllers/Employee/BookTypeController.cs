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
[Route("api/v1/employee/book-types")]
[Authorize(Policy = "EmployeeAccess")]
public class BookTypeController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IDistributedCache _cache;

    public BookTypeController(AppDbContext db, IDistributedCache cache)
    {
        _db = db;
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.BookTypes.OrderBy(b => b.Name);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<BookTypeResponse>
        {
            Items = items.Select(b => new BookTypeResponse { Code = b.Code, Name = b.Name }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookTypeRequest request)
    {
        var bookType = new BookType { Code = request.Code, Name = request.Name };
        _db.BookTypes.Add(bookType);
        await _db.SaveChangesAsync();

        await InvalidateRefCacheAsync("book-types");

        return Ok(new ApiResponse<BookTypeResponse>
        {
            Message = "Thêm loại sách thành công!",
            Data = new BookTypeResponse { Code = bookType.Code, Name = bookType.Name }
        });
    }

    [HttpPut("{code}")]
    public async Task<IActionResult> Update(string code, [FromBody] CreateBookTypeRequest request)
    {
        var bookType = await _db.BookTypes.FindAsync(code);
        if (bookType == null) return NotFound();

        // If code changed, remove old row and re-point existing books to the new code
        if (code != request.Code)
        {
            var books = await _db.Books.Where(b => b.BookTypeCode == code).ToListAsync();
            _db.BookTypes.Remove(bookType);
            _db.BookTypes.Add(new BookType { Code = request.Code, Name = request.Name });
            foreach (var b in books)
                b.BookTypeCode = request.Code;

            await _db.SaveChangesAsync();
            await InvalidateRefCacheAsync("book-types");

            return Ok(new ApiResponse<BookTypeResponse>
            {
                Message = "Cập nhật loại sách thành công! Tất cả sách thuộc loại đã được chuyển sang mã mới.",
                Data = new BookTypeResponse { Code = request.Code, Name = request.Name }
            });
        }

        bookType.Name = request.Name;
        await _db.SaveChangesAsync();
        await InvalidateRefCacheAsync("book-types");

        return Ok(new ApiResponse<BookTypeResponse>
        {
            Message = "Cập nhật loại sách thành công!",
            Data = new BookTypeResponse { Code = request.Code, Name = request.Code }
        });
    }

    [HttpDelete("{code}")]
    public async Task<IActionResult> Delete(string code)
    {
        var bookType = await _db.BookTypes.FindAsync(code);
        if (bookType == null) return NotFound();

        var bookCount = await _db.Books.CountAsync(b => b.BookTypeCode == code);
        if (bookCount > 0)
            return BadRequest(new ApiResponse<object>
            {
                Message = $"Không thể xóa: còn {bookCount} sách thuộc loại \"{bookType.Name}\". Chuyển sách sang loại khác trước khi xóa."
            });

        _db.BookTypes.Remove(bookType);
        await _db.SaveChangesAsync();
        await InvalidateRefCacheAsync("book-types");

        return Ok(new ApiResponse<object> { Message = "Xóa loại sách thành công!" });
    }

    private async Task InvalidateRefCacheAsync(string key)
    {
        await _cache.RemoveAsync($"ref:{key}");
    }
}