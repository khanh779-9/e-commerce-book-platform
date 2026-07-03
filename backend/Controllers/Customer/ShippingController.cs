using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/shipping")]
public class ShippingController : ControllerBase
{
    private readonly IShippingService _shippingService;

    public ShippingController(IShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromBody] CalculateShippingRequest request)
    {
        try
        {
            var result = await _shippingService.CalculateAsync(request.ProvinceId, request.DistrictId, request.TotalWeight, request.OrderValue);
            return Ok(new ApiResponse<ShippingCalculationResult> { Message = "OK", Data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpGet("zones")]
    public async Task<IActionResult> GetZones()
    {
        var zones = await _shippingService.GetZonesAsync();
        return Ok(new ApiResponse<List<ShippingZone>> { Message = "OK", Data = zones });
    }

    [HttpGet("zones/{provinceId}/districts")]
    public async Task<IActionResult> GetDistricts(int provinceId)
    {
        var districts = await _shippingService.GetDistrictsAsync(provinceId);
        return Ok(new ApiResponse<List<ShippingDistrict>> { Message = "OK", Data = districts });
    }
}

public class CalculateShippingRequest
{
    public int ProvinceId { get; set; }
    public int DistrictId { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal OrderValue { get; set; }
}