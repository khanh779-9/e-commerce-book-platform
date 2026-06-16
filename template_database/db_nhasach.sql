-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:306
-- Generation Time: Apr 29, 2026 at 12:33 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_nhasach`
--
DROP DATABASE IF EXISTS db_nhasach;
CREATE DATABASE db_nhasach;
USE db_nhasach;

-- --------------------------------------------------------
-- STEP 1: CREATE TABLES (Structure only)
-- --------------------------------------------------------

CREATE TABLE `chitietgiohang` (
  `ctgh_id` int NOT NULL,
  `giohang_id` int DEFAULT NULL,
  `sanpham_id` int DEFAULT NULL,
  `soluong` int DEFAULT NULL,
  `dongia` decimal(9,3) NOT NULL,
  `thanhtien` decimal(9,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chitiethoadon` (
  `cthd_id` int NOT NULL,
  `hoadon_id` int DEFAULT NULL,
  `sanpham_id` int DEFAULT NULL,
  `soluong` int DEFAULT NULL,
  `dongia` decimal(15,2) DEFAULT NULL,
  `thanhtien` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chitietkhuyenmai` (
  `ctkm_id` int NOT NULL,
  `khuyenmai_id` int DEFAULT NULL,
  `sanpham_id` int DEFAULT NULL,
  `soluong` int DEFAULT NULL,
  `tilegiamgia` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `danhgia` (
  `danhgia_id` int NOT NULL,
  `khachhang_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `binhluan` text,
  `ngaytao` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `danhmucsanpham` (
  `danhmucSP_id` int NOT NULL,
  `tenDanhMuc` varchar(100) NOT NULL,
  `mo_ta` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `diachi_giaohang` (
  `dcgh_id` int NOT NULL,
  `khachhang_id` int NOT NULL,
  `diachi` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `donvitinh` (
  `donvitinh_id` int NOT NULL,
  `ten` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `giohang` (
  `giohang_id` int NOT NULL,
  `khachhang_id` int DEFAULT NULL,
  `ngaytao` datetime DEFAULT CURRENT_TIMESTAMP,
  `soluong` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `hoadon` (
  `hoadon_id` int NOT NULL,
  `khachhang_id` int DEFAULT NULL,
  `nhanvien_id` int DEFAULT NULL,
  `dcgh_id` int DEFAULT NULL,
  `ngaytao` datetime DEFAULT CURRENT_TIMESTAMP,
  `tongtien` decimal(15,2) DEFAULT NULL,
  `trangthai` enum('cho_xac_nhan','da_xac_nhan','dang_giao_hang','da_giao_hang','da_huy') DEFAULT 'cho_xac_nhan',
  `phuongthuc_thanhtoan` enum('tien_mat','chuyen_khoan','vi_dien_tu') DEFAULT 'tien_mat',
  `ghichu` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `khachhang` (
  `khachhang_id` int NOT NULL,
  `password` text,
  `ho` varchar(50) NOT NULL,
  `tendem` varchar(50) DEFAULT NULL,
  `ten` varchar(50) NOT NULL,
  `ngaysinh` date DEFAULT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `sdt` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gioitinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `ngaythamgia` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `khuyenmai` (
  `khuyenmai_id` int NOT NULL,
  `ten` varchar(100) DEFAULT NULL,
  `ngaybatdau` date DEFAULT NULL,
  `ngayketthuc` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `loaisach` (
  `loaisach_code` enum('vat_ly','hoahoc','giaokhoa','kythuat','kinhte','ngoaingu','phapluat','tudien','loaimoi','tinhoc','toanhoc','thethao_dulich','vanhoc','vanhoa_xahoi') NOT NULL,
  `tenLoaiSach` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `nhacungcap` (
  `nhacungcap_id` int NOT NULL,
  `ten` varchar(100) DEFAULT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `sdt` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `nhanvien` (
  `nhanvien_id` int NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `ho` varchar(50) NOT NULL,
  `tendem` varchar(50) DEFAULT NULL,
  `ten` varchar(50) NOT NULL,
  `gioitinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `ngaysinh` date DEFAULT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `sdt` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ngayvaolam` date DEFAULT (curdate()),
  `trangthai` enum('dang_lam','nghi_viec','tam_nghi') DEFAULT 'dang_lam',
  `role` enum('admin','quanly','nhanvien') NOT NULL DEFAULT 'nhanvien',
  `ghichu` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `nhaxuatban` (
  `nhaxuatban_id` int NOT NULL,
  `ten` varchar(100) DEFAULT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `sdt` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sach` (
  `sach_id` int NOT NULL,
  `sanpham_id` int DEFAULT NULL,
  `nhaxuatban_id` int DEFAULT NULL,
  `namXB` year DEFAULT NULL,
  `tacgia_id` int DEFAULT NULL,
  `loaisach_code` enum('giaokhoa','kythuat','kinhte','ngoaingu','phapluat','tudien','loaimoi','tinhoc','toanhoc','thethao_dulich','vanhoc','vanhoa_xahoi') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sanpham` (
  `sanpham_id` int NOT NULL,
  `tenSP` varchar(255) NOT NULL,
  `danhmucSP_id` int DEFAULT NULL,
  `hinhanh` varchar(255) DEFAULT NULL,
  `mo_ta` text,
  `soluongton` int DEFAULT '0',
  `donvitinh_id` int DEFAULT NULL,
  `soluongban` int DEFAULT '0',
  `gia` decimal(9,3) NOT NULL,
  `nhacungcap_id` int NOT NULL,
  `data_json` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sanphamyeuthich` (
  `spyt_id` int NOT NULL,
  `khachhang_id` int NOT NULL,
  `sanpham_id` int NOT NULL,
  `ngaythem` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tacgia` (
  `tacgia_id` int NOT NULL,
  `ho` varchar(50) NOT NULL,
  `tendem` varchar(50) DEFAULT NULL,
  `ten` varchar(50) NOT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `sdt` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `thongbao` (
  `thongbao_id` int NOT NULL,
  `khachhang_id` int DEFAULT NULL,
  `nhanvien_id` int DEFAULT NULL,
  `tieu_de` text NOT NULL,
  `noi_dung` text NOT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `loai` enum('khach_hang','don_hang','he_thong','noi_bo','') NOT NULL,
  `trang_thai` enum('da_doc','chua_doc','luu_tru','') NOT NULL DEFAULT 'chua_doc'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- STEP 2: PRIMARY KEYS & AUTO_INCREMENT
-- --------------------------------------------------------

ALTER TABLE `chitietgiohang` ADD PRIMARY KEY (`ctgh_id`), ADD KEY `giohang_id` (`giohang_id`), ADD KEY `sanpham_id` (`sanpham_id`);
ALTER TABLE `chitiethoadon` ADD PRIMARY KEY (`cthd_id`), ADD KEY `hoadon_id` (`hoadon_id`), ADD KEY `sanpham_id` (`sanpham_id`);
ALTER TABLE `chitietkhuyenmai` ADD PRIMARY KEY (`ctkm_id`), ADD KEY `khuyenmai_id` (`khuyenmai_id`), ADD KEY `sanpham_id` (`sanpham_id`);
ALTER TABLE `danhgia` ADD PRIMARY KEY (`danhgia_id`), ADD KEY `khachhang_id` (`khachhang_id`), ADD KEY `sanpham_id` (`sanpham_id`);
ALTER TABLE `danhmucsanpham` ADD PRIMARY KEY (`danhmucSP_id`);
ALTER TABLE `diachi_giaohang` ADD PRIMARY KEY (`dcgh_id`), ADD KEY `khachhang_id` (`khachhang_id`);
ALTER TABLE `donvitinh` ADD PRIMARY KEY (`donvitinh_id`);
ALTER TABLE `giohang` ADD PRIMARY KEY (`giohang_id`), ADD KEY `khachhang_id` (`khachhang_id`);
ALTER TABLE `hoadon` ADD PRIMARY KEY (`hoadon_id`), ADD KEY `khachhang_id` (`khachhang_id`), ADD KEY `nhanvien_id` (`nhanvien_id`), ADD KEY `dcgh_id` (`dcgh_id`), ADD KEY `idx_ngaytao` (`ngaytao`), ADD KEY `idx_trangthai` (`trangthai`);
ALTER TABLE `khachhang` ADD PRIMARY KEY (`khachhang_id`), ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `khuyenmai` ADD PRIMARY KEY (`khuyenmai_id`);
ALTER TABLE `loaisach` ADD PRIMARY KEY (`loaisach_code`);
ALTER TABLE `nhacungcap` ADD PRIMARY KEY (`nhacungcap_id`);
ALTER TABLE `nhanvien` ADD PRIMARY KEY (`nhanvien_id`), ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `nhaxuatban` ADD PRIMARY KEY (`nhaxuatban_id`);
ALTER TABLE `sach` ADD PRIMARY KEY (`sach_id`), ADD KEY `sanpham_id` (`sanpham_id`), ADD KEY `nhaxuatban_id` (`nhaxuatban_id`), ADD KEY `tacgia_id` (`tacgia_id`), ADD KEY `loaisach_code` (`loaisach_code`);
ALTER TABLE `sanpham` ADD PRIMARY KEY (`sanpham_id`), ADD KEY `donvitinh_id` (`donvitinh_id`), ADD KEY `danhmucSP_id` (`danhmucSP_id`), ADD KEY `idx_tensp` (`tenSP`), ADD KEY `idx_gia` (`gia`);
ALTER TABLE `sanphamyeuthich` ADD PRIMARY KEY (`spyt_id`), ADD KEY `khachhang_id` (`khachhang_id`), ADD KEY `sanpham_id` (`sanpham_id`);
ALTER TABLE `tacgia` ADD PRIMARY KEY (`tacgia_id`);
ALTER TABLE `thongbao` ADD PRIMARY KEY (`thongbao_id`), ADD KEY `fk_khid` (`khachhang_id`), ADD KEY `fk_nvid` (`nhanvien_id`);
ALTER TABLE `personal_access_tokens` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`);

ALTER TABLE `chitietgiohang` MODIFY `ctgh_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
ALTER TABLE `chitiethoadon` MODIFY `cthd_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;
ALTER TABLE `chitietkhuyenmai` MODIFY `ctkm_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
ALTER TABLE `danhgia` MODIFY `danhgia_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `danhmucsanpham` MODIFY `danhmucSP_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
ALTER TABLE `diachi_giaohang` MODIFY `dcgh_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
ALTER TABLE `donvitinh` MODIFY `donvitinh_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `giohang` MODIFY `giohang_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `hoadon` MODIFY `hoadon_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
ALTER TABLE `khachhang` MODIFY `khachhang_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
ALTER TABLE `khuyenmai` MODIFY `khuyenmai_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `nhacungcap` MODIFY `nhacungcap_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
ALTER TABLE `nhanvien` MODIFY `nhanvien_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `nhaxuatban` MODIFY `nhaxuatban_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
ALTER TABLE `sach` MODIFY `sach_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
ALTER TABLE `sanpham` MODIFY `sanpham_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;
ALTER TABLE `sanphamyeuthich` MODIFY `spyt_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
ALTER TABLE `tacgia` MODIFY `tacgia_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
ALTER TABLE `thongbao` MODIFY `thongbao_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
ALTER TABLE `personal_access_tokens` MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------
-- STEP 3: DATA INSERTION (Parents first for cleaner logs)
-- --------------------------------------------------------

INSERT INTO `danhmucsanpham` (`danhmucSP_id`, `tenDanhMuc`, `mo_ta`) VALUES
(1, 'Sách', 'Tất cả các thể loại sách: giáo khoa, tham khảo, văn học, thiếu nhi...'),
(2, 'Văn phòng phẩm', 'Bút, vở, băng keo, hồ, kéo, dụng cụ học tập...'),
(3, 'Quà & phụ kiện', 'Quà tặng, bookmark, card, set quà, lịch bàn, lịch treo tường và thiệp');

INSERT INTO `donvitinh` (`donvitinh_id`, `ten`) VALUES (1, 'Quyển'), (2, 'Cái'), (3, 'Hộp');

INSERT INTO `nhacungcap` (`nhacungcap_id`, `ten`, `diachi`, `sdt`, `email`) VALUES
(1, '[Nhà cung cấp không xác định]', '-', '-', 'unknown@unknown.u'),
(2, 'Công ty Sách XYZ', 'Số 22, Đường B, TP.HCM', '0281234002', 'contact@xyzbooks.vn'),
(3, 'Nhà phân phối Sách LMN', 'Số 5, Phố C, Đà Nẵng', '02361234003', 'info@lmn-distrib.vn'),
(4, 'Công ty Văn Phòng Phẩm HN', 'Số 8, Nguyễn Trãi, Hà Nội', '0242233444', 'sales@vpphn.vn'),
(5, 'Công ty Thiết Bị Giáo Dục - Đào Tạo VN', 'Số 12, Trần Hưng Đạo, Hà Nội', '0243334005', 'edu@devices.vn'),
(6, 'Công ty Sách & VPP TPH', 'Số 50, Lê Lợi, TP.HCM', '0283344556', 'support@sachvpp.vn'),
(7, 'Công ty Phát Hành Sách Đông A', 'Số 77, Hùng Vương, Đà Nẵng', '0236399007', 'info@donga-pub.vn'),
(8, 'Nhà Cung Cấp Văn Phòng Phẩm Gia Đình', 'Số 3, Đường D, Cần Thơ', '0292388008', 'hello@gd-vpp.vn'),
(9, 'Công ty Sách Giáo Khoa Việt', 'Số 99, Nguyễn Du, Hà Nội', '0244455669', 'gk@giaokhoavn.vn'),
(10, 'Công ty Thiên Long', 'KCN Thăng Long, Hà Nội', '0245566770', 'support@thienlong.vn'),
(11, 'Công ty In Ấn FastPrint', 'Số 18, Đường E, Hải Phòng', '0225333441', 'print@fastprint.vn'),
(12, 'Công ty Đầu Tư Giáo Dục A+B', 'Số 6, Phố F, Hà Nội', '0246667002', 'contact@eduab.vn'),
(13, 'Công ty Sách Trung Nam', 'Số 30, Quang Trung, TP.HCM', '0287788993', 'sales@trungnam.vn'),
(14, 'Công ty Vật Tư Văn Phòng QN', 'Số 2, Đường G, Quảng Ninh', '0203334404', 'vpp@quangninh.vn'),
(15, 'Nhà cung cấp SGBooks', 'Số 15, Phố H, Sài Gòn', '0289990015', 'info@sgbooks.vn'),
(16, 'Công ty Phân Phối Minh An', 'Số 21, Đường I, Đà Nẵng', '0236699006', 'minhan@dist.vn'),
(17, 'Công ty Sách & Quà Tặng', 'Số 7, Nguyễn Thái Học, Hà Nội', '0247778007', 'gifts@booksandgifts.vn'),
(18, 'Công ty Thiết Bị Học Tập Pro', 'Số 40, Lê Lợi, Thanh Hóa', '0237366008', 'pro@edu-supplies.vn'),
(19, 'Nhà cung cấp Hồng Phát', 'Số 11, Đường J, Huế', '0237345009', 'contact@hongphat.vn'),
(20, 'Công ty Văn Phòng Phẩm Bình Minh', 'Số 90, Đường K, Bình Dương', '0274333440', 'sales@binhminhvpp.vn'),
(21, 'Công ty Sách Quốc Tế', 'Số 60, Phố L, Hà Nội', '0249988771', 'intl@bookworld.vn'),
(22, 'Nhà cung cấp Sách Trẻ', 'Số 8, Đường M, TP.HCM', '0281234762', 'sales@nxbtree.vn'),
(23, 'Công ty VPP Toàn Cầu', 'Số 101, Đường N, Hà Nội', '0241111223', 'global@vpp.vn'),
(24, 'Công ty Sách Minh Thành', 'Số 45, Đường O, Hải Phòng', '0225444335', 'info@minhthanhbooks.vn'),
(25, 'Nhà phân phối Văn Phòng Phẩm An Khang', 'Số 4, Đường P, Cần Thơ', '0292388776', 'ankhang@dist.vn'),
(26, 'Công ty Sách Giá Rẻ', 'Số 33, Đường Q, Đà Nẵng', '0236122117', 'cheapbooks@vn.vn'),
(27, 'Nhà cung cấp Thiết Bị Giáo Dục Tâm An', 'Số 12, Đường R, Hà Nội', '0242222338', 'taman@edu.vn'),
(28, 'Công ty Sách Long Phát', 'Số 9, Đường S, TP.HCM', '0282233449', 'longphat@books.vn'),
(30, 'Test2', 'asd', '234324', 'sadasd@fmai.co');

INSERT INTO `nhaxuatban` (`nhaxuatban_id`, `ten`, `diachi`, `sdt`, `email`) VALUES
(1, '[NXB không xác định]', '-', '-', '-'),
(2, 'NXB Văn Hóa - Văn Nghệ', 'Số 12 Trần Hưng Đạo, Hà Nội', '0243822333', 'info@vanhoa-vn.vn'),
(3, 'NXB Tổng hợp TP. HCM', 'Số 200 Lê Lợi, Quận 1, TP.HCM', '0283922111', 'support@tonghophcm.vn'),
(4, 'NXB Thanh Niên', 'Số 7 Phạm Ngọc Thạch, Hà Nội', '0243777888', 'hello@nxbthanhnien.vn'),
(5, 'NXB Trẻ', 'Số 18 Nguyễn Thái Học, TP.HCM', '0283912345', 'contact@nxbtre.vn'),
(6, 'NXB Khoa Học & Kỹ Thuật', 'Số 8 Nguyễn Chí Thanh, Hà Nội', '0243999000', 'info@khoahockt.vn'),
(7, 'NXB Giáo Trình Đại Học', 'Số 33 Hoàng Hoa Thám, Hà Nội', '0243123456', 'giao_trinh@dh.edu.vn'),
(8, 'NXB Văn Học', 'Số 56 Nguyễn Văn Cừ, TP.HCM', '0283765432', 'vanhoc@books.vn'),
(9, 'NXB Kim Đồng', 'Số 10 Hàng Bài, Hà Nội', '0243944556', 'contact@kimdong.vn'),
(10, 'NXB Phụ Nữ', 'Số 22 Bà Triệu, Hà Nội', '0243999888', 'info@phunu.vn'),
(11, 'NXB Tri Thức', 'Số 55 Lý Thường Kiệt, Hà Nội', '0243567890', 'support@trithuc.vn'),
(12, 'NXB Hội Nhà Văn', 'Số 3 Quang Trung, Hà Nội', '0243888777', 'hnv@nhavan.vn'),
(13, 'NXB Văn Hóa - Xã Hội', 'Số 77 Nguyễn Trãi, TP.HCM', '0283999001', 'vhxh@publish.vn'),
(14, 'NXB Nghệ Thuật', 'Số 9 Phùng Hưng, Hà Nội', '0243456000', 'art@nxbanh.vn'),
(15, 'NXB chính trị quốc gia', 'Số 6/86 Duy Tân, Cầu Giấy, Hà Nội', '0236391234', 'info@tonghopdn.vn'),
(16, 'NXB Kinh Tế', 'Số 88 Hai Bà Trưng, Hà Nội', '0243111222', 'kinhte@nxbbusiness.vn'),
(17, 'NXB Thanh Hóa', 'Số 5 Lê Lợi, Thanh Hóa', '0237365432', 'contact@nxbthanhhoa.vn'),
(18, 'NXB Cẩm Nang Sống', 'Số 21 Nguyễn Thị Minh Khai, TP.HCM', '0283911999', 'info@camnang.vn'),
(19, 'NXB Sư Phạm', 'Số 12 Trần Phú, Hà Nội', '0243777666', 'supham@edu.vn'),
(20, 'NXB Hồng Đức', 'Số 44 Lê Lợi, Hà Nội', '0243889000', 'info@hongduc.vn'),
(21, 'NXB Văn Học Trẻ', 'Số 3 Lý Thường Kiệt, TP.HCM', '0283766000', 'vhtre@books.vn'),
(22, 'NXB Tài Chính', 'Số 18 Nguyễn Du, Hà Nội', '0243991122', 'finance@nxbtc.vn'),
(23, 'NXB Khoa Học Xã Hội', 'Số 66 Phan Chu Trinh, Hà Nội', '0243113344', 'shs@nxb.vn'),
(24, 'NXB Đà Lạt', 'Số 7 Trần Phú, Đà Lạt', '0263388777', 'dalat@nxb.vn'),
(25, 'NXB Sống Đẹp', 'Số 90 Nguyễn Khánh Toàn, Hà Nội', '0243451234', 'songdep@nxb.vn');

INSERT INTO `tacgia` (`tacgia_id`, `ho`, `tendem`, `ten`, `diachi`, `sdt`, `email`) VALUES
(1, '-', ' -', '[Tác giả không xác định]', 'Hà Nội', '0912345001', 'tg.an01@example.com'),
(2, 'Trần', 'Thị', 'Bích', 'Hồ Chí Minh', '0912345002', 'tg.bich02@example.com'),
(3, 'Lê', 'Văn', 'Cường', 'Đà Nẵng', '0912345003', 'tg.cuong03@example.com'),
(4, 'Phạm', 'Thị', 'Duyên', 'Hải Phòng', '0912345004', 'tg.duyen04@example.com'),
(5, 'Hoàng', 'Văn', 'Em', 'Cần Thơ', '0912345005', 'tg.em05@example.com'),
(6, 'Vũ', 'Minh', 'Hùng', 'Hà Nội', '0912345006', 'tg.hung06@example.com'),
(7, 'Đặng', 'Thị', 'Hạnh', 'Huế', '0912345007', 'tg.hanh07@example.com'),
(8, 'Bùi', 'Văn', 'Khoa', 'Bắc Ninh', '0912345008', 'tg.khoa08@example.com'),
(9, 'Ngô', 'Thị', 'Lan', 'Hồ Chí Minh', '0912345009', 'tg.lan09@example.com'),
(10, 'Phan', 'Văn', 'Long', 'Hải Phòng', '0912345010', 'tg.long10@example.com'),
(11, 'Trương', 'Thị', 'Mai', 'Hà Nội', '0912345011', 'tg.mai11@example.com'),
(12, 'Đỗ', 'Văn', 'Nam', 'Đà Nẵng', '0912345012', 'tg.nam12@example.com'),
(13, 'Dương', 'Thị', 'Nga', 'Hồ Chí Minh', '0912345013', 'tg.nga13@example.com'),
(14, 'Lâm', 'Minh', 'Phúc', 'Nha Trang', '0912345014', 'tg.phuc14@example.com'),
(15, 'Phùng', 'Văn', 'Quân', 'Hà Nội', '0912345015', 'tg.quan15@example.com'),
(16, 'Võ', 'Thị', 'Quỳnh', 'Cần Thơ', '0912345016', 'tg.quynh16@example.com'),
(17, 'Cao', 'Văn', 'Sơn', 'Thanh Hóa', '0912345017', 'tg.son17@example.com'),
(18, 'Hà', 'Thị', 'Thảo', 'Hà Nội', '0912345018', 'tg.thao18@example.com'),
(19, 'Thái', 'Văn', 'Tiến', 'Hồ Chí Minh', '0912345019', 'tg.tien19@example.com'),
(20, 'Mai', 'Thị', 'Trang', 'Đà Nẵng', '0912345020', 'tg.trang20@example.com'),
(21, 'Phó', 'Văn', 'Trung', 'Hải Phòng', '0912345021', 'tg.trung21@example.com'),
(22, 'Lý', 'Thị', 'Uyên', 'Hà Nội', '0912345022', 'tg.uyen22@example.com'),
(23, 'Hồ', 'Văn', 'Việt', 'TP. HCM', '0912345023', 'tg.viet23@example.com'),
(24, 'Nguyễn', 'Thị', 'Xuyến', 'Bình Dương', '0912345024', 'tg.xuyen24@example.com'),
(25, 'Trần', 'Văn', 'Yên', 'Hà Nội', '0912345025', 'tg.yen25@example.com'),
(26, 'Phạm', 'Minh', 'Zê', 'Cần Thơ', '0912345026', 'tg.ze26@example.com'),
(27, 'Lê', 'Thị', 'Ánh', 'Hòa Bình', '0912345027', 'tg.anh27@example.com'),
(28, 'Bùi', 'Minh', 'Bảo', 'Huế', '0912345028', 'tg.bao28@example.com'),
(29, 'Đặng', 'Thị', 'Chi', 'Hải Phòng', '0912345029', 'tg.chi29@example.com'),
(30, 'Ngô', 'Văn', 'Đạt', 'Đà Nẵng', '0912345030', 'tg.dat30@example.com'),
(31, 'Phan', 'Thị', 'Gấm', 'Quảng Ninh', '0912345031', 'tg.gam31@example.com'),
(32, 'Cung', 'Kim', 'Tiến', 'Hồ Chí Minh', '0912345032', 'tg.tien32@example.com'),
(33, 'Nguyễn', 'Như', 'Ý', 'Hà Nội', '0912345033', 'tg.y33@example.com'),
(34, 'Nguyễn', 'Đình', 'Tư', 'Hồ Chí Minh', '0912345034', 'tg.tu34@example.com');

INSERT INTO `loaisach` (`loaisach_code`, `tenLoaiSach`) VALUES
('vat_ly', 'Vật lý'), ('hoahoc', 'Hóa học'), ('giaokhoa', 'Sách giáo khoa'), ('kythuat', 'Kỹ thuật'), ('kinhte', 'Kinh tế'), ('ngoaingu', 'Ngoại ngữ'), ('phapluat', 'Pháp luật'), ('tudien', 'Từ điển'), ('loaimoi', 'Sách mới/Hot'), ('tinhoc', 'Tin học - CNTT'), ('toanhoc', 'Toán học'), ('thethao_dulich', 'Thể thao & Du lịch'), ('vanhoc', 'Văn học'), ('vanhoa_xahoi', 'Văn hóa - Xã hội');

INSERT INTO `khachhang` (`khachhang_id`, `password`, `ho`, `tendem`, `ten`, `ngaysinh`, `diachi`, `sdt`, `email`, `gioitinh`, `ngaythamgia`) VALUES
(1, '$2y$10$8m4pKfrzVNu6randbO5/9er6cOAOjeRNMhm4S9xUDwDOrUVquUH66', 'Nguyen', 'Van', 'An', '1990-01-01', 'Hanoi', '0987654321', 'nguyenvanA@example.com', 'Nam', '2025-11-02 11:13:51'),
(2, '$2y$10$yTLModrZ9oltLvL2H292TOiHyQ0gVAfE/f6.wuQuriM3b0E4FSRti', 'Tran', 'Thi', 'Binh', '1985-05-12', 'Ho Chi Minh', '0912345678', 'tranthiB@example.com', 'Nu', '2025-11-02 11:13:51'),
(3, 'xyz789', 'Le', NULL, 'Cuong', '2000-07-20', 'Da Nang', '0905123456', 'levanC@example.com', 'Nam', '2025-11-02 11:13:51'),
(4, '$2y$10$t1Xl0SIkhwgQ0HkflVBGAerSOwo24ERyZnNAJC0wRr6rg2YpvIvfS', 'Trần', 'Quốc', 'Khánh', '2025-12-12', '', '0329675483', 'du122o@maily.org', NULL, '2025-12-11 08:40:42'),
(5, '$2y$10$juKMi7ZEbdrbvZyTDrDDu.bI5FUITrPtQkHP1OS8cOefT4D9yBSl2', 'Nguyễn', 'Thị Tuyết', 'Nhi', NULL, 'sdasdasd', '02938475', 'nhixinh.slurp285@passinbox.com', NULL, '2025-12-11 21:42:26'),
(6, '$2y$10$.Rug8xdaOKJsqlco0iG3yO.X6BdZWWUNpDWJzc546HRg8GYxqIroS', 'Khanh', '', 'T', NULL, NULL, NULL, 'qkhanh3921@gmail.com', NULL, '2025-12-16 21:05:29');

INSERT INTO `nhanvien` (`nhanvien_id`, `password`, `ho`, `tendem`, `ten`, `gioitinh`, `ngaysinh`, `diachi`, `sdt`, `email`, `ngayvaolam`, `trangthai`, `role`, `ghichu`, `created_at`, `updated_at`) VALUES
(1, '$2y$10$dLXmUrmNDVQFXXXZYgxv1ODPRhJ0SWtAdydpzLFjf5GwLk6ykvRUe', 'Nguyễn', 'Van', 'Xuan', 'Nu', '1980-03-10', 'Hanoi', '0123456789', 'xuan.nguyen@example.com', '2020-01-01', 'dang_lam', 'nhanvien', 'Phu tra viec', '2025-11-02 04:13:51', '2025-12-13 10:30:39'),
(2, '$2y$10$lvVMWAmLuIPA8a64jjeD/u7rFXkqejL3E9JaH9W8pbfTmSk/jgmfe', 'Tran', 'Thi', 'Minh', 'Nam', '1975-12-05', 'Ho Chi Minh', '0987654321', 'tran.minh@example.com', '2018-06-15', 'dang_lam', 'nhanvien', 'Quan ly phong', '2025-11-02 04:13:51', '2025-12-19 17:25:01'),
(3, '$2y$10$iE2VZ/gaNgeXNn6NrGk2m.qoHD8RG0ZT94cXKprn2qU8s/zokb/gi', 'Trần', 'Quốc', 'Khánh', 'Nam', '2004-09-02', 'STU 180 Cao Lỗ, Quận 8', '0124456', 'du122o@maily.org', '2025-12-10', 'dang_lam', 'admin', '4444', '2025-12-10 04:17:10', '2025-12-13 09:40:23'),
(4, '$2y$10$9r.i.KweRIKcnttc7Dv7OugPiRtHYaGa9fE16N6efmi3q.WAAeJPC', 'sà', 'sfds', 'fdsf', 'Nam', '2025-12-05', 'ddđ', '243254', 'qkhanh12.duration060@passinbox.com', '2025-12-26', 'dang_lam', 'nhanvien', NULL, '2025-12-10 04:17:10', '2025-12-10 10:18:41'),
(5, '$2y$10$gtS3Zx7jgreuG1qOKw1TZOPoTKbIoGLEad/gFeqBQONT/.h6Vrga2', '343', '5345', '5345435', 'Nu', '2025-12-22', '324', '345435', 'nhixinh.traps404@passfwd.com', '2025-12-13', 'dang_lam', 'nhanvien', '34', '2025-12-13 09:43:43', '2025-12-13 09:43:43');

INSERT INTO `diachi_giaohang` (`dcgh_id`, `khachhang_id`, `diachi`) VALUES
(1, 1, 'Cổng trước STU - 180 Cao Lỗ, Phường 14, Quận 8'),
(2, 1, 'Cổng sau STU - Phạm Hùng, Quận 8'),
(3, 2, '25 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'),
(4, 2, '90 Trần Hưng Đạo, Quận 5, TP.HCM'),
(5, 3, '88 Lê Văn Việt, Quận 9, TP.Thủ Đức'),
(6, 4, '12 Trần Hưng Đạo, Quận 5, TP.HCM');

INSERT INTO `khuyenmai` (`khuyenmai_id`, `ten`, `ngaybatdau`, `ngayketthuc`) VALUES
(1, 'Giảm giá mùa tựu trường', '2025-08-01', '2025-09-30'),
(2, 'Khuyến mãi Giáng Sinh', '2025-12-01', '2025-12-25'),
(3, 'Khuyến mãi Tết Nguyên Đán', '2026-01-15', '2026-02-10'),
(4, 'Giảm giá mùa hè', '2026-06-01', '2026-07-31'),
(9, 'CMC', '2025-12-17', '2025-12-18'),
(10, 'CMC', '2025-12-17', '2025-12-18');


INSERT INTO `sanpham` (`sanpham_id`, `tenSP`, `danhmucSP_id`, `hinhanh`, `mo_ta`, `soluongton`, `donvitinh_id`, `soluongban`, `gia`, `nhacungcap_id`) VALUES
(1, 'Sách giáo khoa Toán 10 – Bộ Cánh Diều (Tập 1)', 1, 'toan10_canhdieu_tap_1.jpg', 'Sách giáo khoa Toán 10 – Bộ Cánh Diều (Tập 1) là tài liệu chính thống, được sử dụng rộng rãi tại nhiều trường THPT trên toàn quốc. Sách bám sát mục tiêu chất lượng và cập nhật kiến thức hiện đại, giúp học sinh phát triển tư duy logic và năng lực giải quyết vấn đề.\r\n\r\nNội dung được trình bày ngắn gọn, có ví dụ minh họa thực tế cùng các bài tập đa dạng từ cơ bản đến vận dụng. Hệ thống câu hỏi tự luận, trắc nghiệm và gợi ý phương pháp tiếp cận giúp học sinh rèn luyện kỹ năng giải toán một cách chủ động.\r\n\r\nCuốn sách phù hợp để giảng dạy chính khóa tại trường phổ thông và là tài liệu luyện tập hữu ích cho học sinh cũng như giáo viên trong quá trình học và ôn tập Toán 10.', 129, 1, 47, 45000.000, 1),
(2, 'Ngữ văn 11 - Tập 1', 1, 'Ngu-Van-11-Tap-1-600x853.jpg', 'Ngữ văn 11 - Tập 1', 112, 1, 33, 50000.000, 1),
(3, 'Tiếng Anh 12 - Sách học sinh', 1, 'ta12-global.png', 'Tiếng Anh 12 - Sách học sinh', 75, 1, 23, 52000.000, 2),
(4, 'Tiếng Anh 12 - Sách bài tập', 1, 'sach_ta_12_bt.jpg', 'Tiếng Anh 12 - Sách bài tập', 195, 1, 85, 98000.000, 2),
(5, 'Đắc Nhân Tâm - Dale Carnegie', 1, 'dac-nhan-tam-1.jpg', 'Đắc Nhân Tâm - Dale Carnegie', 298, 1, 120, 85000.000, 1),
(6, 'Harry Potter và Hòn đá Phù Thủy', 1, 'Sach-Noi-Harry-Potter-Tap-1-J-K-Rowling-audio-book-sachnoi.cc-4.jpg', '“Harry Potter và Hòn đá Phù Thủy” là cuốn mở đầu trong loạt truyện nổi tiếng của J.K. Rowling, kể về hành trình cậu bé mồ côi Harry khám phá thân thế phù thủy của mình và bước vào Trường Pháp thuật Hogwarts. Tại đây, Harry kết bạn, đối mặt những thử thách đầu tiên và khám phá bí mật xoay quanh Hòn đá Phù Thủy cùng thế lực hắc ám đứng phía sau.\r\n\r\nVới câu chuyện hấp dẫn, giàu trí tưởng tượng và đầy cảm xúc, tập 1 mang lại sự khởi đầu hoàn hảo cho chuyến phiêu lưu huyền thoại của Harry Potter, phù hợp cho mọi lứa tuổi yêu thích thế giới phép thuật.', 88, 1, 61, 135000.000, 2),
(7, 'Vở hồng hà 96 trang', 2, 'vo_hong_ha_96t.jpg', 'Vở Hồng Hà 96 trang được làm từ giấy trắng sáng, mịn, không lem mực và cho nét chữ rõ ràng. Bìa vở thiết kế bền đẹp, cứng cáp, thích hợp sử dụng hằng ngày cho học sinh, sinh viên và nhân viên văn phòng. Mỗi lốc gồm 10 quyển, tiết kiệm và tiện lợi cho việc học tập hoặc mua dùng dài hạn. Sản phẩm ghi chép tốt, phù hợp mọi loại bút.', 300, 2, 40, 82000.000, 3),
(21, 'Thước nhôm 30cm', 2, 'thuoc_nhom_30cm.jpg', 'Thước nhôm 30cm là dụng cụ đo đạc bền bỉ, phù hợp cho học sinh, sinh viên, dân văn phòng và kỹ thuật. Thân thước được làm từ hợp kim nhôm cứng cáp, chống cong vênh và không dễ gãy như thước nhựa. Bề mặt thước được anod hóa hoặc phủ sơn mờ giúp hạn chế trầy xước và giữ thẩm mỹ lâu dài.\r\n\r\nVạch chia được khắc laser sắc nét, không phai theo thời gian, đảm bảo độ chính xác khi kẻ, đo hoặc làm việc kỹ thuật. Mép thước thẳng, bám mặt giấy tốt, hỗ trợ kẻ line nhanh và không bị trượt. Thiết kế mỏng, nhẹ, dễ cầm và dễ cất trong balo hoặc hộp bút. Một số mẫu còn có đệm chống trượt hoặc cạnh bo tròn để an toàn khi sử dụng.\r\n\r\nTính năng nổi bật:\r\n- Chất liệu nhôm cao cấp, cứng, bền.\r\n- Vạch chia khắc laser chính xác, không phai.\r\n- Không cong, không gãy, dùng lâu vẫn giữ form.\r\n- Thiết kế gọn nhẹ, dễ mang theo.\r\n- Chiều dài tiêu chuẩn 30cm, phù hợp học tập – văn phòng – kỹ thuật.', 29, 2, 44, 15000.000, 3),
(24, 'Từ điển Y học – Sức khoẻ – Bệnh lý (Anh – Việt)', 1, 'td04.jpg', 'Từ điển Y học – Sức khoẻ – Bệnh lý (Anh – Việt) là tài liệu tổng hợp các thuật ngữ chuyên ngành liên quan đến cấu tạo cơ thể, triệu chứng, bệnh lý, xét nghiệm, điều trị, dược phẩm và chăm sóc sức khoẻ. Nội dung cung cấp từ vựng tiếng Anh kèm nghĩa tiếng Việt ngắn gọn, giúp người học, nhân viên y tế, sinh viên và người quan tâm dễ dàng tra cứu và hiểu đúng các khái niệm.\r\n\r\nTừ điển bao gồm các thuật ngữ từ cơ bản đến nâng cao, được sắp xếp theo bảng chữ cái, hỗ trợ tra cứu nhanh chóng. Đây là nguồn tài liệu hữu ích trong học tập, nghiên cứu, đọc tài liệu y học nước ngoài hoặc giao tiếp trong môi trường chăm sóc sức khỏe.', 1200, 1, 0, 35000.000, 12),
(26, 'Từ điển Mẫu câu tiếng Nhật', 1, 'td01.jpg', 'Từ điển Mẫu câu tiếng Nhật là tài liệu tổng hợp các câu giao tiếp cơ bản đến nâng cao, được sử dụng thường xuyên trong học tập, công việc và đời sống hằng ngày. Nội dung bao gồm các mẫu câu thông dụng theo chủ đề như chào hỏi, hỏi đường, mua sắm, ăn uống, học tập, xin phép, bày tỏ cảm xúc và giao tiếp trong môi trường công việc.', 600, 1, 0, 54000.000, 11),
(27, 'Kế toán Doanh nghiệp ACCESS', 1, 'th12.jpg', 'Cuốn sách “Kế toán Doanh nghiệp ACCESS” giới thiệu cách ứng dụng Microsoft Access vào việc xây dựng hệ thống kế toán đơn giản nhưng hiệu quả cho doanh nghiệp. Sách hướng dẫn người đọc cách thiết kế cơ sở dữ liệu kế toán, tạo bảng, truy vấn, biểu mẫu và báo cáo để quản lý các nghiệp vụ như thu – chi, bán hàng, mua hàng, công nợ và kho hàng.\r\n\r\nVới cách trình bày dễ hiểu, ví dụ trực quan và bài tập thực hành, sách phù hợp cho sinh viên kế toán – CNTT, người mới học Access, cũng như doanh nghiệp nhỏ muốn tự xây dựng công cụ kế toán tiết kiệm, linh hoạt và dễ sử dụng.', 700, 1, 0, 70000.000, 16),
(28, 'Hộp tập giấy A4 – 400 tờ', 2, 'tap-giay-a4-400-to.jpg', 'Hộp tập giấy A4 – 400 tờ được sản xuất từ giấy chất lượng cao, bề mặt mịn, trắng sáng và viết rất êm tay. Giấy định lượng vừa phải, không lem mực, không thấm ngược, phù hợp cho viết tay, học tập, làm bài, ghi chép hoặc in tài liệu. Tập được đóng hộp gọn gàng, tiện bảo quản và mang theo. Đây là lựa chọn phù hợp cho học sinh, sinh viên và văn phòng cần sử dụng giấy thường xuyên.', 500, 1, 0, 100000.000, 14),
(29, 'Từ điển Kinh doanh – Tiếp thị Hiện đại', 1, 'td02.gif', 'Quyển sách “Từ điển Kinh doanh – Tiếp thị Hiện đại” (Modern Business & Marketing Dictionary) của tác giả Cung Kim Tiến (Bút danh Anh Tuấn) trình bày các thuật ngữ đang sử dụng thịnh hành trong giao dịch kinh doanh và tiếp thị trong nước và quốc tế. Đặc điểm của quyển sách là các thuật ngữ được đặt trong các bối cảnh khác nhau, bằng cách dẫn các đoạn văn xuất hiện trong thực tiễn kinh doanh quốc tế, giúp bạn đọc hiểu rõ được ý nghĩa và cách sử dụng trong thực tiễn của các thuật ngữ chuyên biệt này, với các nội dung thú vị khác nhau.\r\nTác giả đã chọn lọc một cách công phu các đoạn văn đa dạng và phong phú, xuất hiện trên các ấn phẩm quốc tế khác nhau, giúp độc giả có cơ hội thuận lợi trong giao tiếp, soạn thảo, hoặc tham gia các buổi họp liên quan đến kinh doanh, đảm nhiệm các nhiệm vụ về kinh doanh, quản lý và tiếp thị trong các doanh nghiệp.\r\nQuyển sách này được kỳ vọng sẽ trợ giúp hiệu quả để bạn đọc tiếp cận một lĩnh vực tri thức kinh doanh bằng Anh ngữ, là bạn đồng hành trên con đường sự nghiệp trong thời kỳ quốc tế hóa.', 600, 1, 23, 23000.000, 1),
(30, 'Đại từ điển tiếng Việt', 1, 'td03.jpg', 'Thêm yêu tiếng Việt\r\n\r\nTừ lâu chúng ta đã có nhiều công trình nghiên cứu về kho tàng tiếng Việt, thế nhưng “Đại từ điển tiếng Việt” (NXB Đại học Quốc gia TPHCM - Nguyễn Như Ý chủ biên) vừa ra mắt bạn đọc là công trình đầy đặn và đồ sộ nhất. Cuốn sách đã bắt nhịp cầu cho những ai yêu tiếng mẹ…\r\n\r\nCầm trên tay cuốn Đại từ điển dày gần 2.000 trang mới cảm nhận hết tâm huyết của những người làm sách. Cuốn từ điển này được in lần đầu tiên vào năm 1999, đến nay, đáp ứng nhu cầu của bạn đọc, các tác giả đã tiến hành nghiên cứu, bổ sung.\r\n\r\nTrong lần tái bản này, ban biên soạn đã chọn và đưa vào sách những từ ngữ mới xuất hiện và đã được dùng rộng rãi trong đời sống và trên các phương tiện thông tin đại chúng nhằm làm tăng tính mới mẻ và tiện ích cho người sử dụng.\r\n\r\nMột trong những ý tưởng chinh phục người đọc là tính đa dạng của Đại từ điển tiếng Việt. Bởi nó không chỉ đơn thuần là sự tra cứu nghĩa các từ mà mở ra chân trời kiến thức mới. Việc đan xen những kiến thức cơ bản về văn hóa, văn minh Việt Nam và thế giới, giới thiệu tổng quan và hệ thống các hiện vật văn hóa như: Đơn vị đo lường của Việt Nam và thế giới, đồng bạc Việt xưa và nay, các loại trống đồng hiện có ở Việt Nam, quốc kỳ các nước trên thế giới… Đây là những thông tin bổ ích đáp ứng nhu cầu bổ sung kiến thức cơ bản của học sinh - sinh viên và các bạn trẻ Việt Nam.', 600, 1, 23, 25000.000, 3),
(31, 'Từ điển mới ...', 1, 'td05.jpg', 'Từ điển mới ...', 300, 1, 12, 50000.000, 2),
(32, 'Từ điển địa danh hành chính Nam Bộ', 1, 'td06.jpg', 'Từ điển địa danh hành chính Nam Bộ do tác giả Nguyễn Đình Tư biên soạn hết sức công phu, tổng hợp được nhiều tư liệu quý, là công cụ giúp bạn đọc tra cứu một cách khoa học về địa danh hành chính. Đây là cuốn sách có giá trị không chỉ bởi nó cung cấp một lượng mục từ khá đồ sộ, mà còn bởi tác giả đã dành rất nhiều công sức và tâm huyết để sưu tầm, xử lý tư liệu về vùng đất có bề dày truyền thống lịch sử, nhưng cũng có sự thay đổi nhiều và phức tạp nhất về địa danh hành chính', 500, 1, 50, 300000.000, 2),
(33, '100 thủ thuật ứng với 100 bài tập thực hành', 1, 'th01.gif', '100 thủ thuật ứng với 100 bài tập thực hành được hướng dẫn, giải thích theo bố cục chặt chẽ, cách trình bày rõ ràng, dễ sử dụng, bạn đọc có thể tự mình xử lý những vấn đề nảy sinh trong quá trình thực hành đồng thời giúp các bạn thao tác nhanh trên bảng tính.', 400, 1, 0, 60000.000, 2),
(34, 'Lập trình Web bằng PHP 5.3 và cơ sở dữ liệu MySQL 5.1 - Tập 2', 1, 'th02.jpg', 'Tiếp theo tập 1, tập 2 của cuốn sách \"Lập trình Web bằng PHP 5.3 và cơ sở dữ liệu MySQL 5.1\" bao gồm 10 chương và ứng dụng đính kèm lần lượt giới thiệu cùng bạn đọc các kiến thức liên quan đến Session, Cookie, giỏ hàng trực tuyến, tìm kiếm và phân trang dữ liệu, lập trình hướng đối tượng và sử dụng Zend Framework.\r\n\r\nChương 8 trình bày kiến thức cơ bản của kịch bản trình chủ PHP và cơ sở dữ liệu MySQL.\r\n\r\nSang chương 9, bạn tiếp tục tìm hiểu cách thiết kế trang Web cho phép người sử dụng tìm kiếm và phân trang dữ liệu trình bày với nhiều hình thức khác nhau.\r\n\r\nĐể xây dựng ứng dụng thương mại điện tử hoàn chỉnh và mang tính chuyên nghiệp cao, bạn tiếp tục tìm hiểu cách sử dụng hàm Session và Cookie trong chương 10 để lưu trữ thông tin của người sử dụng nhằm vào mục đích quản lý tài nguyên của Website.\r\n\r\nMọi ứng dụng thương mại điện tử đều cung cấp chương giỏ hàng trực tuyến, bạn cũng được tìm hiểu cách xây dựng giỏ hàng bằng cách sử dụng Session lẫn Cookie trong chương 11.\r\n\r\nKhi có nhu cầu trình bày hình ảnh, đồ thị và âm thanh lẫn phim ảnh, bạn tìm hiểu cách sử dụng mã PHP trong chương 12.\r\n\r\nTiếp theo, bạn có thể tìm hiểu cú pháp của kịch bản PHP trong chương 13 và học cách lập trình hướng đối tượng và sử dụng lớp này vào ứng dụng trong chương 14.\r\n\r\nChương 15 giúp bạn sử dụng kịch bản trình khách Java Script để thay đổi góc nhìn và ứng xử của thẻ HTML trong trang Web.\r\n\r\nSang chương 16, bạn khám phá thư viện mã nguồn mở Zend viết bằng PHP dùng cho các loại cơ sở dữ liệu và học cách sử dụng các lớp trong thư viện này vào ứng dụng bán hàng trực tuyến trong chương 17.', 60, 1, 0, 80000.000, 2),
(35, 'Lập trình Web bằng PHP 5.3 và cơ sở dữ liệu MySQL 5.1 - Tập 1', 1, 'th03.jpg', 'Tập 1 của cuốn sách \"Lập trình Web bằng PHP 5.3 và cơ sở dữ liệu MySQL 5.1\" bao gồm 7 chương và ứng dụng đính kèm. Chương 1 cung cấp cho bạn kiến thức từ chức năng của Website, cài đặt gói WamSever 2.0 và cấu hình để có thể vận hành ứng dụng Web bằng PHP, MySQL và Apache Web Sever.\r\n\r\nSang chương 2, bạn tiếp tục tìm hiểu cách tạo Website và thiết kế cấu trúc dùng cho doanh nghiệp bằng hệ quản trị nội dung mã nguồn mở Joomla. Nhằm thỏa mãn nội dung trình bày, bạn tiếp tục tìm hiểu cách thiết kế trang Web tĩnh hay động bằng mã tự sinh PHP với phần mềm Dreamweaver CS trong chương 3 và thẻ HTML trong chương 4.\r\n\r\nTiếp theo, bạn có thể tìm hiểu cú pháp của kịch bản PHP trong chương 5 và học cách sử dụng ứng dụng PhpMyAdmin để quản trị cơ sở dữ liệu MySQL trong chương 6. Sang chương 7 bạn tìm hiểu phát biểu SQL của cơ sở dữ liệu MySQL dùng để xây dựng ứng dụng bán hàng trực tuyến.', 100, 1, 0, 80000.000, 1),
(36, 'Tin học thực hành cơ bản', 1, 'th04.jpg', 'Ngày nay với sự phát triển không ngừng của kinh tế nói chung và ngành công nghệ thông tin nói riêng, chúng ta có thể dễ dàng tiếp xúc và làm quen với máy vi tính. Tuy nhiên đây là một lĩnh vực mới lại chưa được phổ cập ở mọi cấp học nên các em sẽ có cảm giác bỡ ngỡ, thiếu tự tin khi lần đầu làm quen với chiếc máy tính đa năng. Mỗi bài học trong cuốn sách là một bài thực hành, được thực hiện qua từng bước cơ bản với hình ảnh minh họa trực quan và những lời giải thích chi tiết.', 100, 1, 0, 35000.000, 1),
(37, 'Làm việc với máy tính qua desktop', 1, 'th05.jpg', 'Mục Lục:\r\n\r\nBài 1: Máy tính điện tử và hệ điều hành\r\n\r\nBài 2: Hệ điều hành Window XP\r\n\r\nBài 3: Làm việc với máy tính qua desktop\r\n\r\nBài 4: Tệp tin và thư mục\r\n\r\nBài 5: Sử dụng Window Explorer\r\n\r\nBài 6: Một số thao tác cần biết\r\n\r\nPhụ lục – Những tổ hợp phím tắt', 20, 1, 0, 35000.000, 1),
(38, 'Windows Server 2008', 1, 'th06.jpg', 'Kế thừa những ưu điểm vượt trội và sự thành công của Windows Server 2003 cùng những phiên bản Windows trước đó, hãng Microsoft tiếp tục cho ra đời một phiên bản hệ điều hành dành cho máy chủ mới, Windows Server 2008. Phiên bản này đem đến cho người dùng sự nhanh chóng trong cài đặt; sự tiện lợi trong quản trị hệ thống, tương tác với các thành phần và dịch vụ vì được tập trung vài một công cụ duy nhất – Server Manager, những cải tiến đáng chú ý trên Windows Firewall; công nghệ ảo hoá…\r\n\r\nWindows Server 2008 còn cung cấp cho người sử dụng cách thức cài đặt Server Core, bao gồm những thành phần cơ bản nhất của Windows Server và giao diện dòng lệnh. Với kiểu cài đặt này, giao diện đồ hoạ quen thuộc của Windows cùng những dịch vụ không cần thiết sẽ không được cài đặt lên hệ thống. Nhờ đó nâng cao độ bảo mật và nâng cấp hệ thống.', 23, 1, 0, 65000.000, 2),
(39, 'Lập trình C nâng cao', 1, 'th06.jpg', 'Cuốn sách này gồm những nội dung chính sau:\r\n# Chương 1: Các khái niệm cơ bản\r\n# Chương 2: Hằng biến và mảng\r\n# Chương 3: Biểu thức\r\n# Chương 4: Vào ra\r\n# Chương 5: Các toán tử điều khiển\r\n# Chương 6: Hàm và cấu trúc chương trình\r\n# Chương 7: Cấu trúc\r\n# Chương 8: Quản lý màn hình và cửa sổ\r\n# Chương 9: Đồ họa\r\n# Chương 10: Thao tác trên các tập tin\r\n# Chương 11: Lưu trữ dữ liệu và tổ chức bộ nhớ chương trình\r\n# Chương 12: Các chỉ thị tiền xử lý\r\n# Chương 13: Sử dụng ngắt trong C\r\n# Chương 14: Truy nhập trực tiếp vào bộ nhớ\r\n# Chương 15: Hàm xử ngắt và chương trình thường trú\r\n# Chương 16: Âm thanh, âm nhạc\r\n# Chương 17: Lập trình theo thời gian, theo sự kiện và trò chơi\r\n# Chương 18: Giao diện giữa C và Assembler\r\n# Phụ lục 1: Quy tắc xuống dòng và sử dụng các khoảng trống khi viết chương trình\r\n# Phụ lục 2: Tóm tắt các hàm chuẩn của Turbo C\r\n# Phụ lục 3: Bảng mã ASCII\r\n# Phụ lục 4: Cài đặt Turbo C vào đĩa cứng\r\n# Phụ lục 5: Hướng dẫn sử dụng môi trường kết hợp Turbo C\r\n# Phụ lục 6: Hệ soạn thảo của Turbo C\r\n# Phụ lục 7: Dùng menu project dịch chương trình trên nhiều tệp\r\n# Phụ lục 8: Dịch chương trình theo chế độ dòng lệnh TCC\r\n# Phụ lục 9: Sửa đổi cú pháp và gỡ rối chương trình\r\n# Phụ lục 10: Các mô hình bộ nhớ\r\n# Phụ lục 11: Danh sách các hàm của Turbo C theo thứ tự ABC\r\n# Phụ lục 12: Hàm với đối số bất định trong C\r\n# Phụ lục 13: Một số chương trình hữu ích', 100, 1, 0, 80000.000, 2),
(40, 'Giáo trình học nhanh SQL Server 2008', 1, 'th08.jpg', 'Bộ sách “Giáo trình học nhanh SQL Server 2008” được biên soạn dành cho các nhà phát triển và các nhà quản trị cơ sở dữ liệu, những người đang công tác trong lĩnh vực quản lý dữ liệu doanh nghiệp và cho tất cả những ai quan tâm đến SQL Server 2008.\r\n\r\nVới cách thiết kế và bố cục rõ ràng theo từng chủ điểm cụ thể, bộ sách tập trung trình bày những tính năng chính của SQL Server 2008 nhằm mục đích giúp bạn đọc tăng cường kiến thức đồng thời nâng cao kỹ năng sử dụng sản phẩm mới rất tuyệt vời này. Bộ sách được chia thành 2 tập với bốn phần chính sau đây:', 100, 1, 0, 90000.000, 2),
(41, '160 Vấn Đề Cần Nên Biết Khi Sử Dụng Đồ Họa Máy Vi Tính', 1, 'th09.jpg', '“160 Vấn Đề Cần Nên Biết Khi Sử Dụng Đồ Họa Máy Vi Tính” bao gồm những vấn đề cơ bản và thiết yếu mà những người đang học hay làm đồ họa máy vi tính thường quan tâm tìm hiểu nhằm làm việc hiệu quả hơn với các chương trình phần mềm như Photoshop, CorelDRAW và Illustrator.\r\n\r\nSách gồm 3 phần, được thiết kế và bố cục theo từng vấn đề cụ thể từ cơ bản đến chuyên nghiệp như tùy biến Photoshop cho các dự án mà bạn thực hiện, chỉnh sửa các bức ảnh chân dung, tạo nên điều kỳ diệu với những hiệu ứng số đặc biệt, trình bày hình ảnh một cách chuyên nghiệp, tạo các thiết kế và viết lời truyện tranh trong CorelDRAW, và áp dụng các hiệu ứng với Illustrator.\r\n\r\nSách được trình bày ngắn gọn, rõ ràng kèm hình ảnh minh họa. Ngoài ra sách còn bao gồm nhiều thủ thuật và lưu ý hữu ích.', 321, 1, 0, 100000.000, 2),
(42, 'Giáo trình học nhanh SQL Server 2008', 1, 'th10.jpg', 'Bộ sách “Giáo trình học nhanh SQL Server 2008” được biên soạn dành cho các nhà phát triển và các nhà quản trị cơ sở dữ liệu, những người đang công tác trong lĩnh vực quản lý dữ liệu doanh nghiệp và cho tất cả những ai quan tâm đến SQL Server 2008.\r\n\r\nVới cách thiết kế và bố cục rõ ràng theo từng chủ điểm cụ thể, bộ sách tập trung trình bày những tính năng chính của SQL Server 2008 nhằm mục đích giúp bạn đọc tăng cường kiến thức đồng thời nâng cao kỹ năng sử dụng sản phẩm mới rất tuyệt vời này.', 500, 1, 0, 70000.000, 2),
(43, 'Microsoft Word 2007 thủ thuật', 1, 'th11.jpg', 'Microsoft Word 2007 nói riêng và Microsoft Office 2007 nói chung có nhiều đổi mới. Microsoft chẳng những cung cấp cho người dùng giao diện đẹp mắt mà còn có nhiều tiện ích và trực quan hơn so với các phiên bản trước đây. Thay cho thanh menu và các thanh dụng cụ là một hệ thống Ribbon bao gồm các thẻ, các nhóm, trong từng menu lại có các menu phụ và các lệnh. Khi bạn trỏ chuột vào biểu tượng nào của hệ thống này sẽ hiển thị ScreenTip cho biết chức năng và công dụng của chúng. Chẳng những thế, Word còn thể hiện tức thời hiệu quả của từng lệnh để bạn xem, trước khi chọn chúng.\r\n\r\nTrong quyển sách này, chúng tôi trình bày tóm tắt lý thuyết căn bản về soạn thảo, chỉnh sửa, định dạng văn bản và một số thủ thuật mà bất cứ ai làm công tác văn phòng đều phải sử dụng. Nội dung sách gồm 6 bài: 1-Thủ thuật tổng quát, 2-Soạn thảo và chỉnh sửa văn bản, 3-Định dạng văn bản, 4-WordArt và xử lý hình ảnh, 5-Liên kết và Web, 6-Bảo mật & in ấn văn bản,. Từ bài 2 đến bài 4, trước khi trình bày thủ thuật, chúng tôi tóm tắt lý thuyết giống như giáo trình Word 2007 để bạn thực hành', 100, 1, 0, 75000.000, 1),
(44, 'Kế toán doanh nghiệp Access', 1, 'th12.jpg', '', 50, 1, 0, 80000.000, 11),
(45, 'C++ nâng cao', 1, 'th13.gif', 'Cuốn sách gồm 12 chương và 7 phụ lục:\r\n\r\nChương 1 hướng dẫn cách làm việc với phần mềm TC++ 3.0 để thử nghiệm các chương trình, trình bày sơ lược về các phương pháp lập trình và giới thiệu một số mở rộng đơn giản của C.\r\n\r\nChương 2 trình bày các khả năng mới trong việc xây dựng và sử dụng hàm trong C++ như biến tham chiếu, đối có kiểu tham chiếu, đối có giá trị mặc định, hàm trực tuyến, hàm trùng tên, hàm toán tử.\r\n\r\nChương 3 nói về một khái niệm trung tâm của lập trình hướng đối tượng là lớp gồm: Định nghĩa lớp, khai báo các biến, mảng đối tượng ( kiểu lớp ), phương pháp, dùng con trỏ this trong phương thức, phạm vi truy xuất của các thành phần, các phương thức toán tử.\r\n\r\nChương 4 trình bày các vấn đề tạo dựng, sao chép, huỷ bỏ các đối tượng và các vấn đề khác có liên quan như: Hàm tạo, hàm tạo sao chép, hàm huỷ, toán tử gán, cấp phát bộ nhớ cho đối tượng, hàm bạn, lớp bạn.\r\n\r\nChương 5 trình bày một khái niệm quan trong tạo nên khả năng mạnh của lập trình hướng đối tượng trong việc phát triển, mở rộng phầm mềm, đó là khả năng thừa kế củaw các lớp.\r\n\r\nChương 6 trình bày một khái niệm quan trọng khác cho phép xử lý các vấn đề khác nhau, các thực thể khác nhau, các thuật toán khác nhau theo cùng một lược đồ thống nhất, đó là tính tướng ứng bội và phương thức ảo. Các công cụ này cho phép dễ dàng tổ chức chương trình quản lý nhiều dạng đối tượng khác nhau.\r\n\r\nChương 7 trình bày các thao tác trên tệp như: tạo một tệp mới, ghi dữ liệu từ bộ nhớ lên tệp, đọc dữ liệu từ tệp vào bộ nhớ...\r\n\r\nChương 8 nói về việc tổ chức vào/ ra trong C++.C++ đưa vào một khái niệm mới gọi là các dòng tin ( Stream ), Các thao tác vào/ra sẽ thực hiện trao đổi dữ liệu giữa các bộ nhớ với dòng tin: Vào là chuyển dữ liệu từ dòng nhập vào bộ nhớ, ra là chuyển dữ liệu từ bộ nhớ lên dòng xuất. Để nhập xuất dữ liệu trên một thiết bị cụ thể nào, ta chỉ cần gắn dòng nhập xuất với thiết bị đó. Việc tổ chức vào ra theo cách như vậy là rất khoa học và tiện lợi vì nó có tính độc lập thiết bị.\r\n\r\nChương 9 trình bày các hàm đồ hoạ sử dụng trong C và C++. Các hàm này được sử dụng rải rác trong toàn bộ cuốn sách để xây dựng các đối tượng đồ hoạ.\r\n\r\nChương 10 trình bày các hàm truy xuất trực tiếp vào bộ nhớ của máy tính, trong đó có bộ nhớ màn hình. Các hàm này sẽ được sử dụng trong chương 11 để xây dựng các lớp menu và cửa sổ.\r\n\r\nChương 11 giới thiệu 5 chương trình tương đối hoàn chỉnh nhằm minh hoạ thêm khả năng và kỹ thuật lập trình hướng đối tượng trên C++.\r\n\r\nChương 12 trình bày thêm một số chương trình đối tượng trên C++. Đây là các chương trình tương đối phức tạp, hữu ích và sử dụng các công cụ mạnh của C++.', 200, 1, 0, 83000.000, 11),
(46, 'Thủ thuật thiết kế Web nhanh', 1, 'th14.jpg', 'Cuốn sách này sẽ cung cấp các thông tin cần thiết để đẩy nhanh tốc độ thiết kế Web thông qua việc thực hành với các mẫu của nhiều chuyên gia thiết kế Web.\r\nCuốn sách tập trung vào các chi tiết để tạo ra các Web site tốt thông qua nhiều cách tiếp cận hiện đại để giải quyết các thách thức liên quan đến việc tạo Web site. Thay vì đi vào từng ngôn ngữ và công nghệ cụ thể, các bài học trong cuốn sách này được phân chia thành các \"thủ thuật\" nhằm giúp bạn:\r\n# Ngay lập tức cải thiện được Web site của mình\r\n# Xây dựng Web site mới thật sinh động, tương thích với nhiều môi trường khác nhau\r\n# Quản lý việc thiết kế lại\r\n# Đưa Web site từ khởi đầu đến thành công', 200, 1, 0, 100000.000, 12),
(47, 'Tạo Website Hấp Dẫn Với HTML, XHTML Và CSS', 1, 'th15.jpg', 'Ngày nay, việc ứng dụng phát triển Website hấp dẫn không còn gói gọn bằng HTLM, cho dù bạn đang xây dựng một Website thương mại phức tạp hoặc chỉ đơn thuần là tạo ra một Website nhỏ cho bản thân. Với cuốn sách \"Tạo Website Hấp Dẫn Với HTML, XHTML Và CSS\" này sẽ cùng bạn khám phá các sắc thái của XHTML và CSS theo cách giúp bạn nắm được các vấn đề. Sách bao gồm nhiều thông tin mới cập nhật về XHTML, CSS, JavaScript...\r\n\r\nCuốn sách này không những giúp bạn tiết kiệm được thời gian học tập mà còn thích hợp với những ai muốn tò mò tạo một Website, vì sách cung cấp nhiều gợi ý, hướng dẫn rõ ràng trong việc chuẩn bị xuất bản những trang Web đầu tiên ngay sau khi bạn đọc qua vài chương.', 200, 1, 0, 90000.000, 1),
(48, 'Tuyển Tập Thủ Thuật Javascript', 1, 'th16.jpg', '“Tuyển Tập Thủ Thuật Javascript” gồm 2 tập, là một tuyển tập các giải pháp cho những vấn đề phổ biến nhất trong JavaScript. Nó chứa đựng các thủ thuật, gợi ý và kỹ thuật tương thích chuẩn, đã được thử nghiệm và bạn có thể tùy biến để sử dụng trong các trình duyệt khác nhau.', 100, 1, 0, 72000.000, 16),
(49, 'Thiết Kế Web Với CSS', 1, 'th17.jpg', 'Từ khi được giới thiệu năm 1996, bảng kiểu xếp tầng (CSS) đã làm thay đổi đáng kể thiết kế Web. Hiện nay, phần lớn trang Web đều sử dụng CSS và nhiều nhà thiết kế đã xây dựng các bố cục trang hoàn toàn dựa trên CSS. Để thực hiện điều này một cách thành công, đòi hỏi chúng ta phải hiểu biết kỹ về nội dung hoạt động của CSS. Sách Thiết Kế Web Với CSS cung cấp cho bạn những vấn đề cần thiết để sử dụng CSS.', 100, 1, 0, 90000.000, 12),
(50, 'Thiết Kế Web Với JavaScript Và Dom', 1, 'th18.jpg', 'Nội dung cuốn sách \"Thiết Kế Web Với JavaScript Và Dom\" giới thiệu về ngôn ngữ lập trình, nhưng nó không chỉ dành riêng cho các lập trình viên, mà còn rất có ích cho các nhà thiết kế Web.', 299, 1, 0, 92000.000, 1),
(51, 'sdsad', 2, '51-2.jpg', '', 1000, 1, 0, 230000.000, 1);

INSERT INTO `sach` (`sach_id`, `sanpham_id`, `nhaxuatban_id`, `namXB`, `tacgia_id`, `loaisach_code`) VALUES
(1, 1, 1, '2024', 1, 'giaokhoa'),
(2, 2, 1, '2024', 1, 'giaokhoa'),
(3, 3, 1, '2024', 2, 'ngoaingu'),
(4, 4, 3, '2023', 2, 'ngoaingu'),
(5, 5, 5, '2022', 5, 'kinhte'),
(6, 6, 3, '2021', 6, 'vanhoc'),
(8, 23, 22, '2005', 20, 'vanhoc'),
(9, 24, 11, '1998', 16, 'tudien'),
(11, 26, 23, '1999', 27, 'ngoaingu'),
(12, 27, 22, '2003', 29, 'kinhte'),
(13, 29, 11, '2003', 5, 'kinhte'),
(14, 30, 7, '2010', 18, 'tudien'),
(15, 31, 17, '2010', 14, 'tudien'),
(16, 32, 15, '2010', 33, 'tudien'),
(17, 33, 6, '2010', NULL, 'tinhoc'),
(18, 34, 1, '2010', 28, 'tinhoc'),
(19, 35, 18, '2010', NULL, 'tinhoc'),
(20, 36, 18, '2010', 28, 'tinhoc'),
(21, 37, NULL, '2008', 28, 'tinhoc'),
(22, 38, 3, '2007', 28, 'tinhoc'),
(23, 39, NULL, '2007', NULL, 'tinhoc'),
(24, 40, 3, '2009', 28, 'tinhoc'),
(25, 41, 3, '2012', 28, 'tinhoc'),
(26, 42, 3, '2010', NULL, 'tinhoc'),
(27, 43, 1, '2010', 28, 'tinhoc'),
(28, 44, 3, '2007', 28, 'loaimoi'),
(29, 45, 6, '2010', 28, 'tinhoc'),
(30, 46, 18, '2010', 28, 'tinhoc'),
(31, 47, 18, '2010', 17, 'tinhoc'),
(32, 48, 18, '2010', 28, 'tinhoc'),
(33, 49, 18, '2010', 8, 'tinhoc'),
(34, 50, 6, '2010', 28, 'tinhoc');

INSERT INTO `hoadon` (`hoadon_id`, `khachhang_id`, `nhanvien_id`, `dcgh_id`, `ngaytao`, `tongtien`, `trangthai`, `phuongthuc_thanhtoan`, `ghichu`) VALUES
(1, 1, NULL, 1, '2025-12-10 17:25:01', 117000.00, 'dang_giao_hang', 'tien_mat', 'Giao hàng ngoài giờ hành chính'),
(2, 2, 1, 1, '2025-12-10 10:24:31', 239000.00, 'da_xac_nhan', 'chuyen_khoan', 'Giao vào buổi sáng các ngày trong tuần'),
(3, 1, NULL, NULL, '2025-12-10 18:37:08', 458000.00, 'da_xac_nhan', 'tien_mat', NULL),
(4, 1, NULL, NULL, '2025-12-10 14:35:01', 183000.00, 'da_xac_nhan', 'tien_mat', NULL),
(5, 2, NULL, NULL, '2025-12-10 22:17:40', 0.00, 'da_xac_nhan', 'tien_mat', NULL),
(6, 1, NULL, NULL, '2025-12-11 08:41:02', 45000.00, 'da_giao_hang', 'tien_mat', NULL),
(7, 1, NULL, NULL, '2025-12-11 08:43:23', 45000.00, 'da_giao_hang', 'tien_mat', NULL),
(14, 5, NULL, NULL, '2025-12-11 16:28:52', 97000.00, 'da_giao_hang', 'tien_mat', NULL),
(15, 5, NULL, NULL, '2025-12-11 16:29:06', 246000.00, 'da_giao_hang', 'tien_mat', NULL),
(16, 4, NULL, NULL, '2025-12-12 15:20:43', 142000.00, 'da_giao_hang', 'tien_mat', NULL),
(17, 4, NULL, NULL, '2025-12-13 04:25:37', 196000.00, 'da_giao_hang', 'tien_mat', NULL),
(18, 4, NULL, NULL, '2025-12-13 10:52:27', 285000.00, 'da_xac_nhan', 'tien_mat', NULL);

INSERT INTO `chitiethoadon` (`cthd_id`, `hoadon_id`, `sanpham_id`, `soluong`, `dongia`, `thanhtien`) VALUES
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

INSERT INTO `giohang` (`giohang_id`, `khachhang_id`, `ngaytao`, `soluong`) VALUES
(1, 1, '2025-11-02 21:32:45', 1),
(2, 2, '2025-12-10 22:17:28', 0),
(3, 5, '2025-12-11 21:43:33', 2),
(4, 4, '2025-12-12 22:20:37', 2);

INSERT INTO `chitietgiohang` (`ctgh_id`, `giohang_id`, `sanpham_id`, `soluong`, `dongia`, `thanhtien`) VALUES
(7, 1, 1, 1, 45000.000, 45000.000),
(20, 3, 3, 1, 52000.000, 52000.000),
(21, 3, 7, 1, 82000.000, 82000.000),
(27, 4, 2, 2, 50000.000, 100000.000);

INSERT INTO `chitietkhuyenmai` (`ctkm_id`, `khuyenmai_id`, `sanpham_id`, `soluong`, `tilegiamgia`) VALUES
(10, 1, 1, 100, 10.00), (11, 1, 5, 200, 15.00), (12, 2, 2, 50, 20.00), (13, 2, 6, 150, 25.00), (14, 3, 3, 300, 30.00), (15, 3, 7, 100, 18.00), (16, 3, 21, 250, 12.00), (17, 4, 4, 120, 15.00), (18, 4, 24, 200, 22.00), (19, 9, 1, 2, 43.00), (20, 9, 2, 2, 33.00), (21, 10, 1, 2, 43.00), (22, 10, 2, 2, 33.00);

INSERT INTO `danhgia` (`danhgia_id`, `khachhang_id`, `sanpham_id`, `rating`, `binhluan`, `ngaytao`) VALUES
(1, 1, 1, 5, 'Sách đẹp, ok', '2025-11-04 19:09:22');

INSERT INTO `sanphamyeuthich` (`spyt_id`, `khachhang_id`, `sanpham_id`, `ngaythem`) VALUES
(2, 1, 7, '2025-12-01 10:30:31'), (3, 1, 1, '2025-12-01 10:35:29'), (5, 1, 21, '2025-12-07 19:41:12'), (6, 1, 4, '2025-12-10 15:01:44'), (7, 5, 24, '2025-12-11 23:31:44'), (8, 4, 3, '2025-12-13 17:51:44'), (9, 4, 2, '2025-12-13 17:51:47'), (10, 4, 42, '2025-12-21 16:20:55'), (11, 4, 21, '2025-12-21 16:20:57'), (12, 4, 39, '2025-12-21 16:21:01');

INSERT INTO `thongbao` (`thongbao_id`, `khachhang_id`, `tieu_de`, `noi_dung`, `ngay_tao`, `loai`, `trang_thai`) VALUES
(7, 1, 'Đăng nhập tài khoản', '...', '2025-12-08 22:49:03', 'khach_hang', 'chua_doc'),
(8, 1, 'Đăng nhập tài khoản', '...', '2025-12-10 07:20:21', 'khach_hang', 'chua_doc'),
(9, 1, 'Đăng nhập tài khoản', '...', '2025-12-10 11:14:54', 'khach_hang', 'chua_doc'),
(10, 1, 'Đăng nhập tài khoản', '...', '2025-12-10 13:18:31', 'khach_hang', 'chua_doc'),
(11, 1, 'Đăng nhập tài khoản', '...', '2025-12-10 14:52:22', 'khach_hang', 'da_doc'),
(20, 2, 'Đăng nhập tài khoản', '...', '2025-12-10 22:12:12', 'khach_hang', 'chua_doc'),
(21, 4, 'Đăng nhập tài khoản', '...', '2025-12-11 08:40:53', 'khach_hang', 'chua_doc'),
(23, 5, 'Đăng nhập tài khoản', '...', '2025-12-11 21:42:31', 'khach_hang', 'chua_doc'),
(24, 4, 'Đăng nhập tài khoản', '...', '2025-12-12 22:20:30', 'khach_hang', 'chua_doc'),
(25, 4, 'Đăng nhập tài khoản', '...', '2025-12-13 11:24:54', 'khach_hang', 'chua_doc'),
(26, 4, 'Đơn hàng', 'Đơn hàng #17 của bạn đã được tạo thành công.', '2025-12-13 11:25:37', 'khach_hang', 'chua_doc'),
(27, 4, 'Đăng nhập tài khoản', '...', '2025-12-13 17:46:27', 'khach_hang', 'chua_doc'),
(28, 4, 'Đăng nhập tài khoản', '...', '2025-12-13 17:50:00', 'khach_hang', 'chua_doc'),
(29, 4, 'Đơn hàng', 'Đơn hàng #18 của bạn đã được tạo thành công.', '2025-12-13 17:52:27', 'khach_hang', 'chua_doc'),
(30, 4, 'Đăng nhập tài khoản', '...', '2025-12-14 10:38:15', 'khach_hang', 'chua_doc'),
(31, 4, 'Đăng nhập tài khoản', '...', '2025-12-14 11:12:58', 'khach_hang', 'chua_doc'),
(32, 6, 'Đăng nhập qua Google', '...', '2025-12-16 21:05:29', 'khach_hang', 'chua_doc'),
(33, 4, 'Đăng nhập tài khoản', '...', '2025-12-19 23:58:55', 'khach_hang', 'chua_doc'),
(34, 4, 'Đăng nhập tài khoản', '...', '2025-12-21 15:39:21', 'khach_hang', 'chua_doc'),
(35, 4, 'Đăng nhập tài khoản', '...', '2025-12-21 16:09:00', 'khach_hang', 'chua_doc');

-- --------------------------------------------------------
-- STEP 4: FOREIGN KEY CONSTRAINTS (At the very end)
-- --------------------------------------------------------

ALTER TABLE `chitietgiohang` ADD CONSTRAINT `chitietgiohang_ibfk_1` FOREIGN KEY (`giohang_id`) REFERENCES `giohang` (`giohang_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `chitietgiohang_ibfk_2` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`sanpham_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chitiethoadon` ADD CONSTRAINT `chitiethoadon_ibfk_1` FOREIGN KEY (`hoadon_id`) REFERENCES `hoadon` (`hoadon_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `chitiethoadon_ibfk_2` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`sanpham_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chitietkhuyenmai` ADD CONSTRAINT `chitietkhuyenmai_ibfk_1` FOREIGN KEY (`khuyenmai_id`) REFERENCES `khuyenmai` (`khuyenmai_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `chitietkhuyenmai_ibfk_2` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`sanpham_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `danhgia` ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`khachhang_id`) REFERENCES `khachhang` (`khachhang_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`sanpham_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `diachi_giaohang` ADD CONSTRAINT `diachi_giaohang_ibfk_1` FOREIGN KEY (`khachhang_id`) REFERENCES `khachhang` (`khachhang_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `giohang` ADD CONSTRAINT `giohang_ibfk_1` FOREIGN KEY (`khachhang_id`) REFERENCES `khachhang` (`khachhang_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hoadon` ADD CONSTRAINT `hoadon_ibfk_1` FOREIGN KEY (`khachhang_id`) REFERENCES `khachhang` (`khachhang_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `hoadon_ibfk_2` FOREIGN KEY (`nhanvien_id`) REFERENCES `nhanvien` (`nhanvien_id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `hoadon_ibfk_3` FOREIGN KEY (`dcgh_id`) REFERENCES `diachi_giaohang` (`dcgh_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sach` ADD CONSTRAINT `sach_ibfk_1` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`sanpham_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `sach_ibfk_2` FOREIGN KEY (`nhaxuatban_id`) REFERENCES `nhaxuatban` (`nhaxuatban_id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `sach_ibfk_3` FOREIGN KEY (`tacgia_id`) REFERENCES `tacgia` (`tacgia_id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `sach_ibfk_4` FOREIGN KEY (`loaisach_code`) REFERENCES `loaisach` (`loaisach_code`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sanpham` ADD CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`donvitinh_id`) REFERENCES `donvitinh` (`donvitinh_id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `sanpham_ibfk_2` FOREIGN KEY (`danhmucSP_id`) REFERENCES `danhmucsanpham` (`danhmucSP_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sanphamyeuthich` ADD CONSTRAINT `sanphamyeuthich_ibfk_1` FOREIGN KEY (`khachhang_id`) REFERENCES `khachhang` (`khachhang_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `sanphamyeuthich_ibfk_2` FOREIGN KEY (`sanpham_id`) REFERENCES `sanpham` (`sanpham_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `thongbao` ADD CONSTRAINT `fk_khid` FOREIGN KEY (`khachhang_id`) REFERENCES `khachhang` (`khachhang_id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_nvid` FOREIGN KEY (`nhanvien_id`) REFERENCES `nhanvien` (`nhanvien_id`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
