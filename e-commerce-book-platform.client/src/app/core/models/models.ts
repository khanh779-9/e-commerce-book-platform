export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface BookResponse {
  bookId?: number;
  title?: string;
  authorName?: string;
  publisherName?: string;
  publishedYear?: number;
  bookTypeCode?: string;
  bookTypeName?: string;
}

export interface ProductResponse {
  productId: number;
  id: number;
  name: string;
  categoryName?: string;
  imageUrl?: string;
  description?: string;
  stockQuantity: number;
  soldQuantity: number;
  price: number;
  promoPrice: number;
  unitName?: string;
  providerName?: string;
  isWishlisted: boolean;
  avgRating: number;
  totalReviews: number;
  bookDetails?: BookResponse;
  metadata?: { [key: string]: any };
}

export interface CategoryResponse {
  categoryId: number;
  name: string;
  description?: string;
}

export interface AuthorResponse {
  authorId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PublisherResponse {
  publisherId: number;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CustomerResponse {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  displayName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  joinedAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  data?: CustomerResponse;
}

export interface CartItemResponse {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
  image?: string;
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number;
}

export interface OrderItemResponse {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  imageUrl?: string;
}

export interface OrderDetailResponse {
  orderId: number;
  customerId?: number;
  customerName?: string;
  addressId?: number;
  address?: string;
  orderDate: string;
  totalAmount?: number;
  status: string;
  paymentMethod: string;
  notes?: string;
  items: OrderItemResponse[];
}
