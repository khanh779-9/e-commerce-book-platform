import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, CartItemResponse, CartResponse, PaymentMethod, ProductResponse } from '../models/models';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private config = inject(ConfigService);
  private platformId = inject(PLATFORM_ID);
  private readonly guestKey = 'guest_cart';

  readonly cartItems = signal<CartItemResponse[]>([]);
  readonly cartTotal = computed(() => this.cartItems().reduce((sum, i) => sum + i.subTotal, 0));
  readonly cartCount = computed(() => this.cartItems().reduce((sum, i) => sum + i.quantity, 0));
  readonly savings = computed(() => this.cartItems().reduce((sum, i) => sum + Math.max(0, (i.originalPrice - i.price) * i.quantity), 0));

  constructor() {
    this.loadGuest();
    effect(() => { if (this.auth.isAuthenticated()) this.syncWithBackend(); else this.loadGuest(); });
  }
  private isBrowser() { return isPlatformBrowser(this.platformId); }
  private loadGuest() {
    if (!this.isBrowser() || this.auth.isAuthenticated()) return;
    try { this.cartItems.set(JSON.parse(localStorage.getItem(this.guestKey) || '[]')); } catch { this.cartItems.set([]); }
  }
  private saveGuest() { if (this.isBrowser() && !this.auth.isAuthenticated()) localStorage.setItem(this.guestKey, JSON.stringify(this.cartItems())); }
  refresh() { if (this.auth.isAuthenticated()) this.fetchBackendCart(); else this.loadGuest(); }
  private fetchBackendCart() { this.http.get<CartResponse>(this.config.buildApiUrl('/v1/cart')).subscribe({ next: c => this.cartItems.set(c.items || []), error: () => this.cartItems.set([]) }); }
  syncWithBackend() {
    if (!this.auth.isAuthenticated()) return;
    const guest = this.isBrowser() ? this.readGuest() : [];
    if (guest.length) {
      this.http.post<ApiResponse<CartResponse>>(this.config.buildApiUrl('/v1/cart/merge'), { items: guest.map(i => ({ productId: i.productId, quantity: i.quantity })) }).subscribe({
        next: r => { this.cartItems.set(r.data?.items || []); if (this.isBrowser()) localStorage.removeItem(this.guestKey); },
        error: () => this.fetchBackendCart()
      });
    } else this.fetchBackendCart();
  }
  addToCart(product: Pick<ProductResponse,'productId'|'name'|'price'|'promoPrice'|'effectivePrice'|'stockQuantity'|'imageUrl'>, quantity = 1) {
    quantity = Math.max(1, Math.min(quantity, product.stockQuantity || 1));
    if (this.auth.isAuthenticated()) {
      this.http.post<ApiResponse<CartResponse>>(this.config.buildApiUrl('/v1/cart'), { productId: product.productId, quantity }).subscribe({ next: r => this.cartItems.set(r.data?.items || []) });
      return;
    }
    const items = [...this.cartItems()];
    const idx = items.findIndex(i => i.productId === product.productId);
    const price = product.effectivePrice || product.promoPrice || product.price;
    if (idx >= 0) {
      const q = Math.min(items[idx].quantity + quantity, product.stockQuantity || 999);
      items[idx] = { ...items[idx], quantity: q, subTotal: q * items[idx].price, stockQuantity: product.stockQuantity };
    } else {
      items.push({ productId: product.productId, name: product.name, originalPrice: product.price, price, quantity, subTotal: price * quantity, stockQuantity: product.stockQuantity, image: product.imageUrl });
    }
    this.cartItems.set(items); this.saveGuest();
  }
  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) return this.removeFromCart(productId);
    if (this.auth.isAuthenticated()) {
      this.http.patch<ApiResponse<unknown>>(this.config.buildApiUrl(`/v1/cart/${productId}`), { quantity }).subscribe({ next: () => this.fetchBackendCart() }); return;
    }
    this.cartItems.update(items => items.map(i => i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stockQuantity || 999), subTotal: Math.min(quantity, i.stockQuantity || 999) * i.price } : i));
    this.saveGuest();
  }
  removeFromCart(productId: number) {
    if (this.auth.isAuthenticated()) { this.http.delete(this.config.buildApiUrl(`/v1/cart/${productId}`)).subscribe({ next: () => this.fetchBackendCart() }); return; }
    this.cartItems.update(items => items.filter(i => i.productId !== productId)); this.saveGuest();
  }
  clearLocal() { this.cartItems.set([]); if (this.isBrowser()) localStorage.removeItem(this.guestKey); }
  private readGuest(): CartItemResponse[] { try { return JSON.parse(localStorage.getItem(this.guestKey) || '[]'); } catch { return []; } }
}
