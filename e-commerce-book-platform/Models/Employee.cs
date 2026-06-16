namespace ECommerceBookPlatform.Models;

public class Employee
{
    public int EmployeeId { get; set; }
    public string? PasswordHash { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime? StartDate { get; set; }
    public string Status { get; set; } = "dang_lam"; // dang_lam, nghi_viec, tam_nghi
    public string Role { get; set; } = "nhanvien"; // admin, quanly, nhanvien
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Computed
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Trim();
    public string DisplayName => LastName ?? Email ?? "Employee";
}