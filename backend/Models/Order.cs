namespace ECommerceBookPlatform.Models;

public class Order
{
    public int OrderId { get; set; }
    public int? CustomerId { get; set; }
    public int? EmployeeId { get; set; }
    public int? AddressId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal? TotalAmount { get; set; }
    public string Status { get; set; } = "cho_xac_nhan";
    public string PaymentMethod { get; set; } = "tien_mat";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Sprint 1: New fields for production readiness
    public decimal ShippingFee { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public string? VoucherCode { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelReason { get; set; }

    // Status constants
    public const string StatusPendingConfirmation = "cho_xac_nhan";
    public const string StatusConfirmed = "da_xac_nhan";
    public const string StatusShipping = "dang_giao_hang";
    public const string StatusDelivered = "da_giao_hang";
    public const string StatusCancelled = "da_huy";

    // Navigations
    public Customer? Customer { get; set; }
    public Employee? Employee { get; set; }
    public DeliveryAddress? DeliveryAddress { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}