using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace ECommerceBookPlatform.Services.Implementations;

public class SeaweedFSStorageService : IFileStorageService
{
    private readonly HttpClient _http;
    private readonly SeaweedFSOptions _options;
    private readonly ILogger<SeaweedFSStorageService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public SeaweedFSStorageService(HttpClient http, IOptions<SeaweedFSOptions> options, ILogger<SeaweedFSStorageService> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    private string BuildStoragePath(string fileName, string? folder)
    {
        var projectName = ToSlug(_options.ProjectName);

        if (string.IsNullOrWhiteSpace(projectName))
            throw new InvalidOperationException("Invalid project name");

        var segments = new List<string>
    {
        "buckets",
        projectName
    };

        // Thêm các thư mục con
        if (!string.IsNullOrWhiteSpace(folder))
        {
            var folders = folder.Split(
                new[] { '/', '\\' },
                StringSplitOptions.RemoveEmptyEntries
            );

            foreach (var item in folders)
            {
                var segment = ToSlug(item);

                if (!string.IsNullOrWhiteSpace(segment))
                    segments.Add(segment);
            }
        }

        // Chỉ lấy tên file, không lấy đường dẫn từ máy người dùng
        var safeFileName = Path.GetFileName(
            fileName.Replace('\\', '/')
        );

        if (string.IsNullOrWhiteSpace(safeFileName) ||
            safeFileName is "." or "..")
        {
            throw new InvalidOperationException("Invalid file name");
        }

        segments.Add(Uri.EscapeDataString(safeFileName));

        return "/" + string.Join("/", segments);
    }

    private static string ToSlug(string value)
    {
        value = value
            .Replace("đ", "d", StringComparison.OrdinalIgnoreCase)
            .Normalize(NormalizationForm.FormD);

        var result = new System.Text.StringBuilder();

        foreach (var c in value)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c)
                == UnicodeCategory.NonSpacingMark)
                continue;

            var ch = char.ToLowerInvariant(c);

