using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using ECommerceBookPlatform.Tests.Fixtures;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace ECommerceBookPlatform.Tests.Integration;

public class CacheInvalidationIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public CacheInvalidationIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Product_Update_InvalidatesCache_SubsequentGetReturnsNewData()
    {
        // Arrange - Create a product first
        var createRequest = new CreateProductRequest
        {
            Name = "Integration Test Product",
            CategoryId = 1,
            Price = 100000,
            StockQuantity = 10,
            UnitId = 1,
            ProviderId = 1
        };

        var createResponse = await _client.PostAsJsonAsync("/api/v1/employee/products", createRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var createdProduct = await createResponse.Content.ReadFromJsonAsync<ApiResponse<ProductResponse>>();
        createdProduct.Should().NotBeNull();
        createdProduct!.Data.Should().NotBeNull();
        var productId = createdProduct.Data.ProductId;

        // Act 1 - Get product (should populate cache)
        var getResponse1 = await _client.GetAsync($"/api/v1/employee/products/{productId}");
        getResponse1.StatusCode.Should().Be(HttpStatusCode.OK);
        var product1 = await getResponse1.Content.ReadFromJsonAsync<ApiResponse<ProductResponse>>();
        product1.Should().NotBeNull();
        product1!.Data.Should().NotBeNull();
        product1.Data.Name.Should().Be("Integration Test Product");

        // Act 2 - Update product
        var updateRequest = new UpdateProductRequest
        {
            Name = "Updated Integration Product",
            Price = 150000
        };

        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/employee/products/{productId}", updateRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act 3 - Get product again (should hit DB after cache invalidation)
        var getResponse2 = await _client.GetAsync($"/api/v1/employee/products/{productId}");
        getResponse2.StatusCode.Should().Be(HttpStatusCode.OK);
        var product2 = await getResponse2.Content.ReadFromJsonAsync<ApiResponse<ProductResponse>>();
        product2.Should().NotBeNull();
        product2!.Data.Should().NotBeNull();

        // Assert - Should return UPDATED data, not cached old data
        product2.Data.Name.Should().Be("Updated Integration Product");
        product2.Data.Price.Should().Be(150000);
    }

    [Fact]
    public async Task Product_Delete_InvalidatesCache_SubsequentListDoesNotContainDeleted()
    {
        // Arrange - Create a product
        var createRequest = new CreateProductRequest
        {
            Name = "Product To Delete",
            CategoryId = 1,
            Price = 50000,
            StockQuantity = 5,
            UnitId = 1,
            ProviderId = 1
        };

        var createResponse = await _client.PostAsJsonAsync("/api/v1/employee/products", createRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var createdProduct = await createResponse.Content.ReadFromJsonAsync<ApiResponse<ProductResponse>>();
        createdProduct.Should().NotBeNull();
        createdProduct!.Data.Should().NotBeNull();
        var productId = createdProduct.Data.ProductId;

        // Act 1 - List products (should include the new product)
        var listResponse1 = await _client.GetAsync("/api/v1/employee/products?page=1&limit=10");
        listResponse1.StatusCode.Should().Be(HttpStatusCode.OK);
        var list1 = await listResponse1.Content.ReadFromJsonAsync<PaginatedResponse<ProductResponse>>();
        list1.Should().NotBeNull();
        list1!.Items.Should().Contain(p => p.ProductId == productId);

        // Act 2 - Delete product
        var deleteResponse = await _client.DeleteAsync($"/api/v1/employee/products/{productId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act 3 - List products again (should NOT include deleted product)
        var listResponse2 = await _client.GetAsync("/api/v1/employee/products?page=1&limit=10");
        listResponse2.StatusCode.Should().Be(HttpStatusCode.OK);
        var list2 = await listResponse2.Content.ReadFromJsonAsync<PaginatedResponse<ProductResponse>>();
        list2.Should().NotBeNull();
        list2!.Items.Should().NotContain(p => p.ProductId == productId);
    }

    [Fact]
    public async Task Promotion_CRUD_InvalidatesCache()
    {
        // Arrange
        var createRequest = new CreatePromotionRequest
        {
            Name = "Integration Promo",
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        var createResponse = await _client.PostAsJsonAsync("/api/v1/employee/promotions", createRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var createdPromo = await createResponse.Content.ReadFromJsonAsync<ApiResponse<PromotionResponse>>();
        createdPromo.Should().NotBeNull();
        createdPromo!.Data.Should().NotBeNull();
        var promoId = createdPromo.Data.PromotionId;

        // Get promotion (populate cache)
        var getResponse1 = await _client.GetAsync($"/api/v1/employee/promotions/{promoId}");
        getResponse1.StatusCode.Should().Be(HttpStatusCode.OK);
        var promo1 = await getResponse1.Content.ReadFromJsonAsync<ApiResponse<PromotionResponse>>();
        promo1.Should().NotBeNull();
        promo1!.Data.Should().NotBeNull();
        promo1.Data.Name.Should().Be("Integration Promo");

        // Update promotion
        var updateRequest = new CreatePromotionRequest
        {
            Name = "Updated Promo",
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/employee/promotions/{promoId}", updateRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Get again (should return updated data)
        var getResponse2 = await _client.GetAsync($"/api/v1/employee/promotions/{promoId}");
        getResponse2.StatusCode.Should().Be(HttpStatusCode.OK);
        var promo2 = await getResponse2.Content.ReadFromJsonAsync<ApiResponse<PromotionResponse>>();
        promo2.Should().NotBeNull();
        promo2!.Data.Should().NotBeNull();
        promo2.Data.Name.Should().Be("Updated Promo");

        // Delete promotion
        var deleteResponse = await _client.DeleteAsync($"/api/v1/employee/promotions/{promoId}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Get again (should be 404)
        var getResponse3 = await _client.GetAsync($"/api/v1/employee/promotions/{promoId}");
        getResponse3.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace DB with InMemory for testing
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });

            // Replace Redis with InMemory cache
            var cacheDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IDistributedCache));
            if (cacheDescriptor != null) services.Remove(cacheDescriptor);

            services.AddDistributedMemoryCache();

            // Replace SeaweedFS with Local storage
            var storageDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IFileStorageService));
            if (storageDescriptor != null) services.Remove(storageDescriptor);
            services.AddScoped<IFileStorageService, LocalFileStorageServiceForTests>();
        });

        builder.UseEnvironment("Testing");
    }
}

public class LocalFileStorageServiceForTests : IFileStorageService
{
    public Task<FileUploadResult> UploadAsync(Stream stream, string fileName, string contentType, string? folder = null, CancellationToken ct = default)
    {
        return Task.FromResult(new FileUploadResult("test-fid", fileName, stream.Length, $"/test/{fileName}", "local"));
    }

    public Task<bool> DeleteAsync(string fileId, CancellationToken ct = default) => Task.FromResult(true);
    public Task<Stream?> DownloadAsync(string fileId, CancellationToken ct = default) => Task.FromResult<Stream?>(new MemoryStream());
    public Task<FileMetadata?> GetMetadataAsync(string fileId, CancellationToken ct = default) => Task.FromResult<FileMetadata?>(null);
    public Task<List<StoredFileInfo>> ListAsync(string? folder = null, int max = 100, CancellationToken ct = default) => Task.FromResult(new List<StoredFileInfo>());
    public string GetPublicUrl(string fileId) => $"/test/{fileId}";
}