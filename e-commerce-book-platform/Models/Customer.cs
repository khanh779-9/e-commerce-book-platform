namespace ECommerceBookPlatform.Models;

public class Customer
{
    public int CustomerId { get; set; }
    public string? PasswordHash { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Gender { get; set; } // Nam, Nu, Khac
    public string? Notes { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Computed
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Trim();
    public string DisplayName => LastName ?? Email ?? "User";

    // Navigations
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<DeliveryAddress> DeliveryAddresses { get; set; } = new List<DeliveryAddress>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public Cart? Cart { get; set; }
}