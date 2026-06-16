namespace ECommerceBookPlatform.Models;

public class WishlistItem
{
    public int WishlistItemId { get; set; }
    public int CustomerId { get; set; }
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Customer? Customer { get; set; }
    public Product? Product { get; set; }
}