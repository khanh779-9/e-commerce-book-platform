using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace ECommerceBookPlatform.Controllers;

[ApiController]
[Route("api/v1")]
public class OracleCloudController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public OracleCloudController(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>
    /// GET /api/v1/image?path=products/abc.jpg
    /// Public — lấy ảnh theo đường dẫn (local fallback).
    /// </summary>
    [HttpGet("image")]
    public async Task<IActionResult> GetImage([FromQuery] string path)
    {
        if (string.IsNullOrEmpty(path))
            return BadRequest(new ApiResponse<object> { Message = "Thiếu tham số đường dẫn ảnh." });

        var filePath = Path.Combine(_env.WebRootPath, "uploads", path);

        // Chặn path traversal: file phải nằm bên trong wwwroot/uploads
        var uploadsRoot = Path.GetFullPath(Path.Combine(_env.WebRootPath, "uploads"));
        if (!Path.GetFullPath(filePath).StartsWith(uploadsRoot))
            return BadRequest(new ApiResponse<object> { Message = "Đường dẫn ảnh không hợp lệ." });

        if (!System.IO.File.Exists(filePath))
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy ảnh." });

        var ext = Path.GetExtension(filePath).ToLower();
        var mimeTypes = new Dictionary<string, string>
        {
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".webp"] = "image/webp",
            [".gif"] = "image/gif",
        };

        var mime = mimeTypes.GetValueOrDefault(ext, "application/octet-stream");
        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(bytes, mime);
    }

    /// <summary>
    /// GET /api/v1/image/product/{productId}
    /// Public — lấy ảnh sản phẩm theo ID (local fallback).
    /// </summary>
    [HttpGet("image/product/{productId}")]
    public async Task<IActionResult> GetProductImage(int productId)
    {
        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "products");

        if (!Directory.Exists(uploadsDir))
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy ảnh." });

        var files = Directory.GetFiles(uploadsDir, $"{productId}.*");
        if (files.Length == 0)
        {
            files = Directory.GetFiles(uploadsDir, $"*{productId}*");
        }

        if (files.Length == 0)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy ảnh." });

        var filePath = files[0];
        var ext = Path.GetExtension(filePath).ToLower();
        var mimeTypes = new Dictionary<string, string>
        {
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".webp"] = "image/webp",
            [".gif"] = "image/gif",
        };

        var mime = mimeTypes.GetValueOrDefault(ext, "application/octet-stream");
        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);

        return Ok(new
        {
            file_path = Path.GetRelativePath(_env.WebRootPath, filePath),
            url = $"/uploads/products/{Path.GetFileName(filePath)}",
        });
    }
}

[ApiController]
[Route("api/v1/employee/files")]
[Authorize]
public class EmployeeFileController : ControllerBase
{
    private readonly IFileStorageService _storage;
    private readonly string[] _allowedRoles = ["admin", "quanly", "nhanvien"];

    public EmployeeFileController(IFileStorageService storage)
    {
        _storage = storage;
    }

    private bool CheckRole(string role) => _allowedRoles.Contains(role);

    private string GetEmployeeRole()
    {
        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        return roleClaim.Replace("employee_", "");
    }

    /// <summary>
    /// POST /api/v1/employee/files/upload
    /// Upload file lên storage (SeaweedFS hoặc Local).
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? folder)
    {
        if (!CheckRole(GetEmployeeRole()))
            return Forbid();

        if (file == null || file.Length == 0)
            return BadRequest(new ApiResponse<object> { Message = "Vui lòng chọn file." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new ApiResponse<object> { Message = "File không được vượt quá 10MB." });

        var ext = Path.GetExtension(file.FileName).ToLower();
        var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".doc", ".docx", ".xls", ".xlsx" };
        if (!allowedExts.Contains(ext))
            return BadRequest(new ApiResponse<object> { Message = "Định dạng file không hợp lệ." });

        using var stream = file.OpenReadStream();
        var result = await _storage.UploadAsync(stream, file.FileName, file.ContentType, folder);

        return Ok(new ApiResponse<object>
        {
            Message = "Tải file lên thành công!",
            Data = new
            {
                file_id = result.FileId,
                file_name = result.FileName,
                file_size = result.Size,
                url = result.Url,
                storage = result.StorageProvider
            }
        });
    }

    /// <summary>
    /// POST /api/v1/employee/files/upload-product/{productId}
    /// Upload ảnh và gắn vào sản phẩm.
    /// </summary>
    [HttpPost("upload-product/{productId}")]
    public async Task<IActionResult> UploadProductImage(int productId, IFormFile image, [FromServices] IProductService productService)
    {
        if (!CheckRole(GetEmployeeRole()))
            return Forbid();

        if (image == null || image.Length == 0)
            return BadRequest(new ApiResponse<object> { Message = "Vui lòng chọn file ảnh." });

        if (image.Length > 5 * 1024 * 1024)
            return BadRequest(new ApiResponse<object> { Message = "Ảnh không được vượt quá 5MB." });

        var ext = Path.GetExtension(image.FileName).ToLower();
        var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExts.Contains(ext))
            return BadRequest(new ApiResponse<object> { Message = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận jpg, jpeg, png, webp, gif." });

        var product = await productService.GetProductDetailAsync(productId);
        if (product == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy sản phẩm." });

        using var stream = image.OpenReadStream();
        var result = await _storage.UploadAsync(stream, image.FileName, image.ContentType, "products");

        // Update product with new image URL
        await productService.UpdateProductAsync(productId, new UpdateProductRequest
        {
            ImageUrl = result.Url
        });

        return Ok(new ApiResponse<object>
        {
            Message = "Cập nhật ảnh sản phẩm thành công!",
            Data = new
            {
                file_id = result.FileId,
                image_url = result.Url,
                storage = result.StorageProvider
            }
        });
    }

    /// <summary>
    /// GET /api/v1/employee/files
    /// Liệt kê file trong thư mục.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListFiles([FromQuery] string? folder, [FromQuery] int max = 50)
    {
        if (!CheckRole(GetEmployeeRole()))
            return Forbid();

        var files = await _storage.ListAsync(folder, max);

        return Ok(new
        {
            files = files.Select(f => new
            {
                file_id = f.FileId,
                file_name = f.FileName,
                file_size = f.Size,
                url = f.Url,
                created_at = f.CreatedAt
            }),
            total = files.Count,
            folder = folder ?? ""
        });
    }

    /// <summary>
    /// DELETE /api/v1/employee/files/{fileId}
    /// Xoá file theo ID.
    /// </summary>
    [HttpDelete("{fileId}")]
    public async Task<IActionResult> DeleteFile(string fileId)
    {
        var role = GetEmployeeRole();
        if (role != "admin" && role != "quanly")
            return Forbid();

        if (string.IsNullOrEmpty(fileId))
            return BadRequest(new ApiResponse<object> { Message = "Thiếu file ID." });

        var deleted = await _storage.DeleteAsync(fileId);

        if (!deleted)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy file để xoá hoặc storage không hỗ trợ xoá." });

        return Ok(new ApiResponse<object> { Message = "Xoá file thành công!" });
    }
}