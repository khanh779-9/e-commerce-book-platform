
SET NOCOUNT ON;
GO

-- =============================================
-- CREATE DATABASE
-- =============================================
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'db_nhasach')
BEGIN
    ALTER DATABASE db_nhasach SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE db_nhasach;
END
GO

CREATE DATABASE db_nhasach;
GO

USE db_nhasach;
GO

-- =============================================
-- STEP 1: CREATE TABLES
-- =============================================

CREATE TABLE Categories (
  CategoryId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  Description NVARCHAR(MAX) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Units (
  UnitId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(50) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Providers (
  ProviderId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(100) NULL,
  Address NVARCHAR(255) NULL,
  Phone NVARCHAR(20) NULL,
  Email NVARCHAR(100) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Authors (
  AuthorId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  FirstName NVARCHAR(50) NOT NULL,
  MiddleName NVARCHAR(50) NULL,
  LastName NVARCHAR(50) NOT NULL,
  Address NVARCHAR(255) NULL,
  Phone NVARCHAR(15) NULL,
  Email NVARCHAR(100) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE BookTypes (
  Code NVARCHAR(50) NOT NULL PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE(),
  CONSTRAINT CK_BookTypes_Code CHECK (Code IN ('vat_ly','hoahoc','giaokhoa','kythuat','kinhte','ngoaingu','phapluat','tudien','loaimoi','tinhoc','toanhoc','thethao_dulich','vanhoc','vanhoa_xahoi'))
);
GO

CREATE TABLE Publishers (
  PublisherId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(100) NULL,
  Address NVARCHAR(255) NULL,
  Phone NVARCHAR(20) NULL,
  Email NVARCHAR(100) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Products (
  ProductId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  CategoryId INT NULL,
  ImageUrl NVARCHAR(255) NULL,
  Description NVARCHAR(MAX) NULL,
  StockQuantity INT DEFAULT 0,
  UnitId INT NULL,
  SoldQuantity INT DEFAULT 0,
  Price DECIMAL(9,3) NOT NULL,
  ProviderId INT NOT NULL,
  DataJson NVARCHAR(MAX) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Books (
  BookId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ProductId INT NULL,
  PublisherId INT NULL,
  PublishedYear INT NULL,
  AuthorId INT NULL,
  BookTypeCode NVARCHAR(50) NULL,
  Title NVARCHAR(255) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE(),
  CONSTRAINT CK_Books_BookTypeCode CHECK (BookTypeCode IN ('vat_ly','hoahoc','giaokhoa','kythuat','kinhte','ngoaingu','phapluat','tudien','loaimoi','tinhoc','toanhoc','thethao_dulich','vanhoc','vanhoa_xahoi'))
);
GO

CREATE TABLE Customers (
  CustomerId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  PasswordHash NVARCHAR(255) NULL,
  FirstName NVARCHAR(50) NOT NULL,
  MiddleName NVARCHAR(50) NULL,
  LastName NVARCHAR(50) NOT NULL,
  BirthDate DATE NULL,
  Address NVARCHAR(255) NULL,
  Phone NVARCHAR(15) NULL,
  Email NVARCHAR(100) NULL UNIQUE,
  Gender NVARCHAR(10) NULL CONSTRAINT CK_Customers_Gender CHECK (Gender IN ('Nam','Nu','Khac')),
  JoinedAt DATETIME DEFAULT GETDATE(),
  Notes NVARCHAR(MAX) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Employees (
  EmployeeId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  PasswordHash NVARCHAR(255) NULL,
  FirstName NVARCHAR(50) NOT NULL,
  MiddleName NVARCHAR(50) NULL,
  LastName NVARCHAR(50) NOT NULL,
  Gender NVARCHAR(10) NULL CONSTRAINT CK_Employees_Gender CHECK (Gender IN ('Nam','Nu','Khac')),
  BirthDate DATE NULL,
  Address NVARCHAR(255) NULL,
  Phone NVARCHAR(15) NULL,
  Email NVARCHAR(100) NULL UNIQUE,
  StartDate DATE DEFAULT CAST(GETDATE() AS DATE),
  Status NVARCHAR(50) DEFAULT 'dang_lam' CONSTRAINT CK_Employees_Status CHECK (Status IN ('dang_lam','nghi_viec','tam_nghi')),
  Role NVARCHAR(50) NOT NULL DEFAULT 'nhanvien' CONSTRAINT CK_Employees_Role CHECK (Role IN ('admin','quanly','nhanvien')),
  Notes NVARCHAR(MAX) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Carts (
  CartId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CustomerId INT NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  ItemCount INT NOT NULL DEFAULT 0,
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE CartItems (
  CartItemId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CartId INT NULL,
  ProductId INT NULL,
  Quantity INT NULL,
  UnitPrice DECIMAL(9,3) NOT NULL,
  SubTotal DECIMAL(9,3) NOT NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE DeliveryAddresses (
  AddressId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CustomerId INT NOT NULL,
  Address NVARCHAR(MAX) NOT NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Orders (
  OrderId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CustomerId INT NULL,
  EmployeeId INT NULL,
  AddressId INT NULL,
  OrderDate DATETIME DEFAULT GETDATE(),
  TotalAmount DECIMAL(15,2) NULL,
  Status NVARCHAR(50) DEFAULT 'cho_xac_nhan' CONSTRAINT CK_Orders_Status CHECK (Status IN ('cho_xac_nhan','da_xac_nhan','dang_giao_hang','da_giao_hang','da_huy')),
  PaymentMethod NVARCHAR(50) DEFAULT 'tien_mat' CONSTRAINT CK_Orders_PaymentMethod CHECK (PaymentMethod IN ('tien_mat','chuyen_khoan','vi_dien_tu')),
  Notes NVARCHAR(MAX) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE OrderItems (
  OrderItemId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  OrderId INT NULL,
  ProductId INT NULL,
  Quantity INT NULL,
  UnitPrice DECIMAL(15,2) NULL,
  SubTotal DECIMAL(15,2) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Promotions (
  PromotionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(100) NULL,
  StartDate DATE NULL,
  EndDate DATE NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE PromotionDetails (
  DetailId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  PromotionId INT NULL,
  ProductId INT NULL,
  Quantity INT NULL,
  DiscountPercent DECIMAL(5,2) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Reviews (
  ReviewId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CustomerId INT NOT NULL,
  ProductId INT NOT NULL,
  Rating TINYINT NOT NULL,
  Comment NVARCHAR(MAX) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE WishlistItems (
  WishlistItemId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CustomerId INT NOT NULL,
  ProductId INT NOT NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Notifications (
  NotificationId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  CustomerId INT NULL,
  EmployeeId INT NULL,
  Title NVARCHAR(MAX) NOT NULL,
  Content NVARCHAR(MAX) NOT NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  Type NVARCHAR(50) NOT NULL DEFAULT 'he_thong' CONSTRAINT CK_Notifications_Type CHECK (Type IN ('khach_hang','don_hang','he_thong','noi_bo','')),
  Status NVARCHAR(50) NOT NULL DEFAULT 'chua_doc' CONSTRAINT CK_Notifications_Status CHECK (Status IN ('da_doc','chua_doc','luu_tru','')),
  UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE personal_access_tokens (
  id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  token NVARCHAR(64) NOT NULL UNIQUE,
  abilities NVARCHAR(MAX) NULL,
  tokenable_id BIGINT NOT NULL,
  tokenable_type NVARCHAR(255) NOT NULL,
  updated_at DATETIME NULL,
  created_at DATETIME NULL,
  last_used_at DATETIME NULL,
  expires_at DATETIME NULL
);
GO

-- =============================================
-- STEP 2: CREATE INDEXES
-- =============================================

CREATE INDEX idx_CartItems_CartId ON CartItems(CartId);
CREATE INDEX idx_CartItems_ProductId ON CartItems(ProductId);
CREATE INDEX idx_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX idx_OrderItems_ProductId ON OrderItems(ProductId);
CREATE INDEX idx_PromotionDetails_PromotionId ON PromotionDetails(PromotionId);
CREATE INDEX idx_PromotionDetails_ProductId ON PromotionDetails(ProductId);
CREATE INDEX idx_Reviews_CustomerId ON Reviews(CustomerId);
CREATE INDEX idx_Reviews_ProductId ON Reviews(ProductId);
CREATE INDEX idx_DeliveryAddresses_CustomerId ON DeliveryAddresses(CustomerId);
CREATE INDEX idx_Carts_CustomerId ON Carts(CustomerId);
CREATE INDEX idx_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX idx_Orders_EmployeeId ON Orders(EmployeeId);
CREATE INDEX idx_Orders_AddressId ON Orders(AddressId);
CREATE INDEX idx_Orders_OrderDate ON Orders(OrderDate);
CREATE INDEX idx_Orders_Status ON Orders(Status);
CREATE INDEX idx_Books_ProductId ON Books(ProductId);
CREATE INDEX idx_Books_PublisherId ON Books(PublisherId);
CREATE INDEX idx_Books_AuthorId ON Books(AuthorId);
CREATE INDEX idx_Books_BookTypeCode ON Books(BookTypeCode);
CREATE INDEX idx_Products_UnitId ON Products(UnitId);
CREATE INDEX idx_Products_CategoryId ON Products(CategoryId);
CREATE INDEX idx_Products_Name ON Products(Name);
CREATE INDEX idx_Products_Price ON Products(Price);
CREATE INDEX idx_WishlistItems_CustomerId ON WishlistItems(CustomerId);
CREATE INDEX idx_WishlistItems_ProductId ON WishlistItems(ProductId);
CREATE INDEX idx_Notifications_CustomerId ON Notifications(CustomerId);
CREATE INDEX idx_Notifications_EmployeeId ON Notifications(EmployeeId);
GO

-- =============================================
-- STEP 3: DATA INSERTION
-- =============================================

-- Categories
SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (CategoryId, Name, Description) VALUES
(1, N'Sách', N'Tất cả các thể loại sách: giáo khoa, tham khảo, văn học, thiếu nhi...'),
(2, N'Văn phòng phẩm', N'Bút, vở, băng keo, hồ, kéo, dụng cụ học tập...'),
(3, N'Quà & phụ kiện', N'Quà tặng, bookmark, card, set quà, lịch bàn, lịch treo tường và thiệp');
SET IDENTITY_INSERT Categories OFF;
GO

-- Units
SET IDENTITY_INSERT Units ON;
INSERT INTO Units (UnitId, Name) VALUES
(1, N'Quyển'),
(2, N'Cái'),
(3, N'Hộp');
SET IDENTITY_INSERT Units OFF;
GO

-- Providers
SET IDENTITY_INSERT Providers ON;
INSERT INTO Providers (ProviderId, Name, Address, Phone, Email) VALUES
(1, N'[Nhà cung cấp không xác định]', N'-', N'-', N'unknown@unknown.u'),
(2, N'Công ty Sách XYZ', N'Số 22, Đường B, TP.HCM', N'0281234002', N'contact@xyzbooks.vn'),
(3, N'Nhà phân phối Sách LMN', N'Số 5, Phố C, Đà Nẵng', N'02361234003', N'info@lmn-distrib.vn'),
(4, N'Công ty Văn Phòng Phẩm HN', N'Số 8, Nguyễn Trãi, Hà Nội', N'0242233444', N'sales@vpphn.vn'),
(5, N'Công ty Thiết Bị Giáo Dục - Đào Tạo VN', N'Số 12, Trần Hưng Đạo, Hà Nội', N'0243334005', N'edu@devices.vn'),
(6, N'Công ty Sách & VPP TPH', N'Số 50, Lê Lợi, TP.HCM', N'0283344556', N'support@sachvpp.vn'),
(7, N'Công ty Phát Hành Sách Đông A', N'Số 77, Hùng Vương, Đà Nẵng', N'0236399007', N'info@donga-pub.vn'),
(8, N'Nhà Cung Cấp Văn Phòng Phẩm Gia Đình', N'Số 3, Đường D, Cần Thơ', N'0292388008', N'hello@gd-vpp.vn'),
(9, N'Công ty Sách Giáo Khoa Việt', N'Số 99, Nguyễn Du, Hà Nội', N'0244455669', N'gk@giaokhoavn.vn'),
(10, N'Công ty Thiên Long', N'KCN Thăng Long, Hà Nội', N'0245566770', N'support@thienlong.vn'),
(11, N'Công ty In Ấn FastPrint', N'Số 18, Đường E, Hải Phòng', N'0225333441', N'print@fastprint.vn'),
(12, N'Công ty Đầu Tư Giáo Dục A+B', N'Số 6, Phố F, Hà Nội', N'0246667002', N'contact@eduab.vn'),
(13, N'Công ty Sách Trung Nam', N'Số 30, Quang Trung, TP.HCM', N'0287788993', N'sales@trungnam.vn'),
(14, N'Công ty Vật Tư Văn Phòng QN', N'Số 2, Đường G, Quảng Ninh', N'0203334404', N'vpp@quangninh.vn'),
(15, N'Nhà cung cấp SGBooks', N'Số 15, Phố H, Sài Gòn', N'0289990015', N'info@sgbooks.vn'),
(16, N'Công ty Phân Phối Minh An', N'Số 21, Đường I, Đà Nẵng', N'0236699006', N'minhan@dist.vn'),
(17, N'Công ty Sách & Quà Tặng', N'Số 7, Nguyễn Thái Học, Hà Nội', N'0247778007', N'gifts@booksandgifts.vn'),
(18, N'Công ty Thiết Bị Học Tập Pro', N'Số 40, Lê Lợi, Thanh Hóa', N'0237366008', N'pro@edu-supplies.vn'),
(19, N'Nhà cung cấp Hồng Phát', N'Số 11, Đường J, Huế', N'0237345009', N'contact@hongphat.vn'),
(20, N'Công ty Văn Phòng Phẩm Bình Minh', N'Số 90, Đường K, Bình Dương', N'0274333440', N'sales@binhminhvpp.vn'),
(21, N'Công ty Sách Quốc Tế', N'Số 60, Phố L, Hà Nội', N'0249988771', N'intl@bookworld.vn'),
(22, N'Nhà cung cấp Sách Trẻ', N'Số 8, Đường M, TP.HCM', N'0281234762', N'sales@nxbtree.vn'),
(23, N'Công ty VPP Toàn Cầu', N'Số 101, Đường N, Hà Nội', N'0241111223', N'global@vpp.vn'),
(24, N'Công ty Sách Minh Thành', N'Số 45, Đường O, Hải Phòng', N'0225444335', N'info@minhthanhbooks.vn'),
(25, N'Nhà phân phối Văn Phòng Phẩm An Khang', N'Số 4, Đường P, Cần Thơ', N'0292388776', N'ankhang@dist.vn'),
(26, N'Công ty Sách Giá Rẻ', N'Số 33, Đường Q, Đà Nẵng', N'0236122117', N'cheapbooks@vn.vn'),
(27, N'Nhà cung cấp Thiết Bị Giáo Dục Tâm An', N'Số 12, Đường R, Hà Nội', N'0242222338', N'taman@edu.vn'),
(28, N'Công ty Sách Long Phát', N'Số 9, Đường S, TP.HCM', N'0282233449', N'longphat@books.vn'),
(30, N'Test2', N'asd', N'234324', N'sadasd@fmai.co');
SET IDENTITY_INSERT Providers OFF;
GO

-- Publishers
SET IDENTITY_INSERT Publishers ON;
INSERT INTO Publishers (PublisherId, Name, Address, Phone, Email) VALUES
(1, N'[NXB không xác định]', N'-', N'-', N'-'),
(2, N'NXB Văn Hóa - Văn Nghệ', N'Số 12 Trần Hưng Đạo, Hà Nội', N'0243822333', N'info@vanhoa-vn.vn'),
(3, N'NXB Tổng hợp TP. HCM', N'Số 200 Lê Lợi, Quận 1, TP.HCM', N'0283922111', N'support@tonghophcm.vn'),
(4, N'NXB Thanh Niên', N'Số 7 Phạm Ngọc Thạch, Hà Nội', N'0243777888', N'hello@nxbthanhnien.vn'),
(5, N'NXB Trẻ', N'Số 18 Nguyễn Thái Học, TP.HCM', N'0283912345', N'contact@nxbtre.vn'),
(6, N'NXB Khoa Học & Kỹ Thuật', N'Số 8 Nguyễn Chí Thanh, Hà Nội', N'0243999000', N'info@khoahockt.vn'),
(7, N'NXB Giáo Trình Đại Học', N'Số 33 Hoàng Hoa Thám, Hà Nội', N'0243123456', N'giao_trinh@dh.edu.vn'),
(8, N'NXB Văn Học', N'Số 56 Nguyễn Văn Cừ, TP.HCM', N'0283765432', N'vanhoc@books.vn'),
(9, N'NXB Kim Đồng', N'Số 10 Hàng Bài, Hà Nội', N'0243944556', N'contact@kimdong.vn'),
(10, N'NXB Phụ Nữ', N'Số 22 Bà Triệu, Hà Nội', N'0243999888', N'info@phunu.vn'),
(11, N'NXB Tri Thức', N'Số 55 Lý Thường Kiệt, Hà Nội', N'0243567890', N'support@trithuc.vn'),
(12, N'NXB Hội Nhà Văn', N'Số 3 Quang Trung, Hà Nội', N'0243888777', N'hnv@nhavan.vn'),
(13, N'NXB Văn Hóa - Xã Hội', N'Số 77 Nguyễn Trãi, TP.HCM', N'0283999001', N'vhxh@publish.vn'),
(14, N'NXB Nghệ Thuật', N'Số 9 Phùng Hưng, Hà Nội', N'0243456000', N'art@nxbanh.vn'),
(15, N'NXB chính trị quốc gia', N'Số 6/86 Duy Tân, Cầu Giấy, Hà Nội', N'0236391234', N'info@tonghopdn.vn'),
(16, N'NXB Kinh Tế', N'Số 88 Hai Bà Trưng, Hà Nội', N'0243111222', N'kinhte@nxbbusiness.vn'),
(17, N'NXB Thanh Hóa', N'Số 5 Lê Lợi, Thanh Hóa', N'0237365432', N'contact@nxbthanhhoa.vn'),
(18, N'NXB Cẩm Nang Sống', N'Số 21 Nguyễn Thị Minh Khai, TP.HCM', N'0283911999', N'info@camnang.vn'),
(19, N'NXB Sư Phạm', N'Số 12 Trần Phú, Hà Nội', N'0243777666', N'supham@edu.vn'),
(20, N'NXB Hồng Đức', N'Số 44 Lê Lợi, Hà Nội', N'0243889000', N'info@hongduc.vn'),
(21, N'NXB Văn Học Trẻ', N'Số 3 Lý Thường Kiệt, TP.HCM', N'0283766000', N'vhtre@books.vn'),
(22, N'NXB Tài Chính', N'Số 18 Nguyễn Du, Hà Nội', N'0243991122', N'finance@nxbtc.vn'),
(23, N'NXB Khoa Học Xã Hội', N'Số 66 Phan Chu Trinh, Hà Nội', N'0243113344', N'shs@nxb.vn'),
(24, N'NXB Đà Lạt', N'Số 7 Trần Phú, Đà Lạt', N'0263388777', N'dalat@nxb.vn'),
(25, N'NXB Sống Đẹp', N'Số 90 Nguyễn Khánh Toàn, Hà Nội', N'0243451234', N'songdep@nxb.vn');
SET IDENTITY_INSERT Publishers OFF;
GO

-- Authors
SET IDENTITY_INSERT Authors ON;
INSERT INTO Authors (AuthorId, FirstName, MiddleName, LastName, Address, Phone, Email) VALUES
(1, N'-', N' -', N'[Tác giả không xác định]', N'Hà Nội', N'0912345001', N'tg.an01@example.com'),
(2, N'Trần', N'Thị', N'Bích', N'Hồ Chí Minh', N'0912345002', N'tg.bich02@example.com'),
(3, N'Lê', N'Văn', N'Cường', N'Đà Nẵng', N'0912345003', N'tg.cuong03@example.com'),
(4, N'Phạm', N'Thị', N'Duyên', N'Hải Phòng', N'0912345004', N'tg.duyen04@example.com'),
(5, N'Hoàng', N'Văn', N'Em', N'Cần Thơ', N'0912345005', N'tg.em05@example.com'),
(6, N'Vũ', N'Minh', N'Hùng', N'Hà Nội', N'0912345006', N'tg.hung06@example.com'),
(7, N'Đặng', N'Thị', N'Hạnh', N'Huế', N'0912345007', N'tg.hanh07@example.com'),
(8, N'Bùi', N'Văn', N'Khoa', N'Bắc Ninh', N'0912345008', N'tg.khoa08@example.com'),
(9, N'Ngô', N'Thị', N'Lan', N'Hồ Chí Minh', N'0912345009', N'tg.lan09@example.com'),
(10, N'Phan', N'Văn', N'Long', N'Hải Phòng', N'0912345010', N'tg.long10@example.com'),
(11, N'Trương', N'Thị', N'Mai', N'Hà Nội', N'0912345011', N'tg.mai11@example.com'),
(12, N'Đỗ', N'Văn', N'Nam', N'Đà Nẵng', N'0912345012', N'tg.nam12@example.com'),
(13, N'Dương', N'Thị', N'Nga', N'Hồ Chí Minh', N'0912345013', N'tg.nga13@example.com'),
(14, N'Lâm', N'Minh', N'Phúc', N'Nha Trang', N'0912345014', N'tg.phuc14@example.com'),
(15, N'Phùng', N'Văn', N'Quân', N'Hà Nội', N'0912345015', N'tg.quan15@example.com'),
(16, N'Võ', N'Thị', N'Quỳnh', N'Cần Thơ', N'0912345016', N'tg.quynh16@example.com'),
(17, N'Cao', N'Văn', N'Sơn', N'Thanh Hóa', N'0912345017', N'tg.son17@example.com'),
(18, N'Hà', N'Thị', N'Thảo', N'Hà Nội', N'0912345018', N'tg.thao18@example.com'),
(19, N'Thái', N'Văn', N'Tiến', N'Hồ Chí Minh', N'0912345019', N'tg.tien19@example.com'),
(20, N'Mai', N'Thị', N'Trang', N'Đà Nẵng', N'0912345020', N'tg.trang20@example.com'),
(21, N'Phó', N'Văn', N'Trung', N'Hải Phòng', N'0912345021', N'tg.trung21@example.com'),
(22, N'Lý', N'Thị', N'Uyên', N'Hà Nội', N'0912345022', N'tg.uyen22@example.com'),
(23, N'Hồ', N'Văn', N'Việt', N'TP. HCM', N'0912345023', N'tg.viet23@example.com'),
(24, N'Nguyễn', N'Thị', N'Xuyến', N'Bình Dương', N'0912345024', N'tg.xuyen24@example.com'),
(25, N'Trần', N'Văn', N'Yên', N'Hà Nội', N'0912345025', N'tg.yen25@example.com'),
(26, N'Phạm', N'Minh', N'Zê', N'Cần Thơ', N'0912345026', N'tg.ze26@example.com'),
(27, N'Lê', N'Thị', N'Ánh', N'Hòa Bình', N'0912345027', N'tg.anh27@example.com'),
(28, N'Bùi', N'Minh', N'Bảo', N'Huế', N'0912345028', N'tg.bao28@example.com'),
(29, N'Đặng', N'Thị', N'Chi', N'Hải Phòng', N'0912345029', N'tg.chi29@example.com'),
(30, N'Ngô', N'Văn', N'Đạt', N'Đà Nẵng', N'0912345030', N'tg.dat30@example.com'),
(31, N'Phan', N'Thị', N'Gấm', N'Quảng Ninh', N'0912345031', N'tg.gam31@example.com'),
(32, N'Cung', N'Kim', N'Tiến', N'Hồ Chí Minh', N'0912345032', N'tg.tien32@example.com'),
(33, N'Nguyễn', N'Như', N'Ý', N'Hà Nội', N'0912345033', N'tg.y33@example.com'),
(34, N'Nguyễn', N'Đình', N'Tư', N'Hồ Chí Minh', N'0912345034', N'tg.tu34@example.com');
SET IDENTITY_INSERT Authors OFF;
GO

-- BookTypes
INSERT INTO BookTypes (Code, Name) VALUES
(N'vat_ly', N'Vật lý'),
(N'hoahoc', N'Hóa học'),
(N'giaokhoa', N'Sách giáo khoa'),
(N'kythuat', N'Kỹ thuật'),
(N'kinhte', N'Kinh tế'),
(N'ngoaingu', N'Ngoại ngữ'),
(N'phapluat', N'Pháp luật'),
(N'tudien', N'Từ điển'),
(N'loaimoi', N'Sách mới/Hot'),
(N'tinhoc', N'Tin học - CNTT'),
(N'toanhoc', N'Toán học'),
(N'thethao_dulich', N'Thể thao & Du lịch'),
(N'vanhoc', N'Văn học'),
(N'vanhoa_xahoi', N'Văn hóa - Xã hội');
GO

-- Customers
SET IDENTITY_INSERT Customers ON;
INSERT INTO Customers (CustomerId, PasswordHash, FirstName, MiddleName, LastName, BirthDate, Address, Phone, Email, Gender, JoinedAt) VALUES
(1, N'$2y$10$8m4pKfrzVNu6randbO5/9er6cOAOjeRNMhm4S9xUDwHDOrUVquU66', N'Nguyen', N'Van', N'An', '1990-01-01', N'Hanoi', N'0987654321', N'nguyenvanA@example.com', N'Nam', '2025-11-02 11:13:51'),
(2, N'$2y$10$yTLModrZ9oltLvL2H292TOiHyQ0gVAfE/f6.wuQuriM3b0E4FSRti', N'Tran', N'Thi', N'Binh', '1985-05-12', N'Ho Chi Minh', N'0912345678', N'tranthiB@example.com', N'Nu', '2025-11-02 11:13:51'),
(3, N'xyz789', N'Le', NULL, N'Cuong', '2000-07-20', N'Da Nang', N'0905123456', N'levanC@example.com', N'Nam', '2025-11-02 11:13:51'),
(4, N'$2y$10$t1Xl0SIkhwgQ0HkflVBGAerSOwo24ERyZnNAJC0wRr6rg2YpvIvfS', N'Trần', N'Quốc', N'Khánh', '2025-12-12', N'', N'0329675483', N'du122o@maily.org', NULL, '2025-12-11 08:40:42'),
(5, N'$2y$10$juKMi7ZEbdrbvZyTDrDDu.bI5FUITrPtQkHP1OS8cOefT4D9yBSl2', N'Nguyễn', N'Thị Tuyết', N'Nhi', NULL, N'sdasdasd', N'02938475', N'nhixinh.slurp285@passinbox.com', NULL, '2025-12-11 21:42:26'),
(6, N'$2y$10$.Rug8xdaOKJsqlco0iG3yO.X6BdZWWUNpDWJzc546HRg8GYxqIroS', N'Khanh', N'', N'T', NULL, NULL, NULL, N'qkhanh3921@gmail.com', NULL, '2025-12-16 21:05:29');
SET IDENTITY_INSERT Customers OFF;
GO

-- Employees
SET IDENTITY_INSERT Employees ON;
INSERT INTO Employees (EmployeeId, PasswordHash, FirstName, MiddleName, LastName, Gender, BirthDate, Address, Phone, Email, StartDate, Status, Role, Notes, CreatedAt, UpdatedAt) VALUES
(1, N'$2a$11$VAgkLGIK1PzicusMQjiMaeEpT6pIzik7hBttydiymcc/wlEfizn0W', N'Nguyễn', N'Van', N'Xuan', N'Nu', '1980-03-10', N'Hanoi', N'0123456789', N'xuan.nguyen1@example.com', '2020-01-01', N'dang_lam', N'nhanvien', N'Phu tra viec', '2025-11-02 04:13:51', '2025-12-13 10:30:39'),
(2, N'$2a$11$VAgkLGIK1PzicusMQjiMaeEpT6pIzik7hBttydiymcc/wlEfizn0W', N'Nguyễn', N'Van', N'Xuan', N'Nu', '1980-03-10', N'Hanoi', N'0123456789', N'xuan.nguyen@example.com', '2020-01-01', N'dang_lam', N'nhanvien', N'Phu tra viec', '2025-11-02 04:13:51', '2025-12-13 10:30:39'),
(3, N'$2a$11$VAgkLGIK1PzicusMQjiMaeEpT6pIzik7hBttydiymcc/wlEfizn0W', N'Tran', N'Thi', N'Minh', N'Nam', '1975-12-05', N'Ho Chi Minh', N'0987654321', N'tran.minh@example.com', '2018-06-15', N'dang_lam', N'nhanvien', N'Quan ly phong', '2025-11-02 04:13:51', '2025-12-19 17:25:01'),
(4, N'$2a$11$VAgkLGIK1PzicusMQjiMaeEpT6pIzik7hBttydiymcc/wlEfizn0W', N'Trần', N'Quốc', N'Khánh', N'Nam', '2004-09-02', N'STU 180 Cao Lỗ, Quận 8', N'0124456', N'du122o@maily.org', '2025-12-10', N'dang_lam', N'admin', N'4444', '2025-12-10 04:17:10', '2025-12-13 09:40:23'),
(5, N'$2a$11$VAgkLGIK1PzicusMQjiMaeEpT6pIzik7hBttydiymcc/wlEfizn0W', N'sà', N'sfds', N'fdsf', N'Nam', '2025-12-05', N'ddđ', N'243254', N'qkhanh12.duration060@passinbox.com', '2025-12-26', N'dang_lam', N'nhanvien', NULL, '2025-12-10 04:17:10', '2025-12-10 10:18:41'),
(6, N'$2a$11$VAgkLGIK1PzicusMQjiMaeEpT6pIzik7hBttydiymcc/wlEfizn0W', N'343', N'5345', N'5345435', N'Nu', '2025-12-22', N'324', N'345435', N'nhixinh.traps404@passfwd.com', '2025-12-13', N'dang_lam', N'nhanvien', N'34', '2025-12-13 09:43:43', '2025-12-13 09:43:43');
SET IDENTITY_INSERT Employees OFF;
GO

-- DeliveryAddresses
SET IDENTITY_INSERT DeliveryAddresses ON;
INSERT INTO DeliveryAddresses (AddressId, CustomerId, Address) VALUES
(1, 1, N'Cổng trước STU - 180 Cao Lỗ, Phường 14, Quận 8'),
(2, 1, N'Cổng sau STU - Phạm Hùng, Quận 8'),
(3, 2, N'25 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'),
(4, 2, N'90 Trần Hưng Đạo, Quận 5, TP.HCM'),
(5, 3, N'88 Lê Văn Việt, Quận 9, TP.Thủ Đức'),
(6, 4, N'12 Trần Hưng Đạo, Quận 5, TP.HCM');
SET IDENTITY_INSERT DeliveryAddresses OFF;
GO

-- Promotions
SET IDENTITY_INSERT Promotions ON;
INSERT INTO Promotions (PromotionId, Name, StartDate, EndDate) VALUES
(1, N'Giảm giá mùa tựu trường', '2025-08-01', '2025-09-30'),
(2, N'Khuyến mãi Giáng Sinh', '2025-12-01', '2025-12-25'),
(3, N'Khuyến mãi Tết Nguyên Đán', '2026-01-15', '2026-02-10'),
(4, N'Giảm giá mùa hè', '2026-06-01', '2026-07-31'),
(9, N'CMC', '2025-12-17', '2025-12-18'),
(10, N'CMC', '2025-12-17', '2025-12-18');
SET IDENTITY_INSERT Promotions OFF;
GO

-- Products
SET IDENTITY_INSERT Products ON;
INSERT INTO Products (ProductId, Name, CategoryId, ImageUrl, Description, StockQuantity, UnitId, SoldQuantity, Price, ProviderId) VALUES
(1, N'Sách giáo khoa Toán 10 – Bộ Cánh Diều (Tập 1)', 1, N'toan10_canhdieu_tap_1.jpg', N'Sách giáo khoa Toán 10 – Bộ Cánh Diều (Tập 1) là tài liệu chính thống, được sử dụng rộng rãi tại nhiều trường THPT trên toàn quốc. Sách bám sát mục tiêu chất lượng và cập nhật kiến thức hiện đại, giúp học sinh phát triển tư duy logic và năng lực giải quyết vấn đề.', 129, 1, 47, 45000.000, 1),
(2, N'Ngữ văn 11 - Tập 1', 1, N'Ngu-Van-11-Tap-1-600x853.jpg', N'Ngữ văn 11 - Tập 1', 112, 1, 33, 50000.000, 1),
(3, N'Tiếng Anh 12 - Sách học sinh', 1, N'ta12-global.png', N'Tiếng Anh 12 - Sách học sinh', 75, 1, 23, 52000.000, 2),
(4, N'Tiếng Anh 12 - Sách bài tập', 1, N'sach_ta_12_bt.jpg', N'Tiếng Anh 12 - Sách bài tập', 195, 1, 85, 98000.000, 2),
(5, N'Đắc Nhân Tâm - Dale Carnegie', 1, N'dac-nhan-tam-1.jpg', N'Đắc Nhân Tâm - Dale Carnegie', 298, 1, 120, 85000.000, 1),
(6, N'Harry Potter và Hòn đá Phù Thủy', 1, N'Sach-Noi-Harry-Potter-Tap-1-J-K-Rowling-audio-book-sachnoi.cc-4.jpg', N'Harry Potter và Hòn đá Phù Thủy là cuốn mở đầu trong loạt truyện nổi tiếng của J.K. Rowling, kể về hành trình cậu bé mồ côi Harry khám phá thân thế phù thủy của mình.', 88, 1, 61, 135000.000, 2),
(7, N'Vở hồng hà 96 trang', 2, N'vo_hong_ha_96t.jpg', N'Vở Hồng Hà 96 trang được làm từ giấy trắng sáng, mịn, không lem mực. Bìa vở thiết kế bền đẹp. Mỗi lốc gồm 10 quyển.', 300, 2, 40, 82000.000, 3),
(21, N'Thước nhôm 30cm', 2, N'thuoc_nhom_30cm.jpg', N'Thước nhôm 30cm là dụng cụ đo đạc bền bỉ, phù hợp cho học sinh, sinh viên và văn phòng. Làm từ hợp kim nhôm cứng cáp, vạch chia laser sắc nét.', 29, 2, 44, 15000.000, 3),
(24, N'Từ điển Y học – Sức khoẻ – Bệnh lý (Anh – Việt)', 1, N'td04.jpg', N'Từ điển Y học – Sức khoẻ – Bệnh lý (Anh – Việt) - tổng hợp các thuật ngữ chuyên ngành y tế.', 1200, 1, 0, 35000.000, 12),
(26, N'Từ điển Mẫu câu tiếng Nhật', 1, N'td01.jpg', N'Từ điển Mẫu câu tiếng Nhật - tổng hợp các câu giao tiếp cơ bản đến nâng cao.', 600, 1, 0, 54000.000, 11),
(27, N'Kế toán Doanh nghiệp ACCESS', 1, N'th12.jpg', N'Cuốn sách giới thiệu cách ứng dụng Microsoft Access vào việc xây dựng hệ thống kế toán cho doanh nghiệp.', 700, 1, 0, 70000.000, 16),
(28, N'Hộp tập giấy A4 – 400 tờ', 2, N'tap-giay-a4-400-to.jpg', N'Hộp tập giấy A4 – 400 tờ, chất lượng cao, bề mặt mịn, trắng sáng.', 500, 1, 0, 100000.000, 14),
(29, N'Từ điển Kinh doanh – Tiếp thị Hiện đại', 1, N'td02.gif', N'Từ điển Kinh doanh – Tiếp thị Hiện đại - các thuật ngữ kinh doanh và tiếp thị trong nước và quốc tế.', 600, 1, 23, 23000.000, 1),
(30, N'Đại từ điển tiếng Việt', 1, N'td03.jpg', N'Đại từ điển tiếng Việt - công trình đầy đặn và đồ sộ, gần 2.000 trang.', 600, 1, 23, 25000.000, 3),
(31, N'Từ điển mới ...', 1, N'td05.jpg', N'Từ điển mới ...', 300, 1, 12, 50000.000, 2),
(32, N'Từ điển địa danh hành chính Nam Bộ', 1, N'td06.jpg', N'Từ điển địa danh hành chính Nam Bộ - tác giả Nguyễn Đình Tư.', 500, 1, 50, 300000.000, 2),
(33, N'100 thủ thuật ứng với 100 bài tập thực hành', 1, N'th01.gif', N'100 thủ thuật ứng với 100 bài tập thực hành trên bảng tính.', 400, 1, 0, 60000.000, 2),
(34, N'Lập trình Web bằng PHP 5.3 và CSDL MySQL 5.1 - Tập 2', 1, N'th02.jpg', N'Tập 2 của cuốn sách Lập trình Web bằng PHP 5.3 và MySQL 5.1.', 60, 1, 0, 80000.000, 2),
(35, N'Lập trình Web bằng PHP 5.3 và CSDL MySQL 5.1 - Tập 1', 1, N'th03.jpg', N'Tập 1 của cuốn sách Lập trình Web bằng PHP 5.3 và MySQL 5.1.', 100, 1, 0, 80000.000, 1),
(36, N'Tin học thực hành cơ bản', 1, N'th04.jpg', N'Tin học thực hành cơ bản - hướng dẫn làm quen với máy vi tính.', 100, 1, 0, 35000.000, 1),
(37, N'Làm việc với máy tính qua desktop', 1, N'th05.jpg', N'Làm việc với máy tính qua desktop - Hệ điều hành Windows.', 20, 1, 0, 35000.000, 1),
(38, N'Windows Server 2008', 1, N'th06.jpg', N'Windows Server 2008 - hệ điều hành máy chủ của Microsoft.', 23, 1, 0, 65000.000, 2),
(39, N'Lập trình C nâng cao', 1, N'th06.jpg', N'Lập trình C nâng cao - gồm 18 chương về lập trình C.', 100, 1, 0, 80000.000, 2),
(40, N'Giáo trình học nhanh SQL Server 2008', 1, N'th08.jpg', N'Giáo trình học nhanh SQL Server 2008 dành cho nhà phát triển.', 100, 1, 0, 90000.000, 2),
(41, N'160 Vấn Đề Cần Nên Biết Khi Sử Dụng Đồ Họa Máy Vi Tính', 1, N'th09.jpg', N'160 vấn đề về đồ họa máy vi tính - Photoshop, CorelDRAW, Illustrator.', 321, 1, 0, 100000.000, 2),
(42, N'Giáo trình học nhanh SQL Server 2008 (Tập 2)', 1, N'th10.jpg', N'Giáo trình học nhanh SQL Server 2008 tập 2.', 500, 1, 0, 70000.000, 2),
(43, N'Microsoft Word 2007 thủ thuật', 1, N'th11.jpg', N'Microsoft Word 2007 thủ thuật và căn bản.', 100, 1, 0, 75000.000, 1),
(44, N'Kế toán doanh nghiệp Access', 1, N'th12.jpg', N'', 50, 1, 0, 80000.000, 11),
(45, N'C++ nâng cao', 1, N'th13.gif', N'C++ nâng cao - 12 chương và 7 phụ lục về lập trình hướng đối tượng.', 200, 1, 0, 83000.000, 11),
(46, N'Thủ thuật thiết kế Web nhanh', 1, N'th14.jpg', N'Thủ thuật thiết kế Web nhanh - cải thiện Website.', 200, 1, 0, 100000.000, 12),
(47, N'Tạo Website Hấp Dẫn Với HTML, XHTML Và CSS', 1, N'th15.jpg', N'Tạo Website hấp dẫn với HTML, XHTML và CSS.', 200, 1, 0, 90000.000, 1),
(48, N'Tuyển Tập Thủ Thuật Javascript', 1, N'th16.jpg', N'Tuyển tập thủ thuật Javascript - 2 tập.', 100, 1, 0, 72000.000, 16),
(49, N'Thiết Kế Web Với CSS', 1, N'th17.jpg', N'Thiết kế Web với CSS - bảng kiểu xếp tầng.', 100, 1, 0, 90000.000, 12),
(50, N'Thiết Kế Web Với JavaScript Và Dom', 1, N'th18.jpg', N'Thiết kế Web với JavaScript và DOM.', 299, 1, 0, 92000.000, 1),
(51, N'sdsad', 2, N'51-2.jpg', N'', 1000, 1, 0, 230000.000, 1);
SET IDENTITY_INSERT Products OFF;
GO

-- Books
SET IDENTITY_INSERT Books ON;
INSERT INTO Books (BookId, ProductId, PublisherId, PublishedYear, AuthorId, BookTypeCode) VALUES
(1, 1, 1, 2024, 1, N'giaokhoa'),
(2, 2, 1, 2024, 1, N'giaokhoa'),
(3, 3, 1, 2024, 2, N'ngoaingu'),
(4, 4, 3, 2023, 2, N'ngoaingu'),
(5, 5, 5, 2022, 5, N'kinhte'),
(6, 6, 3, 2021, 6, N'vanhoc'),
(9, 24, 11, 1998, 16, N'tudien'),
(11, 26, 23, 1999, 27, N'ngoaingu'),
(12, 27, 22, 2003, 29, N'kinhte'),
(13, 29, 11, 2003, 5, N'kinhte'),
(14, 30, 7, 2010, 18, N'tudien'),
(15, 31, 17, 2010, 14, N'tudien'),
(16, 32, 15, 2010, 33, N'tudien'),
(17, 33, 6, 2010, NULL, N'tinhoc'),
(18, 34, 1, 2010, 28, N'tinhoc'),
(19, 35, 18, 2010, NULL, N'tinhoc'),
(20, 36, 18, 2010, 28, N'tinhoc'),
(21, 37, NULL, 2008, 28, N'tinhoc'),
(22, 38, 3, 2007, 28, N'tinhoc'),
(23, 39, NULL, 2007, NULL, N'tinhoc'),
(24, 40, 3, 2009, 28, N'tinhoc'),
(25, 41, 3, 2012, 28, N'tinhoc'),
(26, 42, 3, 2010, NULL, N'tinhoc'),
(27, 43, 1, 2010, 28, N'tinhoc'),
(28, 44, 3, 2007, 28, N'loaimoi'),
(29, 45, 6, 2010, 28, N'tinhoc'),
(30, 46, 18, 2010, 28, N'tinhoc'),
(31, 47, 18, 2010, 17, N'tinhoc'),
(32, 48, 18, 2010, 28, N'tinhoc'),
(33, 49, 18, 2010, 8, N'tinhoc'),
(34, 50, 6, 2010, 28, N'tinhoc');
SET IDENTITY_INSERT Books OFF;
GO

-- Orders
SET IDENTITY_INSERT Orders ON;
INSERT INTO Orders (OrderId, CustomerId, EmployeeId, AddressId, OrderDate, TotalAmount, Status, PaymentMethod, Notes) VALUES
(1, 1, NULL, 1, '2025-12-10 17:25:01', 117000.00, N'dang_giao_hang', N'tien_mat', N'Giao hàng ngoài giờ hành chính'),
(2, 2, 1, 1, '2025-12-10 10:24:31', 239000.00, N'da_xac_nhan', N'chuyen_khoan', N'Giao vào buổi sáng các ngày trong tuần'),
(3, 1, NULL, NULL, '2025-12-10 18:37:08', 458000.00, N'da_xac_nhan', N'tien_mat', NULL),
(4, 1, NULL, NULL, '2025-12-10 14:35:01', 183000.00, N'da_xac_nhan', N'tien_mat', NULL),
(5, 2, NULL, NULL, '2025-12-10 22:17:40', 0.00, N'da_xac_nhan', N'tien_mat', NULL),
(6, 1, NULL, NULL, '2025-12-11 08:41:02', 45000.00, N'da_giao_hang', N'tien_mat', NULL),
(7, 1, NULL, NULL, '2025-12-11 08:43:23', 45000.00, N'da_giao_hang', N'tien_mat', NULL),
(14, 5, NULL, NULL, '2025-12-11 16:28:52', 97000.00, N'da_giao_hang', N'tien_mat', NULL),
(15, 5, NULL, NULL, '2025-12-11 16:29:06', 246000.00, N'da_giao_hang', N'tien_mat', NULL),
(16, 4, NULL, NULL, '2025-12-12 15:20:43', 142000.00, N'da_giao_hang', N'tien_mat', NULL),
(17, 4, NULL, NULL, '2025-12-13 04:25:37', 196000.00, N'da_giao_hang', N'tien_mat', NULL),
(18, 4, NULL, NULL, '2025-12-13 10:52:27', 285000.00, N'da_xac_nhan', N'tien_mat', NULL);
SET IDENTITY_INSERT Orders OFF;
GO

-- OrderItems
SET IDENTITY_INSERT OrderItems ON;
INSERT INTO OrderItems (OrderItemId, OrderId, ProductId, Quantity, UnitPrice, SubTotal) VALUES
(1, 1, 1, 1, 45000.00, 45000.00),
(2, 1, 21, 2, 15000.00, 30000.00),
(3, 1, 7, 1, 42000.00, 42000.00),
(4, 2, 3, 2, 52000.00, 104000.00),
(5, 2, 6, 1, 135000.00, 135000.00),
(11, 4, 4, 1, 98000.00, 98000.00),
(12, 4, 5, 1, 85000.00, 85000.00),
(14, 6, 1, 1, 45000.00, 45000.00),
(15, 7, 1, 1, 45000.00, 45000.00),
(18, 14, 1, 1, 45000.00, 45000.00),
(19, 14, 3, 1, 52000.00, 52000.00),
(20, 15, 2, 1, 50000.00, 50000.00),
(21, 15, 4, 2, 98000.00, 196000.00),
(22, 16, 1, 2, 45000.00, 90000.00),
(23, 16, 3, 1, 52000.00, 52000.00),
(24, 17, 4, 2, 98000.00, 196000.00),
(25, 18, 2, 3, 50000.00, 150000.00),
(26, 18, 6, 1, 135000.00, 135000.00);
SET IDENTITY_INSERT OrderItems OFF;
GO

-- Carts
SET IDENTITY_INSERT Carts ON;
INSERT INTO Carts (CartId, CustomerId, CreatedAt, ItemCount) VALUES
(1, 1, '2025-11-02 21:32:45', 1),
(2, 2, '2025-12-10 22:17:28', 0),
(3, 5, '2025-12-11 21:43:33', 2),
(4, 4, '2025-12-12 22:20:37', 2);
SET IDENTITY_INSERT Carts OFF;
GO

-- CartItems
SET IDENTITY_INSERT CartItems ON;
INSERT INTO CartItems (CartItemId, CartId, ProductId, Quantity, UnitPrice, SubTotal) VALUES
(7, 1, 1, 1, 45000.000, 45000.000),
(20, 3, 3, 1, 52000.000, 52000.000),
(21, 3, 7, 1, 82000.000, 82000.000),
(27, 4, 2, 2, 50000.000, 100000.000);
SET IDENTITY_INSERT CartItems OFF;
GO

-- PromotionDetails
SET IDENTITY_INSERT PromotionDetails ON;
INSERT INTO PromotionDetails (DetailId, PromotionId, ProductId, Quantity, DiscountPercent) VALUES
(10, 1, 1, 100, 10.00),
(11, 1, 5, 200, 15.00),
(12, 2, 2, 50, 20.00),
(13, 2, 6, 150, 25.00),
(14, 3, 3, 300, 30.00),
(15, 3, 7, 100, 18.00),
(16, 3, 21, 250, 12.00),
(17, 4, 4, 120, 15.00),
(18, 4, 24, 200, 22.00),
(19, 9, 1, 2, 43.00),
(20, 9, 2, 2, 33.00),
(21, 10, 1, 2, 43.00),
(22, 10, 2, 2, 33.00);
SET IDENTITY_INSERT PromotionDetails OFF;
GO

-- Reviews
SET IDENTITY_INSERT Reviews ON;
INSERT INTO Reviews (ReviewId, CustomerId, ProductId, Rating, Comment, CreatedAt) VALUES
(1, 1, 1, 5, N'Sách đẹp, ok', '2025-11-04 19:09:22');
SET IDENTITY_INSERT Reviews OFF;
GO

-- WishlistItems
SET IDENTITY_INSERT WishlistItems ON;
INSERT INTO WishlistItems (WishlistItemId, CustomerId, ProductId, CreatedAt) VALUES
(2, 1, 7, '2025-12-01 10:30:31'),
(3, 1, 1, '2025-12-01 10:35:29'),
(5, 1, 21, '2025-12-07 19:41:12'),
(6, 1, 4, '2025-12-10 15:01:44'),
(7, 5, 24, '2025-12-11 23:31:44'),
(8, 4, 3, '2025-12-13 17:51:44'),
(9, 4, 2, '2025-12-13 17:51:47'),
(10, 4, 42, '2025-12-21 16:20:55'),
(11, 4, 21, '2025-12-21 16:20:57'),
(12, 4, 39, '2025-12-21 16:21:01');
SET IDENTITY_INSERT WishlistItems OFF;
GO

-- Notifications
SET IDENTITY_INSERT Notifications ON;
INSERT INTO Notifications (NotificationId, CustomerId, EmployeeId, Title, Content, CreatedAt, Type, Status) VALUES
(7, 1, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-08 22:49:03', N'khach_hang', N'chua_doc'),
(8, 1, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-10 07:20:21', N'khach_hang', N'chua_doc'),
(9, 1, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-10 11:14:54', N'khach_hang', N'chua_doc'),
(10, 1, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-10 13:18:31', N'khach_hang', N'chua_doc'),
(11, 1, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-10 14:52:22', N'khach_hang', N'da_doc'),
(20, 2, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-10 22:12:12', N'khach_hang', N'chua_doc'),
(21, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-11 08:40:53', N'khach_hang', N'chua_doc'),
(23, 5, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-11 21:42:31', N'khach_hang', N'chua_doc'),
(24, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-12 22:20:30', N'khach_hang', N'chua_doc'),
(25, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-13 11:24:54', N'khach_hang', N'chua_doc'),
(26, 4, NULL, N'Đơn hàng', N'Đơn hàng #17 của bạn đã được tạo thành công.', '2025-12-13 11:25:37', N'khach_hang', N'chua_doc'),
(27, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-13 17:46:27', N'khach_hang', N'chua_doc'),
(28, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-13 17:50:00', N'khach_hang', N'chua_doc'),
(29, 4, NULL, N'Đơn hàng', N'Đơn hàng #18 của bạn đã được tạo thành công.', '2025-12-13 17:52:27', N'khach_hang', N'chua_doc'),
(30, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-14 10:38:15', N'khach_hang', N'chua_doc'),
(31, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-14 11:12:58', N'khach_hang', N'chua_doc'),
(32, 6, NULL, N'Đăng nhập qua Google', N'...', '2025-12-16 21:05:29', N'khach_hang', N'chua_doc'),
(33, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-19 23:58:55', N'khach_hang', N'chua_doc'),
(34, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-21 15:39:21', N'khach_hang', N'chua_doc'),
(35, 4, NULL, N'Đăng nhập tài khoản', N'...', '2025-12-21 16:09:00', N'khach_hang', N'chua_doc');
SET IDENTITY_INSERT Notifications OFF;
GO

-- =============================================
-- STEP 4: FOREIGN KEY CONSTRAINTS
-- =============================================

-- CartItems
ALTER TABLE CartItems ADD CONSTRAINT FK_CartItems_Carts_CartId FOREIGN KEY (CartId) REFERENCES Carts(CartId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE CartItems ADD CONSTRAINT FK_CartItems_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE ON UPDATE CASCADE;

-- OrderItems
ALTER TABLE OrderItems ADD CONSTRAINT FK_OrderItems_Orders_OrderId FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE OrderItems ADD CONSTRAINT FK_OrderItems_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE ON UPDATE CASCADE;

-- PromotionDetails
ALTER TABLE PromotionDetails ADD CONSTRAINT FK_PromotionDetails_Promotions_PromotionId FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE PromotionDetails ADD CONSTRAINT FK_PromotionDetails_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE ON UPDATE CASCADE;

-- Reviews
ALTER TABLE Reviews ADD CONSTRAINT FK_Reviews_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Reviews ADD CONSTRAINT FK_Reviews_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE ON UPDATE CASCADE;

-- DeliveryAddresses
ALTER TABLE DeliveryAddresses ADD CONSTRAINT FK_DeliveryAddresses_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE ON UPDATE CASCADE;

-- Carts
ALTER TABLE Carts ADD CONSTRAINT FK_Carts_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE ON UPDATE CASCADE;

-- Orders
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Employees_EmployeeId FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_DeliveryAddresses_AddressId FOREIGN KEY (AddressId) REFERENCES DeliveryAddresses(AddressId) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Books
ALTER TABLE Books ADD CONSTRAINT FK_Books_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Books ADD CONSTRAINT FK_Books_Publishers_PublisherId FOREIGN KEY (PublisherId) REFERENCES Publishers(PublisherId) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Books ADD CONSTRAINT FK_Books_Authors_AuthorId FOREIGN KEY (AuthorId) REFERENCES Authors(AuthorId) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Books ADD CONSTRAINT FK_Books_BookTypes_BookTypeCode FOREIGN KEY (BookTypeCode) REFERENCES BookTypes(Code) ON DELETE SET NULL ON UPDATE CASCADE;

-- Products
ALTER TABLE Products ADD CONSTRAINT FK_Products_Units_UnitId FOREIGN KEY (UnitId) REFERENCES Units(UnitId) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Products ADD CONSTRAINT FK_Products_Categories_CategoryId FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE Products ADD CONSTRAINT FK_Products_Providers_ProviderId FOREIGN KEY (ProviderId) REFERENCES Providers(ProviderId) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- WishlistItems
ALTER TABLE WishlistItems ADD CONSTRAINT FK_WishlistItems_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE WishlistItems ADD CONSTRAINT FK_WishlistItems_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE ON UPDATE CASCADE;

-- Notifications
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications_Customers_CustomerId FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications_Employees_EmployeeId FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- =============================================
-- STEP 5: TRIGGERS
-- =============================================

-- Trigger to automatically update UpdatedAt for Employees
CREATE TRIGGER trg_Employees_UpdatedAt
ON Employees
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Employees
    SET UpdatedAt = GETDATE()
    FROM Employees e
    INNER JOIN inserted i ON e.EmployeeId = i.EmployeeId;
END;
GO

PRINT N'=== Database db_nhasach created successfully! ===';
GO
