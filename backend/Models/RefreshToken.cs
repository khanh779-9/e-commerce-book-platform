namespace ECommerceBookPlatform.Models;

public class RefreshToken
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string? Abilities { get; set; }
    public long TokenableId { get; set; }
    public string TokenableType { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsRevoked => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
}