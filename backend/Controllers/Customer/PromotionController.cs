using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/promotions")]
[Authorize(Roles = "customer")]
public class PromotionController : ControllerBase
{
    private readonly IPromotionService _promotionService;

    public PromotionController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCode([FromBody] ValidatePromotionRequest request)
    {
        try
        {
            var result = await _promotionService.ValidateCodeAsync(request.Code, request.OrderValue, request.ProductIds);
            return Ok(new ApiResponse<PromotionValidationResult> { Message = result.Message, Data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }
}

public class ValidatePromotionRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderValue { get; set; }
    public List<int> ProductIds { get; set; } = new();
}