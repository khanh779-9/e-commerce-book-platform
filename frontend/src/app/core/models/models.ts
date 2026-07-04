export interface ApiResponse<T> { message?: string; data?: T; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number; }

export interface ReviewResponse {
  reviewId: number; customerId: number; customerName?: string; productId: number; productName?: string;
  rating: number; comment?: string; createdAt: string; updatedAt: string;
}
export interface PromotionSummaryResponse { promotionId: number; name?: string; startDate?: string; endDate?: string; discountPercent: number; quantity?: number; }
export interface BookResponse {
  bookId?: number; title?: string; authorId?: number; authorName?: string; publisherId?: number;
  publisherName?: string; publishedYear?: number; bookTypeCode?: string; bookTypeName?: string;
}
export interface ProductResponse {
  productId: number; id: number; name: string; slug?: string; categoryId?: number; categoryName?: string; imageUrl?: string;
  description?: string; stockQuantity: number; soldQuantity: number; price: number; promoPrice: number; effectivePrice: number;
  discountPercent?: number; unitId?: number; unitName?: string; providerId?: number; providerName?: string; dataJson?: string;
  isWishlisted: boolean; avgRating: number; totalReviews: number; bookDetails?: BookResponse; activePromotion?: PromotionSummaryResponse;
  reviews: ReviewResponse[]; metadata?: Record<string, unknown>; createdAt: string; updatedAt: string;
  isActive?: boolean; isFeatured?: boolean; viewCount?: number; metaTitle?: string; metaDescription?: string; metaKeywords?: string;
}
export interface CategoryResponse { categoryId: number; name: string; description?: string; productCount: number; }
export interface AuthorResponse { authorId: number; firstName: string; middleName?: string; lastName: string; fullName: string; address?: string; phone?: string; email?: string; bookCount: number; }
export interface PublisherResponse { publisherId: number; name?: string; address?: string; phone?: string; email?: string; bookCount: number; }
export interface ProviderResponse { providerId: number; name?: string; address?: string; phone?: string; email?: string; productCount: number; }
export interface UnitResponse { unitId: number; name?: string; productCount: number; }
export interface BookTypeResponse { code: string; name: string; bookCount: number; }

export interface CustomerResponse {
  id: number; firstName: string; middleName?: string; lastName: string; fullName: string; displayName: string;
  email?: string; phone?: string; address?: string; birthDate?: string; gender?: 'Nam'|'Nu'|'Khac'; joinedAt: string;
  notes?: string; orderCount: number; totalSpent: number; addresses?: AddressResponse[];
}
export interface LoginResponse { message: string; token: string; data?: CustomerResponse; }
export interface EmployeeResponse {
  id: number; firstName: string; middleName?: string; lastName: string; fullName: string; email?: string; phone?: string;
  address?: string; birthDate?: string; gender?: 'Nam'|'Nu'|'Khac'; startDate?: string;
  role: 'admin'|'quanly'|'nhanvien'; status: 'dang_lam'|'nghi_viec'|'tam_nghi'; notes?: string; type: 'employee';
}
export interface EmployeeLoginResponse { message: string; token: string; data?: EmployeeResponse; }
export interface AddressResponse { addressId: number; address: string; provinceId?: number; districtId?: number; }

export interface CartItemResponse {
  productId: number; name: string; originalPrice: number; price: number; quantity: number; subTotal: number;
  stockQuantity: number; image?: string; weight?: number;
}
export interface CartResponse { items: CartItemResponse[]; total: number; savings: number; itemCount: number; }

export type OrderStatus = 'cho_xac_nhan'|'da_xac_nhan'|'dang_giao_hang'|'da_giao_hang'|'da_huy';
export type PaymentMethod = 'tien_mat'|'chuyen_khoan'|'vi_dien_tu'|'vnpay';

export interface VnPayPaymentResponse { paymentUrl: string; orderId: number; message?: string; }
export interface OrderItemResponse { productId: number; productName?: string; quantity: number; unitPrice: number; subTotal: number; imageUrl?: string; }
export interface OrderListResponse {
  orderId: number; customerId?: number; customerName?: string; employeeId?: number; employeeName?: string; orderDate: string;
  totalAmount?: number; status: OrderStatus; paymentMethod: PaymentMethod; itemCount: number;
  shippingFee?: number; discountAmount?: number; voucherCode?: string; trackingNumber?: string;
  shippedAt?: string; deliveredAt?: string; cancelledAt?: string; cancelReason?: string;
}
export interface OrderDetailResponse extends OrderListResponse { addressId?: number; address?: string; notes?: string; items: OrderItemResponse[]; }

