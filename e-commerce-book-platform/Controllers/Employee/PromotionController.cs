using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/promotions")]
[Authorize]
public class PromotionController : ControllerBase
{
    private readonly AppDbContext _db;

    public PromotionController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _db.Promotions.Include(p => p.Details).OrderByDescending(p => p.PromotionId);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PaginatedResponse<PromotionResponse>
        {
            Items = items.Select(MapPromotion).ToList(),
            Total = total, Page = page, PageSize = limit
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var promotion = await _db.Promotions.Include(p => p.Details).ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(p => p.PromotionId == id);
        if (promotion == null) return NotFound();

        return Ok(new ApiResponse<PromotionResponse> { Data = MapPromotion(promotion) });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePromotionRequest request)
    {
        var promotion = new Promotion
        {
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
        };
        _db.Promotions.Add(promotion);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<PromotionResponse>
        {
            Message = "Thêm khuyến mãi thành công!",
            Data = MapPromotion(promotion)
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePromotionRequest request)
    {
        var promotion = await _db.Promotions.FindAsync(id);
        if (promotion == null) return NotFound();

        promotion.Name = request.Name;
        promotion.StartDate = request.StartDate;
        promotion.EndDate = request.EndDate;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<PromotionResponse>
        {
            Message = "Cập nhật khuyến mãi thành công!",
            Data = MapPromotion(promotion)
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var promotion = await _db.Promotions.Include(p => p.Details).FirstOrDefaultAsync(p => p.PromotionId == id);
        if (promotion == null) return NotFound();

        _db.PromotionDetails.RemoveRange(promotion.Details);
        _db.Promotions.Remove(promotion);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa khuyến mãi thành công!" });
    }

    [HttpPost("{id}/details")]
    public async Task<IActionResult> AddDetail(int id, [FromBody] AddPromotionDetailRequest request)
    {
        var promotion = await _db.Promotions.FindAsync(id);
        if (promotion == null) return NotFound();

        var product = await _db.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound(new ApiResponse<object> { Message = "Sản phẩm không tồn tại!" });

        var detail = new PromotionDetail
        {
            PromotionId = id,
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            DiscountPercent = request.DiscountPercent,
        };
        _db.PromotionDetails.Add(detail);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<PromotionDetailResponse>
        {
            Message = "Thêm sản phẩm vào khuyến mãi thành công!",
            Data = new PromotionDetailResponse
            {
                DetailId = detail.DetailId,
                ProductId = detail.ProductId ?? 0,
                ProductName = product.Name,
                Quantity = detail.Quantity ?? 0,
                DiscountPercent = detail.DiscountPercent ?? 0,
            }
        });
    }

    [HttpDelete("{id}/details/{detailId}")]
    public async Task<IActionResult> RemoveDetail(int id, int detailId)
    {
        var detail = await _db.PromotionDetails.FirstOrDefaultAsync(d => d.DetailId == detailId && d.PromotionId == id);
        if (detail == null) return NotFound();

        _db.PromotionDetails.Remove(detail);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa sản phẩm khỏi khuyến mãi thành công!" });
    }

    private static PromotionResponse MapPromotion(Promotion p) => new()
    {
        PromotionId = p.PromotionId,
        Name = p.Name,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        Details = p.Details?.Select(d => new PromotionDetailResponse
        {
            DetailId = d.DetailId,
            ProductId = d.ProductId ?? 0,
            ProductName = d.Product?.Name ?? "",
            Quantity = d.Quantity ?? 0,
            DiscountPercent = d.DiscountPercent ?? 0,
        }).ToList() ?? [],
    };
}