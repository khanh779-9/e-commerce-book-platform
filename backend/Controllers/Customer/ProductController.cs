using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWishlistService _wishlistService;
    private readonly AppDbContext _db;
    private readonly IDistributedCache _cache;
    private readonly ILogger<ProductController> _logger;
    private static readonly TimeSpan RefDataTtl = TimeSpan.FromHours(1);
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public ProductController(IProductService productService, IWishlistService wishlistService, AppDbContext db, IDistributedCache cache, ILogger<ProductController> logger)
    {
        _productService = productService;
        _wishlistService = wishlistService;
        _db = db;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] ProductSearchRequest request)
    {
        var customerId = GetCustomerId();
        var result = await _productService.GetProductsAsync(request, customerId);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] ProductSearchRequest request)
    {
        return await GetProducts(request);
    }

    [HttpGet("products/{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var customerId = GetCustomerId();
        var product = await _productService.GetProductDetailAsync(id, customerId);
        if (product == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy sản phẩm" });

        return Ok(new ApiResponse<ProductResponse> { Data = product });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        return await GetCachedRefDataAsync("categories", async () =>
            await _db.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryResponse
                {
                    CategoryId = c.CategoryId,
                    Name = c.Name,
                    Description = c.Description,
                    ProductCount = _db.Products.Count(p => p.CategoryId == c.CategoryId)
                })
                .ToListAsync());
    }

    [HttpGet("publishers")]
    public async Task<IActionResult> GetPublishers()
    {
        return await GetCachedRefDataAsync("publishers", async () => 
            await _db.Publishers.OrderBy(p => p.Name).ToListAsync());
    }

    [HttpGet("providers")]
    public async Task<IActionResult> GetProviders()
    {
        return await GetCachedRefDataAsync("providers", async () => 
            await _db.Providers.OrderBy(p => p.Name).ToListAsync());
    }

    [HttpGet("authors")]
    public async Task<IActionResult> GetAuthors()
    {
        return await GetCachedRefDataAsync("authors", async () => 
            await _db.Authors.OrderBy(a => a.LastName).ToListAsync());
    }

    [HttpGet("units")]
    public async Task<IActionResult> GetUnits()
    {
        return await GetCachedRefDataAsync("units", async () => 
            await _db.Units.ToListAsync());
    }

    [HttpGet("book-types")]
    public async Task<IActionResult> GetBookTypes()
    {
        return await GetCachedRefDataAsync("book-types", async () => 
            await _db.BookTypes.OrderBy(b => b.Name).ToListAsync());
    }

    private async Task<IActionResult> GetCachedRefDataAsync<T>(string cacheKey, Func<Task<List<T>>> fetchFunc) where T : class
    {
        var fullKey = $"ref:{cacheKey}";
        try
        {
            var cached = await _cache.GetStringAsync(fullKey);
            if (cached != null)
            {
                var data = JsonSerializer.Deserialize<List<T>>(cached, JsonOpts);
                return Ok(data);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ref-data cache read failed for key: {Key}, falling back to database.", fullKey);
        }

        var items = await fetchFunc();
        var json = JsonSerializer.Serialize(items, JsonOpts);
        try
        {
            await _cache.SetStringAsync(fullKey, json, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = RefDataTtl
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ref-data cache write failed for key: {Key}. Serving uncached data.", fullKey);
        }

        return Ok(items);
    }

    private int GetCustomerId()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out var id))
                return id;
        }
        return 0;
    }
}