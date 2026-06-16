using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceBookPlatform.Models;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int? UnitId { get; set; }
    public int SoldQuantity { get; set; } = 0;
    public decimal Price { get; set; }
    public int? ProviderId { get; set; }
    public string? DataJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Category? Category { get; set; }
    public Unit? Unit { get; set; }
    public Provider? Provider { get; set; }
    public Book? Book { get; set; }
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public ICollection<PromotionDetail> PromotionDetails { get; set; } = new List<PromotionDetail>();

    // Computed
    public string DisplayName => Name ?? $"Sản phẩm #{ProductId}";

    public decimal GetPromoPrice()
    {
        var activePromo = PromotionDetails?
            .FirstOrDefault(pd => pd.Promotion != null
                && pd.Promotion.StartDate <= DateTime.UtcNow
                && pd.Promotion.EndDate >= DateTime.UtcNow);

        if (activePromo != null)
            return Price * (1 - (activePromo.DiscountPercent ?? 0) / 100m);

        return Price;
    }

    public bool HasStock(int quantity) => StockQuantity >= quantity;
}