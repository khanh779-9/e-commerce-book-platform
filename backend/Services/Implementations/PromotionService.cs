using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerceBookPlatform.Services.Implementations;

public class PromotionService : IPromotionService
{
    private readonly AppDbContext _db;
    private readonly ICacheService _cache;
    private readonly ILogger<PromotionService> _logger;

    private const string PromotionsCachePrefix = "promotions:list:";
    private const string PromotionDetailCachePrefix = "promotions:detail:";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(10);

    public PromotionService(AppDbContext db, ICacheService cache, ILogger<PromotionService> logger)
    {
        _db = db;
        _cache = cache;
        _logger = logger;
    }

    public async Task<PromotionResponse> CreatePromotionAsync(CreatePromotionRequest request)
    {
        var promotion = new Promotion
        {
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
        };

        _db.Promotions.Add(promotion);
        await _db.SaveChangesAsync();

        if (request.Details != null)
        {
            foreach (var detail in request.Details)
            {
                _db.PromotionDetails.Add(new PromotionDetail
                {
                    PromotionId = promotion.PromotionId,
                    ProductId = detail.ProductId,
                    Quantity = detail.Quantity,
                    DiscountPercent = detail.DiscountPercent,
                });
            }
            await _db.SaveChangesAsync();
        }

        await InvalidatePromotionCachesAsync();
        return (await GetPromotionDetailAsync(promotion.PromotionId))!;
    }

    public async Task<PromotionResponse> UpdatePromotionAsync(int id, CreatePromotionRequest request)
    {
        var promotion = await _db.Promotions.FindAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy khuyến mãi.");

        promotion.Name = request.Name;
        promotion.StartDate = request.StartDate;
        promotion.EndDate = request.EndDate;
        await _db.SaveChangesAsync();

        await InvalidatePromotionCachesAsync(id);
        return (await GetPromotionDetailAsync(id))!;
    }

    public async Task DeletePromotionAsync(int id)
    {
        var promotion = await _db.Promotions
            .Include(p => p.Details)
            .FirstOrDefaultAsync(p => p.PromotionId == id)
            ?? throw new KeyNotFoundException("Không tìm thấy khuyến mãi.");

        _db.PromotionDetails.RemoveRange(promotion.Details);
        _db.Promotions.Remove(promotion);
        await _db.SaveChangesAsync();

        await InvalidatePromotionCachesAsync(id);
    }

    public async Task<PromotionDetailResponse> AddDetailAsync(int promotionId, AddPromotionDetailRequest request)
    {
        if (!await _db.Promotions.AnyAsync(p => p.PromotionId == promotionId))
            throw new KeyNotFoundException("Không tìm thấy khuyến mãi.");

        var detail = new PromotionDetail
        {
            PromotionId = promotionId,
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            DiscountPercent = request.DiscountPercent,
        };

        _db.PromotionDetails.Add(detail);
        await _db.SaveChangesAsync();

        await InvalidatePromotionCachesAsync(promotionId);

        return new PromotionDetailResponse
        {
            DetailId = detail.DetailId,
            ProductId = detail.ProductId,
            DiscountPercent = detail.DiscountPercent,
            Quantity = detail.Quantity,
        };
    }

    public async Task RemoveDetailAsync(int detailId)
    {
        var detail = await _db.PromotionDetails.FindAsync(detailId)
            ?? throw new KeyNotFoundException("Không tìm thấy chi tiết khuyến mãi.");
        
        var promotionId = detail.PromotionId;
        _db.PromotionDetails.Remove(detail);
        await _db.SaveChangesAsync();

        await InvalidatePromotionCachesAsync(promotionId);
    }

    private async Task InvalidatePromotionCachesAsync(int? specificId = null)
    {
        if (specificId.HasValue)
        {
            await _cache.RemoveAsync($"{PromotionDetailCachePrefix}{specificId}");
        }
        await _cache.RemoveByPatternAsync($"{PromotionsCachePrefix}*");
        _logger.LogDebug("Invalidated promotion caches");
    }

    public async Task<PaginatedResponse<PromotionResponse>> GetAllPromotionsAsync(int page = 1, int pageSize = 15)
    {
        var cacheKey = $"{PromotionsCachePrefix}p:{page}:l:{pageSize}";
        
        var cached = await _cache.GetAsync<PaginatedResponse<PromotionResponse>>(cacheKey);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for promotions list: {Key}", cacheKey);
            return cached;
        }

