namespace ECommerceBookPlatform.Models;

public class Promotion
{
    public int PromotionId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Sprint 1: New fields for production readiness
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; } = 0;
    public decimal? MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigations
    public ICollection<PromotionDetail> Details { get; set; } = new List<PromotionDetail>();
}