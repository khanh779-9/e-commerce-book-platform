using AutoFixture;
using AutoFixture.Kernel;
using AutoFixture.Xunit2;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;

namespace ECommerceBookPlatform.Tests.Fixtures;

public class CustomAutoDataAttribute : AutoDataAttribute
{
    public CustomAutoDataAttribute() : base(() => new Fixture().Customize(new AutoFixtureCustomization()))
    {
    }
}

public class AutoFixtureCustomization : ICustomization
{
    public void Customize(IFixture fixture)
    {
        fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => fixture.Behaviors.Remove(b));
        fixture.Behaviors.Add(new OmitOnRecursionBehavior());

        fixture.Customize<Product>(c => c
            .Without(p => p.Category)
            .Without(p => p.Unit)
            .Without(p => p.Provider)
            .Without(p => p.Book)
            .Without(p => p.PromotionDetails)
            .Without(p => p.Reviews)
            .Without(p => p.CartItems)
            .Without(p => p.WishlistItems)
            );

        fixture.Customize<Category>(c => c
            .Without(c => c.Products)
            );

        fixture.Customize<Promotion>(c => c
            .Without(p => p.Details)
            );

        fixture.Customize<Customer>(c => c
            .Without(c => c.Orders)
            .Without(c => c.Cart)
            .Without(c => c.WishlistItems)
            .Without(c => c.Reviews)
            
            );

        fixture.Customize<Order>(c => c
            .Without(o => o.Customer)
            .Without(o => o.Employee)
            );
    }
}

public static class TestData
{
    public static Product CreateProduct(int id = 1, string name = "Test Product", decimal price = 100000, int stock = 10)
    {
        return new Product
        {
            ProductId = id,
            Name = name,
            Price = price,
            StockQuantity = stock,
            CategoryId = 1,
            UnitId = 1,
            ProviderId = 1,
            Description = "Test description",
            ImageUrl = "/uploads/products/test.jpg",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static ProductSearchRequest CreateSearchRequest(int page = 1, int limit = 10, string? query = null)
    {
        return new ProductSearchRequest
        {
            Page = page,
            Limit = limit,
            Q = query,
            InStockOnly = true
        };
    }

    public static PaginatedResponse<ProductResponse> CreatePaginatedResponse(List<ProductResponse>? items = null, int total = 1, int page = 1, int limit = 10)
    {
        return new PaginatedResponse<ProductResponse>
        {
            Items = items ?? new List<ProductResponse>(),
            Total = total,
            Page = page,
            PageSize = limit
        };
    }

    public static ProductResponse CreateProductResponse(int id = 1, string name = "Test Product")
    {
        return new ProductResponse
        {
            ProductId = id,
            Name = name,
            Price = 100000,
            PromoPrice = 90000,
            StockQuantity = 10,
            IsWishlisted = false,
            ImageUrl = "/uploads/products/test.jpg"
        };
    }
}