using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/orders")]
[Authorize(Roles = "customer")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICartService _cartService;

    public OrderController(IOrderService orderService, ICartService cartService)
    {
        _orderService = orderService;
        _cartService = cartService;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1)
    {
        var orders = await _orderService.GetCustomerOrdersAsync(CustomerId, page);
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _orderService.GetOrderDetailAsync(id, CustomerId);
        if (order == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy đơn hàng" });

        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CheckoutRequest request)
    {
        var cart = await _cartService.GetCartAsync(CustomerId);
        if (cart.Items.Count == 0)
            return UnprocessableEntity(new ApiResponse<object> { Message = "Giỏ hàng trống." });

        try
        {
            var order = await _orderService.CreateOrderAsync(CustomerId, request, cart.Items);
            return Ok(new ApiResponse<OrderDetailResponse> { Message = "Đặt hàng thành công.", Data = order });
        }
        catch (Exception ex)
        {
            return UnprocessableEntity(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        // Chỉ chủ đơn mới được hủy
        var order = await _orderService.GetOrderDetailAsync(id, CustomerId);
        if (order == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy đơn hàng" });

        var cancellable = new[] { Models.Order.StatusPendingConfirmation, Models.Order.StatusConfirmed };
        if (!cancellable.Contains(order.Status))
            return BadRequest(new ApiResponse<object> { Message = "Đơn hàng đang giao/đã giao rồi thì không thể hủy." });

        try
        {
            var updated = await _orderService.UpdateOrderStatusAsync(id, Models.Order.StatusCancelled);
            return Ok(new ApiResponse<OrderDetailResponse> { Message = "Đã hủy đơn hàng.", Data = updated });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmOrder(int id)
    {
        // Chỉ chủ đơn hàng mới được xác nhận đơn của mình
        var order = await _orderService.GetOrderDetailAsync(id, CustomerId);
        if (order == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy đơn hàng" });

        if (order.Status != Models.Order.StatusPendingConfirmation)
            return BadRequest(new ApiResponse<object> { Message = "Chỉ xác nhận được đơn ở trạng thái chờ xác nhận." });

        try
        {
            var updated = await _orderService.UpdateOrderStatusAsync(id, Models.Order.StatusConfirmed);
            return Ok(new ApiResponse<OrderDetailResponse> { Message = "Đã xác nhận đơn hàng.", Data = updated });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }
}