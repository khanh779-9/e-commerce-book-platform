using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class ShippingService : IShippingService
{
    private readonly AppDbContext _db;
    private readonly ISettingService _settingService;

    public ShippingService(AppDbContext db, ISettingService settingService)
    {
        _db = db;
        _settingService = settingService;
    }

    public async Task<ShippingCalculationResult> CalculateAsync(int provinceId, int districtId, decimal totalWeight, decimal orderValue, CancellationToken ct = default)
    {
        var freeThreshold = await _settingService.GetAsync("shipping:free_threshold", 500000m, ct);
        var baseFee = await _settingService.GetAsync("shipping:base_fee", 30000m, ct);

        var zone = await _db.ShippingZones
            .AsNoTracking()
            .FirstOrDefaultAsync(z => z.ProvinceId == provinceId && z.IsActive, ct);

        if (zone == null)
        {
            // Default shipping for unknown provinces
            return new ShippingCalculationResult
            {
                ShippingFee = baseFee,
                IsFreeShipping = orderValue >= freeThreshold,
                FreeShippingThreshold = freeThreshold,
                ZoneName = "Khác",
                EstimatedDays = 5,
                Note = "Khu vực chưa được hỗ trợ chính thức"
            };
        }

        var district = await _db.ShippingDistricts
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DistrictId == districtId && d.ProvinceId == provinceId && d.IsActive, ct);

        var weight = Math.Max(totalWeight, 0.5m); // Minimum 0.5kg
        var shippingFee = zone.BaseFee + (weight * zone.PerKgFee);
        
        if (district != null)
        {
            shippingFee += district.AdditionalFee;
        }

        var isFree = orderValue >= freeThreshold;
        
        return new ShippingCalculationResult
        {
            ShippingFee = isFree ? 0 : shippingFee,
            IsFreeShipping = isFree,
            FreeShippingThreshold = freeThreshold,
            ZoneName = zone.ProvinceName,
            EstimatedDays = zone.EstimatedDays,
            Note = isFree ? "Miễn phí vận chuyển cho đơn từ " + freeThreshold.ToString("N0") + "đ" : null
        };
    }

    public async Task<List<Services.Interfaces.ShippingZone>> GetZonesAsync(CancellationToken ct = default)
    {
        return await _db.ShippingZones
            .AsNoTracking()
            .Where(z => z.IsActive)
            .OrderBy(z => z.ProvinceName)
            .Select(z => new Services.Interfaces.ShippingZone
            {
                ProvinceId = z.ProvinceId,
                ProvinceName = z.ProvinceName,
                BaseFee = z.BaseFee,
                PerKgFee = z.PerKgFee,
                EstimatedDays = z.EstimatedDays
            })
            .ToListAsync(ct);
    }

    public async Task<List<Services.Interfaces.ShippingDistrict>> GetDistrictsAsync(int provinceId, CancellationToken ct = default)
    {
        return await _db.ShippingDistricts
            .AsNoTracking()
            .Where(d => d.ProvinceId == provinceId && d.IsActive)
            .OrderBy(d => d.DistrictName)
            .Select(d => new Services.Interfaces.ShippingDistrict
            {
                DistrictId = d.DistrictId,
                DistrictName = d.DistrictName,
                ProvinceId = d.ProvinceId,
                AdditionalFee = d.AdditionalFee
            })
            .ToListAsync(ct);
    }
}