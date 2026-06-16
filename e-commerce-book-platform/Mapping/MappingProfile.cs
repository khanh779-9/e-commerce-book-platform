using AutoMapper;
using ECommerceBookPlatform.DTOs.Requests;
using ECommerceBookPlatform.DTOs.Responses;
using ECommerceBookPlatform.Models;

namespace ECommerceBookPlatform.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Product mappings ──────────────────────────
        CreateMap<Product, ProductResponse>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
            .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.Unit != null ? src.Unit.Name : null))
            .ForMember(dest => dest.ProviderName, opt => opt.MapFrom(src => src.Provider != null ? src.Provider.Name : null))
            .ForMember(dest => dest.PromoPrice, opt => opt.MapFrom(src => src.GetPromoPrice()))
            .ForMember(dest => dest.DanhmucSP_id, opt => opt.MapFrom(src => src.CategoryId))
            .ForMember(dest => dest.BookDetails, opt => opt.MapFrom(src => src.Book))
            .ForMember(dest => dest.Metadata, opt => opt.Ignore());

        // ── Book to BookResponse ───────────────────────
        CreateMap<Book, BookResponse>()
            .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author != null ? src.Author.FullName : null))
            .ForMember(dest => dest.PublisherName, opt => opt.MapFrom(src => src.Publisher != null ? src.Publisher.Name : null))
            .ForMember(dest => dest.BookTypeName, opt => opt.MapFrom(src => src.BookType != null ? src.BookType.Name : null));

        // ── Customer mappings ─────────────────────────
        CreateMap<Customer, CustomerResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CustomerId))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName));

        // ── Employee mappings ─────────────────────────
        CreateMap<Employee, EmployeeResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.EmployeeId))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName));

        // ── Order mappings ────────────────────────────
        CreateMap<Order, OrderListResponse>()
            .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null));

        CreateMap<Order, OrderDetailResponse>()
            .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.DeliveryAddress != null ? src.DeliveryAddress.Address : null));

        CreateMap<OrderItem, OrderItemResponse>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null))
            .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Product != null ? src.Product.ImageUrl : null));

        // ── Cart mappings ─────────────────────────────
        CreateMap<CartItem, CartItemResponse>()
            .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null))
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.UnitPrice))
            .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.Product != null ? src.Product.ImageUrl : null));

        // ── Category/Author/Publisher/Provider ────────
        CreateMap<Category, CategoryResponse>();
        CreateMap<Author, AuthorResponse>();
        CreateMap<Publisher, PublisherResponse>();
        CreateMap<Provider, ProviderResponse>();
        CreateMap<Unit, UnitResponse>();
        CreateMap<BookType, BookTypeResponse>();

        // ── Request to Entity ─────────────────────────
        CreateMap<CreateProductRequest, Product>();
        CreateMap<CreateCategoryRequest, Category>();
        CreateMap<CreateAuthorRequest, Author>();
        CreateMap<CreatePublisherRequest, Publisher>();
        CreateMap<CreateProviderRequest, Provider>();
        CreateMap<CreatePromotionRequest, Promotion>();
    }
}