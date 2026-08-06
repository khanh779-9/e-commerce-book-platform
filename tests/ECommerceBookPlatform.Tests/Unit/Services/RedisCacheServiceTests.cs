using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ECommerceBookPlatform.Services.Implementations;
using ECommerceBookPlatform.Services.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace ECommerceBookPlatform.Tests.Unit.Services;

public class RedisCacheServiceTests
{
    private readonly Mock<IDistributedCache> _distributedCacheMock;
    private readonly Mock<IConnectionMultiplexer> _redisMock;
    private readonly Mock<IServer> _serverMock;
    private readonly Mock<IDatabase> _databaseMock;
    private readonly Mock<ILogger<RedisCacheService>> _loggerMock;
    private readonly RedisCacheService _service;

    public RedisCacheServiceTests()
    {
        _distributedCacheMock = new Mock<IDistributedCache>();
        _redisMock = new Mock<IConnectionMultiplexer>();
        _serverMock = new Mock<IServer>();
        _databaseMock = new Mock<IDatabase>();
        _loggerMock = new Mock<ILogger<RedisCacheService>>();

        _redisMock.Setup(x => x.GetEndPoints()).Returns(new[] { new DnsEndPoint("localhost", 6379) });
        _redisMock.Setup(x => x.GetServer(It.IsAny<EndPoint>(), It.IsAny<object>())).Returns(_serverMock.Object);
        _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_databaseMock.Object);

        _service = new RedisCacheService(_distributedCacheMock.Object, _redisMock.Object, _loggerMock.Object);
    }

    #region GetAsync Tests

    [Fact]
    public async Task GetAsync_CacheHit_ReturnsDeserializedObject()
    {
        // Arrange
        var key = "test:key";
        var expected = new TestDto { Id = 1, Name = "Test" };
        var json = JsonSerializer.Serialize(expected);

        _distributedCacheMock.Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(json);

        // Act
        var result = await _service.GetAsync<TestDto>(key);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Name.Should().Be("Test");
    }

    [Fact]
    public async Task GetAsync_CacheMiss_ReturnsNull()
    {
        // Arrange
        var key = "missing:key";

        _distributedCacheMock.Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync((string?)null);

        // Act
        var result = await _service.GetAsync<TestDto>(key);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAsync_DeserializationFails_ReturnsNullAndLogsWarning()
    {
        // Arrange
        var key = "bad:key";
        var badJson = "{ invalid json }";

        _distributedCacheMock.Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(badJson);

        // Act
        var result = await _service.GetAsync<TestDto>(key);

        // Assert
        result.Should().BeNull();
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Cache get failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region SetAsync Tests

    [Fact]
    public async Task SetAsync_SerializesAndStoresWithDefaultTtl()
    {
        // Arrange
        var key = "test:key";
        var value = new TestDto { Id = 2, Name = "Test 2" };
        var expectedJson = JsonSerializer.Serialize(value);

        _distributedCacheMock.Setup(x => x.SetStringAsync(
                key,
                expectedJson,
                It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow.HasValue && o.AbsoluteExpirationRelativeToNow.Value == TimeSpan.FromMinutes(30)),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.SetAsync(key, value);

        // Assert
        _distributedCacheMock.Verify(x => x.SetStringAsync(
                key,
                expectedJson,
                It.IsAny<DistributedCacheEntryOptions>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SetAsync_WithCustomTtl_UsesCustomTtl()
    {
        // Arrange
        var key = "test:key";
        var value = new TestDto { Id = 3, Name = "Test 3" };
        var customTtl = TimeSpan.FromMinutes(5);

        _distributedCacheMock.Setup(x => x.SetStringAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == customTtl),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.SetAsync(key, value, customTtl);

        // Assert
        _distributedCacheMock.Verify(x => x.SetStringAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.Is<DistributedCacheEntryOptions>(o => o.AbsoluteExpirationRelativeToNow == customTtl),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SetAsync_Exception_LogsWarning()
    {
        // Arrange
        var key = "test:key";
        var value = new TestDto { Id = 4, Name = "Test 4" };

        _distributedCacheMock.Setup(x => x.SetStringAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new RedisException("Connection failed"));

        // Act
        await _service.SetAsync(key, value); // Should not throw

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Cache set failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region RemoveAsync Tests

    [Fact]
    public async Task RemoveAsync_CallsDistributedCacheRemove()
    {
        // Arrange
        var key = "test:key";

        _distributedCacheMock.Setup(x => x.RemoveAsync(key, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.RemoveAsync(key);

        // Assert
        _distributedCacheMock.Verify(x => x.RemoveAsync(key, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region RemoveByPatternAsync Tests - CRITICAL for cache invalidation

    [Fact]
    public async Task RemoveByPatternAsync_WithMatchingKeys_DeletesKeys()
    {
        // Arrange
        var pattern = "products:list:*";
        var keys = new RedisKey[] { "products:list:1", "products:list:2", "products:list:3" };

        _serverMock.Setup(x => x.Keys(pattern: pattern, pageSize: It.IsAny<int>(), pageOffset: It.IsAny<int>()))
            .Returns(keys);

        _databaseMock.Setup(x => x.KeyDeleteAsync(keys, It.IsAny<CommandFlags>()))
            .ReturnsAsync(3);

        // Act
        await _service.RemoveByPatternAsync(pattern);

        // Assert
        _serverMock.Verify(x => x.Keys(pattern: pattern, pageSize: It.IsAny<int>(), pageOffset: It.IsAny<int>()), Times.Once);
        _databaseMock.Verify(x => x.KeyDeleteAsync(keys, It.IsAny<CommandFlags>()), Times.Once);
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Deleted 3 keys matching pattern")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task RemoveByPatternAsync_NoMatchingKeys_DoesNotCallDelete()
    {
        // Arrange
        var pattern = "empty:pattern:*";
        var keys = new RedisKey[0];

        _serverMock.Setup(x => x.Keys(pattern: pattern, pageSize: It.IsAny<int>(), pageOffset: It.IsAny<int>()))
            .Returns(keys);

        // Act
        await _service.RemoveByPatternAsync(pattern);

        // Assert
        _serverMock.Verify(x => x.Keys(pattern: pattern, pageSize: It.IsAny<int>(), pageOffset: It.IsAny<int>()), Times.Once);
        _databaseMock.Verify(x => x.KeyDeleteAsync(It.IsAny<RedisKey[]>(), It.IsAny<CommandFlags>()), Times.Never);
    }

    [Fact]
    public async Task RemoveByPatternAsync_Exception_LogsWarning()
    {
        // Arrange
        var pattern = "error:pattern:*";

        _serverMock.Setup(x => x.Keys(pattern: pattern, pageSize: It.IsAny<int>(), pageOffset: It.IsAny<int>()))
            .Throws(new RedisException("SCAN failed"));

        // Act
        await _service.RemoveByPatternAsync(pattern); // Should not throw

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Pattern-based cache removal failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region ExistsAsync Tests

    [Fact]
    public async Task ExistsAsync_KeyExists_ReturnsTrue()
    {
        // Arrange
        var key = "existing:key";
        var json = JsonSerializer.Serialize(new TestDto { Id = 1, Name = "Test" });

        _distributedCacheMock.Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(json);

        // Act
        var result = await _service.ExistsAsync(key);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_KeyMissing_ReturnsFalse()
    {
        // Arrange
        var key = "missing:key";

        _distributedCacheMock.Setup(x => x.GetStringAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync((string?)null);

        // Act
        var result = await _service.ExistsAsync(key);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Test DTO

    private record TestDto(int Id, string Name);

    #endregion
}