export interface NotificationResponse { notificationId: number; title: string; content: string; type: string; status: 'da_doc'|'chua_doc'|'luu_tru'|string; createdAt: string; }
export interface PromotionDetailResponse { detailId: number; productId?: number; productName?: string; quantity?: number; discountPercent?: number; }
export interface PromotionResponse { promotionId: number; name?: string; code?: string; startDate?: string; endDate?: string; isActive: boolean; usageLimit?: number; usedCount?: number; minOrderValue?: number; maxDiscount?: number; details: PromotionDetailResponse[]; }
export interface PromotionValidationResult { isValid: boolean; message: string; discountAmount: number; promotion?: PromotionResponse; }

export interface ShippingCalculationResult { shippingFee: number; isFreeShipping: boolean; freeShippingThreshold: number; zoneName: string; estimatedDays: number; note?: string; }
export interface ShippingZone { provinceId: number; provinceName: string; baseFee: number; perKgFee: number; estimatedDays: number; }
export interface ShippingDistrict { districtId: number; districtName: string; provinceId: number; additionalFee: number; }

export interface DashboardStats {
  revenue: number; revenueThisMonth: number; orders: number; pendingOrders: number; products: number;
  lowStockProducts: number; customers: number; activePromotions: number;
}
export interface LowStockProductResponse { productId: number; name: string; stockQuantity: number; }
export interface DashboardResponse { stats: DashboardStats; recentOrders: OrderListResponse[]; lowStockProducts: LowStockProductResponse[]; orderByStatus: Record<string, number>; }
export interface MonthlyRevenue { month: number; year: number; revenue: number; orderCount: number; }
export interface ProductReportItem { productId: number; productName: string; totalQuantity: number; totalRevenue: number; }
export interface ReportSummary {
  totalOrders: number; totalRevenue: number; totalCustomers: number; pendingOrders: number; monthlyRevenue: number;
  averageOrderValue: number; deliveredOrders: number; cancelledOrders: number;
}
export interface ReportResponse { summary: ReportSummary; monthlyRevenues: MonthlyRevenue[]; topProducts: ProductReportItem[]; orderByStatus: Record<string, number>; }

export interface WishlistToggleResponse { message: string; added: boolean; }
export interface ProductSearchParams {
  q?: string; categoryId?: number; providerId?: number; publisherId?: number; authorId?: number; bookTypeCode?: string;
  minPrice?: number; maxPrice?: number; sortBy?: string; promotedOnly?: boolean; inStockOnly?: boolean; page?: number; limit?: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cho_xac_nhan: 'Chờ xác nhận', da_xac_nhan: 'Đã xác nhận', dang_giao_hang: 'Đang giao', da_giao_hang: 'Đã giao', da_huy: 'Đã hủy'
};
export const PAYMENT_LABELS: Record<PaymentMethod, string> = { tien_mat: 'Tiền mặt', chuyen_khoan: 'Chuyển khoản', vi_dien_tu: 'Ví điện tử', vnpay: 'VNPay / Thẻ quốc tế' };
export const BOOK_TYPE_CODES = [
  ['vat_ly','Vật lý'],['hoahoc','Hóa học'],['giaokhoa','Giáo khoa'],['kythuat','Kỹ thuật'],['kinhte','Kinh tế'],['ngoaingu','Ngoại ngữ'],
  ['phapluat','Pháp luật'],['tudien','Từ điển'],['loaimoi','Loại mới'],['tinhoc','Tin học'],['toanhoc','Toán học'],['thethao_dulich','Thể thao & Du lịch'],
  ['vanhoc','Văn học'],['vanhoa_xahoi','Văn hóa & Xã hội']
] as const;

// Compatibility aliases used by internal admin tables.
export type PublisherListResponse = PublisherResponse;
export type ProviderListResponse = ProviderResponse;
export type CustomerAdminResponse = CustomerResponse;
export type EmployeeListResponse = EmployeeResponse;
