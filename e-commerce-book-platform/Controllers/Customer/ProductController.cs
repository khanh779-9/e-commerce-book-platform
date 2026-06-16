using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWishlistService _wishlistService;
    private readonly AppDbContext _db;

    public ProductController(IProductService productService, IWishlistService wishlistService, AppDbContext db)
    {
        _productService = productService;
        _wishlistService = wishlistService;
        _db = db;
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
        var categories = await _db.Categories.OrderBy(c => c.Name).ToListAsync();
        return Ok(categories.Select(c => new CategoryResponse
        {
            CategoryId = c.CategoryId,
            Name = c.Name,
            Description = c.Description
        }));
    }

    [HttpGet("publishers")]
    public async Task<IActionResult> GetPublishers()
    {
        var publishers = await _db.Publishers.OrderBy(p => p.Name).ToListAsync();
        return Ok(publishers.Select(p => new PublisherResponse
        {
            PublisherId = p.PublisherId,
            Name = p.Name,
            Address = p.Address,
            Phone = p.Phone,
            Email = p.Email
        }));
    }

    [HttpGet("providers")]
    public async Task<IActionResult> GetProviders()
    {
        var providers = await _db.Providers.OrderBy(p => p.Name).ToListAsync();
        return Ok(providers.Select(p => new ProviderResponse
        {
            ProviderId = p.ProviderId,
            Name = p.Name,
            Address = p.Address,
            Phone = p.Phone,
            Email = p.Email
        }));
    }

    [HttpGet("authors")]
    public async Task<IActionResult> GetAuthors()
    {
        var authors = await _db.Authors.OrderBy(a => a.LastName).ToListAsync();
        return Ok(authors.Select(a => new AuthorResponse
        {
            AuthorId = a.AuthorId,
            FirstName = a.FirstName,
            MiddleName = a.MiddleName,
            LastName = a.LastName,
            FullName = a.FullName,
            Address = a.Address,
            Phone = a.Phone,
            Email = a.Email
        }));
    }

    [HttpGet("units")]
    public async Task<IActionResult> GetUnits()
    {
        var units = await _db.Units.ToListAsync();
        return Ok(units.Select(u => new UnitResponse { UnitId = u.UnitId, Name = u.Name }));
    }

    [HttpGet("book-types")]
    public async Task<IActionResult> GetBookTypes()
    {
        var types = await _db.BookTypes.ToListAsync();
        return Ok(types.Select(t => new BookTypeResponse { Code = t.Code, Name = t.Name }));
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