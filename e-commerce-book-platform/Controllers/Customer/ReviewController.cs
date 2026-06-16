using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1/products/{productId}/reviews")]
[Authorize(Roles = "customer")]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewController(AppDbContext db)
    {
        _db = db;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpPost]
    public async Task<IActionResult> SubmitReview(int productId, [FromBody] SubmitReviewRequest request)
    {
        // Check if purchased
        var hasPurchased = await _db.Orders
            .Where(o => o.CustomerId == CustomerId && o.Status != "da_huy")
            .Join(_db.OrderItems.Where(oi => oi.ProductId == productId),
                o => o.OrderId, oi => oi.OrderId, (o, oi) => o)
            .AnyAsync();

        if (!hasPurchased)
            return Forbid();

        // Check if already reviewed
        var alreadyReviewed = await _db.Reviews
            .AnyAsync(r => r.CustomerId == CustomerId && r.ProductId == productId);

        if (alreadyReviewed)
            return UnprocessableEntity(new ApiResponse<object> { Message = "Bạn đã đánh giá sản phẩm này rồi." });

        var review = new Review
        {
            CustomerId = CustomerId,
            ProductId = productId,
            Rating = request.Rating,
            Comment = request.Comment,
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        var customer = await _db.Customers.FindAsync(CustomerId);

        return Ok(new ApiResponse<ReviewResponse>
        {
            Message = "Cảm ơn bạn đã đánh giá!",
            Data = new ReviewResponse
            {
                ReviewId = review.ReviewId,
                CustomerId = review.CustomerId,
                CustomerName = customer?.FullName,
                ProductId = review.ProductId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            }
        });
    }
}