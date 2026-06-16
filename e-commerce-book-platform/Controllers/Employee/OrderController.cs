using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly AppDbContext _db;

    public OrderController(IOrderService orderService, AppDbContext db)
    {
        _orderService = orderService;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1)
    {
        var orders = await _orderService.GetAllOrdersAsync(page);
        return Ok(orders);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            var empId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var order = await _orderService.UpdateOrderStatusAsync(id, request.Status, empId);
            return Ok(new ApiResponse<OrderDetailResponse> { Message = "Đã cập nhật trạng thái.", Data = order });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] EmployeeCreateOrderRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
            return BadRequest(new ApiResponse<object> { Message = "Giỏ hàng trống." });

        var empId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var productIds = request.Items.Select(i => i.ProductId).ToList();
            var products = await _db.Products
                .FromSqlRaw("SELECT * FROM Products WITH (UPDLOCK, ROWLOCK) WHERE ProductId IN ({0})", string.Join(",", productIds))
                .Include(p => p.PromotionDetails).ThenInclude(pd => pd.Promotion)
                .ToListAsync();

            // Validate stock
            foreach (var item in request.Items)
            {
                var product = products.FirstOrDefault(p => p.ProductId == item.ProductId);
                if (product == null)
                    return BadRequest(new ApiResponse<object> { Message = $"Sản phẩm #{item.ProductId} không tồn tại." });
                if (!product.HasStock(item.Quantity))
                    return BadRequest(new ApiResponse<object> { Message = $"Sản phẩm \"{product.Name}\" không đủ hàng (còn: {product.StockQuantity})." });
            }

            decimal totalAmount = 0;
            var orderItems = new List<Models.OrderItem>();

            foreach (var item in request.Items)
            {
                var product = products.First(p => p.ProductId == item.ProductId);
                var unitPrice = product.GetPromoPrice();
                var subTotal = unitPrice * item.Quantity;
                totalAmount += subTotal;

                orderItems.Add(new Models.OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    SubTotal = subTotal,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                });

                product.StockQuantity -= item.Quantity;
                product.SoldQuantity += item.Quantity;
            }

            var order = new Models.Order
            {
                CustomerId = request.CustomerId,
                EmployeeId = empId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "da_xac_nhan",
                PaymentMethod = request.PaymentMethod ?? "tien_mat",
                Notes = request.Notes,
                Items = orderItems,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new ApiResponse<OrderDetailResponse>
            {
                Message = "Tạo đơn hàng thành công!",
                Data = new OrderDetailResponse
                {
                    OrderId = order.OrderId,
                    CustomerId = order.CustomerId,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    PaymentMethod = order.PaymentMethod,
                    Notes = order.Notes,
                }
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return UnprocessableEntity(new ApiResponse<object> { Message = ex.Message });
        }
    }
}

public class EmployeeCreateOrderRequest
{
    public int CustomerId { get; set; }
    public string PaymentMethod { get; set; } = "tien_mat";
    public string? Notes { get; set; }
    public List<EmployeeOrderItemInput> Items { get; set; } = new();
}

public class EmployeeOrderItemInput
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}