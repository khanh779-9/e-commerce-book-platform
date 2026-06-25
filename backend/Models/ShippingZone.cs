namespace ECommerceBookPlatform.Models;

public class ShippingZone
{
    public int ProvinceId { get; set; }
    public string ProvinceName { get; set; } = string.Empty;
    public decimal BaseFee { get; set; }
    public decimal PerKgFee { get; set; }
    public int EstimatedDays { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ShippingDistrict> Districts { get; set; } = new List<ShippingDistrict>();
}

public class ShippingDistrict
{
    public int DistrictId { get; set; }
    public int ProvinceId { get; set; }
    public string DistrictName { get; set; } = string.Empty;
    public decimal AdditionalFee { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ShippingZone? Province { get; set; }
}