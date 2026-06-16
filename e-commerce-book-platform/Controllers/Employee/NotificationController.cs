using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationController(AppDbContext db) => _db = db;

    private int GetEmployeeId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20,
        [FromQuery] string? type = null, [FromQuery] string? status = null)
    {
        var query = _db.Notifications.Where(n => n.EmployeeId == GetEmployeeId()).AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(n => n.Type == type);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(n => n.Status == status);

        query = query.OrderByDescending(n => n.NotificationId);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<NotificationResponse>
        {
            Items = items.Select(n => new NotificationResponse
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Content = n.Content,
                Type = n.Type,
                Status = n.Status,
                CreatedAt = n.CreatedAt,
            }).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.EmployeeId == GetEmployeeId());
        if (notification == null) return NotFound();

        return Ok(new ApiResponse<NotificationResponse>
        {
            Data = new NotificationResponse
            {
                NotificationId = notification.NotificationId,
                Title = notification.Title,
                Content = notification.Content,
                Type = notification.Type,
                Status = notification.Status,
                CreatedAt = notification.CreatedAt,
            }
        });
    }

    [HttpPost("mark-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var unread = await _db.Notifications
            .Where(n => n.EmployeeId == GetEmployeeId() && n.Status == "chua_doc")
            .ToListAsync();

        foreach (var n in unread) n.Status = "da_doc";
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Đã đánh dấu tất cả là đã đọc!" });
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.EmployeeId == GetEmployeeId());
        if (notification == null) return NotFound();

        notification.Status = notification.Status == "chua_doc" ? "da_doc" : "chua_doc";
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Cập nhật trạng thái thông báo thành công!" });
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == id && n.EmployeeId == GetEmployeeId());
        if (notification == null) return NotFound();

        notification.Status = "luu_tru";
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Đã lưu trữ thông báo!" });
    }
}