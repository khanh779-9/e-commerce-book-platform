using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.Models;

namespace ECommerceBookPlatform.Tests.Fixtures;

public static class MockDbContextFactory
{
    public static Mock<AppDbContext> Create(params object[] entities)
    {
        var mockContext = new Mock<AppDbContext>(MockBehavior.Default, new DbContextOptions<AppDbContext>());
        
        foreach (var entity in entities)
        {
            SetupDbSet(mockContext, entity);
        }

        mockContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        return mockContext;
    }

    private static void SetupDbSet(Mock<AppDbContext> mockContext, object entity)
    {
        var entityType = entity.GetType();
        
        // Use reflection to call the generic method with the correct type
        var method = typeof(MockDbContextFactory).GetMethod(nameof(SetupDbSetGeneric), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
        var genericMethod = method!.MakeGenericMethod(entityType);
        genericMethod.Invoke(null, new object[] { mockContext, entity });
    }

    private static void SetupDbSetGeneric<T>(Mock<AppDbContext> mockContext, object entity) where T : class
    {
        var mockSet = CreateMockDbSet(new[] { (T)entity });
        
        var propertyName = typeof(T).Name + "s";
        var property = typeof(AppDbContext).GetProperty(propertyName);
        if (property != null)
        {
            property.SetValue(mockContext.Object, mockSet.Object);
        }
    }

    private static Mock<DbSet<T>> CreateMockDbSet<T>(T[] data) where T : class
    {
        var queryable = data.AsQueryable();
        
        var mockSet = new Mock<DbSet<T>>();
        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        
        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new TestAsyncEnumerator<T>(data.AsEnumerable().GetEnumerator()));

        mockSet.Setup(m => m.FindAsync(It.IsAny<object[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((object[] ids, CancellationToken ct) => 
            {
                var firstId = ids.FirstOrDefault();
                return firstId != null 
                    ? data.FirstOrDefault(e => GetId(e)?.Equals(firstId) == true) 
                    : null;
            });
        
        mockSet.Setup(m => m.Add(It.IsAny<T>())).Callback<T>(e => { });
        mockSet.Setup(m => m.Remove(It.IsAny<T>())).Callback<T>(e => { });

        return mockSet;
    }

    private static object? GetId<T>(T entity)
    {
        var idProp = typeof(T).GetProperties().FirstOrDefault(p => 
            p.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase) || 
            p.Name == "Id");
        return idProp?.GetValue(entity);
    }
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _enumerator;

    public TestAsyncEnumerator(IEnumerator<T> enumerator)
    {
        _enumerator = enumerator;
    }

    public T Current => _enumerator.Current;

    public ValueTask<bool> MoveNextAsync()
    {
        return new ValueTask<bool>(_enumerator.MoveNext());
    }

    public ValueTask DisposeAsync()
    {
        _enumerator.Dispose();
        return ValueTask.CompletedTask;
    }
}