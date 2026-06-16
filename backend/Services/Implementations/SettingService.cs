using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class SettingService : ISettingService
{
    private readonly AppDbContext _db;
    private readonly ICacheService _cache;

    public SettingService(AppDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string key, T? defaultValue = default, CancellationToken ct = default)
    {
        var cacheKey = $"setting:{key}";
        var cached = await _cache.GetAsync<string>(cacheKey, ct);
        if (cached != null)
        {
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<T>(cached);
            }
            catch
            {
                // Fall through to DB
            }
        }

        var setting = await _db.Settings.AsNoTracking().FirstOrDefaultAsync(s => s.Key == key, ct);
        if (setting == null || setting.Value == null)
            return defaultValue;

        try
        {
            var value = System.Text.Json.JsonSerializer.Deserialize<T>(setting.Value);
            await _cache.SetAsync(cacheKey, setting.Value, TimeSpan.FromHours(1), ct);
            return value;
        }
        catch
        {
            return defaultValue;
        }
    }

    public async Task SetAsync<T>(string key, T value, string? description = null, string group = "general", bool isPublic = false, CancellationToken ct = default)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(value);
        
        var setting = await _db.Settings.FirstOrDefaultAsync(s => s.Key == key, ct);
        if (setting == null)
        {
            setting = new Setting { Key = key, Group = group };
            _db.Settings.Add(setting);
        }
        
        setting.Value = json;
        setting.Description = description;
        setting.Group = group;
        setting.IsPublic = isPublic;
        setting.UpdatedAt = DateTime.UtcNow;
        
        await _db.SaveChangesAsync();
        await _cache.RemoveAsync($"setting:{key}", ct);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        var setting = await _db.Settings.FirstOrDefaultAsync(s => s.Key == key, ct);
        if (setting != null)
        {
            _db.Settings.Remove(setting);
            await _db.SaveChangesAsync();
            await _cache.RemoveAsync($"setting:{key}", ct);
        }
    }

    public async Task<Dictionary<string, string>> GetPublicSettingsAsync(CancellationToken ct = default)
    {
        var cacheKey = "settings:public";
        var cached = await _cache.GetAsync<Dictionary<string, string>>(cacheKey, ct);
        if (cached != null) return cached;

        var settings = await _db.Settings
            .AsNoTracking()
            .Where(s => s.IsPublic)
            .ToDictionaryAsync(s => s.Key, s => s.Value ?? "", ct);

        await _cache.SetAsync(cacheKey, settings, TimeSpan.FromHours(1), ct);
        return settings;
    }

    public async Task<Dictionary<string, string>> GetSettingsByGroupAsync(string group, CancellationToken ct = default)
    {
        var cacheKey = $"settings:group:{group}";
        var cached = await _cache.GetAsync<Dictionary<string, string>>(cacheKey, ct);
        if (cached != null) return cached;

        var settings = await _db.Settings
            .AsNoTracking()
            .Where(s => s.Group == group)
            .ToDictionaryAsync(s => s.Key, s => s.Value ?? "", ct);

        await _cache.SetAsync(cacheKey, settings, TimeSpan.FromHours(1), ct);
        return settings;
    }
}