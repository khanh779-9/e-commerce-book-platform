using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/notifications")]
[Authorize(Roles = "customer")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] string? type, [FromQuery] string? status, [FromQuery] int page = 1)
    {
        var notifications = await _notificationService.GetCustomerNotificationsAsync(CustomerId, type, status, page);
        return Ok(notifications);
    }

    [HttpPost("mark-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _notificationService.MarkAllAsReadAsync(CustomerId);
        return Ok(new ApiResponse<object> { Message = "Đã đánh dấu tất cả là đã đọc." });
    }

    [HttpPost("{id}/toggle")]
    public async Task<IActionResult> ToggleRead(int id)
    {
        try
        {
            var notification = await _notificationService.ToggleReadAsync(CustomerId, id);
            return Ok(new ApiResponse<NotificationResponse> { Message = "Đã cập nhật trạng thái.", Data = notification });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        try
        {
            await _notificationService.ArchiveAsync(CustomerId, id);
            return Ok(new ApiResponse<object> { Message = "Đã lưu trữ thông báo." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ApiResponse<object> { Message = ex.Message });
        }
    }
}