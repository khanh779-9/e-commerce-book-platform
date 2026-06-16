namespace ECommerceBookPlatform.Models;

public class Promotion
{
    public int PromotionId { get; set; }
    public string? Name { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public ICollection<PromotionDetail> Details { get; set; } = new List<PromotionDetail>();
}