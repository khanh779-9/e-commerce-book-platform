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

    // Sprint 1: New fields for production readiness
    public bool IsApproved { get; set; } = false;
    public int HelpfulCount { get; set; } = 0;
    public string? ImagesJson { get; set; } // JSON array of image URLs

    // Navigations
    public Customer? Customer { get; set; }
    public Product? Product { get; set; }
}