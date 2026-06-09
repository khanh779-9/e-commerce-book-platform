using ECommerceBookPlatform.Models;

namespace ECommerceBookPlatform.Services.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(string entityName, string entityId, string action, object? oldValues = null, object? newValues = null, int? employeeId = null, int? customerId = null, string? ipAddress = null, string? userAgent = null);
    Task<List<AuditLog>> GetEntityHistoryAsync(string entityName, string entityId, int page = 1, int pageSize = 20);
    Task<List<AuditLog>> GetUserActivityAsync(int? employeeId = null, int? customerId = null, int page = 1, int pageSize = 50);
}