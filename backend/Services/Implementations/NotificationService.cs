using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResponse<NotificationResponse>> GetCustomerNotificationsAsync(
        int customerId, string? type, string? status, int page = 1, int pageSize = 12)
    {
        var query = _db.Notifications
            .Where(n => n.CustomerId == customerId)
            .AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(n => n.Type == type);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(n => n.Status == status);

        query = query.OrderByDescending(n => n.NotificationId);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResponse<NotificationResponse>
        {
            Items = items.Select(MapNotification).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResponse<NotificationResponse>> GetEmployeeNotificationsAsync(
        int employeeId, string? type, string? status, int page = 1, int pageSize = 12)
    {
        var query = _db.Notifications
            .Where(n => n.EmployeeId == employeeId || (n.Type == "noi_bo" && n.EmployeeId == null))
            .AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(n => n.Type == type);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(n => n.Status == status);

        query = query.OrderByDescending(n => n.NotificationId);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResponse<NotificationResponse>
        {
            Items = items.Select(MapNotification).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task MarkAllAsReadAsync(int customerId)
    {
        var unread = await _db.Notifications
            .Where(n => n.CustomerId == customerId && n.Status == "chua_doc")
            .ToListAsync();

        foreach (var n in unread)
            n.Status = "da_doc";

        await _db.SaveChangesAsync();
    }

    public async Task<NotificationResponse> ToggleReadAsync(int customerId, int notificationId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Không tìm thấy thông báo.");

        notification.Status = notification.Status == "chua_doc" ? "da_doc" : "chua_doc";
        await _db.SaveChangesAsync();

        return MapNotification(notification);
    }

    public async Task ArchiveAsync(int customerId, int notificationId)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Không tìm thấy thông báo.");

        notification.Status = "luu_tru";
        await _db.SaveChangesAsync();
    }

    public async Task SendNotificationAsync(int? customerId, int? employeeId, string title, string content, string type = "he_thong")
    {
        _db.Notifications.Add(new Notification
        {
            CustomerId = customerId,
            EmployeeId = employeeId,
            Title = title,
            Content = content,
            Type = type,
            Status = "chua_doc",
            CreatedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();
    }

    private static NotificationResponse MapNotification(Notification n) => new()
    {
        NotificationId = n.NotificationId,
        Title = n.Title,
        Content = n.Content,
        Type = n.Type,
        Status = n.Status,
        CreatedAt = n.CreatedAt
    };
}