            if ((ch >= 'a' && ch <= 'z') ||
                (ch >= '0' && ch <= '9'))
            {
                result.Append(ch);
            }
            else if (result.Length > 0 && result[^1] != '_')
            {
                result.Append('_');
            }
        }

        return result.ToString().Trim('_');
    }

    public async Task<FileUploadResult> UploadAsync(Stream stream, string fileName, string contentType, string? folder = null, CancellationToken ct = default)
    {
        try
        {



            // 1. Assign file ID from master
            var assignUrl = $"{_options.MasterUrl.TrimEnd('/')}/dir/assign";
            var queryParams = new List<string>();
            if (string.IsNullOrEmpty(folder))
                return new FileUploadResult(null, fileName, stream.Length, null, "seaweedfs");

            var storagePath = BuildStoragePath(fileName, folder);

            queryParams.Add($"path=/{storagePath.Trim('/')}");
            queryParams.Add($"replication={_options.Replication}");
            if (queryParams.Count > 0)
                assignUrl += "?" + string.Join("&", queryParams);

            var assignResp = await _http.GetFromJsonAsync<AssignResponse>(assignUrl, JsonOptions, ct)
                ?? throw new InvalidOperationException("Failed to assign file ID from SeaweedFS master");

            if (string.IsNullOrEmpty(assignResp.Fid))
                throw new InvalidOperationException("SeaweedFS master returned empty file ID");

            // 2. Upload to volume server
            var scheme = _options.UseHttps ? "https://" : "http://";
            var volumeUrl = $"{scheme}{assignResp.Url.TrimEnd('/')}/{assignResp.Fid}";
            using var content = new MultipartFormDataContent();
            var streamContent = new StreamContent(stream);
            streamContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse(contentType);
            content.Add(streamContent, "file", fileName);

            var uploadResp = await _http.PostAsync(volumeUrl, content, ct);
            if (!uploadResp.IsSuccessStatusCode)
            {
                var error = await uploadResp.Content.ReadAsStringAsync(ct);
                _logger.LogError("SeaweedFS upload failed: {StatusCode} - {Error}", uploadResp.StatusCode, error);
                throw new InvalidOperationException($"SeaweedFS upload failed: {uploadResp.StatusCode}");
            }

            var fileId = assignResp.Fid;
            var publicUrl = GetPublicUrl(fileId);

            _logger.LogInformation("Uploaded file to SeaweedFS: {FileId} ({Size} bytes)", fileId, stream.Length);

            return new FileUploadResult(fileId, fileName, stream.Length, publicUrl, "seaweedfs");
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "SeaweedFS upload error for file: {FileName}", fileName);
            throw new InvalidOperationException($"SeaweedFS upload failed: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteAsync(string fileId, CancellationToken ct = default)
    {
        try
        {
            var deleteUrl = $"{_options.MasterUrl.TrimEnd('/')}/{fileId}";
            var resp = await _http.DeleteAsync(deleteUrl, ct);

            if (resp.IsSuccessStatusCode)
            {
                _logger.LogInformation("Deleted file from SeaweedFS: {FileId}", fileId);
                return true;
            }

            _logger.LogWarning("SeaweedFS delete failed for {FileId}: {StatusCode}", fileId, resp.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SeaweedFS delete error for file: {FileId}", fileId);
            return false;
        }
    }

    public async Task<Stream?> DownloadAsync(string fileId, CancellationToken ct = default)
    {
        try
        {
            var volumeUrl = await ResolveVolumeUrlAsync(fileId, ct);
            if (volumeUrl == null) return null;

            return await _http.GetStreamAsync(volumeUrl, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SeaweedFS download error for file: {FileId}", fileId);
            return null;
        }
    }

    public async Task<FileMetadata?> GetMetadataAsync(string fileId, CancellationToken ct = default)
    {
        try
        {
            var volumeUrl = await ResolveVolumeUrlAsync(fileId, ct);
            if (volumeUrl == null) return null;

            var resp = await _http.SendAsync(new HttpRequestMessage(HttpMethod.Head, volumeUrl), ct);
            if (!resp.IsSuccessStatusCode) return null;

            return new FileMetadata(
                fileId,
                resp.Content.Headers.ContentDisposition?.FileNameStar ?? fileId,
                resp.Content.Headers.ContentLength ?? 0,
                resp.Content.Headers.ContentType?.MediaType ?? "application/octet-stream",
                DateTime.UtcNow
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SeaweedFS metadata error for file: {FileId}", fileId);
            return null;
        }
    }

    public async Task<List<StoredFileInfo>> ListAsync(string? folder = null, int max = 100, CancellationToken ct = default)
    {
        // SeaweedFS doesn't have native folder listing via master API
        // Would need filer or separate index (DB/Redis)
        _logger.LogWarning("ListAsync not fully supported by SeaweedFS master API. Use Filer or maintain separate index.");
        return new List<StoredFileInfo>();
    }

    public string GetPublicUrl(string fileId) => $"{_options.PublicUrl.TrimEnd('/')}/{fileId}";

    private async Task<string?> ResolveVolumeUrlAsync(string fileId, CancellationToken ct)
    {
        try
        {
            var scheme = _options.UseHttps ? "https://" : "http://";
            var volumeId = GetVolumeId(fileId);
            var lookupUrl = $"{_options.MasterUrl.TrimEnd('/')}/dir/lookup?volumeId={volumeId}";
            var lookup = await _http.GetFromJsonAsync<LookupResponse>(lookupUrl, JsonOptions, ct);

            if (lookup?.Locations == null || lookup.Locations.Count == 0)
            {
                _logger.LogWarning("No volume locations found for file: {FileId}", fileId);
                return null;
            }

            return $"{scheme}{lookup.Locations[0].Url.TrimEnd('/')}/{fileId}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SeaweedFS lookup error for file: {FileId}", fileId);
            return null;
        }
    }

    private static int GetVolumeId(string fid)
    {
        var parts = fid.Split(',');
        return int.TryParse(parts[0], out var volId) ? volId : 0;
    }

    private record AssignResponse(string Fid, string Url, string? PublicUrl, int Count);
    private record LookupResponse(List<Location> Locations);
    private record Location(string Url, string? PublicUrl);
}