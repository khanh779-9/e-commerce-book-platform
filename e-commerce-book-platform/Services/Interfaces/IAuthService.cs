using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;

namespace ECommerceBookPlatform.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(string email, string password, string? userAgent, string? ip);
    Task<LoginResponse> RegisterAsync(string firstName, string? middleName, string lastName, string email, string password, string? phone, string? address, string? userAgent, string? ip);
    Task LogoutAsync(int customerId);
    Task<string> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
}

public interface IEmployeeAuthService
{
    Task<EmployeeLoginResponse> LoginAsync(int employeeId, string password, string? userAgent, string? ip);
    Task LogoutAsync(int employeeId);
}

public interface IProductService
{
    Task<PaginatedResponse<ProductResponse>> GetProductsAsync(ProductSearchRequest request, int? customerId = null);
    Task<ProductResponse?> GetProductDetailAsync(int id, int? customerId = null);
    Task<ProductResponse> CreateProductAsync(CreateProductRequest request);
    Task<ProductResponse> UpdateProductAsync(int id, UpdateProductRequest request);
    Task DeleteProductAsync(int id);
}

public interface ICartService
{
    Task<CartResponse> GetCartAsync(int customerId);
    Task<CartResponse> AddItemAsync(int customerId, int productId, int quantity);
    Task UpdateItemAsync(int customerId, int productId, int quantity);
    Task RemoveItemAsync(int customerId, int productId);
    Task<CartResponse> MergeCartAsync(int customerId, List<CartItemInput> items);
}

public interface IOrderService
{
    Task<OrderDetailResponse> CreateOrderAsync(int customerId, CheckoutRequest request, List<CartItemResponse> cartItems);
    Task<PaginatedResponse<OrderListResponse>> GetCustomerOrdersAsync(int customerId, int page = 1, int pageSize = 10);
    Task<OrderDetailResponse?> GetOrderDetailAsync(int orderId, int customerId);
    Task<OrderDetailResponse> UpdateOrderStatusAsync(int orderId, string status, int? employeeId = null);
    Task<PaginatedResponse<OrderListResponse>> GetAllOrdersAsync(int page = 1, int pageSize = 10);
}

public interface IWishlistService
{
    Task<PaginatedResponse<ProductResponse>> GetWishlistAsync(int customerId, int page = 1, int pageSize = 12);
    Task<WishlistToggleResponse> ToggleAsync(int customerId, int productId);
    List<int> GetWishlistStatus(int customerId, IEnumerable<int> productIds);
}

public interface IPromotionService
{
    Task<PromotionResponse> CreatePromotionAsync(CreatePromotionRequest request);
    Task<PromotionResponse> UpdatePromotionAsync(int id, CreatePromotionRequest request);
    Task DeletePromotionAsync(int id);
    Task<PromotionDetailResponse> AddDetailAsync(int promotionId, AddPromotionDetailRequest request);
    Task RemoveDetailAsync(int detailId);
    Task<PaginatedResponse<PromotionResponse>> GetAllPromotionsAsync(int page = 1, int pageSize = 15);
    Task<PromotionResponse?> GetPromotionDetailAsync(int id);
}

public interface INotificationService
{
    Task<PaginatedResponse<NotificationResponse>> GetCustomerNotificationsAsync(int customerId, string? type, string? status, int page = 1, int pageSize = 12);
    Task<PaginatedResponse<NotificationResponse>> GetEmployeeNotificationsAsync(int employeeId, string? type, string? status, int page = 1, int pageSize = 12);
    Task MarkAllAsReadAsync(int customerId);
    Task<NotificationResponse> ToggleReadAsync(int customerId, int notificationId);
    Task ArchiveAsync(int customerId, int notificationId);
    Task SendNotificationAsync(int? customerId, int? employeeId, string title, string content, string type = "he_thong");
}

public interface IPasswordResetService
{
    Task<string> SendCodeAsync(string email);
    bool VerifyCode(string email, string code);
    Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
}