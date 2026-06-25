using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/wishlist")]
[Authorize(Roles = "customer")]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetWishlist([FromQuery] int page = 1)
    {
        var products = await _wishlistService.GetWishlistAsync(CustomerId, page);
        return Ok(products);
    }

    [HttpPost("toggle")]
    public async Task<IActionResult> Toggle([FromBody] WishlistToggleRequest request)
    {
        var result = await _wishlistService.ToggleAsync(CustomerId, request.ProductId);
        return Ok(result);
    }
}