namespace ECommerceBookPlatform.Models;

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int? OrderId { get; set; }
    public int? ProductId { get; set; }
    public int? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? SubTotal { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}