using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public RefreshTokenService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<string> GenerateRefreshTokenAsync(int userId, string userType, TimeSpan? expiry = null, string? ipAddress = null, string? userAgent = null)
    {
        var tokenBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");

        var expiresAt = DateTime.UtcNow.Add(expiry ?? TimeSpan.FromDays(30));
        
        var refreshToken = new RefreshToken
        {
            Name = $"refresh_token_{userType}_{userId}",
            Token = token,
            TokenableId = userId,
            TokenableType = userType == "customer" ? "App\\Models\\Customer" : "App\\Models\\Employee",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return token;
    }

    public async Task<bool> ValidateRefreshTokenAsync(string token, int userId, string userType)
    {
        var tokenableType = userType == "customer" ? "App\\Models\\Customer" : "App\\Models\\Employee";
        
        var refreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token 
                && rt.TokenableId == userId 
                && rt.TokenableType == tokenableType
                && rt.ExpiresAt > DateTime.UtcNow);

        return refreshToken != null;
    }

    public async Task RevokeRefreshTokenAsync(string token)
    {
        var refreshToken = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
        if (refreshToken != null)
        {
            refreshToken.ExpiresAt = DateTime.UtcNow;
            refreshToken.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task RevokeAllUserTokensAsync(int userId, string userType)
    {
        var tokenableType = userType == "customer" ? "App\\Models\\Customer" : "App\\Models\\Employee";
        
        var tokens = await _db.RefreshTokens
            .Where(rt => rt.TokenableId == userId 
                && rt.TokenableType == tokenableType
                && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.ExpiresAt = DateTime.UtcNow;
            token.UpdatedAt = DateTime.UtcNow;
        }

        if (tokens.Count > 0)
            await _db.SaveChangesAsync();
    }

    public async Task<bool> RotateRefreshTokenAsync(string oldToken, string newToken, int userId, string userType)
    {
        var tokenableType = userType == "customer" ? "App\\Models\\Customer" : "App\\Models\\Employee";
        
        var oldRefreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == oldToken 
                && rt.TokenableId == userId 
                && rt.TokenableType == tokenableType
                && rt.ExpiresAt > DateTime.UtcNow);

        if (oldRefreshToken == null)
            return false;

        // Revoke old token
        oldRefreshToken.ExpiresAt = DateTime.UtcNow;
        oldRefreshToken.UpdatedAt = DateTime.UtcNow;

        // Create new token
        var expiresAt = DateTime.UtcNow.Add(TimeSpan.FromDays(30));
        var newRefreshToken = new RefreshToken
        {
            Name = $"refresh_token_{userType}_{userId}",
            Token = newToken,
            TokenableId = userId,
            TokenableType = tokenableType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        };

        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync();

        return true;
    }
}