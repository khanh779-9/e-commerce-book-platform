using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace ECommerceBookPlatform.Services.Interfaces;

public interface IFileStorageService
{
    Task<FileUploadResult> UploadAsync(Stream stream, string fileName, string contentType, string? folder = null, CancellationToken ct = default);
    Task<bool> DeleteAsync(string fileId, CancellationToken ct = default);
    Task<Stream?> DownloadAsync(string fileId, CancellationToken ct = default);
    Task<FileMetadata?> GetMetadataAsync(string fileId, CancellationToken ct = default);
    Task<List<StoredFileInfo>> ListAsync(string? folder = null, int max = 100, CancellationToken ct = default);
    string GetPublicUrl(string fileId);
}

public record FileUploadResult(string FileId, string FileName, long Size, string Url, string StorageProvider);
public record FileMetadata(string FileId, string FileName, long Size, string ContentType, DateTime CreatedAt);
public record StoredFileInfo(string FileId, string FileName, long Size, string Url, DateTime CreatedAt);