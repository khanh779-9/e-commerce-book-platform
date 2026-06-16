namespace ECommerceBookPlatform.Models;

public class Review
{
    public int ReviewId { get; set; }
    public int CustomerId { get; set; }
    public int ProductId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Customer? Customer { get; set; }
    public Product? Product { get; set; }
}