using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/book-types")]
[Authorize]
public class BookTypeController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookTypeController(AppDbContext db) => _db = db;

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

        // If code changed, delete old and insert new
        if (code != request.Code)
        {
            _db.BookTypes.Remove(bookType);
            _db.BookTypes.Add(new BookType { Code = request.Code, Name = request.Name });
        }
        else
        {
            bookType.Name = request.Name;
        }

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<BookTypeResponse>
        {
            Message = "Cập nhật loại sách thành công!",
            Data = new BookTypeResponse { Code = request.Code, Name = request.Name }
        });
    }

    [HttpDelete("{code}")]
    public async Task<IActionResult> Delete(string code)
    {
        var bookType = await _db.BookTypes.FindAsync(code);
        if (bookType == null) return NotFound();

        _db.BookTypes.Remove(bookType);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa loại sách thành công!" });
    }
}