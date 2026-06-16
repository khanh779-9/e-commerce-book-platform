namespace ECommerceBookPlatform.Models;

public class Author
{
    public int AuthorId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Computed
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Trim();

    // Navigation
    public ICollection<Book> Books { get; set; } = new List<Book>();
}