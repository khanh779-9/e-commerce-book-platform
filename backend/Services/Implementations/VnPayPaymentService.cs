using System.Security.Cryptography;
using System.Text;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ECommerceBookPlatform.Services.Implementations;

public class VnPaySettings
{
    public string TmnCode { get; set; } = "";
    public string HashSecret { get; set; } = "";
    public string BaseUrl { get; set; } = "";
    public string ReturnUrl { get; set; } = "";
    public string IpnUrl { get; set; } = "";
    public string Version { get; set; } = "2.1.0";
    public string Command { get; set; } = "pay";
    public string Locale { get; set; } = "vn";
    public string CurrCode { get; set; } = "VND";
}

public class VnPayPaymentService : IPaymentService
{
    private readonly VnPaySettings _settings;
    private readonly AppDbContext _db;
    private readonly ILogger<VnPayPaymentService> _logger;

    public VnPayPaymentService(IOptions<VnPaySettings> settings, AppDbContext db, ILogger<VnPayPaymentService> logger)
    {
        _settings = settings.Value;
        _db = db;
        _logger = logger;
    }

    public async Task<string> CreatePaymentUrlAsync(int orderId, decimal amount, string orderInfo, string returnUrl, string ipAddress)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Đơn hàng không tồn tại.");

        var vnpParams = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = _settings.Version,
            ["vnp_Command"] = _settings.Command,
            ["vnp_TmnCode"] = _settings.TmnCode,
            ["vnp_Amount"] = ((long)(amount * 100)).ToString(), // VNPay uses smallest currency unit (cents)
            ["vnp_CurrCode"] = _settings.CurrCode,
            ["vnp_TxnRef"] = orderId.ToString(),
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = _settings.Locale,
            ["vnp_ReturnUrl"] = returnUrl ?? _settings.ReturnUrl,
            ["vnp_IpAddr"] = ipAddress,
            ["vnp_CreateDate"] = DateTime.Now.ToString("yyyyMMddHHmmss")
        };

        var signData = string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        var secureHash = HmacSHA512(_settings.HashSecret, signData);
        vnpParams["vnp_SecureHash"] = secureHash;

        var paymentUrl = _settings.BaseUrl + "?" + string.Join("&", vnpParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
        
        _logger.LogInformation("Created VNPay payment URL for order {OrderId}: {Url}", orderId, paymentUrl);
        
        return paymentUrl;
    }

    public async Task<PaymentCallbackResult> ProcessReturnAsync(IQueryCollection query)
    {
        var result = new PaymentCallbackResult();
        
        try
        {
            var vnpParams = query.ToDictionary(q => q.Key, q => q.Value.ToString());
            
            if (!vnpParams.TryGetValue("vnp_TxnRef", out var txnRef) || !int.TryParse(txnRef, out var orderId))
            {
                result.Message = "Mã đơn hàng không hợp lệ";
                return result;
            }

            result.OrderId = txnRef;
            
            if (!vnpParams.TryGetValue("vnp_Amount", out var amountStr) || !long.TryParse(amountStr, out var amount))
            {
                result.Message = "Số tiền không hợp lệ";
                return result;
            }
            result.Amount = amount / 100m;

            if (!vnpParams.TryGetValue("vnp_TransactionNo", out var transId))
            {
                result.Message = "Thiếu mã giao dịch";
                return result;
            }
            result.TransactionId = transId;

            if (!vnpParams.TryGetValue("vnp_ResponseCode", out var responseCode))
            {
                result.Message = "Thiếu mã phản hồi";
                return result;
            }
            result.ResponseCode = responseCode;

            // Verify signature
            var receivedHash = vnpParams.ContainsKey("vnp_SecureHash") ? vnpParams["vnp_SecureHash"] : "";
            vnpParams.Remove("vnp_SecureHash");
            vnpParams.Remove("vnp_SecureHashType");

            var signData = string.Join("&", vnpParams.OrderBy(kvp => kvp.Key).Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
            var calculatedHash = HmacSHA512(_settings.HashSecret, signData);

            result.IsVerified = receivedHash.Equals(calculatedHash, StringComparison.OrdinalIgnoreCase);

            if (!result.IsVerified)
            {
                result.Message = "Chữ ký không hợp lệ";
                _logger.LogWarning("VNPay return: Invalid signature for order {OrderId}", orderId);
                return result;
            }

            result.Success = responseCode == "00";
            result.Message = result.Success ? "Thanh toán thành công" : GetVnPayResponseMessage(responseCode);

            // Update order if success
            if (result.Success)
            {
                await UpdateOrderPaymentAsync(orderId, transId, result.Amount, "vnpay");
            }

            _logger.LogInformation("VNPay return processed for order {OrderId}: Success={Success}, Code={Code}", orderId, result.Success, responseCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing VNPay return");
            result.Message = "Lỗi xử lý thanh toán";
        }

        return result;
    }

    public async Task<PaymentCallbackResult> ProcessIpnAsync(IQueryCollection query)
    {
        var result = new PaymentCallbackResult();
        
        try
        {
            var vnpParams = query.ToDictionary(q => q.Key, q => q.Value.ToString());
            
            if (!vnpParams.TryGetValue("vnp_TxnRef", out var txnRef) || !int.TryParse(txnRef, out var orderId))
            {
                result.ResponseCode = "99";
                result.Message = "Mã đơn hàng không hợp lệ";
                return result;
            }

            result.OrderId = txnRef;
            
            if (!vnpParams.TryGetValue("vnp_Amount", out var amountStr) || !long.TryParse(amountStr, out var amount))
            {
                result.ResponseCode = "99";
                result.Message = "Số tiền không hợp lệ";
                return result;
            }
            result.Amount = amount / 100m;

            if (!vnpParams.TryGetValue("vnp_TransactionNo", out var transId))
            {
                result.ResponseCode = "99";
                result.Message = "Thiếu mã giao dịch";
                return result;
            }
            result.TransactionId = transId;

            if (!vnpParams.TryGetValue("vnp_ResponseCode", out var responseCode))
            {
                result.ResponseCode = "99";
                result.Message = "Thiếu mã phản hồi";
                return result;
            }
            result.ResponseCode = responseCode;

            // Verify signature
            var receivedHash = vnpParams.ContainsKey("vnp_SecureHash") ? vnpParams["vnp_SecureHash"] : "";
            vnpParams.Remove("vnp_SecureHash");
            vnpParams.Remove("vnp_SecureHashType");

            var signData = string.Join("&", vnpParams.OrderBy(kvp => kvp.Key).Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
            var calculatedHash = HmacSHA512(_settings.HashSecret, signData);

            result.IsVerified = receivedHash.Equals(calculatedHash, StringComparison.OrdinalIgnoreCase);

            if (!result.IsVerified)
            {
                result.ResponseCode = "97";
                result.Message = "Chữ ký không hợp lệ";
                _logger.LogWarning("VNPay IPN: Invalid signature for order {OrderId}", orderId);
                return result;
            }

            result.Success = responseCode == "00";
            result.Message = result.Success ? "Thanh toán thành công" : GetVnPayResponseMessage(responseCode);

            // Check order status before updating
            var order = await _db.Orders.FindAsync(orderId);
            if (order == null)
            {
                result.ResponseCode = "01";
                result.Message = "Đơn hàng không tồn tại";
                return result;
            }

            // Only process if order is still pending
            if (order.Status == Order.StatusPendingConfirmation || order.Status == Order.StatusConfirmed)
            {
                if (result.Success)
                {
                    await UpdateOrderPaymentAsync(orderId, transId, result.Amount, "vnpay");
                    _logger.LogInformation("VNPay IPN: Order {OrderId} updated to paid", orderId);
                }
                else
                {
                    _logger.LogInformation("VNPay IPN: Order {OrderId} payment failed with code {Code}", orderId, responseCode);
                }
            }

            result.ResponseCode = "00"; // Acknowledge to VNPay
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing VNPay IPN");
            result.ResponseCode = "99";
            result.Message = "Lỗi xử lý IPN";
        }

        return result;
    }

    public async Task<bool> RefundAsync(int orderId, decimal amount, string reason)
    {
        // VNPay refund requires separate API integration
        // For now, log the refund request
        _logger.LogInformation("Refund requested for order {OrderId}: {Amount} - {Reason}", orderId, amount, reason);
        
        // TODO: Implement VNPay refund API call
        // This would call VNPay's refund endpoint with the transaction details
        
        return true; // Placeholder
    }

    private async Task UpdateOrderPaymentAsync(int orderId, string transactionId, decimal amount, string paymentMethod)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order == null) return;

        order.Status = Order.StatusConfirmed; // da_xac_nhan
        order.PaymentMethod = paymentMethod;
        order.Notes = (order.Notes ?? "") + $"\nVNPay Transaction: {transactionId}";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    private static string HmacSHA512(string key, string inputData)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        
        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(inputBytes);
        
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }

    private static string GetVnPayResponseMessage(string responseCode)
    {
        return responseCode switch
        {
            "00" => "Giao dịch thành công",
            "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
            "09" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
            "10" => "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
            "11" => "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
            "12" => "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
            "13" => "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
            "24" => "Giao dịch không thành công do: Khách hàng hủy giao dịch",
            "51" => "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
            "65" => "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
            "75" => "Ngân hàng thanh toán đang bảo trì.",
            "79" => "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
            "99" => "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
            _ => $"Lỗi không xác định: {responseCode}"
        };
    }
}