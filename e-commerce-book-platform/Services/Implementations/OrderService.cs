using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public OrderService(AppDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    public async Task<OrderDetailResponse> CreateOrderAsync(int customerId, CheckoutRequest request, List<CartItemResponse> cartItems)
    {
        if (request.AddressId.HasValue)
        {
            var addressExists = await _db.DeliveryAddresses
                .AnyAsync(a => a.AddressId == request.AddressId && a.CustomerId == customerId);
            if (!addressExists)
                throw new InvalidOperationException("Địa chỉ giao hàng không hợp lệ.");
        }

        var total = cartItems.Sum(i => i.SubTotal);

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                CustomerId = customerId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = total,
                PaymentMethod = request.PaymentMethod,
                Status = Order.StatusPendingConfirmation,
                AddressId = request.AddressId,
                Notes = request.Notes,
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            foreach (var item in cartItems)
            {
                _db.OrderItems.Add(new OrderItem
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Price,
                    SubTotal = item.SubTotal,
                });

                // Update stock with pessimistic lock
                var product = await _db.Products.FromSqlRaw(
                    "SELECT * FROM Products WITH (UPDLOCK, ROWLOCK) WHERE ProductId = {0}", item.ProductId)
                    .FirstOrDefaultAsync();
                if (product != null)
                {
                    if (product.StockQuantity < item.Quantity)
                        throw new InvalidOperationException($"Sản phẩm \"{product.Name}\" không đủ hàng trong kho.");
                    product.StockQuantity -= item.Quantity;
                }
            }

            // Clear cart
            var cart = await _db.Carts.FirstOrDefaultAsync(c => c.CustomerId == customerId);
            if (cart != null)
            {
                var cartItemsToRemove = await _db.CartItems.Where(ci => ci.CartId == cart.CartId).ToListAsync();
                _db.CartItems.RemoveRange(cartItemsToRemove);
                cart.ItemCount = 0;
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            await _notificationService.SendNotificationAsync(
                customerId, null,
                "Đặt hàng thành công",
                $"Đơn hàng #{order.OrderId} của bạn đã được tiếp nhận.",
                "don_hang");

            return (await GetOrderDetailAsync(order.OrderId, customerId))!;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PaginatedResponse<OrderListResponse>> GetCustomerOrdersAsync(int customerId, int page = 1, int pageSize = 10)
    {
        var query = _db.Orders
            .Include(o => o.Customer)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.OrderId);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResponse<OrderListResponse>
        {
            Items = items.Select(o => new OrderListResponse
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer?.FullName,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
            }).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailResponse?> GetOrderDetailAsync(int orderId, int customerId)
    {
        return await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.DeliveryAddress)
            .Include(o => o.Items).ThenInclude(oi => oi.Product)
            .Where(o => o.OrderId == orderId && o.CustomerId == customerId)
            .Select(o => new OrderDetailResponse
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer!.FullName,
                AddressId = o.AddressId,
                Address = o.DeliveryAddress != null ? o.DeliveryAddress.Address : null,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                Notes = o.Notes,
                Items = o.Items.Select(i => new OrderItemResponse
                {
                    ProductId = i.ProductId ?? 0,
                    ProductName = i.Product!.DisplayName,
                    Quantity = i.Quantity ?? 0,
                    UnitPrice = i.UnitPrice ?? 0,
                    SubTotal = i.SubTotal ?? 0,
                    ImageUrl = i.Product.ImageUrl,
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    async Task<PaginatedResponse<OrderListResponse>> IOrderService.GetAllOrdersAsync(int page, int pageSize)
    {
        var query = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Employee)
            .OrderByDescending(o => o.OrderId);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResponse<OrderListResponse>
        {
            Items = items.Select(o => new OrderListResponse
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer?.FullName,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
            }).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailResponse> UpdateOrderStatusAsync(int orderId, string status, int? employeeId = null)
    {
        using var transaction = await _db.Database.BeginTransactionAsync();

        var order = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderId == orderId)
            ?? throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

        var oldStatus = order.Status;
        order.Status = status;
        if (employeeId.HasValue)
            order.EmployeeId = employeeId;

        // If delivered, update sold quantity
        if (status == Order.StatusDelivered && oldStatus != Order.StatusDelivered)
        {
            foreach (var item in order.Items)
            {
                if (item.ProductId.HasValue)
                {
                    var product = await _db.Products.FindAsync(item.ProductId.Value);
                    if (product != null)
                        product.SoldQuantity += item.Quantity ?? 0;
                }
            }
        }

        await _db.SaveChangesAsync();
        await transaction.CommitAsync();

        var statusMessages = new Dictionary<string, string>
        {
            ["da_xac_nhan"] = "đã được xác nhận",
            ["dang_giao_hang"] = "đang được giao",
            ["da_giao_hang"] = "đã giao thành công",
            ["da_huy"] = "đã bị hủy",
        };

        if (order.CustomerId.HasValue && statusMessages.TryGetValue(status, out var msg))
        {
            await _notificationService.SendNotificationAsync(
                order.CustomerId, null,
                "Cập nhật đơn hàng",
                $"Đơn hàng #{order.OrderId} {msg}.",
                "don_hang");
        }

        // Return without customer filter for employee
        return new OrderDetailResponse
        {
            OrderId = order.OrderId,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer?.FullName,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            Notes = order.Notes,
        };
    }
}