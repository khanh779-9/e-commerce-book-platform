using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/products")]
[Authorize]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly AppDbContext _db;

    public ProductController(IProductService productService, AppDbContext db)
    {
        _productService = productService;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        var products = await _productService.GetProductsAsync(new ProductSearchRequest
        {
            Limit = limit,
            Page = page,
            InStockOnly = false
        });
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _productService.GetProductDetailAsync(id);
        if (product == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy sản phẩm" });

        return Ok(new ApiResponse<ProductResponse> { Data = product });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        try
        {
            var product = await _productService.CreateProductAsync(request);
            return Ok(new ApiResponse<ProductResponse> { Message = "Thêm sản phẩm thành công!", Data = product });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        try
        {
            var product = await _productService.UpdateProductAsync(id, request);
            return Ok(new ApiResponse<ProductResponse> { Message = "Cập nhật sản phẩm thành công!", Data = product });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            await _productService.DeleteProductAsync(id);
            return Ok(new ApiResponse<object> { Message = "Xóa sản phẩm thành công!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest(new ApiResponse<object> { Message = "Vui lòng chọn file ảnh." });

        if (image.Length > 2 * 1024 * 1024)
            return BadRequest(new ApiResponse<object> { Message = "Ảnh không được vượt quá 2MB." });

        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy sản phẩm." });

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        product.ImageUrl = $"/uploads/products/{fileName}";
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Message = "Tải ảnh lên thành công!",
            Data = new { image_url = product.ImageUrl }
        });
    }
}