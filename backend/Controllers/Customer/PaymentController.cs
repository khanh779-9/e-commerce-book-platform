using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/payment")]
[Authorize(Roles = "customer")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IOrderService _orderService;
    private readonly ICartService _cartService;
    private readonly IConfiguration _config;

    public PaymentController(IPaymentService paymentService, IOrderService orderService, ICartService cartService, IConfiguration config)
    {
        _paymentService = paymentService;
        _orderService = orderService;
        _cartService = cartService;
        _config = config;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVnPayPayment([FromBody] CreateVnPayPaymentRequest request)
    {
        try
        {
            var cart = await _cartService.GetCartAsync(CustomerId);
            if (cart.Items.Count == 0)
                return UnprocessableEntity(new ApiResponse<object> { Message = "Giỏ hàng trống." });

            // Create order first
            var order = await _orderService.CreateOrderAsync(CustomerId, new CheckoutRequest
            {
                AddressId = request.AddressId,
                PaymentMethod = "vnpay",
                Notes = request.Notes
            }, cart.Items);

            var returnUrl = $"{_config["VnPay:ReturnUrl"] ?? _config["Email:BaseUrl"]}/payment/vnpay-return?orderId={order.OrderId}";
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            
            var paymentUrl = await _paymentService.CreatePaymentUrlAsync(
                order.OrderId, 
                order.TotalAmount ?? 0, 
                $"Thanh toan don hang #{order.OrderId} - BookZone",
                returnUrl,
                ipAddress);

            return Ok(new ApiResponse<object>
            {
                Message = "Tạo URL thanh toán thành công.",
                Data = new { paymentUrl, orderId = order.OrderId }
            });
        }
        catch (Exception ex)
        {
            return UnprocessableEntity(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("vnpay-return")]
    public async Task<IActionResult> VnPayReturn()
    {
        var result = await _paymentService.ProcessReturnAsync(Request.Query);
        
        var frontendUrl = _config["Email:BaseUrl"] ?? "https://bookzone.vn";
        var redirectUrl = result.Success
            ? $"{frontendUrl}/payment/success?orderId={result.OrderId}&amount={result.Amount}"
            : $"{frontendUrl}/payment/failed?orderId={result.OrderId}&message={Uri.EscapeDataString(result.Message)}";

        return Redirect(redirectUrl);
    }

    [AllowAnonymous]
    [HttpPost("vnpay-ipn")]
    public async Task<IActionResult> VnPayIpn()
    {
        var result = await _paymentService.ProcessIpnAsync(Request.Query);
        
        // VNPay expects specific response format
        return Ok(new { RspCode = result.ResponseCode, Message = result.Message });
    }
}

public class CreateVnPayPaymentRequest
{
    public int? AddressId { get; set; }
    public string? Notes { get; set; }
}