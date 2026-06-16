using ECommerceBookPlatform.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    /// Public — lấy ảnh theo đường dẫn.
    /// </summary>
    [HttpGet("image")]
    public async Task<IActionResult> GetImage([FromQuery] string path)
    {
        if (string.IsNullOrEmpty(path))
            return BadRequest(new ApiResponse<object> { Message = "Thiếu tham số đường dẫn ảnh." });

        var filePath = Path.Combine(_env.WebRootPath, "uploads", path);
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
    /// Public — lấy ảnh sản phẩm theo ID.
    /// </summary>
    [HttpGet("image/product/{productId}")]
    public async Task<IActionResult> GetProductImage(int productId)
    {
        // Try to find product image in uploads/products/
        var searchPattern = $"{productId}.*";
        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "products");

        if (!Directory.Exists(uploadsDir))
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy ảnh." });

        var files = Directory.GetFiles(uploadsDir, $"{productId}.*");
        if (files.Length == 0)
        {
            // Try any file that contains the product id
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
[Route("api/v1/employee/oracle-cloud")]
[Authorize]
public class EmployeeOracleCloudController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly string[] _allowedRoles = ["admin", "quanly", "nhanvien"];

    public EmployeeOracleCloudController(IWebHostEnvironment env)
    {
        _env = env;
    }

    private bool CheckRole(string role) => _allowedRoles.Contains(role);

    private string GetEmployeeRole()
    {
        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        return roleClaim.Replace("employee_", "");
    }

    /// <summary>
    /// POST /api/v1/employee/oracle-cloud/upload
    /// Upload file lên storage.
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile image, [FromQuery] string? path)
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

        var subPath = string.IsNullOrEmpty(path) ? "products" : path.Trim('/');
        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", subPath);
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        var relativePath = Path.Combine("uploads", subPath, fileName).Replace('\\', '/');

        return Ok(new ApiResponse<object>
        {
            Message = "Tải ảnh lên thành công!",
            Data = new
            {
                file_path = relativePath,
                file_name = fileName,
                url = $"/{relativePath}",
                disk = "local"
            }
        });
    }

    /// <summary>
    /// POST /api/v1/employee/oracle-cloud/upload-product/{productId}
    /// Upload ảnh và gắn vào sản phẩm.
    /// </summary>
    [HttpPost("upload-product/{productId}")]
    public async Task<IActionResult> UploadProductImage(int productId, IFormFile image)
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
            return BadRequest(new ApiResponse<object> { Message = "Định dạng ảnh không hợp lệ." });

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        var relativePath = $"uploads/products/{fileName}";

        return Ok(new ApiResponse<object>
        {
            Message = "Cập nhật ảnh sản phẩm thành công!",
            Data = new
            {
                file_path = relativePath,
                image_url = $"/{relativePath}",
            }
        });
    }

    /// <summary>
    /// GET /api/v1/employee/oracle-cloud/files
    /// Liệt kê file trong thư mục.
    /// </summary>
    [HttpGet("files")]
    public IActionResult ListFiles([FromQuery] string? prefix, [FromQuery] int max = 50)
    {
        if (!CheckRole(GetEmployeeRole()))
            return Forbid();

        var searchDir = string.IsNullOrEmpty(prefix)
            ? Path.Combine(_env.WebRootPath, "uploads")
            : Path.Combine(_env.WebRootPath, "uploads", prefix);

        if (!Directory.Exists(searchDir))
            return Ok(new { files = Array.Empty<object>(), total = 0, prefix = prefix ?? "" });

        var files = Directory.GetFiles(searchDir, "*", SearchOption.TopDirectoryOnly)
            .Take(Math.Min(max, 200))
            .Select(f =>
            {
                var relativePath = Path.GetRelativePath(_env.WebRootPath, f).Replace('\\', '/');
                return new
                {
                    path = relativePath,
                    url = $"/{relativePath}",
                };
            })
            .ToList();

        return Ok(new
        {
            files,
            total = files.Count,
            prefix = prefix ?? "",
        });
    }

    /// <summary>
    /// DELETE /api/v1/employee/oracle-cloud/image
    /// Xoá file theo đường dẫn.
    /// </summary>
    [HttpDelete("image")]
    public IActionResult DeleteImage([FromQuery] string path)
    {
        var role = GetEmployeeRole();
        if (role != "admin" && role != "quanly")
            return Forbid();

        if (string.IsNullOrEmpty(path))
            return BadRequest(new ApiResponse<object> { Message = "Thiếu tham số đường dẫn ảnh." });

        var filePath = Path.Combine(_env.WebRootPath, path);
        if (!System.IO.File.Exists(filePath))
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy ảnh để xoá." });

        System.IO.File.Delete(filePath);

        return Ok(new ApiResponse<object> { Message = "Xoá ảnh thành công!" });
    }
}