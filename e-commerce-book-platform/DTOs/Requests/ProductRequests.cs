using FluentValidation;

namespace ECommerceBookPlatform.DTOs.Requests;

public class ProductSearchRequest
{
    public string? Q { get; set; }
    public int? CategoryId { get; set; }
    public int? ProviderId { get; set; }
    public int? PublisherId { get; set; }
    public string? BookTypeCode { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; } // newest, price_asc, price_desc, best_selling
    public bool? PromotedOnly { get; set; }
    public bool? InStockOnly { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 12;
}

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int UnitId { get; set; }
    public int? ProviderId { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string Type { get; set; } = "book"; // book, other

    // Book specific
    public int? AuthorId { get; set; }
    public int? PublisherId_ { get; set; }
    public int? PublishedYear { get; set; }
    public string? BookTypeCode { get; set; }
}

public class UpdateProductRequest
{
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public decimal? Price { get; set; }
    public int? StockQuantity { get; set; }
    public int? UnitId { get; set; }
    public int? ProviderId { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }

    // Book specific
    public int? AuthorId { get; set; }
    public int? PublisherId_ { get; set; }
    public int? PublishedYear { get; set; }
    public string? BookTypeCode { get; set; }
}

public class CartAddRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CartUpdateRequest
{
    public int Quantity { get; set; }
}

public class CartMergeRequest
{
    public List<CartItemInput> Items { get; set; } = new();
}

public class CartItemInput
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CheckoutRequest
{
    public int? AddressId { get; set; }
    public string PaymentMethod { get; set; } = "tien_mat";
    public string? Notes { get; set; }
}

public class CreatePromotionRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<PromotionDetailInput>? Details { get; set; }
}

public class PromotionDetailInput
{
    public int ProductId { get; set; }
    public int? Quantity { get; set; }
    public decimal DiscountPercent { get; set; }
}

public class AddPromotionDetailRequest
{
    public int ProductId { get; set; }
    public int? Quantity { get; set; }
    public decimal DiscountPercent { get; set; }
}

public class SubmitReviewRequest
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class WishlistToggleRequest
{
    public int ProductId { get; set; }
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateAuthorRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class CreatePublisherRequest
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class CreateProviderRequest
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class CreateUnitRequest
{
    public string? Name { get; set; }
}

public class CreateBookTypeRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

// ── Validators ─────────────────────────────────────

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.UnitId).GreaterThan(0);

        When(x => x.Type == "book", () =>
        {
            RuleFor(x => x.AuthorId).NotNull().GreaterThan(0);
            RuleFor(x => x.PublisherId_).NotNull().GreaterThan(0);
            RuleFor(x => x.PublishedYear).NotNull().InclusiveBetween(1900, DateTime.UtcNow.Year + 1);
            RuleFor(x => x.BookTypeCode).NotEmpty();
        });
    }
}

public class CheckoutRequestValidator : AbstractValidator<CheckoutRequest>
{
    public CheckoutRequestValidator()
    {
        RuleFor(x => x.PaymentMethod).NotEmpty()
            .Must(x => new[] { "tien_mat", "chuyen_khoan", "vi_dien_tu" }.Contains(x));
    }
}

public class SubmitReviewRequestValidator : AbstractValidator<SubmitReviewRequest>
{
    public SubmitReviewRequestValidator()
    {
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
    }
}

public class CreatePromotionRequestValidator : AbstractValidator<CreatePromotionRequest>
{
    public CreatePromotionRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThanOrEqualTo(x => x.StartDate);
    }
}

public class UpdateOrderStatusRequestValidator : AbstractValidator<UpdateOrderStatusRequest>
{
    public UpdateOrderStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty()
            .Must(x => new[] { "cho_xac_nhan", "da_xac_nhan", "dang_giao_hang", "da_giao_hang", "da_huy" }.Contains(x));
    }
}