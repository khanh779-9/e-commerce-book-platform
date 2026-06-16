import { Injectable, signal, computed, inject, effect, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { CartItemResponse, CartResponse, ApiResponse } from '../models/models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  // Signal state
  cartItems = signal<CartItemResponse[]>([]);
  cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0));
  cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    // Load initial cart
    if (this.isBrowser()) {
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        this.cartItems.set(JSON.parse(localCart));
      }
    }

    // React to auth changes
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      if (isAuth) {
        this.syncWithBackend();
      } else {
        // Fallback to local guest cart
        if (this.isBrowser()) {
          const localCart = localStorage.getItem('guest_cart');
          this.cartItems.set(localCart ? JSON.parse(localCart) : []);
        }
      }
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  private saveLocal() {
    if (this.isBrowser() && !this.authService.isAuthenticated()) {
      localStorage.setItem('guest_cart', JSON.stringify(this.cartItems()));
    }
  }

  syncWithBackend() {
    if (!this.authService.isAuthenticated()) return;

    // If there are guest items, merge them first
    const guestItems = this.cartItems();
    if (guestItems.length > 0) {
      const itemsToMerge = guestItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      this.http.post<ApiResponse<CartResponse>>('/api/v1/cart/merge', { items: itemsToMerge }, { headers: this.getHeaders() })
        .subscribe({
          next: (res) => {
            if (res.data) {
              this.cartItems.set(res.data.items || []);
              if (this.isBrowser()) {
                localStorage.removeItem('guest_cart');
              }
            }
          },
          error: () => this.fetchBackendCart()
        });
    } else {
      this.fetchBackendCart();
    }
  }

  private fetchBackendCart() {
    this.http.get<CartResponse>('/api/v1/cart', { headers: this.getHeaders() }).subscribe({
      next: (cart) => {
        this.cartItems.set(cart?.items || []);
      }
    });
  }

  addToCart(product: { productId: number; name: string; price: number; imageUrl?: string }, quantity = 1) {
    const isAuth = this.authService.isAuthenticated();

    if (isAuth) {
      this.http.post<ApiResponse<CartResponse>>('/api/v1/cart', {
        productId: product.productId,
        quantity: quantity
      }, { headers: this.getHeaders() }).subscribe({
        next: (res) => {
          if (res.data) {
            this.cartItems.set(res.data.items || []);
          }
        }
      });
    } else {
      // Local cart logic
      const items = [...this.cartItems()];
      const index = items.findIndex(item => item.productId === product.productId);
      if (index > -1) {
        items[index].quantity += quantity;
        items[index].subTotal = items[index].quantity * items[index].price;
      } else {
        items.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity: quantity,
          subTotal: product.price * quantity,
          image: product.imageUrl
        });
      }
      this.cartItems.set(items);
      this.saveLocal();
    }
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const isAuth = this.authService.isAuthenticated();

    if (isAuth) {
      this.http.patch<ApiResponse<any>>(`/api/v1/cart/${productId}`, {
        quantity: quantity
      }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchBackendCart();
        }
      });
    } else {
      const items = [...this.cartItems()];
      const index = items.findIndex(item => item.productId === productId);
      if (index > -1) {
        items[index].quantity = quantity;
        items[index].subTotal = items[index].quantity * items[index].price;
        this.cartItems.set(items);
        this.saveLocal();
      }
    }
  }

  removeFromCart(productId: number) {
    const isAuth = this.authService.isAuthenticated();

    if (isAuth) {
      this.http.delete<ApiResponse<any>>(`/api/v1/cart/${productId}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchBackendCart();
        }
      });
    } else {
      const items = this.cartItems().filter(item => item.productId !== productId);
      this.cartItems.set(items);
      this.saveLocal();
    }
  }

  checkout(checkoutDetails: { addressId?: number; paymentMethod: string; notes?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('/api/v1/orders', checkoutDetails, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.cartItems.set([]);
        if (this.isBrowser()) {
          localStorage.removeItem('guest_cart');
        }
      })
    );
  }

  clearCart() {
    this.cartItems.set([]);
    if (this.isBrowser()) {
      localStorage.removeItem('guest_cart');
    }
  }
}
