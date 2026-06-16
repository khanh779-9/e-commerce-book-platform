namespace ECommerceBookPlatform.Models;

public class Book
{
    public int BookId { get; set; }
    public int? ProductId { get; set; }
    public string? Title { get; set; }
    public int? PublisherId { get; set; }
    public int? PublishedYear { get; set; }
    public int? AuthorId { get; set; }
    public string? BookTypeCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public Product? Product { get; set; }
    public Publisher? Publisher { get; set; }
    public Author? Author { get; set; }
    public BookType? BookType { get; set; }
}