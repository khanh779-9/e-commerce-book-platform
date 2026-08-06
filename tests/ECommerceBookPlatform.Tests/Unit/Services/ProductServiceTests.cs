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

public class ProductServiceTests
{
    private readonly Mock<AppDbContext> _dbMock;
    private readonly Mock<ICacheService> _cacheMock;
    private readonly Mock<ILogger<ProductService>> _loggerMock;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _dbMock = new Mock<AppDbContext>(MockBehavior.Default, new DbContextOptions<AppDbContext>());
        _cacheMock = new Mock<ICacheService>();
        _loggerMock = new Mock<ILogger<ProductService>>();
        _service = new ProductService(_dbMock.Object, _cacheMock.Object, _loggerMock.Object);
    }

    #region GetProductsAsync Tests

    [Fact]
    public async Task GetProductsAsync_CacheHit_ReturnsCachedDataWithoutQueryingDb()
    {
        // Arrange
        var request = TestData.CreateSearchRequest();
        var cachedResponse = TestData.CreatePaginatedResponse(
            items: new List<ProductResponse> { TestData.CreateProductResponse() },
            total: 1);

        _cacheMock.Setup(x => x.GetAsync<PaginatedResponse<ProductResponse>>(
                It.Is<string>(s => s.StartsWith("products:list:")),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedResponse);

        // Act
        var result = await _service.GetProductsAsync(request);

        // Assert
        result.Should().BeSameAs(cachedResponse);
        result.Items.Should().HaveCount(1);
        
        // Verify DB was NOT queried
        _dbMock.Verify(x => x.Products, Times.Never);
    }

    [Fact]
    public async Task GetProductsAsync_CacheMiss_QueriesDbAndCachesResult()
    {
        // Arrange
        var request = TestData.CreateSearchRequest();
        var products = new List<Product> { TestData.CreateProduct() };

        _cacheMock.Setup(x => x.GetAsync<PaginatedResponse<ProductResponse>>(
                It.Is<string>(s => s.StartsWith("products:list:")),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((PaginatedResponse<ProductResponse>?)null);

        SetupProductsQuery(products);

        // Act
        var result = await _service.GetProductsAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Total.Should().Be(1);

        // Verify cache was set
        _cacheMock.Verify(x => x.SetAsync(
                It.Is<string>(s => s.StartsWith("products:list:")),
                It.IsAny<PaginatedResponse<ProductResponse>>(),
                It.IsAny<TimeSpan?>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetProductsAsync_WithCustomerId_EnrichesWishlist()
    {
        // Arrange
        var request = TestData.CreateSearchRequest();
        var customerId = 42;
        var products = new List<Product> { TestData.CreateProduct(id: 1), TestData.CreateProduct(id: 2) };
        var wishlistedIds = new List<int> { 1 };

        _cacheMock.Setup(x => x.GetAsync<PaginatedResponse<ProductResponse>>(
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PaginatedResponse<ProductResponse>?)null);

        SetupProductsQuery(products);
        
        var wishlistMock = new Mock<DbSet<WishlistItem>>();
        wishlistMock.As<IQueryable<WishlistItem>>().Setup(m => m.Provider).Returns(wishlistedIds.Select(w => new WishlistItem { CustomerId = customerId, ProductId = w }).AsQueryable().Provider);
        wishlistMock.As<IQueryable<WishlistItem>>().Setup(m => m.Expression).Returns(wishlistedIds.Select(w => new WishlistItem { CustomerId = customerId, ProductId = w }).AsQueryable().Expression);
        wishlistMock.As<IQueryable<WishlistItem>>().Setup(m => m.ElementType).Returns(wishlistedIds.Select(w => new WishlistItem { CustomerId = customerId, ProductId = w }).AsQueryable().ElementType);
        wishlistMock.As<IQueryable<WishlistItem>>().Setup(m => m.GetEnumerator()).Returns(wishlistedIds.Select(w => new WishlistItem { CustomerId = customerId, ProductId = w }).AsQueryable().GetEnumerator());

        _dbMock.Setup(x => x.WishlistItems).Returns(wishlistMock.Object);

        // Act
        var result = await _service.GetProductsAsync(request, customerId);

        // Assert
        result.Items.Should().HaveCount(2);
        result.Items.First(i => i.ProductId == 1).IsWishlisted.Should().BeTrue();
        result.Items.First(i => i.ProductId == 2).IsWishlisted.Should().BeFalse();
    }

    #endregion

    #region GetProductDetailAsync Tests

    [Fact]
    public async Task GetProductDetailAsync_CacheHit_ReturnsCachedData()
    {
        // Arrange
        var productId = 1;
        var cachedResponse = TestData.CreateProductResponse(id: productId);

        _cacheMock.Setup(x => x.GetAsync<ProductResponse>(
                $"products:detail:{productId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedResponse);

        // Act
        var result = await _service.GetProductDetailAsync(productId);

        // Assert
        result.Should().BeSameAs(cachedResponse);
        _dbMock.Verify(x => x.Products, Times.Never);
    }

    [Fact]
    public async Task GetProductDetailAsync_CacheMiss_QueriesDbAndCachesResult()
    {
        // Arrange
        var productId = 1;
        var product = TestData.CreateProduct(id: productId);

        _cacheMock.Setup(x => x.GetAsync<ProductResponse>(
                $"products:detail:{productId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProductResponse?)null);

        SetupProductDetailQuery(product);

        // Act
        var result = await _service.GetProductDetailAsync(productId);

        // Assert
        result.Should().NotBeNull();
        result.ProductId.Should().Be(productId);

        _cacheMock.Verify(x => x.SetAsync(
                $"products:detail:{productId}",
                It.IsAny<ProductResponse>(),
                It.IsAny<TimeSpan?>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetProductDetailAsync_NotFound_ReturnsNull()
    {
        // Arrange
        var productId = 999;

        _cacheMock.Setup(x => x.GetAsync<ProductResponse>(
                $"products:detail:{productId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProductResponse?)null);

        SetupProductDetailQuery(null);

        // Act
        var result = await _service.GetProductDetailAsync(productId);

        // Assert
        result.Should().BeNull();
        _cacheMock.Verify(x => x.SetAsync(It.IsAny<string>(), It.IsAny<ProductResponse>(), It.IsAny<TimeSpan?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region CreateProductAsync Tests

    [Fact]
    public async Task CreateProductAsync_InvalidatesCache()
    {
        // Arrange
        var request = new CreateProductRequest
        {
            Name = "New Product",
            CategoryId = 1,
            Price = 150000,
            StockQuantity = 20,
            UnitId = 1,
            ProviderId = 1
        };

        var createdProduct = TestData.CreateProduct(id: 10, name: "New Product");

        _dbMock.Setup(x => x.Products.Add(It.IsAny<Product>())).Callback<Product>(p => p.ProductId = 10);
        _dbMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        _cacheMock.Setup(x => x.GetAsync<ProductResponse>(
                It.Is<string>(s => s.StartsWith("products:detail:")),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TestData.CreateProductResponse(id: 10));

        // Act
        var result = await _service.CreateProductAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Product");

        // Verify cache invalidation
        _cacheMock.Verify(x => x.RemoveByPatternAsync(
                "products:list:*",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region UpdateProductAsync Tests - CRITICAL for cache invalidation

    [Fact]
    public async Task UpdateProductAsync_InvalidatesDetailAndListCache()
    {
        // Arrange
        var productId = 1;
        var request = new UpdateProductRequest
        {
            Name = "Updated Name",
            Price = 120000
        };
        var existingProduct = TestData.CreateProduct(id: productId, name: "Old Name", price: 100000);

        _dbMock.Setup(x => x.Products
            .Include(It.IsAny<string>())
            .FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProduct);

        _dbMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        _cacheMock.Setup(x => x.GetAsync<ProductResponse>(
                $"products:detail:{productId}",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(TestData.CreateProductResponse(id: productId, name: "Updated Name"));

        // Act
        var result = await _service.UpdateProductAsync(productId, request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Updated Name");
        result.Price.Should().Be(120000);

        // CRITICAL: Verify detail cache was removed
        _cacheMock.Verify(x => x.RemoveAsync(
                $"products:detail:{productId}",
                It.IsAny<CancellationToken>()),
            Times.Once, "Detail cache must be invalidated on update");

        // CRITICAL: Verify list cache was invalidated
        _cacheMock.Verify(x => x.RemoveByPatternAsync(
                "products:list:*",
                It.IsAny<CancellationToken>()),
            Times.Once, "List cache must be invalidated on update");
    }

    [Fact]
    public async Task UpdateProductAsync_NotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var productId = 999;
        var request = new UpdateProductRequest { Name = "New Name" };

        _dbMock.Setup(x => x.Products
            .Include(It.IsAny<string>())
            .FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act & Assert
        await _service.Invoking(s => s.UpdateProductAsync(productId, request))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Không tìm thấy sản phẩm.");

        // Verify no cache invalidation attempted
        _cacheMock.Verify(x => x.RemoveAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        _cacheMock.Verify(x => x.RemoveByPatternAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region DeleteProductAsync Tests

    [Fact]
    public async Task DeleteProductAsync_InvalidatesCache()
    {
        // Arrange
        var productId = 1;
        var existingProduct = TestData.CreateProduct(id: productId);

        _dbMock.Setup(x => x.Products
            .Include(It.IsAny<string>())
            .FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingProduct);

        _dbMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        await _service.DeleteProductAsync(productId);

        // Assert
        _dbMock.Verify(x => x.Products.Remove(existingProduct), Times.Once);
        _dbMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);

        // Verify cache invalidation
        _cacheMock.Verify(x => x.RemoveAsync(
                $"products:detail:{productId}",
                It.IsAny<CancellationToken>()),
            Times.Once, "Detail cache must be invalidated on delete");

        _cacheMock.Verify(x => x.RemoveByPatternAsync(
                "products:list:*",
                It.IsAny<CancellationToken>()),
            Times.Once, "List cache must be invalidated on delete");
    }

    #endregion

    #region Helper Methods

    private void SetupProductsQuery(List<Product> products)
    {
        var queryable = products.AsQueryable();
        
        var mockProducts = new Mock<DbSet<Product>>();
        mockProducts.As<IQueryable<Product>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());

        // Setup Include chain
        mockProducts.Setup(m => m.Include(It.IsAny<string>())).Returns(mockProducts.Object);
        mockProducts.Setup(m => m.Include(It.IsAny<Expression<Func<Product, object>>>())).Returns((Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Product, object>)mockProducts.Object);
        
        // Setup Where, OrderBy, Skip, Take
        mockProducts.As<IQueryable<Product>>().Setup(m => m.Where(It.IsAny<Expression<Func<Product, bool>>>())).Returns(mockProducts.Object);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.OrderBy(It.IsAny<Expression<Func<Product, object>>>())).Returns((IOrderedQueryable<Product>)mockProducts.Object);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.OrderByDescending(It.IsAny<Expression<Func<Product, object>>>())).Returns((IOrderedQueryable<Product>)mockProducts.Object);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.Skip(It.IsAny<int>())).Returns(mockProducts.Object);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.Take(It.IsAny<int>())).Returns(mockProducts.Object);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.CountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(products.Count);
        mockProducts.As<IQueryable<Product>>().Setup(m => m.ToListAsync(It.IsAny<CancellationToken>())).ReturnsAsync(products);

        _dbMock.Setup(x => x.Products).Returns(mockProducts.Object);

        // Setup Reviews for stats
        var reviews = products.SelectMany(p => Enumerable.Range(1, 3).Select(i => new Review { ProductId = p.ProductId, Rating = 4 })).ToList();
        var mockReviews = new Mock<DbSet<Review>>();
        mockReviews.As<IQueryable<Review>>().Setup(m => m.Provider).Returns(reviews.AsQueryable().Provider);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.Expression).Returns(reviews.AsQueryable().Expression);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.ElementType).Returns(reviews.AsQueryable().ElementType);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.GetEnumerator()).Returns(reviews.AsQueryable().GetEnumerator());
        mockReviews.As<IQueryable<Review>>().Setup(m => m.Where(It.IsAny<Expression<Func<Review, bool>>>())).Returns(mockReviews.Object);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.GroupBy(It.IsAny<Expression<Func<Review, object>>>())).Returns((IQueryable<IGrouping<object, Review>>)reviews.GroupBy(r => r.ProductId).AsQueryable());

        _dbMock.Setup(x => x.Reviews).Returns(mockReviews.Object);
    }

    private void SetupProductDetailQuery(Product? product)
    {
        var mockProducts = new Mock<DbSet<Product>>();
        
        if (product != null)
        {
            var queryable = new List<Product> { product }.AsQueryable();
            mockProducts.As<IQueryable<Product>>().Setup(m => m.Provider).Returns(queryable.Provider);
            mockProducts.As<IQueryable<Product>>().Setup(m => m.Expression).Returns(queryable.Expression);
            mockProducts.As<IQueryable<Product>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            mockProducts.As<IQueryable<Product>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
            mockProducts.Setup(m => m.Include(It.IsAny<string>())).Returns(mockProducts.Object);
            mockProducts.Setup(m => m.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>())).ReturnsAsync(product);
        }
        else
        {
            mockProducts.Setup(m => m.Include(It.IsAny<string>())).Returns(mockProducts.Object);
            mockProducts.Setup(m => m.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>())).ReturnsAsync((Product?)null);
        }

        _dbMock.Setup(x => x.Products).Returns(mockProducts.Object);

        // Setup WishlistItems
        var mockWishlist = new Mock<DbSet<WishlistItem>>();
        mockWishlist.As<IQueryable<WishlistItem>>().Setup(m => m.Provider).Returns(Enumerable.Empty<WishlistItem>().AsQueryable().Provider);
        mockWishlist.As<IQueryable<WishlistItem>>().Setup(m => m.Expression).Returns(Enumerable.Empty<WishlistItem>().AsQueryable().Expression);
        mockWishlist.As<IQueryable<WishlistItem>>().Setup(m => m.ElementType).Returns(Enumerable.Empty<WishlistItem>().AsQueryable().ElementType);
        mockWishlist.As<IQueryable<WishlistItem>>().Setup(m => m.GetEnumerator()).Returns(Enumerable.Empty<WishlistItem>().AsQueryable().GetEnumerator());
        mockWishlist.Setup(m => m.AnyAsync(It.IsAny<Expression<Func<WishlistItem, bool>>>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);

        _dbMock.Setup(x => x.WishlistItems).Returns(mockWishlist.Object);

        // Setup Reviews
        var reviews = product != null ? new List<Review> { new() { ProductId = product.ProductId, Rating = 4 } } : new List<Review>();
        var mockReviews = new Mock<DbSet<Review>>();
        mockReviews.As<IQueryable<Review>>().Setup(m => m.Provider).Returns(reviews.AsQueryable().Provider);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.Expression).Returns(reviews.AsQueryable().Expression);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.ElementType).Returns(reviews.AsQueryable().ElementType);
        mockReviews.As<IQueryable<Review>>().Setup(m => m.GetEnumerator()).Returns(reviews.AsQueryable().GetEnumerator());
        mockReviews.Setup(m => m.AnyAsync(It.IsAny<CancellationToken>())).ReturnsAsync(reviews.Any());
        mockReviews.Setup(m => m.Average(It.IsAny<Expression<Func<Review, double>>>())).Returns(reviews.Any() ? reviews.Average(r => (double)r.Rating) : 0);
        mockReviews.Setup(m => m.Count()).Returns(reviews.Count);

        _dbMock.Setup(x => x.Reviews).Returns(mockReviews.Object);
    }

    #endregion
}