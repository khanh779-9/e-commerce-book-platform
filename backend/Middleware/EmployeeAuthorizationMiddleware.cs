using System.Security.Claims;

namespace ECommerceBookPlatform.Middleware;

public class EmployeeAuthorizationMiddleware
{
    private readonly RequestDelegate _next;

    public EmployeeAuthorizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip for non-employee routes
        var path = context.Request.Path.Value?.ToLower() ?? "";
        if (!path.StartsWith("/api/v1/employee/"))
        {
            await _next(context);
            return;
        }

        // If user is authenticated, check if they have an employee role
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            if (!roleClaim.StartsWith("employee_"))
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(
                    System.Text.Json.JsonSerializer.Serialize(new
                    {
                        message = "Chỉ nhân viên mới có quyền truy cập!",
                        statusCode = 403
                    }));
                return;
            }

            // Check employee status for active routes (not login)
            if (!path.EndsWith("/login") && !path.EndsWith("/logout"))
            {
                var statusClaim = context.User.FindFirst("EmployeeStatus")?.Value ?? "";
                if (statusClaim != "dang_lam")
                {
                    context.Response.StatusCode = 403;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(
                        System.Text.Json.JsonSerializer.Serialize(new
                        {
                            message = "Tài khoản nhân viên đã bị vô hiệu hóa!",
                            statusCode = 403
                        }));
                    return;
                }
            }
        }

        await _next(context);
    }
}