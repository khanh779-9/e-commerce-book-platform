using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string entityName, string entityId, string action, object? oldValues = null, object? newValues = null, int? employeeId = null, int? customerId = null, string? ipAddress = null, string? userAgent = null)
    {
        var log = new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            Action = action,
            OldValues = oldValues != null ? System.Text.Json.JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? System.Text.Json.JsonSerializer.Serialize(newValues) : null,
            EmployeeId = employeeId,
            CustomerId = customerId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public async Task<List<AuditLog>> GetEntityHistoryAsync(string entityName, string entityId, int page = 1, int pageSize = 20)
    {
        return await _db.AuditLogs
            .AsNoTracking()
            .Where(l => l.EntityName == entityName && l.EntityId == entityId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<AuditLog>> GetUserActivityAsync(int? employeeId = null, int? customerId = null, int page = 1, int pageSize = 50)
    {
        var query = _db.AuditLogs.AsNoTracking();
        
        if (employeeId.HasValue)
            query = query.Where(l => l.EmployeeId == employeeId);
        else if (customerId.HasValue)
            query = query.Where(l => l.CustomerId == customerId);
        
        return await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
}