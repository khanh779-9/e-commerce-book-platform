namespace ECommerceBookPlatform.Services.Interfaces;

public interface IShippingService
{
    Task<ShippingCalculationResult> CalculateAsync(int provinceId, int districtId, decimal totalWeight, decimal orderValue, CancellationToken ct = default);
    Task<List<ShippingZone>> GetZonesAsync(CancellationToken ct = default);
    Task<List<ShippingDistrict>> GetDistrictsAsync(int provinceId, CancellationToken ct = default);
}

public class ShippingCalculationResult
{
    public decimal ShippingFee { get; set; }
    public bool IsFreeShipping { get; set; }
    public decimal FreeShippingThreshold { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int EstimatedDays { get; set; }
    public string? Note { get; set; }
}

public class ShippingZone
{
    public int ProvinceId { get; set; }
    public string ProvinceName { get; set; } = string.Empty;
    public decimal BaseFee { get; set; }
    public decimal PerKgFee { get; set; }
    public int EstimatedDays { get; set; }
}

public class ShippingDistrict
{
    public int DistrictId { get; set; }
    public string DistrictName { get; set; } = string.Empty;
    public int ProvinceId { get; set; }
    public decimal AdditionalFee { get; set; }
}