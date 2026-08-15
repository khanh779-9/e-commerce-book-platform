# ECommerceBookPlatform.Tests

## Cấu trúc

```
tests/ECommerceBookPlatform.Tests/
├── Fixtures/
│   ├── TestFixtures.cs          # AutoFixture customization + test data helpers
│   └── MockDbContextFactory.cs  # Mock DbContext factory
├── Unit/
│   ├── Services/
│   │   ├── ProductServiceTests.cs       # Cache hit/miss, CRUD + invalidation
│   │   ├── PromotionServiceTests.cs     # Cache hit/miss, CRUD + invalidation
│   │   └── RedisCacheServiceTests.cs    # Get/Set/Remove/RemoveByPattern/Exists
│   └── Controllers/
│       └── ProductControllerTests.cs    # Customer + Employee controller tests
└── Integration/
    └── CacheInvalidationIntegrationTests.cs  # End-to-end cache invalidation
```

## Chạy test

```bash
# Chạy tất cả test
dotnet test tests/ECommerceBookPlatform.Tests/ECommerceBookPlatform.Tests.csproj

# Chạy với coverage
dotnet test tests/ECommerceBookPlatform.Tests/ECommerceBookPlatform.Tests.csproj --collect:"XPlat Code Coverage"

# Chạy chỉ unit test
dotnet test tests/ECommerceBookPlatform.Tests/ECommerceBookPlatform.Tests.csproj --filter "FullyQualifiedName~Unit"

# Chạy chỉ integration test
dotnet test tests/ECommerceBookPlatform.Tests/ECommerceBookPlatform.Tests.csproj --filter "FullyQualifiedName~Integration"

# Chạy test cụ thể
dotnet test --filter "ProductServiceTests.UpdateProductAsync_InvalidatesDetailAndListCache"
```

## Test cases quan trọng (P0)

| Test | Mục đích |
|------|----------|
| `ProductServiceTests.UpdateProductAsync_InvalidatesDetailAndListCache` | Verify cache invalidation khi update |
| `ProductServiceTests.DeleteProductAsync_InvalidatesCache` | Verify cache invalidation khi delete |
| `ProductServiceTests.GetProductsAsync_CacheHit_ReturnsCachedDataWithoutQueryingDb` | Verify cache hit không query DB |
| `RedisCacheServiceTests.RemoveByPatternAsync_WithMatchingKeys_DeletesKeys` | Verify pattern delete hoạt động |
| `CacheInvalidationIntegrationTests.Product_Update_InvalidatesCache_SubsequentGetReturnsNewData` | End-to-end cache invalidation |

## Mock strategy

- **AppDbContext**: Mock DbSet với `IQueryable` để test EF Core queries
- **ICacheService**: Mock hoàn toàn để verify cache interactions
- **IDistributedCache + IConnectionMultiplexer**: Mock cho RedisCacheService
- **HttpClient + WebApplicationFactory**: Integration tests với InMemory DB + MemoryCache

## Lưu ý

- Integration tests dùng `InMemoryDatabase` và `MemoryDistributedCache` (không cần Redis thật)
- Unit tests mock mọi dependency external
- Test data dùng `AutoFixture` + `TestData` helpers