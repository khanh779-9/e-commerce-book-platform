namespace ECommerceBookPlatform.DTOs.Responses;

public class ProductResponse
{
    public int ProductId { get; set; }
    public int Id => ProductId;
    public string Name { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int StockQuantity { get; set; }
    public int SoldQuantity { get; set; }
    public decimal Price { get; set; }
    public decimal PromoPrice { get; set; }
    public string? UnitName { get; set; }
    public string? ProviderName { get; set; }
    public bool IsWishlisted { get; set; }
    public double AvgRating { get; set; }
    public int TotalReviews { get; set; }
    public BookResponse? BookDetails { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }

    // Compat fields (Vietnamese)
    public string TenSP => Name;
    public int? DanhmucSP_id { get; set; }
    public string? Hinhanh => ImageUrl;
    public string? Mo_ta => Description;
    public int Soluongton => StockQuantity;
    public int Soluongban => SoldQuantity;
    public decimal Gia => Price;
}

public class BookResponse
{
    public int? BookId { get; set; }
    public string? Title { get; set; }
    public string? AuthorName { get; set; }
    public string? PublisherName { get; set; }
    public int? PublishedYear { get; set; }
    public string? BookTypeCode { get; set; }
    public string? BookTypeName { get; set; }

    public string? TenSach => Title;
}

public class CategoryResponse
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class AuthorResponse
{
    public int AuthorId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class PublisherResponse
{
    public int PublisherId { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class ProviderResponse
{
    public int ProviderId { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class UnitResponse
{
    public int UnitId { get; set; }
    public string? Name { get; set; }
}

public class BookTypeResponse
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}