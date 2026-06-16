using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class CartService : ICartService
{
    private readonly AppDbContext _db;

    public CartService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CartResponse> GetCartAsync(int customerId)
    {
        var cart = await GetOrCreateCartAsync(customerId);
        var items = await _db.CartItems
            .Where(ci => ci.CartId == cart.CartId)
            .Include(ci => ci.Product)
            .ToListAsync();

        return new CartResponse
        {
            Items = items.Select(i => new CartItemResponse
            {
                ProductId = i.ProductId ?? 0,
                Name = i.Product?.DisplayName ?? "",
                Price = i.UnitPrice,
                Quantity = i.Quantity ?? 1,
                SubTotal = i.SubTotal,
                Image = i.Product?.ImageUrl
            }).ToList(),
            Total = items.Sum(i => i.SubTotal)
        };
    }

    public async Task<CartResponse> AddItemAsync(int customerId, int productId, int quantity)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        var cart = await GetOrCreateCartAsync(customerId);
        var existingItem = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cart.CartId && ci.ProductId == productId);

        if (existingItem != null)
        {
            var newQty = (existingItem.Quantity ?? 0) + quantity;
            if (newQty > product.StockQuantity)
                throw new InvalidOperationException("Số lượng vượt quá tồn kho.");

            existingItem.Quantity = newQty;
            existingItem.SubTotal = newQty * existingItem.UnitPrice;
        }
        else
        {
            if (quantity > product.StockQuantity)
                throw new InvalidOperationException("Số lượng vượt quá tồn kho.");

            _db.CartItems.Add(new CartItem
            {
                CartId = cart.CartId,
                ProductId = productId,
                Quantity = quantity,
                UnitPrice = product.Price,
                SubTotal = quantity * product.Price,
            });
        }

        await _db.SaveChangesAsync();
        await RefreshCartCountAsync(cart.CartId);

        return await GetCartAsync(customerId);
    }

    public async Task UpdateItemAsync(int customerId, int productId, int quantity)
    {
        var product = await _db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        if (quantity > product.StockQuantity)
            throw new InvalidOperationException("Số lượng vượt quá tồn kho.");

        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.CustomerId == customerId)
            ?? throw new KeyNotFoundException("Giỏ hàng trống.");

        var item = await _db.CartItems
            .FirstOrDefaultAsync(ci => ci.CartId == cart.CartId && ci.ProductId == productId);

        if (item == null)
            throw new KeyNotFoundException("Sản phẩm không có trong giỏ.");

        if (quantity <= 0)
        {
            _db.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = quantity;
            item.SubTotal = quantity * item.UnitPrice;
        }

        await _db.SaveChangesAsync();
        await RefreshCartCountAsync(cart.CartId);
    }

    public async Task RemoveItemAsync(int customerId, int productId)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.CustomerId == customerId);
        if (cart == null) return;

        var items = await _db.CartItems
            .Where(ci => ci.CartId == cart.CartId && ci.ProductId == productId)
            .ToListAsync();

        _db.CartItems.RemoveRange(items);
        await _db.SaveChangesAsync();
        await RefreshCartCountAsync(cart.CartId);
    }

    public async Task<CartResponse> MergeCartAsync(int customerId, List<CartItemInput> items)
    {
        foreach (var item in items)
        {
            try
            {
                await AddItemAsync(customerId, item.ProductId, item.Quantity);
            }
            catch { /* skip failed items */ }
        }
        return await GetCartAsync(customerId);
    }

    private async Task<Cart> GetOrCreateCartAsync(int customerId)
    {
        var cart = await _db.Carts.FirstOrDefaultAsync(c => c.CustomerId == customerId);
        if (cart == null)
        {
            cart = new Cart
            {
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow,
                ItemCount = 0
            };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }
        return cart;
    }

    private async Task RefreshCartCountAsync(int cartId)
    {
        var count = await _db.CartItems
            .Where(ci => ci.CartId == cartId)
            .SumAsync(ci => (int?)ci.Quantity ?? 0);

        var cart = await _db.Carts.FindAsync(cartId);
        if (cart != null)
        {
            cart.ItemCount = count;
            await _db.SaveChangesAsync();
        }
    }
}