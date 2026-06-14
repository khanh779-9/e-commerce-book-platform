namespace ECommerceBookPlatform.Models;

public class Cart
{
    public int CartId { get; set; }
    public int? CustomerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int ItemCount { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Customer? Customer { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}