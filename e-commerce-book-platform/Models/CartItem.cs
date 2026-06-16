namespace ECommerceBookPlatform.Models;

public class CartItem
{
    public int CartItemId { get; set; }
    public int? CartId { get; set; }
    public int? ProductId { get; set; }
    public int? Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Cart? Cart { get; set; }
    public Product? Product { get; set; }
}