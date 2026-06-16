using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerceBookPlatform.Services.Implementations;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;
    private readonly ICacheService _cache;
    private readonly ILogger<ProductService> _logger;

    private const string ProductsCachePrefix = "products:list:";
    private const string ProductDetailCachePrefix = "products:detail:";
    private static readonly TimeSpan ListCacheTtl = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan DetailCacheTtl = TimeSpan.FromMinutes(10);

    public ProductService(AppDbContext db, ICacheService cache, ILogger<ProductService> logger)
    {
        _db = db;
        _cache = cache;
        _logger = logger;
    }

    public async Task<PaginatedResponse<ProductResponse>> GetProductsAsync(ProductSearchRequest request, int? customerId = null)
    {
        var cacheKey = BuildProductsCacheKey(request);
        
        // Try cache first
        var cached = await _cache.GetAsync<PaginatedResponse<ProductResponse>>(cacheKey);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for products: {Key}", cacheKey);
            // Still need to check wishlist status for this customer
            if (customerId.HasValue)
            {
                await EnrichWithWishlistAsync(cached.Items, customerId.Value);
            }
            return cached;
        }

        _logger.LogDebug("Cache miss for products: {Key}", cacheKey);

        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .Include(p => p.Provider)
            .Include(p => p.Book).ThenInclude(b => b!.Author)
            .Include(p => p.Book).ThenInclude(b => b!.Publisher)
            .Include(p => p.Book).ThenInclude(b => b!.BookType)
            .Include(p => p.PromotionDetails).ThenInclude(pd => pd.Promotion)
            .AsQueryable();

        // Filters
        if (!string.IsNullOrEmpty(request.Q))
        {
            var keyword = request.Q.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(keyword)
                || (p.Book != null && p.Book.Title != null && p.Book.Title.ToLower().Contains(keyword)));
        }

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId);

        if (request.ProviderId.HasValue)
            query = query.Where(p => p.ProviderId == request.ProviderId);

        if (request.PublisherId.HasValue)
            query = query.Where(p => p.Book != null && p.Book.PublisherId == request.PublisherId);

        if (!string.IsNullOrEmpty(request.BookTypeCode))
            query = query.Where(p => p.Book != null && p.Book.BookTypeCode == request.BookTypeCode);

        if (request.MinPrice.HasValue)
            query = query.Where(p => p.Price >= request.MinPrice);

        if (request.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= request.MaxPrice);

        if (request.PromotedOnly == true)
            query = query.Where(p => p.PromotionDetails.Any(pd =>
                pd.Promotion != null && pd.Promotion.StartDate <= DateTime.UtcNow && pd.Promotion.EndDate >= DateTime.UtcNow));

        if (request.InStockOnly != false)
            query = query.Where(p => p.StockQuantity > 0);

        // Sort
        query = request.SortBy switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "best_selling" => query.OrderByDescending(p => p.SoldQuantity),
            _ => query.OrderByDescending(p => p.ProductId)
        };

        // Paginate
        var total = await query.CountAsync();
        var items = await query
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .ToListAsync();

        // Wishlist status
        var wishlistedIds = new List<int>();
        if (customerId.HasValue)
        {
            wishlistedIds = await _db.WishlistItems
                .Where(w => w.CustomerId == customerId && items.Select(i => i.ProductId).Contains(w.ProductId))
                .Select(w => w.ProductId)
                .ToListAsync();
        }

        // Review stats
        var productIds = items.Select(i => i.ProductId).ToList();
        var reviewStats = await _db.Reviews
            .Where(r => productIds.Contains(r.ProductId))
            .GroupBy(r => r.ProductId)
            .Select(g => new { ProductId = g.Key, Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .ToListAsync();

        var statsDict = reviewStats.ToDictionary(s => s.ProductId);

        var response = new PaginatedResponse<ProductResponse>
        {
            Items = items.Select(p => MapProduct(p, wishlistedIds.Contains(p.ProductId), statsDict.GetValueOrDefault(p.ProductId))).ToList(),
            Total = total,
            Page = request.Page,
            PageSize = request.Limit
        };

        // Cache the response (without wishlist - that's per-user)
        await _cache.SetAsync(cacheKey, response, ListCacheTtl);
        _logger.LogDebug("Cached products: {Key}", cacheKey);

        return response;
    }

    private string BuildProductsCacheKey(ProductSearchRequest request)
    {
        var parts = new List<string>
        {
            ProductsCachePrefix,
            $"q:{request.Q ?? ""}",
            $"cat:{request.CategoryId ?? 0}",
            $"prov:{request.ProviderId ?? 0}",
            $"pub:{request.PublisherId ?? 0}",
            $"type:{request.BookTypeCode ?? ""}",
            $"min:{request.MinPrice ?? 0}",
            $"max:{request.MaxPrice ?? 0}",
            $"promo:{request.PromotedOnly == true}",
            $"stock:{request.InStockOnly != false}",
            $"sort:{request.SortBy ?? "default"}",
            $"p:{request.Page}",
            $"l:{request.Limit}"
        };
        return string.Join(":", parts);
    }

    private async Task EnrichWithWishlistAsync(List<ProductResponse> items, int customerId)
    {
        if (items.Count == 0) return;
        
        var productIds = items.Select(i => i.ProductId).ToList();
        var wishlistedIds = await _db.WishlistItems
            .Where(w => w.CustomerId == customerId && productIds.Contains(w.ProductId))
            .Select(w => w.ProductId)
            .ToListAsync();

        foreach (var item in items)
        {
            item.IsWishlisted = wishlistedIds.Contains(item.ProductId);
        }
    }

    public async Task<ProductResponse?> GetProductDetailAsync(int id, int? customerId = null)
    {
        var cacheKey = $"{ProductDetailCachePrefix}{id}";
        
        var cached = await _cache.GetAsync<ProductResponse>(cacheKey);
        if (cached != null)
        {
            _logger.LogDebug("Cache hit for product detail: {Id}", id);
            if (customerId.HasValue)
            {
                cached.IsWishlisted = await _db.WishlistItems
                    .AnyAsync(w => w.CustomerId == customerId && w.ProductId == id);
            }
            return cached;
        }

        _logger.LogDebug("Cache miss for product detail: {Id}", id);

        var product = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .Include(p => p.Provider)
            .Include(p => p.Book).ThenInclude(b => b!.Author)
            .Include(p => p.Book).ThenInclude(b => b!.Publisher)
            .Include(p => p.Book).ThenInclude(b => b!.BookType)
            .Include(p => p.PromotionDetails).ThenInclude(pd => pd.Promotion)
            .Include(p => p.Reviews).ThenInclude(r => r.Customer)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null) return null;

        bool isWishlisted = false;
        if (customerId.HasValue)
        {
            isWishlisted = await _db.WishlistItems.AnyAsync(w =>
                w.CustomerId == customerId && w.ProductId == id);
        }

        var avgRating = product.Reviews.Any() ? product.Reviews.Average(r => (double)r.Rating) : 0;

        var response = MapProduct(product, isWishlisted,
            new { Avg = avgRating, Count = product.Reviews.Count });

        // Cache the response
        await _cache.SetAsync(cacheKey, response, DetailCacheTtl);
        _logger.LogDebug("Cached product detail: {Id}", id);

        return response;
    }

    public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            CategoryId = request.CategoryId,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            UnitId = request.UnitId,
            ProviderId = request.ProviderId,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        if (request.Type == "book")
        {
            var book = new Book
            {
                ProductId = product.ProductId,
                AuthorId = request.AuthorId,
                PublisherId = request.PublisherId_,
                PublishedYear = request.PublishedYear,
                BookTypeCode = request.BookTypeCode,
            };
            _db.Books.Add(book);
            await _db.SaveChangesAsync();
        }

        // Invalidate product list caches
        await InvalidateProductCachesAsync();

        return (await GetProductDetailAsync(product.ProductId))!;
    }

    public async Task<ProductResponse> UpdateProductAsync(int id, UpdateProductRequest request)
    {
        var product = await _db.Products
            .Include(p => p.Book)
            .FirstOrDefaultAsync(p => p.ProductId == id)
            ?? throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        if (request.Name != null) product.Name = request.Name;
        if (request.CategoryId.HasValue) product.CategoryId = request.CategoryId;
        if (request.Price.HasValue) product.Price = request.Price.Value;
        if (request.StockQuantity.HasValue) product.StockQuantity = request.StockQuantity.Value;
        if (request.UnitId.HasValue) product.UnitId = request.UnitId;
        if (request.ProviderId.HasValue) product.ProviderId = request.ProviderId;
        if (request.Description != null) product.Description = request.Description;
        if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;

        if (product.Book != null)
        {
            if (request.AuthorId.HasValue) product.Book.AuthorId = request.AuthorId;
            if (request.PublisherId_.HasValue) product.Book.PublisherId = request.PublisherId_;
            if (request.PublishedYear.HasValue) product.Book.PublishedYear = request.PublishedYear;
            if (request.BookTypeCode != null) product.Book.BookTypeCode = request.BookTypeCode;
        }

        await _db.SaveChangesAsync();

        // Invalidate caches
        await _cache.RemoveAsync($"{ProductDetailCachePrefix}{id}");
        await InvalidateProductCachesAsync();

        return (await GetProductDetailAsync(product.ProductId))!;
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _db.Products
            .Include(p => p.Book)
            .FirstOrDefaultAsync(p => p.ProductId == id)
            ?? throw new KeyNotFoundException("Không tìm thấy sản phẩm.");

        if (product.Book != null)
            _db.Books.Remove(product.Book);
        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        // Invalidate caches
        await _cache.RemoveAsync($"{ProductDetailCachePrefix}{id}");
        await InvalidateProductCachesAsync();
    }

    private async Task InvalidateProductCachesAsync()
    {
        // Since IDistributedCache doesn't support pattern deletion,
        // we rely on TTL expiration. For immediate invalidation,
        // use StackExchange.Redis directly (see RedisCacheService.RemoveByPatternAsync)
        await _cache.RemoveByPatternAsync($"{ProductsCachePrefix}*");
        _logger.LogDebug("Invalidated product list caches");
    }

    private ProductResponse MapProduct(Product p, bool isWishlisted, dynamic? reviewStats)
    {
        double avgRating = 0;
        int totalReviews = 0;
        if (reviewStats != null)
        {
            avgRating = (double)reviewStats.Avg;
            totalReviews = (int)reviewStats.Count;
        }

        return new ProductResponse
        {
            ProductId = p.ProductId,
            Name = p.DisplayName,
            CategoryName = p.Category?.Name,
            ImageUrl = p.ImageUrl,
            Description = p.Description,
            StockQuantity = p.StockQuantity,
            SoldQuantity = p.SoldQuantity,
            Price = p.Price,
            PromoPrice = p.GetPromoPrice(),
            UnitName = p.Unit?.Name,
            ProviderName = p.Provider?.Name,
            IsWishlisted = isWishlisted,
            AvgRating = avgRating,
            TotalReviews = totalReviews,
            BookDetails = p.Book != null ? new BookResponse
            {
                BookId = p.Book.BookId,
                Title = p.Book.Title,
                AuthorName = p.Book.Author?.FullName,
                PublisherName = p.Book.Publisher?.Name,
                PublishedYear = p.Book.PublishedYear,
                BookTypeCode = p.Book.BookTypeCode,
                BookTypeName = p.Book.BookType?.Name,
            } : null,
        };
    }
}