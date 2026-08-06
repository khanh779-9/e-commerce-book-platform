using System.Collections.Generic;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Threading.Tasks;
using ECommerceBookPlatform.Controllers.Customer;
using ECommerceBookPlatform.Controllers.Employee;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using ECommerceBookPlatform.Services.Interfaces;
using ECommerceBookPlatform.Tests.Fixtures;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

// Aliases to resolve ambiguous ProductController references
using CustomerProductController = ECommerceBookPlatform.Controllers.Customer.ProductController;
using EmployeeProductController = ECommerceBookPlatform.Controllers.Employee.ProductController;

namespace ECommerceBookPlatform.Tests.Unit.Controllers;

public class ProductControllerTests
{
    #region Customer ProductController Tests

    public class CustomerProductControllerTests
    {
        private readonly Mock<IProductService> _productServiceMock;
        private readonly Mock<IWishlistService> _wishlistServiceMock;
        private readonly Mock<AppDbContext> _dbMock;
        private readonly Mock<IDistributedCache> _cacheMock;
        private readonly Mock<ILogger<CustomerProductController>> _loggerMock;
        private readonly CustomerProductController _controller;

        public CustomerProductControllerTests()
        {
            _productServiceMock = new Mock<IProductService>();
            _wishlistServiceMock = new Mock<IWishlistService>();
            _dbMock = new Mock<AppDbContext>(MockBehavior.Default, new DbContextOptions<AppDbContext>());
            _cacheMock = new Mock<IDistributedCache>();
            _loggerMock = new Mock<ILogger<CustomerProductController>>();
            _controller = new CustomerProductController(_productServiceMock.Object, _wishlistServiceMock.Object, _dbMock.Object, _cacheMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task GetProducts_ReturnsOkWithPaginatedResponse()
        {
            // Arrange
            var request = TestData.CreateSearchRequest();
            var expectedResponse = TestData.CreatePaginatedResponse(
                items: new List<ProductResponse> { TestData.CreateProductResponse() },
                total: 1);

            _productServiceMock.Setup(x => x.GetProductsAsync(request, null))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetProducts(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeSameAs(expectedResponse);
        }

        [Fact]
        public async Task GetProduct_Exists_ReturnsOkWithProduct()
        {
            // Arrange
            var productId = 1;
            var expectedProduct = TestData.CreateProductResponse(id: productId);

            _productServiceMock.Setup(x => x.GetProductDetailAsync(productId, null))
                .ReturnsAsync(expectedProduct);

            // Act
            var result = await _controller.GetProduct(productId);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<ProductResponse>>().Subject;
            apiResponse.Data.Should().BeSameAs(expectedProduct);
        }

        [Fact]
        public async Task GetProduct_NotFound_ReturnsNotFound()
        {
            // Arrange
            var productId = 999;

            _productServiceMock.Setup(x => x.GetProductDetailAsync(productId, null))
                .ReturnsAsync((ProductResponse?)null);

            // Act
            var result = await _controller.GetProduct(productId);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var apiResponse = notFoundResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
            apiResponse.Message.Should().Be("Không tìm thấy sản phẩm");
        }

        [Fact]
        public async Task GetCategories_ReturnsOk()
        {
            // Arrange
            var categories = new List<Category>
            {
                new() { CategoryId = 1, Name = "Category 1", Description = "Desc 1" },
                new() { CategoryId = 2, Name = "Category 2", Description = "Desc 2" }
            };

            var mockCategories = new Mock<DbSet<Category>>();
            mockCategories.As<IQueryable<Category>>().Setup(m => m.Provider).Returns(categories.AsQueryable().Provider);
            mockCategories.As<IQueryable<Category>>().Setup(m => m.Expression).Returns(categories.AsQueryable().Expression);
            mockCategories.As<IQueryable<Category>>().Setup(m => m.ElementType).Returns(categories.AsQueryable().ElementType);
            mockCategories.As<IQueryable<Category>>().Setup(m => m.GetEnumerator()).Returns(categories.AsQueryable().GetEnumerator());
            
            // Setup OrderBy to return IOrderedQueryable
            var orderedCategories = categories.OrderBy(c => c.Name).AsQueryable();
            mockCategories.As<IQueryable<Category>>().Setup(m => m.OrderBy(It.IsAny<Expression<Func<Category, object>>>())).Returns((IOrderedQueryable<Category>)orderedCategories);
            mockCategories.As<IQueryable<Category>>().Setup(m => m.ToListAsync(It.IsAny<CancellationToken>())).ReturnsAsync(categories);

            _dbMock.Setup(x => x.Categories).Returns(mockCategories.Object);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var categoryList = okResult.Value.Should().BeAssignableTo<IEnumerable<CategoryResponse>>().Subject;
            categoryList.Should().HaveCount(2);
        }
    }

    #endregion

    #region Employee ProductController Tests

    public class EmployeeProductControllerTests
    {
        private readonly Mock<IProductService> _productServiceMock;
        private readonly Mock<IFileStorageService> _storageMock;
        private readonly Mock<AppDbContext> _dbMock;
        private readonly EmployeeProductController _controller;

        public EmployeeProductControllerTests()
        {
            _productServiceMock = new Mock<IProductService>();
            _storageMock = new Mock<IFileStorageService>();
            _dbMock = new Mock<AppDbContext>(MockBehavior.Default, new DbContextOptions<AppDbContext>());
            _controller = new EmployeeProductController(
                _productServiceMock.Object, _storageMock.Object, _dbMock.Object);
        }

        [Fact]
        public async Task CreateProduct_ReturnsOkWithCreatedProduct()
        {
            // Arrange
            var request = new CreateProductRequest
            {
                Name = "New Product",
                CategoryId = 1,
                Price = 100000,
                StockQuantity = 10
            };
            var createdProduct = TestData.CreateProductResponse(id: 1, name: "New Product");

            _productServiceMock.Setup(x => x.CreateProductAsync(request))
                .ReturnsAsync(createdProduct);

            // Act
            var result = await _controller.CreateProduct(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<ProductResponse>>().Subject;
            apiResponse.Data.Should().BeSameAs(createdProduct);
            apiResponse.Message.Should().Be("Thêm sản phẩm thành công!");
        }

        [Fact]
        public async Task UpdateProduct_ReturnsOkWithUpdatedProduct()
        {
            // Arrange
            var productId = 1;
            var request = new UpdateProductRequest { Name = "Updated", Price = 150000 };
            var updatedProduct = TestData.CreateProductResponse(id: productId, name: "Updated");

            _productServiceMock.Setup(x => x.UpdateProductAsync(productId, request))
                .ReturnsAsync(updatedProduct);

            // Act
            var result = await _controller.UpdateProduct(productId, request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<ProductResponse>>().Subject;
            apiResponse.Data.Should().BeSameAs(updatedProduct);
        }

        [Fact]
        public async Task DeleteProduct_ReturnsOk()
        {
            // Arrange
            var productId = 1;

            _productServiceMock.Setup(x => x.DeleteProductAsync(productId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteProduct(productId);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
            apiResponse.Message.Should().Be("Xóa sản phẩm thành công!");
        }

        [Fact]
        public async Task UploadImage_ValidFile_ReturnsOkWithImageUrl()
        {
            // Arrange
            var productId = 1;
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(x => x.Length).Returns(1024 * 1024); // 1MB
            fileMock.Setup(x => x.FileName).Returns("test.jpg");
            fileMock.Setup(x => x.ContentType).Returns("image/jpeg");
            fileMock.Setup(x => x.OpenReadStream()).Returns(new MemoryStream(new byte[1024]));

            var product = TestData.CreateProduct(id: productId);
            var uploadResult = new FileUploadResult("fid123", "test.jpg", 1024 * 1024, "https://cdn.example.com/fid123", "seaweedfs");

            _dbMock.Setup(x => x.Products.FindAsync(productId)).ReturnsAsync(product);
            _storageMock.Setup(x => x.UploadAsync(It.IsAny<Stream>(), "test.jpg", "image/jpeg", "products", It.IsAny<CancellationToken>()))
                .ReturnsAsync(uploadResult);
            _productServiceMock.Setup(x => x.UpdateProductAsync(productId, It.IsAny<UpdateProductRequest>()))
                .ReturnsAsync(TestData.CreateProductResponse(id: productId, name: product.Name));

            // Act
            var result = await _controller.UploadImage(productId, fileMock.Object);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var apiResponse = okResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
            apiResponse.Message.Should().Be("Tải ảnh lên thành công!");
            
            var data = apiResponse.Data.Should().BeAssignableTo<object>().Subject;
            data.GetType().GetProperty("image_url")!.GetValue(data).Should().Be("https://cdn.example.com/fid123");
            data.GetType().GetProperty("storage")!.GetValue(data).Should().Be("seaweedfs");
        }

        [Fact]
        public async Task UploadImage_FileTooLarge_ReturnsBadRequest()
        {
            // Arrange
            var productId = 1;
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(x => x.Length).Returns(10 * 1024 * 1024); // 10MB > 5MB limit

            // Act
            var result = await _controller.UploadImage(productId, fileMock.Object);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var apiResponse = badRequestResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
            apiResponse.Message.Should().Be("Ảnh không được vượt quá 5MB.");
        }

        [Fact]
        public async Task UploadImage_InvalidExtension_ReturnsBadRequest()
        {
            // Arrange
            var productId = 1;
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(x => x.Length).Returns(1024);
            fileMock.Setup(x => x.FileName).Returns("test.exe");

            // Act
            var result = await _controller.UploadImage(productId, fileMock.Object);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var apiResponse = badRequestResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
            apiResponse.Message.Should().Contain("Định dạng ảnh không hợp lệ");
        }

        [Fact]
        public async Task UploadImage_ProductNotFound_ReturnsNotFound()
        {
            // Arrange
            var productId = 999;
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(x => x.Length).Returns(1024);
            fileMock.Setup(x => x.FileName).Returns("test.jpg");
            fileMock.Setup(x => x.ContentType).Returns("image/jpeg");

            _dbMock.Setup(x => x.Products.FindAsync(productId)).ReturnsAsync((Product?)null);

            // Act
            var result = await _controller.UploadImage(productId, fileMock.Object);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            var apiResponse = notFoundResult.Value.Should().BeOfType<ApiResponse<object>>().Subject;
            apiResponse.Message.Should().Be("Không tìm thấy sản phẩm.");
        }
    }

    #endregion
}