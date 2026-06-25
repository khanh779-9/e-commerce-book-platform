namespace ECommerceBookPlatform.Models;

public class DeliveryAddress
{
    public int AddressId { get; set; }
    public int CustomerId { get; set; }
    public string Address { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Sprint 1: New field
    public bool IsDefault { get; set; } = false;

    // Sprint 2: Shipping fields
    public int? ProvinceId { get; set; }
    public int? DistrictId { get; set; }

    // Navigations
    public Customer? Customer { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}