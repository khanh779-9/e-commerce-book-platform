namespace ECommerceBookPlatform.Services.Interfaces;

public interface IPaymentService
{
    Task<string> CreatePaymentUrlAsync(int orderId, decimal amount, string orderInfo, string returnUrl, string ipAddress);
    Task<PaymentCallbackResult> ProcessReturnAsync(IQueryCollection query);
    Task<PaymentCallbackResult> ProcessIpnAsync(IQueryCollection query);
    Task<bool> RefundAsync(int orderId, decimal amount, string reason);
}

public class PaymentCallbackResult
{
    public bool Success { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string ResponseCode { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}