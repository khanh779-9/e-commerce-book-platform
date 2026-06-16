namespace ECommerceBookPlatform.DTOs.Responses;

public class LoginResponse
{
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public CustomerResponse? Data { get; set; }
}

public class EmployeeLoginResponse
{
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public EmployeeResponse? Data { get; set; }
}

public class CustomerResponse
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; }
    public DateTime JoinedAt { get; set; }
    public string Type => "customer";
}

public class EmployeeResponse
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Type => "employee";
}

public class DashboardResponse
{
    public DashboardStats Stats { get; set; } = new();
    public List<OrderListResponse> RecentOrders { get; set; } = new();
}

public class DashboardStats
{
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
    public int Products { get; set; }
    public int Customers { get; set; }
}

public class OrderListResponse
{
    public int OrderId { get; set; }
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
}

public class OrderDetailResponse
{
    public int OrderId { get; set; }
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int? AddressId { get; set; }
    public string? Address { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<OrderItemResponse> Items { get; set; } = new();
}

public class OrderItemResponse
{
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    public string? ImageUrl { get; set; }
}

public class CartResponse
{
    public List<CartItemResponse> Items { get; set; } = new();
    public decimal Total { get; set; }
}

public class CartItemResponse
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal { get; set; }
    public string? Image { get; set; }
}

public class ReviewResponse
{
    public int ReviewId { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public int ProductId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationResponse
{
    public int NotificationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AddressResponse
{
    public int AddressId { get; set; }
    public string Address { get; set; } = string.Empty;
}

public class PromotionResponse
{
    public int PromotionId { get; set; }
    public string? Name { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<PromotionDetailResponse> Details { get; set; } = new();
}

public class PromotionDetailResponse
{
    public int DetailId { get; set; }
    public int? ProductId { get; set; }
    public string? ProductName { get; set; }
    public int? Quantity { get; set; }
    public decimal? DiscountPercent { get; set; }
}

public class ReportResponse
{
    public ReportSummary Summary { get; set; } = new();
    public List<MonthlyRevenue> MonthlyRevenues { get; set; } = new();
    public List<ProductReportItem> TopProducts { get; set; } = new();
    public Dictionary<string, int> OrderByStatus { get; set; } = new();
}

public class MonthlyRevenue
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class ReportSummary
{
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalCustomers { get; set; }
    public int PendingOrders { get; set; }
    public decimal MonthlyRevenue { get; set; }
}

public class ProductReportItem
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class WishlistToggleResponse
{
    public string Message { get; set; } = string.Empty;
    public bool Added { get; set; }
}