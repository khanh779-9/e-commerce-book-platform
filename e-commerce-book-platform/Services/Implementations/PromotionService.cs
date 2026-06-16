using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Services.Implementations;

public class PromotionService : IPromotionService
{
    private readonly AppDbContext _db;

    public PromotionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PromotionResponse> CreatePromotionAsync(CreatePromotionRequest request)
    {
        var promotion = new Promotion
        {
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
        };

        _db.Promotions.Add(promotion);
        await _db.SaveChangesAsync();

        if (request.Details != null)
        {
            foreach (var detail in request.Details)
            {
                _db.PromotionDetails.Add(new PromotionDetail
                {
                    PromotionId = promotion.PromotionId,
                    ProductId = detail.ProductId,
                    Quantity = detail.Quantity,
                    DiscountPercent = detail.DiscountPercent,
                });
            }
            await _db.SaveChangesAsync();
        }

        return (await GetPromotionDetailAsync(promotion.PromotionId))!;
    }

    public async Task<PromotionResponse> UpdatePromotionAsync(int id, CreatePromotionRequest request)
    {
        var promotion = await _db.Promotions.FindAsync(id)
            ?? throw new KeyNotFoundException("Không tìm thấy khuyến mãi.");

        promotion.Name = request.Name;
        promotion.StartDate = request.StartDate;
        promotion.EndDate = request.EndDate;
        await _db.SaveChangesAsync();

        return (await GetPromotionDetailAsync(id))!;
    }

    public async Task DeletePromotionAsync(int id)
    {
        var promotion = await _db.Promotions
            .Include(p => p.Details)
            .FirstOrDefaultAsync(p => p.PromotionId == id)
            ?? throw new KeyNotFoundException("Không tìm thấy khuyến mãi.");

        _db.PromotionDetails.RemoveRange(promotion.Details);
        _db.Promotions.Remove(promotion);
        await _db.SaveChangesAsync();
    }

    public async Task<PromotionDetailResponse> AddDetailAsync(int promotionId, AddPromotionDetailRequest request)
    {
        if (!await _db.Promotions.AnyAsync(p => p.PromotionId == promotionId))
            throw new KeyNotFoundException("Không tìm thấy khuyến mãi.");

        var detail = new PromotionDetail
        {
            PromotionId = promotionId,
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            DiscountPercent = request.DiscountPercent,
        };

        _db.PromotionDetails.Add(detail);
        await _db.SaveChangesAsync();

        return new PromotionDetailResponse
        {
            DetailId = detail.DetailId,
            ProductId = detail.ProductId,
            DiscountPercent = detail.DiscountPercent,
            Quantity = detail.Quantity,
        };
    }

    public async Task RemoveDetailAsync(int detailId)
    {
        var detail = await _db.PromotionDetails.FindAsync(detailId)
            ?? throw new KeyNotFoundException("Không tìm thấy chi tiết khuyến mãi.");
        _db.PromotionDetails.Remove(detail);
        await _db.SaveChangesAsync();
    }

    public async Task<PaginatedResponse<PromotionResponse>> GetAllPromotionsAsync(int page = 1, int pageSize = 15)
    {
        var query = _db.Promotions
            .Include(p => p.Details).ThenInclude(d => d.Product)
            .OrderByDescending(p => p.PromotionId);

        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PaginatedResponse<PromotionResponse>
        {
            Items = items.Select(p => new PromotionResponse
            {
                PromotionId = p.PromotionId,
                Name = p.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Details = p.Details.Select(d => new PromotionDetailResponse
                {
                    DetailId = d.DetailId,
                    ProductId = d.ProductId,
                    ProductName = d.Product?.DisplayName,
                    Quantity = d.Quantity,
                    DiscountPercent = d.DiscountPercent,
                }).ToList()
            }).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PromotionResponse?> GetPromotionDetailAsync(int id)
    {
        return await _db.Promotions
            .Include(p => p.Details).ThenInclude(d => d.Product)
            .Where(p => p.PromotionId == id)
            .Select(p => new PromotionResponse
            {
                PromotionId = p.PromotionId,
                Name = p.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Details = p.Details.Select(d => new PromotionDetailResponse
                {
                    DetailId = d.DetailId,
                    ProductId = d.ProductId,
                    ProductName = d.Product!.DisplayName,
                    Quantity = d.Quantity,
                    DiscountPercent = d.DiscountPercent,
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }
}