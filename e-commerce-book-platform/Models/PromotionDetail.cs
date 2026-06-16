namespace ECommerceBookPlatform.Models;

public class PromotionDetail
{
    public int DetailId { get; set; }
    public int? PromotionId { get; set; }
    public int? ProductId { get; set; }
    public int? Quantity { get; set; }
    public decimal? DiscountPercent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Promotion? Promotion { get; set; }
    public Product? Product { get; set; }
}