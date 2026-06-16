using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Controllers.Employee;

[ApiController]
[Route("api/v1/employee/reports")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetReports([FromQuery] int year = 0, [FromQuery] int month = 0)
    {
        if (year == 0) year = DateTime.UtcNow.Year;
        if (month == 0) month = DateTime.UtcNow.Month;

        // Monthly revenue
        var monthlyRevenueQuery = _db.Orders
            .Where(o => o.Status == "da_giao" || o.Status == "da_xac_nhan")
            .Where(o => o.OrderDate.Year == year && o.OrderDate.Month == month);

        var monthlyRevenue = await monthlyRevenueQuery.SumAsync(o => o.TotalAmount ?? 0);

        // Revenue by month in year
        var revenueByMonth = await _db.Orders
            .Where(o => o.Status == "da_giao" || o.Status == "da_xac_nhan")
            .Where(o => o.OrderDate.Year == year)
            .GroupBy(o => o.OrderDate.Month)
            .Select(g => new MonthlyRevenue
            {
                Month = g.Key,
                Year = year,
                Revenue = g.Sum(o => o.TotalAmount ?? 0),
                OrderCount = g.Count(),
            })
            .OrderBy(r => r.Month)
            .ToListAsync();

        // Top selling products
        var topProducts = await _db.OrderItems
            .Include(oi => oi.Product)
            .Where(oi => oi.Order != null && (oi.Order.Status == "da_giao" || oi.Order.Status == "da_xac_nhan"))
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                TotalQuantity = g.Sum(oi => oi.Quantity ?? 0),
                TotalRevenue = g.Sum(oi => oi.SubTotal ?? 0),
                ProductName = g.First().Product!.Name,
            })
            .OrderByDescending(x => x.TotalQuantity)
            .Take(10)
            .ToListAsync();

        // Summary stats
        var totalOrders = await _db.Orders.CountAsync();
        var totalRevenue = await _db.Orders
            .Where(o => o.Status == "da_giao" || o.Status == "da_xac_nhan")
            .SumAsync(o => o.TotalAmount ?? 0);
        var totalCustomers = await _db.Customers.CountAsync();
        var pendingOrders = await _db.Orders.CountAsync(o => o.Status == "cho_xac_nhan");

        // Order status distribution
        var orderByStatus = await _db.Orders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new ApiResponse<ReportResponse>
        {
            Data = new ReportResponse
            {
                Summary = new ReportSummary
                {
                    TotalOrders = totalOrders,
                    TotalRevenue = totalRevenue,
                    TotalCustomers = totalCustomers,
                    PendingOrders = pendingOrders,
                    MonthlyRevenue = monthlyRevenue,
                },
                MonthlyRevenues = revenueByMonth,
                TopProducts = topProducts.Select(x => new ProductReportItem
                {
                    ProductId = x.ProductId ?? 0,
                    ProductName = x.ProductName,
                    TotalQuantity = x.TotalQuantity,
                    TotalRevenue = x.TotalRevenue,
                }).ToList(),
                OrderByStatus = orderByStatus.ToDictionary(x => x.Status, x => x.Count),
            }
        });
    }
}