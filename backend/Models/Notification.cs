namespace ECommerceBookPlatform.Models;

public class Notification
{
    public int NotificationId { get; set; }
    public int? CustomerId { get; set; }
    public int? EmployeeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Type { get; set; } = "he_thong"; // khach_hang, don_hang, he_thong, noi_bo
    public string Status { get; set; } = "chua_doc"; // chua_doc, da_doc, luu_tru
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Customer? Customer { get; set; }
    public Employee? Employee { get; set; }
}