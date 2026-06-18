namespace ECommerceBookPlatform.Services.Implementations;

public class SeaweedFSOptions
{
    public string MasterUrl { get; set; } = "";
    public string PublicUrl { get; set; } = "";
    public string Replication { get; set; } = "001";
    public int HttpTimeoutSeconds { get; set; } = 30;
    public bool UseHttps { get; set; } = true;
}