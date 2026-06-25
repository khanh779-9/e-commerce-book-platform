using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class WishlistService : IWishlistService
{
    private readonly AppDbContext _db;

    public WishlistService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResponse<ProductResponse>> GetWishlistAsync(int customerId, int page = 1, int pageSize = 12)
    {
        var wishlistIds = await _db.WishlistItems
            .Where(w => w.CustomerId == customerId)
            .Select(w => w.ProductId)
            .ToListAsync();

        var query = _db.Products
            .Include(p => p.Category)
            .Where(p => wishlistIds.Contains(p.ProductId));

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResponse<ProductResponse>
        {
            Items = items.Select(p => new ProductResponse
            {
                ProductId = p.ProductId,
                Name = p.DisplayName,
                ImageUrl = p.ImageUrl,
                Price = p.Price,
                PromoPrice = p.GetPromoPrice(),
                StockQuantity = p.StockQuantity,
                IsWishlisted = true,
            }).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<WishlistToggleResponse> ToggleAsync(int customerId, int productId)
    {
        var existing = await _db.WishlistItems
            .FirstOrDefaultAsync(w => w.CustomerId == customerId && w.ProductId == productId);

        if (existing != null)
        {
            _db.WishlistItems.Remove(existing);
            await _db.SaveChangesAsync();
            return new WishlistToggleResponse { Message = "Đã xóa khỏi danh sách yêu thích", Added = false };
        }

        _db.WishlistItems.Add(new WishlistItem
        {
            CustomerId = customerId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        return new WishlistToggleResponse { Message = "Đã thêm vào danh sách yêu thích", Added = true };
    }

    public List<int> GetWishlistStatus(int customerId, IEnumerable<int> productIds)
    {
        if (customerId <= 0) return new List<int>();

        return _db.WishlistItems
            .Where(w => w.CustomerId == customerId && productIds.Contains(w.ProductId))
            .Select(w => w.ProductId)
            .ToList();
    }
}