        _logger.LogDebug("Cache miss for promotions list: {Key}", cacheKey);

        var query = _db.Promotions
            .Include(p => p.Details).ThenInclude(d => d.Product)
            .OrderByDescending(p => p.PromotionId);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var response = new PaginatedResponse<PromotionResponse>
        {
            Items = items.Select(p => new PromotionResponse
            {
                PromotionId = p.PromotionId,
                Name = p.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Details = p.Details.Select(d => new PromotionDetailResponse
                {
                    DetailId = d.DetailId,
                    ProductId = d.ProductId,
                    ProductName = d.Product?.DisplayName,
                    Quantity = d.Quantity,
                    DiscountPercent = d.DiscountPercent,
                }).ToList()
            }).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };

        await _cache.SetAsync(cacheKey, response, CacheTtl);
        _logger.LogDebug("Cached promotions list: {Key}", cacheKey);

        return response;
    }

    public async Task<PromotionResponse?> GetPromotionDetailAsync(int id)
    {
        var cacheKey = $"{PromotionDetailCachePrefix}{id}";
        
        var cached = await _cache.GetAsync<PromotionResponse>(cacheKey);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for promotion detail: {Id}", id);
            return cached;
        }

        _logger.LogDebug("Cache miss for promotion detail: {Id}", id);

        var response = await _db.Promotions
            .Include(p => p.Details).ThenInclude(d => d.Product)
            .Where(p => p.PromotionId == id)
            .Select(p => new PromotionResponse
            {
                PromotionId = p.PromotionId,
                Name = p.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Details = p.Details.Select(d => new PromotionDetailResponse
                {
                    DetailId = d.DetailId,
                    ProductId = d.ProductId,
                    ProductName = d.Product!.DisplayName,
                    Quantity = d.Quantity,
                    DiscountPercent = d.DiscountPercent,
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (response != null)
        {
            await _cache.SetAsync(cacheKey, response, CacheTtl);
            _logger.LogDebug("Cached promotion detail: {Id}", id);
        }

        return response;
    }

    public async Task<PromotionValidationResult> ValidateCodeAsync(string code, decimal orderValue, List<int> productIds)
    {
        var now = DateTime.UtcNow;
        
        var promotion = await _db.Promotions
            .Include(p => p.Details).ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(p => p.Code == code && p.IsActive 
                && p.StartDate <= now && p.EndDate >= now);

        if (promotion == null)
            return new PromotionValidationResult { IsValid = false, Message = "Mã khuyến mãi không tồn tại hoặc đã hết hạn." };

        if (promotion.UsageLimit.HasValue && promotion.UsedCount >= promotion.UsageLimit.Value)
            return new PromotionValidationResult { IsValid = false, Message = "Mã khuyến mãi đã hết lượt sử dụng." };

        if (promotion.MinOrderValue.HasValue && orderValue < promotion.MinOrderValue.Value)
            return new PromotionValidationResult 
            { 
                IsValid = false, 
                Message = $"Đơn hàng phải từ {promotion.MinOrderValue.Value:N0}đ để áp dụng mã này." 
            };

        // Check if any product in cart matches promotion products
        var promoProductIds = promotion.Details.Select(d => d.ProductId).ToList();
        var hasMatchingProduct = productIds.Any(id => promoProductIds.Contains(id));
        
        if (!hasMatchingProduct)
            return new PromotionValidationResult { IsValid = false, Message = "Không có sản phẩm nào trong giỏ hàng áp dụng được mã này." };

        // Calculate discount
        decimal discountAmount = 0;
        foreach (var detail in promotion.Details)
        {
            if (!detail.ProductId.HasValue || !productIds.Contains(detail.ProductId.Value)) continue;
            
            var product = detail.Product;
            if (product == null) continue;

            var promoPrice = product.GetPromoPrice();
            var discount = promoPrice * (detail.DiscountPercent ?? 0) / 100m;
            
            if (promotion.MaxDiscount.HasValue)
            {
                discount = Math.Min(discount, promotion.MaxDiscount.Value);
            }
            
            discountAmount += discount;
        }

        if (promotion.MaxDiscount.HasValue)
        {
            discountAmount = Math.Min(discountAmount, promotion.MaxDiscount.Value);
        }

        var response = await GetPromotionDetailAsync(promotion.PromotionId);
        
        return new PromotionValidationResult
        {
            IsValid = true,
            Message = "Mã khuyến mãi hợp lệ.",
            DiscountAmount = discountAmount,
            Promotion = response
        };
    }
}