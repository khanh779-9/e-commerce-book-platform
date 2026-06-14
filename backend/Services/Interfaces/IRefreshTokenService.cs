namespace ECommerceBookPlatform.Services.Interfaces;

public interface IRefreshTokenService
{
    Task<string> GenerateRefreshTokenAsync(int userId, string userType, TimeSpan? expiry = null, string? ipAddress = null, string? userAgent = null);
    Task<bool> ValidateRefreshTokenAsync(string token, int userId, string userType);
    Task RevokeRefreshTokenAsync(string token);
    Task RevokeAllUserTokensAsync(int userId, string userType);
    Task<bool> RotateRefreshTokenAsync(string oldToken, string newToken, int userId, string userType);
}