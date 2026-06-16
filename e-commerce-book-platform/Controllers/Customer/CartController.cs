using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/cart")]
[Authorize(Roles = "customer")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _cartService.GetCartAsync(CustomerId);
        return Ok(cart);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] CartAddRequest request)
    {
        try
        {
            var cart = await _cartService.AddItemAsync(CustomerId, request.ProductId, request.Quantity);
            return Ok(new ApiResponse<CartResponse> { Message = "Đã thêm vào giỏ hàng.", Data = cart });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpPatch("{productId}")]
    public async Task<IActionResult> UpdateCart(int productId, [FromBody] CartUpdateRequest request)
    {
        try
        {
            await _cartService.UpdateItemAsync(CustomerId, productId, request.Quantity);
            return Ok(new ApiResponse<object> { Message = "Đã cập nhật giỏ hàng." });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromCart(int productId)
    {
        await _cartService.RemoveItemAsync(CustomerId, productId);
        return Ok(new ApiResponse<object> { Message = "Đã xóa sản phẩm." });
    }

    [HttpPost("merge")]
    public async Task<IActionResult> MergeCart([FromBody] CartMergeRequest request)
    {
        try
        {
            var cart = await _cartService.MergeCartAsync(CustomerId, request.Items);
            return Ok(new ApiResponse<CartResponse> { Message = "Đã hợp nhất giỏ hàng.", Data = cart });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object> { Message = ex.Message });
        }
    }
}