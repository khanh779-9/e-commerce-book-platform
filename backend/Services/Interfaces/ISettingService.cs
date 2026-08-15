namespace ECommerceBookPlatform.Services.Interfaces;

public interface ISettingService
{
    Task<T?> GetAsync<T>(string key, T? defaultValue = default, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, string? description = null, string group = "general", bool isPublic = false, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task<Dictionary<string, string>> GetPublicSettingsAsync(CancellationToken ct = default);
    Task<Dictionary<string, string>> GetSettingsByGroupAsync(string group, CancellationToken ct = default);
}