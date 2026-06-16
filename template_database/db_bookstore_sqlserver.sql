-- =============================================
-- SQL Server Database Script
-- Converted from MySQL (phpMyAdmin)
-- Database: db_nhasach
-- =============================================

-- Create Database
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

-- --------------------------------------------------------
-- STEP 1: CREATE TABLES (Structure only)
-- --------------------------------------------------------

CREATE TABLE chitietgiohang (
  ctgh_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  giohang_id INT NULL,
  sanpham_id INT NULL,
  soluong INT NULL,
  dongia DECIMAL(9,3) NOT NULL,
  thanhtien DECIMAL(9,3) NOT NULL
);
GO

CREATE TABLE chitiethoadon (
  cthd_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  hoadon_id INT NULL,
  sanpham_id INT NULL,
  soluong INT NULL,
  dongia DECIMAL(15,2) NULL,
  thanhtien DECIMAL(15,2) NULL
);
GO

CREATE TABLE chitietkhuyenmai (
  ctkm_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khuyenmai_id INT NULL,
  sanpham_id INT NULL,
  soluong INT NULL,
  tilegiamgia DECIMAL(5,2) NULL
);
GO

CREATE TABLE danhgia (
  danhgia_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khachhang_id INT NOT NULL,
  sanpham_id INT NOT NULL,
  rating TINYINT NOT NULL,
  binhluan NVARCHAR(MAX) NULL,
  ngaytao DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE danhmucsanpham (
  danhmucSP_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  tenDanhMuc NVARCHAR(100) NOT NULL,
  mo_ta NVARCHAR(MAX) NULL
);
GO

CREATE TABLE diachi_giaohang (
  dcgh_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khachhang_id INT NOT NULL,
  diachi NVARCHAR(MAX) NOT NULL
);
GO

CREATE TABLE donvitinh (
  donvitinh_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ten NVARCHAR(50) NULL
);
GO

CREATE TABLE giohang (
  giohang_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khachhang_id INT NULL,
  ngaytao DATETIME DEFAULT GETDATE(),
  soluong INT NOT NULL
);
GO

CREATE TABLE hoadon (
  hoadon_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khachhang_id INT NULL,
  nhanvien_id INT NULL,
  dcgh_id INT NULL,
  ngaytao DATETIME DEFAULT GETDATE(),
  tongtien DECIMAL(15,2) NULL,
  trangthai NVARCHAR(50) DEFAULT 'cho_xac_nhan' CHECK (trangthai IN ('cho_xac_nhan','da_xac_nhan','dang_giao_hang','da_giao_hang','da_huy')),
  phuongthuc_thanhtoan NVARCHAR(50) DEFAULT 'tien_mat' CHECK (phuongthuc_thanhtoan IN ('tien_mat','chuyen_khoan','vi_dien_tu')),
  ghichu NVARCHAR(MAX) NULL
);
GO

CREATE TABLE khachhang (
  khachhang_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  password NVARCHAR(MAX) NULL,
  ho NVARCHAR(50) NOT NULL,
  tendem NVARCHAR(50) NULL,
  ten NVARCHAR(50) NOT NULL,
  ngaysinh DATE NULL,
  diachi NVARCHAR(255) NULL,
  sdt NVARCHAR(15) NULL,
  email NVARCHAR(100) NULL UNIQUE,
  gioitinh NVARCHAR(10) NULL CHECK (gioitinh IN ('Nam','Nu','Khac')),
  ngaythamgia DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE khuyenmai (
  khuyenmai_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ten NVARCHAR(100) NULL,
  ngaybatdau DATE NULL,
  ngayketthuc DATE NULL
);
GO

CREATE TABLE loaisach (
  loaisach_code NVARCHAR(50) NOT NULL PRIMARY KEY,
  tenLoaiSach NVARCHAR(100) NOT NULL,
  CHECK (loaisach_code IN ('vat_ly','hoahoc','giaokhoa','kythuat','kinhte','ngoaingu','phapluat','tudien','loaimoi','tinhoc','toanhoc','thethao_dulich','vanhoc','vanhoa_xahoi'))
);
GO

CREATE TABLE nhacungcap (
  nhacungcap_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ten NVARCHAR(100) NULL,
  diachi NVARCHAR(255) NULL,
  sdt NVARCHAR(20) NULL,
  email NVARCHAR(100) NULL
);
GO

CREATE TABLE nhanvien (
  nhanvien_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  password NVARCHAR(255) NULL,
  ho NVARCHAR(50) NOT NULL,
  tendem NVARCHAR(50) NULL,
  ten NVARCHAR(50) NOT NULL,
  gioitinh NVARCHAR(10) NULL CHECK (gioitinh IN ('Nam','Nu','Khac')),
  ngaysinh DATE NULL,
  diachi NVARCHAR(255) NULL,
  sdt NVARCHAR(15) NULL,
  email NVARCHAR(100) NULL UNIQUE,
  ngayvaolam DATE DEFAULT CAST(GETDATE() AS DATE),
  trangthai NVARCHAR(50) DEFAULT 'dang_lam' CHECK (trangthai IN ('dang_lam','nghi_viec','tam_nghi')),
  role NVARCHAR(50) NOT NULL DEFAULT 'nhanvien' CHECK (role IN ('admin','quanly','nhanvien')),
  ghichu NVARCHAR(MAX) NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE nhaxuatban (
  nhaxuatban_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ten NVARCHAR(100) NULL,
  diachi NVARCHAR(255) NULL,
  sdt NVARCHAR(20) NULL,
  email NVARCHAR(100) NULL
);
GO

CREATE TABLE sach (
  sach_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  sanpham_id INT NULL,
  nhaxuatban_id INT NULL,
  namXB INT NULL,
  tacgia_id INT NULL,
  loaisach_code NVARCHAR(50) NULL CHECK (loaisach_code IN ('vat_ly','hoahoc','giaokhoa','kythuat','kinhte','ngoaingu','phapluat','tudien','loaimoi','tinhoc','toanhoc','thethao_dulich','vanhoc','vanhoa_xahoi'))
);
GO

CREATE TABLE sanpham (
  sanpham_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  tenSP NVARCHAR(255) NOT NULL,
  danhmucSP_id INT NULL,
  hinhanh NVARCHAR(255) NULL,
  mo_ta NVARCHAR(MAX) NULL,
  soluongton INT DEFAULT 0,
  donvitinh_id INT NULL,
  soluongban INT DEFAULT 0,
  gia DECIMAL(9,3) NOT NULL,
  nhacungcap_id INT NOT NULL,
  data_json NVARCHAR(MAX) NULL
);
GO

CREATE TABLE sanphamyeuthich (
  spyt_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khachhang_id INT NOT NULL,
  sanpham_id INT NOT NULL,
  ngaythem DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE tacgia (
  tacgia_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ho NVARCHAR(50) NOT NULL,
  tendem NVARCHAR(50) NULL,
  ten NVARCHAR(50) NOT NULL,
  diachi NVARCHAR(255) NULL,
  sdt NVARCHAR(15) NULL,
  email NVARCHAR(100) NULL
);
GO

CREATE TABLE thongbao (
  thongbao_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  khachhang_id INT NULL,
  nhanvien_id INT NULL,
  tieu_de NVARCHAR(MAX) NOT NULL,
  noi_dung NVARCHAR(MAX) NOT NULL,
  ngay_tao DATETIME DEFAULT GETDATE(),
  loai NVARCHAR(50) NOT NULL CHECK (loai IN ('khach_hang','don_hang','he_thong','noi_bo','')),
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'chua_doc' CHECK (trang_thai IN ('da_doc','chua_doc','luu_tru',''))
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

-- --------------------------------------------------------
-- STEP 2: CREATE INDEXES
-- --------------------------------------------------------

CREATE INDEX idx_ctgh_giohang_id ON chitietgiohang(giohang_id);
CREATE INDEX idx_ctgh_sanpham_id ON chitietgiohang(sanpham_id);
CREATE INDEX idx_cthd_hoadon_id ON chitiethoadon(hoadon_id);
CREATE INDEX idx_cthd_sanpham_id ON chitiethoadon(sanpham_id);
CREATE INDEX idx_ctkm_khuyenmai_id ON chitietkhuyenmai(khuyenmai_id);
CREATE INDEX idx_ctkm_sanpham_id ON chitietkhuyenmai(sanpham_id);
CREATE INDEX idx_dg_khachhang_id ON danhgia(khachhang_id);
CREATE INDEX idx_dg_sanpham_id ON danhgia(sanpham_id);
CREATE INDEX idx_dcgh_khachhang_id ON diachi_giaohang(khachhang_id);
CREATE INDEX idx_gh_khachhang_id ON giohang(khachhang_id);
CREATE INDEX idx_hd_khachhang_id ON hoadon(khachhang_id);
CREATE INDEX idx_hd_nhanvien_id ON hoadon(nhanvien_id);
CREATE INDEX idx_hd_dcgh_id ON hoadon(dcgh_id);
CREATE INDEX idx_ngaytao ON hoadon(ngaytao);
CREATE INDEX idx_trangthai ON hoadon(trangthai);
CREATE INDEX idx_s_sanpham_id ON sach(sanpham_id);
CREATE INDEX idx_s_nhaxuatban_id ON sach(nhaxuatban_id);
CREATE INDEX idx_s_tacgia_id ON sach(tacgia_id);
CREATE INDEX idx_s_loaisach_code ON sach(loaisach_code);
CREATE INDEX idx_donvitinh_id ON sanpham(donvitinh_id);
CREATE INDEX idx_danhmucSP_id ON sanpham(danhmucSP_id);
CREATE INDEX idx_tensp ON sanpham(tenSP);
CREATE INDEX idx_gia ON sanpham(gia);
CREATE INDEX idx_spyt_khachhang_id ON sanphamyeuthich(khachhang_id);
CREATE INDEX idx_spyt_sanpham_id ON sanphamyeuthich(sanpham_id);
CREATE INDEX fk_khid ON thongbao(khachhang_id);
CREATE INDEX fk_nvid ON thongbao(nhanvien_id);
GO

-- --------------------------------------------------------
-- STEP 3: DATA INSERTION
-- --------------------------------------------------------

SET IDENTITY_INSERT danhmucsanpham ON;
INSERT INTO danhmucsanpham (danhmucSP_id, tenDanhMuc, mo_ta) VALUES
(1, N'Sách', N'Tất cả các thể loại sách: giáo khoa, tham khảo, văn học, thiếu nhi...'),
(2, N'Văn phòng phẩm', N'Bút, vở, băng keo, hồ, kéo, dụng cụ học tập...'),
(3, N'Quà & phụ kiện', N'Quà tặng, bookmark, card, set quà, lịch bàn, lịch treo tường và thiệp');
SET IDENTITY_INSERT danhmucsanpham OFF;
GO

SET IDENTITY_INSERT donvitinh ON;
INSERT INTO donvitinh (donvitinh_id, ten) VALUES 
(1, N'Quyển'), 
(2, N'Cái'), 
(3, N'Hộp');
SET IDENTITY_INSERT donvitinh OFF;
GO

SET IDENTITY_INSERT nhacungcap ON;
INSERT INTO nhacungcap (nhacungcap_id, ten, diachi, sdt, email) VALUES
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
SET IDENTITY_INSERT nhacungcap OFF;
GO

SET IDENTITY_INSERT nhaxuatban ON;
INSERT INTO nhaxuatban (nhaxuatban_id, ten, diachi, sdt, email) VALUES
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
SET IDENTITY_INSERT nhaxuatban OFF;
GO

SET IDENTITY_INSERT tacgia ON;
INSERT INTO tacgia (tacgia_id, ho, tendem, ten, diachi, sdt, email) VALUES
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
SET IDENTITY_INSERT tacgia OFF;
GO

INSERT INTO loaisach (loaisach_code, tenLoaiSach) VALUES
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

SET IDENTITY_INSERT khachhang ON;
INSERT INTO khachhang (khachhang_id, password, ho, tendem, ten, ngaysinh, diachi, sdt, email, gioitinh, ngaythamgia) VALUES
(1, N'$2y$10$8m4pKfrzVNu6randbO5/9er6cOAOjeRNMhm4S9xUDwDOrUVquUH66', N'Nguyen', N'Van', N'An', '1990-01-01', N'Hanoi', N'0987654321', N'nguyenvanA@example.com', N'Nam', '2025-11-02 11:13:51'),
(2, N'$2y$10$yTLModrZ9oltLvL2H292TOiHyQ0gVAfE/f6.wuQuriM3b0E4FSRti', N'Tran', N'Thi', N'Binh', '1985-05-12', N'Ho Chi Minh', N'0912345678', N'tranthiB@example.com', N'Nu', '2025-11-02 11:13:51'),
(3, N'xyz789', N'Le', NULL, N'Cuong', '2000-07-20', N'Da Nang', N'0905123456', N'levanC@example.com', N'Nam', '2025-11-02 11:13:51'),
(4, N'$2y$10$t1Xl0SIkhwgQ0HkflVBGAerSOwo24ERyZnNAJC0wRr6rg2YpvIvfS', N'Trần', N'Quốc', N'Khánh', '2025-12-12', N'', N'0329675483', N'du122o@maily.org', NULL, '2025-12-11 08:40:42'),
(5, N'$2y$10$juKMi7ZEbdrbvZyTDrDDu.bI5FUITrPtQkHP1OS8cOefT4D9yBSl2', N'Nguyễn', N'Thị Tuyết', N'Nhi', NULL, N'sdasdasd', N'02938475', N'nhixinh.slurp285@passinbox.com', NULL, '2025-12-11 21:42:26'),
(6, N'$2y$10$.Rug8xdaOKJsqlco0iG3yO.X6BdZWWUNpDWJzc546HRg8GYxqIroS', N'Khanh', N'', N'T', NULL, NULL, NULL, N'qkhanh3921@gmail.com', NULL, '2025-12-16 21:05:29');
SET IDENTITY_INSERT khachhang OFF;
GO

SET IDENTITY_INSERT nhanvien ON;
INSERT INTO nhanvien (nhanvien_id, password, ho, tendem, ten, gioitinh, ngaysinh, diachi, sdt, email, ngayvaolam, trangthai, role, ghichu, created_at, updated_at) VALUES
(1, N'$2y$10$dLXmUrmNDVQFXXXZYgxv1ODPRhJ0SWtAdydpzLFjf5GwLk6ykvRUe', N'Nguyễn', N'Van', N'Xuan', N'Nu', '1980-03-10', N'Hanoi', N'0123456789', N'xuan.nguyen@example.com', '2020-01-01', N'dang_lam', N'nhanvien', N'Phu tra viec', '2025-11-02 04:13:51', '2025-12-13 10:30:39'),
(2, N'$2y$10$lvVMWAmLuIPA8a64jjeD/u7rFXkqejL3E9JaH9W8pbfTmSk/jgmfe', N'Tran', N'Thi', N'Minh', N'Nam', '1975-12-05', N'Ho Chi Minh', N'0987654321', N'tran.minh@example.com', '2018-06-15', N'dang_lam', N'nhanvien', N'Quan ly phong', '2025-11-02 04:13:51', '2025-12-19 17:25:01'),
(3, N'$2y$10$iE2VZ/gaNgeXNn6NrGk2m.qoHD8RG0ZT94cXKprn2qU8s/zokb/gi', N'Trần', N'Quốc', N'Khánh', N'Nam', '2004-09-02', N'STU 180 Cao Lỗ, Quận 8', N'0124456', N'du122o@maily.org', '2025-12-10', N'dang_lam', N'admin', N'4444', '2025-12-10 04:17:10', '2025-12-13 09:40:23'),
(4, N'$2y$10$9r.i.KweRIKcnttc7Dv7OugPiRtHYaGa9fE16N6efmi3q.WAAeJPC', N'sà', N'sfds', N'fdsf', N'Nam', '2025-12-05', N'ddđ', N'243254', N'qkhanh12.duration060@passinbox.com', '2025-12-26', N'dang_lam', N'nhanvien', NULL, '2025-12-10 04:17:10', '2025-12-10 10:18:41'),
(5, N'$2y$10$gtS3Zx7jgreuG1qOKw1TZOPoTKbIoGLEad/gFeqBQONT/.h6Vrga2', N'343', N'5345', N'5345435', N'Nu', '2025-12-22', N'324', N'345435', N'nhixinh.traps404@passfwd.com', '2025-12-13', N'dang_lam', N'nhanvien', N'34', '2025-12-13 09:43:43', '2025-12-13 09:43:43');
SET IDENTITY_INSERT nhanvien OFF;
GO

SET IDENTITY_INSERT diachi_giaohang ON;
INSERT INTO diachi_giaohang (dcgh_id, khachhang_id, diachi) VALUES
(1, 1, N'Cổng trước STU - 180 Cao Lỗ, Phường 14, Quận 8'),
(2, 1, N'Cổng sau STU - Phạm Hùng, Quận 8'),
(3, 2, N'25 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'),
(4, 2, N'90 Trần Hưng Đạo, Quận 5, TP.HCM'),
(5, 3, N'88 Lê Văn Việt, Quận 9, TP.Thủ Đức'),
(6, 4, N'12 Trần Hưng Đạo, Quận 5, TP.HCM');
SET IDENTITY_INSERT diachi_giaohang OFF;
GO

SET IDENTITY_INSERT khuyenmai ON;
INSERT INTO khuyenmai (khuyenmai_id, ten, ngaybatdau, ngayketthuc) VALUES
(1, N'Giảm giá mùa tựu trường', '2025-08-01', '2025-09-30'),
(2, N'Khuyến mãi Giáng Sinh', '2025-12-01', '2025-12-25'),
(3, N'Khuyến mãi Tết Nguyên Đán', '2026-01-15', '2026-02-10'),
(4, N'Giảm giá mùa hè', '2026-06-01', '2026-07-31'),
(9, N'CMC', '2025-12-17', '2025-12-18'),
(10, N'CMC', '2025-12-17', '2025-12-18');
SET IDENTITY_INSERT khuyenmai OFF;
GO

-- Lưu ý: Phần INSERT sanpham có nội dung rất dài, bạn có thể copy nguyên xi từ code MySQL và thêm N'...' vào trước các chuỗi
-- Dưới đây là ví dụ mẫu cho 2 sản phẩm đầu tiên, bạn làm tương tự cho các sản phẩm còn lại
SET IDENTITY_INSERT sanpham ON;
INSERT INTO sanpham (sanpham_id, tenSP, danhmucSP_id, hinhanh, mo_ta, soluongton, donvitinh_id, soluongban, gia, nhacungcap_id) VALUES
(1, N'Sách giáo khoa Toán 10 – Bộ Cánh Diều (Tập 1)', 1, N'toan10_canhdieu_tap_1.jpg', N'Sách giáo khoa Toán 10 – Bộ Cánh Diều (Tập 1) là tài liệu chính thống, được sử dụng rộng rãi tại nhiều trường THPT trên toàn quốc. Sách bám sát mục tiêu chất lượng và cập nhật kiến thức hiện đại, giúp học sinh phát triển tư duy logic và năng lực giải quyết vấn đề.

Nội dung được trình bày ngắn gọn, có ví dụ minh họa thực tế cùng các bài tập đa dạng từ cơ bản đến vận dụng. Hệ thống câu hỏi tự luận, trắc nghiệm và gợi ý phương pháp tiếp cận giúp học sinh rèn luyện kỹ năng giải toán một cách chủ động.

Cuốn sách phù hợp để giảng dạy chính khóa tại trường phổ thông và là tài liệu luyện tập hữu ích cho học sinh cũng như giáo viên trong quá trình học và ôn tập Toán 10.', 129, 1, 47, 45000.000, 1),
(2, N'Ngữ văn 11 - Tập 1', 1, N'Ngu-Van-11-Tap-1-600x853.jpg', N'Ngữ văn 11 - Tập 1', 112, 1, 33, 50000.000, 1);
-- ... (Bạn copy tiếp các dòng INSERT sanpham còn lại từ code MySQL, thêm N'...' vào trước mỗi chuỗi tiếng Việt)
SET IDENTITY_INSERT sanpham OFF;
GO

-- Tiếp tục với các bảng khác: sach, hoadon, chitiethoadon, giohang, chitietgiohang, chitietkhuyenmai, danhgia, sanphamyeuthich, thongbao
-- Làm tương tự: SET IDENTITY_INSERT ON -> INSERT -> SET IDENTITY_INSERT OFF

-- --------------------------------------------------------
-- STEP 4: FOREIGN KEY CONSTRAINTS
-- --------------------------------------------------------

ALTER TABLE chitietgiohang ADD CONSTRAINT FK_ctgh_giohang FOREIGN KEY (giohang_id) REFERENCES giohang(giohang_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE chitietgiohang ADD CONSTRAINT FK_ctgh_sanpham FOREIGN KEY (sanpham_id) REFERENCES sanpham(sanpham_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE chitiethoadon ADD CONSTRAINT FK_cthd_hoadon FOREIGN KEY (hoadon_id) REFERENCES hoadon(hoadon_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE chitiethoadon ADD CONSTRAINT FK_cthd_sanpham FOREIGN KEY (sanpham_id) REFERENCES sanpham(sanpham_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE chitietkhuyenmai ADD CONSTRAINT FK_ctkm_khuyenmai FOREIGN KEY (khuyenmai_id) REFERENCES khuyenmai(khuyenmai_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE chitietkhuyenmai ADD CONSTRAINT FK_ctkm_sanpham FOREIGN KEY (sanpham_id) REFERENCES sanpham(sanpham_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE danhgia ADD CONSTRAINT FK_dg_khachhang FOREIGN KEY (khachhang_id) REFERENCES khachhang(khachhang_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE danhgia ADD CONSTRAINT FK_dg_sanpham FOREIGN KEY (sanpham_id) REFERENCES sanpham(sanpham_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE diachi_giaohang ADD CONSTRAINT FK_dcgh_khachhang FOREIGN KEY (khachhang_id) REFERENCES khachhang(khachhang_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE giohang ADD CONSTRAINT FK_gh_khachhang FOREIGN KEY (khachhang_id) REFERENCES khachhang(khachhang_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE hoadon ADD CONSTRAINT FK_hd_khachhang FOREIGN KEY (khachhang_id) REFERENCES khachhang(khachhang_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE hoadon ADD CONSTRAINT FK_hd_nhanvien FOREIGN KEY (nhanvien_id) REFERENCES nhanvien(nhanvien_id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE hoadon ADD CONSTRAINT FK_hd_dcgh FOREIGN KEY (dcgh_id) REFERENCES diachi_giaohang(dcgh_id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE sach ADD CONSTRAINT FK_s_sanpham FOREIGN KEY (sanpham_id) REFERENCES sanpham(sanpham_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE sach ADD CONSTRAINT FK_s_nhaxuatban FOREIGN KEY (nhaxuatban_id) REFERENCES nhaxuatban(nhaxuatban_id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE sach ADD CONSTRAINT FK_s_tacgia FOREIGN KEY (tacgia_id) REFERENCES tacgia(tacgia_id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE sach ADD CONSTRAINT FK_s_loaisach FOREIGN KEY (loaisach_code) REFERENCES loaisach(loaisach_code) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE sanpham ADD CONSTRAINT FK_sp_donvitinh FOREIGN KEY (donvitinh_id) REFERENCES donvitinh(donvitinh_id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE sanpham ADD CONSTRAINT FK_sp_danhmuc FOREIGN KEY (danhmucSP_id) REFERENCES danhmucsanpham(danhmucSP_id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE sanphamyeuthich ADD CONSTRAINT FK_spyt_khachhang FOREIGN KEY (khachhang_id) REFERENCES khachhang(khachhang_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE sanphamyeuthich ADD CONSTRAINT FK_spyt_sanpham FOREIGN KEY (sanpham_id) REFERENCES sanpham(sanpham_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE thongbao ADD CONSTRAINT FK_tb_khachhang FOREIGN KEY (khachhang_id) REFERENCES khachhang(khachhang_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE thongbao ADD CONSTRAINT FK_tb_nhanvien FOREIGN KEY (nhanvien_id) REFERENCES nhanvien(nhanvien_id) ON DELETE CASCADE ON UPDATE CASCADE;
GO

-- --------------------------------------------------------
-- STEP 5: TRIGGERS (Thay thế ON UPDATE CURRENT_TIMESTAMP)
-- --------------------------------------------------------

-- Trigger tự động cập nhật updated_at cho bảng nhanvien
CREATE TRIGGER trg_nhanvien_updated_at
ON nhanvien
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE nhanvien
    SET updated_at = GETDATE()
    FROM nhanvien n
    INNER JOIN inserted i ON n.nhanvien_id = i.nhanvien_id;
END;
GO

-- Trigger tự động cập nhật ngay_tao cho bảng thongbao (theo logic MySQL gốc)
CREATE TRIGGER trg_thongbao_ngay_tao
ON thongbao
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE thongbao
    SET ngay_tao = GETDATE()
    FROM thongbao t
    INNER JOIN inserted i ON t.thongbao_id = i.thongbao_id;
END;
GO

PRINT N'=== Database db_nhasach created successfully! ===';
GO