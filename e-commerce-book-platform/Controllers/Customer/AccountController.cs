using ECommerceBookPlatform.Data;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CustomerModel = ECommerceBookPlatform.Models.Customer;

namespace ECommerceBookPlatform.Controllers.Customer;

[ApiController]
[Route("api/v1")]
[Authorize(Roles = "customer")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _db;

    public AccountController(AppDbContext db)
    {
        _db = db;
    }

    private int CustomerId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("account")]
    public async Task<IActionResult> GetAccount()
    {
        var customer = await _db.Customers.FindAsync(CustomerId);
        if (customer == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy khách hàng" });

        return Ok(new ApiResponse<CustomerResponse>
        {
            Message = "OK",
            Data = MapCustomer(customer)
        });
    }

    [HttpPut("account/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var customer = await _db.Customers.FindAsync(CustomerId);
        if (customer == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy khách hàng" });

        if (request.FirstName != null) customer.FirstName = request.FirstName;
        if (request.MiddleName != null) customer.MiddleName = request.MiddleName;
        if (request.LastName != null) customer.LastName = request.LastName;
        if (request.Email != null) customer.Email = request.Email;
        if (request.Phone != null) customer.Phone = request.Phone;
        if (request.Address != null) customer.Address = request.Address;
        if (request.BirthDate.HasValue) customer.BirthDate = request.BirthDate;
        if (request.Gender != null) customer.Gender = request.Gender;

        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<CustomerResponse>
        {
            Message = "Cập nhật thành công",
            Data = MapCustomer(customer)
        });
    }

    [HttpPut("account/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var customer = await _db.Customers.FindAsync(CustomerId);
        if (customer == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy khách hàng" });

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, customer.PasswordHash))
            return BadRequest(new ApiResponse<object> { Message = "Mật khẩu cũ không đúng" });

        customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Đổi mật khẩu thành công" });
    }

    // ── Addresses ───────────────────────────────────

    [HttpGet("addresses")]
    public async Task<IActionResult> GetAddresses()
    {
        var addresses = await _db.DeliveryAddresses
            .Where(a => a.CustomerId == CustomerId)
            .ToListAsync();

        return Ok(addresses.Select(a => new AddressResponse
        {
            AddressId = a.AddressId,
            Address = a.Address
        }));
    }

    [HttpPost("addresses")]
    public async Task<IActionResult> AddAddress([FromBody] AddAddressRequest request)
    {
        var address = new DeliveryAddress
        {
            CustomerId = CustomerId,
            Address = request.Address,
        };

        _db.DeliveryAddresses.Add(address);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<AddressResponse>
        {
            Message = "Thêm địa chỉ thành công",
            Data = new AddressResponse { AddressId = address.AddressId, Address = address.Address }
        });
    }

    [HttpPut("addresses/{id}")]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] AddAddressRequest request)
    {
        var address = await _db.DeliveryAddresses
            .FirstOrDefaultAsync(a => a.AddressId == id && a.CustomerId == CustomerId);

        if (address == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy địa chỉ" });

        address.Address = request.Address;
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<AddressResponse>
        {
            Message = "Cập nhật địa chỉ thành công",
            Data = new AddressResponse { AddressId = address.AddressId, Address = address.Address }
        });
    }

    [HttpDelete("addresses/{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var address = await _db.DeliveryAddresses
            .FirstOrDefaultAsync(a => a.AddressId == id && a.CustomerId == CustomerId);

        if (address == null)
            return NotFound(new ApiResponse<object> { Message = "Không tìm thấy địa chỉ" });

        _db.DeliveryAddresses.Remove(address);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Message = "Xóa địa chỉ thành công" });
    }

    private static CustomerResponse MapCustomer(CustomerModel c) => new()
    {
        Id = c.CustomerId,
        FirstName = c.FirstName,
        MiddleName = c.MiddleName,
        LastName = c.LastName,
        FullName = c.FullName,
        DisplayName = c.DisplayName,
        Email = c.Email,
        Phone = c.Phone,
        Address = c.Address,
        BirthDate = c.BirthDate,
        Gender = c.Gender,
        JoinedAt = c.JoinedAt
    };
}