namespace ECommerceBookPlatform.Models;

public class AuditLog
{
    public long AuditLogId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Created, Updated, Deleted, Login, Logout, etc.
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public int? EmployeeId { get; set; }
    public int? CustomerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Employee? Employee { get; set; }
    public Customer? Customer { get; set; }
}