# E-Commerce Book Platform

Hệ thống thương mại điện tử bán sách trực tuyến được xây dựng với kiến trúc monolith tách biệt rõ ràng giữa Backend API và Frontend

## Kiến trúc hệ thống

```
├── backend/          # ASP.NET Core 8 Web API
├── frontend/         # Angular 18 Application
├── deploy/           # Docker Compose & Nginx config
├── tests/            # Unit & Integration Tests
└── template_database/# Database schema & seed data
```

## Backend (ASP.NET Core 8)

**Công nghệ:**

- .NET 8 / ASP.NET Core Web API
- Entity Framework Core (SQL Server)
- JWT Authentication + Refresh Token
- Redis Caching (StackExchange.Redis)
- SeaweedFS / Local File Storage
- VNPay Payment Integration
- MailKit Email Service
- AutoMapper, FluentValidation
- Serilog Logging

**Cấu trúc:**

```
backend/
├── Controllers/          # API Controllers (Customer & Employee)
├── Services/             # Business Logic (Interfaces + Implementations)
├── Data/                 # EF Core DbContext & Migrations
├── Models/               # Domain Entities
├── DTOs/                 # Request/Response Objects
├── Mapping/              # AutoMapper Profiles
├── Middleware/           # Custom Middleware
└── Properties/           # Launch Settings
```

**Chức năng chính:**

- Authentication/Authorization (Customer + Employee roles)
- Quản lý sách, danh mục, tác giả, nhà xuất bản
- Giỏ hàng, đặt hàng, thanh toán (VNPay)
- Đánh giá, yêu thích, thông báo
- Quản trị viên: Dashboard, CRUD đầy đủ, báo cáo
- Quản lý kho, khuyến mãi, đơn vị tính

## Frontend (Angular 18)

**Công nghệ:**

- Angular 18 (Standalone Components)
- Angular Signals & New Control Flow
- Tailwind CSS + shadcn/ui inspired components
- RxJS State Management
- Angular SSR (Server-Side Rendering)
- PWA Ready

**Cấu trúc:**

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Guards, Interceptors, Services, Models
│   │   ├── external/          # Public pages (Home, Products, Auth, Cart)
│   │   ├── internal/          # Admin pages (Dashboard, CRUD Management)
│   │   ├── shared/            # Shared Components, Pipes, Directives
│   │   └── layouts/           # Layout Components
│   ├── environments/          # Environment configs
│   └── styles.css             # Global Styles + Tailwind
├── angular.json
├── package.json
└── tsconfig.json
```

**Trang khách hàng:**

- Trang chủ, Danh sách sản phẩm, Chi tiết sản phẩm
- Đăng ký/Đăng nhập, Quên mật khẩu
- Giỏ hàng, Thanh toán, Đơn hàng
- Wishlist, Đánh giá, Thông báo
- Các trang chính sách (Bảo mật, Đổi trả, Vận chuyển)

**Trang quản trị:**

- Dashboard tổng quan
- Quản lý: Sách, Danh mục, Tác giả, NXB, Khuyến mãi
- Quản lý: Khách hàng, Nhân viên, Đơn hàng
- Báo cáo doanh thu, Thống kê

## Triển khai (Deployment)

```bash
# Development
docker-compose -f deploy/docker-compose.yml up -d

# Production
docker-compose -f deploy/docker-compose.prod.yml up -d
```

**Services:**

- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:4200`
- SQL Server: `localhost:1433`
- Redis: `localhost:6379`
- SeaweedFS: `localhost:8888` (Master), `localhost:9333` (Volume)

## Testing

```bash
cd tests/ECommerceBookPlatform.Tests
dotnet test
```

## Yêu cầu hệ thống

- .NET 8 SDK
- Node.js 20+ & pnpm
- SQL Server 2019+
- Redis 7+
- Docker & Docker Compose (optional)

## License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.

---

*Cập nhật lần cuối: 15/08/2026*
