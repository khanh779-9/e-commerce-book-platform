using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Implementations;
using ECommerceBookPlatform.Services.Interfaces;
using ECommerceBookPlatform.Tests.Fixtures;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ECommerceBookPlatform.Tests.Unit.Services;

public class PromotionServiceTests
{
    private readonly Mock<AppDbContext> _dbMock;
    private readonly Mock<ICacheService> _cacheMock;
    private readonly Mock<ILogger<PromotionService>> _loggerMock;
    private readonly PromotionService _service;

    public PromotionServiceTests()
    {
        _dbMock = new Mock<AppDbContext>(MockBehavior.Default, new DbContextOptions<AppDbContext>());
        _cacheMock = new Mock<ICacheService>();
        _loggerMock = new Mock<ILogger<PromotionService>>();
        _service = new PromotionService(_dbMock.Object, _cacheMock.Object, _loggerMock.Object);
    }

    #region GetAllPromotionsAsync Tests

    [Fact]
    public async Task GetAllPromotionsAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var page = 1;
        var pageSize = 15;
        var cachedResponse = new PaginatedResponse<PromotionResponse>
        {
            Items = new List<PromotionResponse> { CreatePromotionResponse(1) },
            Total = 1,
            Page = page,
            PageSize = pageSize
        };

        _cacheMock.Setup(x => x.GetAsync<PaginatedResponse<PromotionResponse>>(
                $"promotions:list:p:{page}:l:{pageSize}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedResponse);

        // Act
        var result = await _service.GetAllPromotionsAsync(page, pageSize);

        // Assert
        result.Should().BeSameAs(cachedResponse);
        _dbMock.Verify(x => x.Promotions, Times.Never);
    }

    [Fact]
    public async Task GetAllPromotionsAsync_CacheMiss_QueriesDbAndCachesResult()
    {
        // Arrange
        var page = 1;
        var pageSize = 15;
        var promotions = new List<Promotion> { CreatePromotion(1) };

        _cacheMock.Setup(x => x.GetAsync<PaginatedResponse<PromotionResponse>>(
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PaginatedResponse<PromotionResponse>?)null);

        SetupPromotionsQuery(promotions);

        // Act
        var result = await _service.GetAllPromotionsAsync(page, pageSize);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Total.Should().Be(1);

        _cacheMock.Verify(x => x.SetAsync(
                It.Is<string>(s => s.StartsWith("promotions:list:")),
                It.IsAny<PaginatedResponse<PromotionResponse>>(),
                It.IsAny<TimeSpan?>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region GetPromotionDetailAsync Tests

    [Fact]
    public async Task GetPromotionDetailAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var promotionId = 1;
        var cachedResponse = CreatePromotionResponse(promotionId);

        _cacheMock.Setup(x => x.GetAsync<PromotionResponse>(
                $"promotions:detail:{promotionId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedResponse);

        // Act
        var result = await _service.GetPromotionDetailAsync(promotionId);

        // Assert
        result.Should().BeSameAs(cachedResponse);
        _dbMock.Verify(x => x.Promotions, Times.Never);
    }

    [Fact]
    public async Task GetPromotionDetailAsync_CacheMiss_QueriesDbAndCachesResult()
    {
        // Arrange
        var promotionId = 1;
        var promotion = CreatePromotion(promotionId);

        _cacheMock.Setup(x => x.GetAsync<PromotionResponse>(
                $"promotions:detail:{promotionId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((PromotionResponse?)null);

        SetupPromotionDetailQuery(promotion);

        // Act
        var result = await _service.GetPromotionDetailAsync(promotionId);

        // Assert
        result.Should().NotBeNull();
        result.PromotionId.Should().Be(promotionId);

        _cacheMock.Verify(x => x.SetAsync(
                $"promotions:detail:{promotionId}",
                It.IsAny<PromotionResponse>(),
                It.IsAny<TimeSpan?>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region CreatePromotionAsync Tests

    [Fact]
    public async Task CreatePromotionAsync_InvalidatesCache()
    {
        // Arrange
        var request = new CreatePromotionRequest
        {
            Name = "New Promotion",
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        var createdPromotion = CreatePromotion(10);

        _dbMock.Setup(x => x.Promotions.Add(It.IsAny<Promotion>())).Callback<Promotion>(p => p.PromotionId = 10);
        _dbMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        _cacheMock.Setup(x => x.GetAsync<PromotionResponse>(
                It.Is<string>(s => s.StartsWith("promotions:detail:")),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(CreatePromotionResponse(10));

        // Act
        var result = await _service.CreatePromotionAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Promotion");

        _cacheMock.Verify(x => x.RemoveByPatternAsync(
                "promotions:list:*",
                It.IsAny<CancellationToken>()),
            Times.Once, "List cache must be invalidated on create");
    }

    #endregion

    #region UpdatePromotionAsync Tests

    [Fact]
    public async Task UpdatePromotionAsync_InvalidatesCache()
    {
        // Arrange
        var promotionId = 1;
        var request = new CreatePromotionRequest
        {
            Name = "Updated Promotion",
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        var existingPromotion = CreatePromotion(promotionId);

        _dbMock.Setup(x => x.Promotions.FindAsync(promotionId)).ReturnsAsync(existingPromotion);
        _dbMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        _cacheMock.Setup(x => x.GetAsync<PromotionResponse>(
                $"promotions:detail:{promotionId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(CreatePromotionResponse(promotionId));

        // Act
        var result = await _service.UpdatePromotionAsync(promotionId, request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Promotion");

        _cacheMock.Verify(x => x.RemoveAsync(
                $"promotions:detail:{promotionId}",
                It.IsAny<CancellationToken>()),
            Times.Once, "Detail cache must be invalidated on update");

        _cacheMock.Verify(x => x.RemoveByPatternAsync(
                "promotions:list:*",
                It.IsAny<CancellationToken>()),
            Times.Once, "List cache must be invalidated on update");
    }

    #endregion

    #region DeletePromotionAsync Tests

    [Fact]
    public async Task DeletePromotionAsync_InvalidatesCache()
    {
        // Arrange
        var promotionId = 1;
        var existingPromotion = CreatePromotion(promotionId);

        _dbMock.Setup(x => x.Promotions
            .Include(It.IsAny<string>())
            .FirstOrDefaultAsync(It.IsAny<Expression<Func<Promotion, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPromotion);

        _dbMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _service.DeletePromotionAsync(promotionId);

        // Assert
        _dbMock.Verify(x => x.Promotions.Remove(existingPromotion), Times.Once);

        _cacheMock.Verify(x => x.RemoveAsync(
                $"promotions:detail:{promotionId}",
                It.IsAny<CancellationToken>()),
            Times.Once);

        _cacheMock.Verify(x => x.RemoveByPatternAsync(
                "promotions:list:*",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region Helper Methods

    private Promotion CreatePromotion(int id, string name = "Test Promotion")
    {
        return new Promotion
        {
            PromotionId = id,
            Name = name,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30),
            IsActive = true,
            Details = new List<PromotionDetail>
            {
                new() { DetailId = 1, PromotionId = id, ProductId = 1, DiscountPercent = 10, Quantity = 100 }
            }
        };
    }

    private PromotionResponse CreatePromotionResponse(int id, string name = "Test Promotion")
    {
        return new PromotionResponse
        {
            PromotionId = id,
            Name = name,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30),
            Details = new List<PromotionDetailResponse>
            {
                new() { DetailId = 1, ProductId = 1, DiscountPercent = 10, Quantity = 100 }
            }
        };
    }

    private void SetupPromotionsQuery(List<Promotion> promotions)
    {
        var queryable = promotions.AsQueryable();
        var mockPromotions = new Mock<DbSet<Promotion>>();
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        mockPromotions.Setup(m => m.Include(It.IsAny<string>())).Returns(mockPromotions.Object);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.OrderByDescending(It.IsAny<Expression<Func<Promotion, object>>>())).Returns((IOrderedQueryable<Promotion>)mockPromotions.Object);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.Skip(It.IsAny<int>())).Returns(mockPromotions.Object);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.Take(It.IsAny<int>())).Returns(mockPromotions.Object);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.CountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(promotions.Count);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.ToListAsync(It.IsAny<CancellationToken>())).ReturnsAsync(promotions);

        _dbMock.Setup(x => x.Promotions).Returns(mockPromotions.Object);
    }

    private void SetupPromotionDetailQuery(Promotion promotion)
    {
        var mockPromotions = new Mock<DbSet<Promotion>>();
        var queryable = new List<Promotion> { promotion }.AsQueryable();
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockPromotions.As<IQueryable<Promotion>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        mockPromotions.Setup(m => m.Include(It.IsAny<string>())).Returns(mockPromotions.Object);
        mockPromotions.Setup(m => m.Where(It.IsAny<Expression<Func<Promotion, bool>>>())).Returns(mockPromotions.Object);
        
        // Create the projected queryable
        var projectedQueryable = queryable.Select(p => new PromotionResponse
        {
            PromotionId = p.PromotionId,
            Name = p.Name,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Details = p.Details.Select(d => new PromotionDetailResponse
            {
                DetailId = d.DetailId,
                ProductId = d.ProductId,
                DiscountPercent = d.DiscountPercent,
                Quantity = d.Quantity
            }).ToList()
        }).AsQueryable();
        
        mockPromotions.Setup(m => m.Select(It.IsAny<Expression<Func<Promotion, PromotionResponse>>>())).Returns(projectedQueryable);
        
        // Setup FirstOrDefaultAsync on the projected queryable
        var mockProjected = new Mock<IQueryable<PromotionResponse>>();
        mockProjected.As<IQueryable<PromotionResponse>>().Setup(m => m.Provider).Returns(projectedQueryable.Provider);
        mockProjected.As<IQueryable<PromotionResponse>>().Setup(m => m.Expression).Returns(projectedQueryable.Expression);
        mockProjected.As<IQueryable<PromotionResponse>>().Setup(m => m.ElementType).Returns(projectedQueryable.ElementType);
        mockProjected.As<IQueryable<PromotionResponse>>().Setup(m => m.GetEnumerator()).Returns(projectedQueryable.GetEnumerator());
        mockProjected.Setup(m => m.FirstOrDefaultAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            new PromotionResponse
            {
                PromotionId = promotion.PromotionId,
                Name = promotion.Name,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                Details = promotion.Details.Select(d => new PromotionDetailResponse
                {
                    DetailId = d.DetailId,
                    ProductId = d.ProductId,
                    DiscountPercent = d.DiscountPercent,
                    Quantity = d.Quantity
                }).ToList()
            });

        // We can't easily mock the Select to return a mock, so let's just setup the Promotions DbSet to return the promotion directly
        // The service will use FirstOrDefaultAsync on the DbSet after Select
        mockPromotions.Setup(m => m.FirstOrDefaultAsync(It.IsAny<Expression<Func<Promotion, bool>>>(), It.IsAny<CancellationToken>())).ReturnsAsync(promotion);

        _dbMock.Setup(x => x.Promotions).Returns(mockPromotions.Object);
    }

    #endregion
}