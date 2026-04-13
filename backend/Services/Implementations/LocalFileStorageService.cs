using System.Text.Json;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ECommerceBookPlatform.Services.Implementations;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootPath;
    private readonly string _publicBaseUrl;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IWebHostEnvironment env, IConfiguration config, ILogger<LocalFileStorageService> logger)
    {
        _rootPath = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        _publicBaseUrl = config["FileStorage:PublicBaseUrl"]?.TrimEnd('/') ?? "";
        _logger = logger;
        
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<FileUploadResult> UploadAsync(Stream stream, string fileName, string contentType, string? folder = null, CancellationToken ct = default)
    {
        try
        {
            var subDir = folder?.Trim('/') ?? "misc";
            var dir = Path.Combine(_rootPath, subDir);
            Directory.CreateDirectory(dir);

            var ext = Path.GetExtension(fileName);
            var storedName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(dir, storedName);

            using var fs = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, true);
            await stream.CopyToAsync(fs, ct);

            var relativePath = Path.Combine("uploads", subDir, storedName).Replace('\\', '/');
            var publicUrl = string.IsNullOrEmpty(_publicBaseUrl) 
                ? $"/{relativePath}" 
                : $"{_publicBaseUrl}/{relativePath}";

            _logger.LogInformation("Uploaded file locally: {Path} ({Size} bytes)", relativePath, stream.Length);

            return new FileUploadResult(storedName, fileName, stream.Length, publicUrl, "local");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Local file upload error for file: {FileName}", fileName);
            throw new InvalidOperationException($"Local file upload failed: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteAsync(string fileId, CancellationToken ct = default)
    {
        try
        {
            // Local storage doesn't track fileId -> path mapping
            // This would need a database index or filer
            _logger.LogWarning("DeleteAsync not fully supported for local storage without path tracking. FileId: {FileId}", fileId);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Local file delete error for file: {FileId}", fileId);
            return false;
        }
    }

    public async Task<Stream?> DownloadAsync(string fileId, CancellationToken ct = default)
    {
        try
        {
            // Search for file by name (fileId is the stored filename)
            var files = Directory.GetFiles(_rootPath, fileId, SearchOption.AllDirectories);
            if (files.Length == 0) return null;

            var filePath = files[0];
            return new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Local file download error for file: {FileId}", fileId);
            return null;
        }
    }

    public async Task<FileMetadata?> GetMetadataAsync(string fileId, CancellationToken ct = default)
    {
        try
        {
            var files = Directory.GetFiles(_rootPath, fileId, SearchOption.AllDirectories);
            if (files.Length == 0) return null;

            var filePath = files[0];
            var info = new FileInfo(filePath);
            var ext = info.Extension.ToLowerInvariant();
            var mime = GetMimeType(ext);

            return new FileMetadata(
                fileId,
                info.Name,
                info.Length,
                mime,
                info.CreationTimeUtc
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Local file metadata error for file: {FileId}", fileId);
            return null;
        }
    }

    public async Task<List<StoredFileInfo>> ListAsync(string? folder = null, int max = 100, CancellationToken ct = default)
    {
        try
        {
            var searchDir = string.IsNullOrEmpty(folder) ? _rootPath : Path.Combine(_rootPath, folder.Trim('/'));
            if (!Directory.Exists(searchDir)) return new List<StoredFileInfo>();

            var files = Directory.GetFiles(searchDir, "*", SearchOption.TopDirectoryOnly)
                .Take(max)
                .Select(f =>
                {
                    var info = new FileInfo(f);
                    var ext = info.Extension.ToLowerInvariant();
                    var relativePath = Path.GetRelativePath(_rootPath, f).Replace('\\', '/');
                    var publicUrl = string.IsNullOrEmpty(_publicBaseUrl) 
                        ? $"/uploads/{relativePath}" 
                        : $"{_publicBaseUrl}/uploads/{relativePath}";

                    return new StoredFileInfo(info.Name, info.Name, info.Length, publicUrl, info.CreationTimeUtc);
                })
                .ToList();

            return files;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Local file list error for folder: {Folder}", folder);
            return new List<StoredFileInfo>();
        }
    }

    public string GetPublicUrl(string fileId) => string.IsNullOrEmpty(_publicBaseUrl) 
        ? $"/uploads/{fileId}" 
        : $"{_publicBaseUrl}/uploads/{fileId}";

    private static string GetMimeType(string ext) => ext switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".gif" => "image/gif",
        ".pdf" => "application/pdf",
        _ => "application/octet-stream"
    };
}