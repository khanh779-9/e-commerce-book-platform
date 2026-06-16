using ECommerceBookPlatform.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBookPlatform.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<BookType> BookTypes => Set<BookType>();
    public DbSet<Publisher> Publishers => Set<Publisher>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<DeliveryAddress> DeliveryAddresses => Set<DeliveryAddress>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<PromotionDetail> PromotionDetails => Set<PromotionDetail>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Category ──────────────────────────────────────
        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("Categories");
            e.HasKey(x => x.CategoryId);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnType("nvarchar(max)");
        });

        // ── Unit ──────────────────────────────────────────
        modelBuilder.Entity<Unit>(e =>
        {
            e.ToTable("Units");
            e.HasKey(x => x.UnitId);
            e.Property(x => x.Name).HasMaxLength(50);
        });

        // ── Provider ──────────────────────────────────────
        modelBuilder.Entity<Provider>(e =>
        {
            e.ToTable("Providers");
            e.HasKey(x => x.ProviderId);
            e.Property(x => x.Name).HasMaxLength(100);
            e.Property(x => x.Address).HasMaxLength(255);
            e.Property(x => x.Phone).HasMaxLength(20);
            e.Property(x => x.Email).HasMaxLength(100);
        });

        // ── Author ───────────────────────────────────────
        modelBuilder.Entity<Author>(e =>
        {
            e.ToTable("Authors");
            e.HasKey(x => x.AuthorId);
            e.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
            e.Property(x => x.MiddleName).HasMaxLength(50);
            e.Property(x => x.LastName).HasMaxLength(50).IsRequired();
            e.Property(x => x.Address).HasMaxLength(255);
            e.Property(x => x.Phone).HasMaxLength(15);
            e.Property(x => x.Email).HasMaxLength(100);
        });

        // ── BookType ─────────────────────────────────────
        modelBuilder.Entity<BookType>(e =>
        {
            e.ToTable("BookTypes");
            e.HasKey(x => x.Code);
            e.Property(x => x.Code).HasMaxLength(50);
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
        });

        // ── Publisher ────────────────────────────────────
        modelBuilder.Entity<Publisher>(e =>
        {
            e.ToTable("Publishers");
            e.HasKey(x => x.PublisherId);
            e.Property(x => x.Name).HasMaxLength(100);
            e.Property(x => x.Address).HasMaxLength(255);
            e.Property(x => x.Phone).HasMaxLength(20);
            e.Property(x => x.Email).HasMaxLength(100);
        });

        // ── Product ──────────────────────────────────────
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.HasKey(x => x.ProductId);
            e.Property(x => x.Name).HasMaxLength(255).IsRequired();
            e.Property(x => x.ImageUrl).HasMaxLength(255);
            e.Property(x => x.Description).HasColumnType("nvarchar(max)");
            e.Property(x => x.Price).HasColumnType("decimal(9,3)");
            e.Property(x => x.DataJson).HasColumnType("nvarchar(max)");

            e.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Unit).WithMany(x => x.Products).HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Provider).WithMany(x => x.Products).HasForeignKey(x => x.ProviderId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Book ─────────────────────────────────────────
        modelBuilder.Entity<Book>(e =>
        {
            e.ToTable("Books");
            e.HasKey(x => x.BookId);
            e.Property(x => x.Title).HasMaxLength(255);

            e.HasOne(x => x.Product).WithOne(x => x.Book).HasForeignKey<Book>(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Publisher).WithMany(x => x.Books).HasForeignKey(x => x.PublisherId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Author).WithMany(x => x.Books).HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.BookType).WithMany(x => x.Books).HasForeignKey(x => x.BookTypeCode).OnDelete(DeleteBehavior.SetNull);
        });

        // ── Customer ─────────────────────────────────────
        modelBuilder.Entity<Customer>(e =>
        {
            e.ToTable("Customers");
            e.HasKey(x => x.CustomerId);
            e.Property(x => x.PasswordHash).HasMaxLength(255);
            e.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
            e.Property(x => x.MiddleName).HasMaxLength(50);
            e.Property(x => x.LastName).HasMaxLength(50).IsRequired();
            e.Property(x => x.Address).HasMaxLength(255);
            e.Property(x => x.Phone).HasMaxLength(15);
            e.Property(x => x.Email).HasMaxLength(100);
            e.HasIndex(x => x.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
            e.Property(x => x.Gender).HasMaxLength(10);
            e.Property(x => x.Notes).HasColumnType("nvarchar(max)");
        });

        // ── Employee ─────────────────────────────────────
        modelBuilder.Entity<Employee>(e =>
        {
            e.ToTable("Employees");
            e.HasKey(x => x.EmployeeId);
            e.Property(x => x.PasswordHash).HasMaxLength(255);
            e.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
            e.Property(x => x.MiddleName).HasMaxLength(50);
            e.Property(x => x.LastName).HasMaxLength(50).IsRequired();
            e.Property(x => x.Gender).HasMaxLength(10);
            e.Property(x => x.Address).HasMaxLength(255);
            e.Property(x => x.Phone).HasMaxLength(15);
            e.Property(x => x.Email).HasMaxLength(100);
            e.HasIndex(x => x.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
            e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("dang_lam");
            e.Property(x => x.Role).HasMaxLength(20).HasDefaultValue("nhanvien");
            e.Property(x => x.Notes).HasColumnType("nvarchar(max)");
        });

        // ── Cart ─────────────────────────────────────────
        modelBuilder.Entity<Cart>(e =>
        {
            e.ToTable("Carts");
            e.HasKey(x => x.CartId);
            e.HasOne(x => x.Customer).WithOne(x => x.Cart).HasForeignKey<Cart>(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── CartItem ─────────────────────────────────────
        modelBuilder.Entity<CartItem>(e =>
        {
            e.ToTable("CartItems");
            e.HasKey(x => x.CartItemId);
            e.Property(x => x.UnitPrice).HasColumnType("decimal(9,3)");
            e.Property(x => x.SubTotal).HasColumnType("decimal(9,3)");

            e.HasOne(x => x.Cart).WithMany(x => x.Items).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(x => x.CartItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── DeliveryAddress ──────────────────────────────
        modelBuilder.Entity<DeliveryAddress>(e =>
        {
            e.ToTable("DeliveryAddresses");
            e.HasKey(x => x.AddressId);
            e.Property(x => x.Address).IsRequired().HasColumnType("nvarchar(max)");
            e.HasOne(x => x.Customer).WithMany(x => x.DeliveryAddresses).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Order ────────────────────────────────────────
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("Orders");
            e.HasKey(x => x.OrderId);
            e.Property(x => x.TotalAmount).HasColumnType("decimal(15,2)");
            e.Property(x => x.Status).HasMaxLength(30).HasDefaultValue("cho_xac_nhan");
            e.Property(x => x.PaymentMethod).HasMaxLength(30).HasDefaultValue("tien_mat");
            e.Property(x => x.Notes).HasColumnType("nvarchar(max)");

            e.HasOne(x => x.Customer).WithMany(x => x.Orders).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.DeliveryAddress).WithMany(x => x.Orders).HasForeignKey(x => x.AddressId).OnDelete(DeleteBehavior.SetNull);
        });

        // ── OrderItem ────────────────────────────────────
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("OrderItems");
            e.HasKey(x => x.OrderItemId);
            e.Property(x => x.UnitPrice).HasColumnType("decimal(15,2)");
            e.Property(x => x.SubTotal).HasColumnType("decimal(15,2)");

            e.HasOne(x => x.Order).WithMany(x => x.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Promotion ───────────────────────────────────
        modelBuilder.Entity<Promotion>(e =>
        {
            e.ToTable("Promotions");
            e.HasKey(x => x.PromotionId);
            e.Property(x => x.Name).HasMaxLength(100);
        });

        // ── PromotionDetail ─────────────────────────────
        modelBuilder.Entity<PromotionDetail>(e =>
        {
            e.ToTable("PromotionDetails");
            e.HasKey(x => x.DetailId);
            e.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)");

            e.HasOne(x => x.Promotion).WithMany(x => x.Details).HasForeignKey(x => x.PromotionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(x => x.PromotionDetails).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Review ───────────────────────────────────────
        modelBuilder.Entity<Review>(e =>
        {
            e.ToTable("Reviews");
            e.HasKey(x => x.ReviewId);
            e.Property(x => x.Comment).HasColumnType("nvarchar(max)");

            e.HasOne(x => x.Customer).WithMany(x => x.Reviews).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(x => x.Reviews).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── WishlistItem ────────────────────────────────
        modelBuilder.Entity<WishlistItem>(e =>
        {
            e.ToTable("WishlistItems");
            e.HasKey(x => x.WishlistItemId);
            e.HasIndex(x => new { x.CustomerId, x.ProductId }).IsUnique();

            e.HasOne(x => x.Customer).WithMany(x => x.WishlistItems).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(x => x.WishlistItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Notification ─────────────────────────────────
        modelBuilder.Entity<Notification>(e =>
        {
            e.ToTable("Notifications");
            e.HasKey(x => x.NotificationId);
            e.Property(x => x.Title).IsRequired().HasColumnType("nvarchar(max)");
            e.Property(x => x.Content).IsRequired().HasColumnType("nvarchar(max)");
            e.Property(x => x.Type).HasMaxLength(30).HasDefaultValue("he_thong");
            e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("chua_doc");

            e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}