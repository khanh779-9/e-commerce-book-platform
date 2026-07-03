import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AddressResponse, PaymentMethod, ShippingCalculationResult, ShippingZone, ShippingDistrict, VnPayPaymentResponse } from '../../../core/models/models';
import { AccountService } from '../../../core/services/account.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppIconComponent } from '../../../shared/components/icon/icon';
import { ProductImagePipe } from '../../../shared/pipes/product-image.pipe';
import { PRODUCT_IMAGE_FALLBACK } from '../../../core/utils/image';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AppIconComponent, ProductImagePipe],
  template: `
    <div class="bg-paper"><div class="site-container page-shell">
      <header class="page-header"><p class="eyebrow">Thanh toán</p><h1 class="page-title">Xác nhận đơn hàng</h1><p class="page-description">Địa chỉ, phương thức thanh toán, mã giảm giá và tổng tiền được hiển thị trước khi đặt hàng.</p></header>
      @if(cart.cartItems().length===0){
        <div class="py-16 text-center"><h2 class="font-serif text-2xl font-semibold">Không có sản phẩm để thanh toán</h2><a routerLink="/cart" class="btn-primary mt-5">Quay lại giỏ hàng</a></div>
      } @else {
        <form (submit)="submit($event)" class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:gap-16">
        <div class="space-y-10">
        <section>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-white">1</span><h2 class="font-serif text-2xl font-semibold">Địa chỉ giao hàng</h2></div>
            <button type="button" class="text-sm font-semibold text-primary hover:text-primary-dark" (click)="showAddressForm.set(!showAddressForm())">Thêm địa chỉ</button>
          </div>
          @if(addresses().length){
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              @for(a of addresses(); track a.addressId){
                <label class="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-4 [&:has(input:checked)]:ring-primary/10" [class.border-primary]="addressId===a.addressId" [class.border-border]="addressId!==a.addressId">
                  <input type="radio" name="address" [value]="a.addressId" [(ngModel)]="addressId" class="mt-1 h-4 w-4 accent-[var(--color-primary)]"/>
                  <span class="text-sm leading-6 text-body">{{a.address}}</span>
                </label>
              }
            </div>
          } @else {
            <p class="mt-4 text-sm text-muted">Bạn chưa lưu địa chỉ giao hàng.</p>
          }
          @if(showAddressForm()){
            <div class="mt-5 rounded-xl border border-border bg-cream p-5">
              <label class="field-label">Địa chỉ mới</label>
              <textarea class="field min-h-24 bg-white" [(ngModel)]="newAddress" name="newAddress" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"></textarea>
              <div class="mt-4 flex gap-2">
                <button type="button" class="btn-primary" (click)="addAddress()" [disabled]="!newAddress.trim()">Lưu địa chỉ</button>
                <button type="button" class="btn-secondary" (click)="showAddressForm.set(false)">Hủy</button>
              </div>
            </div>
          }
        </section>

        <section class="border-t border-border pt-10">
          <div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-white">2</span><h2 class="font-serif text-2xl font-semibold">Phương thức thanh toán</h2></div>
          <div class="mt-5 grid gap-3 sm:grid-cols-4">
            <label class="cursor-pointer rounded-xl border p-4 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-4 [&:has(input:checked)]:ring-primary/10" [class.border-primary]="paymentMethod==='tien_mat'">
              <input type="radio" name="payment" value="tien_mat" [(ngModel)]="paymentMethod" class="mr-2 h-4 w-4 accent-[var(--color-primary)]"/>
              <span class="inline-flex items-center gap-2 text-sm font-medium text-secondary"><app-icon name="banknote" class="h-4 w-4 text-primary"/>Tiền mặt</span>
            </label>
            <label class="cursor-pointer rounded-xl border p-4 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-4 [&:has(input:checked)]:ring-primary/10" [class.border-primary]="paymentMethod==='chuyen_khoan'">
              <input type="radio" name="payment" value="chuyen_khoan" [(ngModel)]="paymentMethod" class="mr-2 h-4 w-4 accent-[var(--color-primary)]"/>
              <span class="inline-flex items-center gap-2 text-sm font-medium text-secondary"><app-icon name="credit-card" class="h-4 w-4 text-primary"/>Chuyển khoản</span>
            </label>
            <label class="cursor-pointer rounded-xl border p-4 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-4 [&:has(input:checked)]:ring-primary/10" [class.border-primary]="paymentMethod==='vi_dien_tu'">
              <input type="radio" name="payment" value="vi_dien_tu" [(ngModel)]="paymentMethod" class="mr-2 h-4 w-4 accent-[var(--color-primary)]"/>
              <span class="inline-flex items-center gap-2 text-sm font-medium text-secondary"><app-icon name="wallet" class="h-4 w-4 text-primary"/>Ví điện tử</span>
            </label>
            <label class="cursor-pointer rounded-xl border p-4 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-4 [&:has(input:checked)]:ring-primary/10" [class.border-primary]="paymentMethod==='vnpay'">
              <input type="radio" name="payment" value="vnpay" [(ngModel)]="paymentMethod" class="mr-2 h-4 w-4 accent-[var(--color-primary)]"/>
              <span class="inline-flex items-center gap-2 text-sm font-medium text-secondary"><app-icon name="credit-card" class="h-4 w-4 text-primary"/>VNPay / Thẻ quốc tế</span>
            </label>
          </div>
        </section>

        <section class="border-t border-border pt-10">
          <div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-white">3</span><h2 class="font-serif text-2xl font-semibold">Khu vực giao hàng</h2></div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="block"><span class="field-label">Tỉnh/Thành phố</span>
              <select class="field" [(ngModel)]="selectedProvinceId" (change)="onProvinceChange()">
                <option value="0">Chọn tỉnh/thành</option>
                @for (z of shippingZones(); track z.provinceId) {
                  <option [value]="z.provinceId">{{ z.provinceName }}</option>
                }
              </select>
            </label>
            <label class="block"><span class="field-label">Quận/Huyện</span>
              <select class="field" [(ngModel)]="selectedDistrictId" (change)="calculateShipping()" [disabled]="!shippingDistricts().length">
                <option value="0">Chọn quận/huyện</option>
                @for (d of shippingDistricts(); track d.districtId) {
                  <option [value]="d.districtId">{{ d.districtName }} (+{{ d.additionalFee | currency:'VND':'symbol-narrow':'1.0-0' }})</option>
                }
              </select>
            </label>
          </div>
          @if(loadingShipping()){<p class="mt-2 text-sm text-muted">Đang tính phí vận chuyển...</p>}
        </section>

        <section class="border-t border-border pt-10">
          <div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-white">4</span><h2 class="font-serif text-2xl font-semibold">Mã giảm giá</h2></div>
          <div class="mt-4 flex gap-2">
            <input type="text" class="field flex-1" [(ngModel)]="voucherCode" name="voucherCode" placeholder="Nhập mã giảm giá" [disabled]="applyingVoucher()" />
            <button type="button" class="btn-secondary" (click)="applyVoucher()" [disabled]="!voucherCode.trim()||applyingVoucher()">{{applyingVoucher()?'Đang áp dụng...':'Áp dụng'}}</button>
          </div>
          @if(voucherError()){<p class="mt-2 text-sm text-danger">{{voucherError()}}</p>}
          @if(voucherSuccess()){<p class="mt-2 text-sm text-success">{{voucherSuccess()}}</p>}
        </section>

        <section class="border-t border-border pt-10">
          <div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-white">5</span><h2 class="font-serif text-2xl font-semibold">Ghi chú</h2></div>
          <textarea class="field mt-5 min-h-28" [(ngModel)]="notes" name="notes" placeholder="Ghi chú cho đơn hàng (tùy chọn)"></textarea>
        </section>
        </div>

        <aside class="h-fit rounded-xl border border-border bg-surface p-7 lg:sticky lg:top-28">
          <h2 class="font-serif text-xl font-semibold">Đơn hàng</h2>
          <div class="mt-5 max-h-80 divide-y divide-border overflow-auto">
            @for(i of cart.cartItems(); track i.productId){
              <div class="flex gap-4 py-4">
                <div class="h-16 w-12 shrink-0 rounded-md bg-cream p-1">
                  @if(i.image){
                    <img [src]="i.image | productImage" (error)="$any($event.target).src = fallbackImg" [alt]="i.name" class="h-full w-full object-contain"/>
                  }
                </div>
                <div class="min-w-0 flex-1">
                  <p class="line-clamp-2 text-sm font-medium text-secondary">{{i.name}}</p>
                  <p class="mt-1 text-xs text-muted">{{i.quantity}} × {{i.price|currency:'VND':'symbol-narrow':'1.0-0'}}</p>
                </div>
                <p class="text-sm font-semibold tnum">{{i.subTotal|currency:'VND':'symbol-narrow':'1.0-0'}}</p>
              </div>
            }
          </div>
          <dl class="mt-5 space-y-3 border-t border-border pt-4 text-sm">
            <div class="flex justify-between"><dt class="text-muted">Tạm tính</dt><dd class="tnum text-secondary">{{subTotal()|currency:'VND':'symbol-narrow':'1.0-0'}}</dd></div>
            @if(discountAmount()>0){
              <div class="flex justify-between text-success"><dt>Giảm giá ({{appliedVoucherCode()}})</dt><dd class="tnum">-{{discountAmount()|currency:'VND':'symbol-narrow':'1.0-0'}}</dd></div>
            }
            @if(shippingResult()){
              <div class="flex justify-between"><dt class="text-muted">Phí vận chuyển</dt><dd class="tnum">{{shippingResult()!.shippingFee|currency:'VND':'symbol-narrow':'1.0-0'}}</dd></div>
            }
            @if(shippingResult()?.isFreeShipping){
              <p class="text-xs text-success">Miễn phí vận chuyển cho đơn từ {{shippingResult()!.freeShippingThreshold|currency:'VND':'symbol-narrow':'1.0-0'}}</p>
            }
            <div class="flex justify-between border-t border-border pt-4 text-lg font-semibold text-secondary"><dt>Tổng cộng</dt><dd class="tnum">{{grandTotal()|currency:'VND':'symbol-narrow':'1.0-0'}}</dd></div>
          </dl>
          @if(error()){<p class="mt-4 text-sm text-danger">{{error()}}</p>}
          <button class="btn-primary mt-6 w-full min-h-12" [disabled]="submitting()||!addressId||!selectedProvinceId||!selectedDistrictId">
            {{submitting()?'Đang xử lý...':'Đặt hàng'}}
          </button>
          <p class="mt-3 text-xs leading-5 text-muted">Giá và tồn kho sẽ được máy chủ kiểm tra lại ngay khi bạn đặt hàng.</p>
        </aside>
        </form>
      }
    </div></div>
  `
})
export class CheckoutComponent implements OnInit {
  fallbackImg = PRODUCT_IMAGE_FALLBACK;
  private account = inject(AccountService);
  public cart = inject(CartService);
  private orders = inject(OrderService);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  addresses = signal<AddressResponse[]>([]);
  showAddressForm = signal(false);
  newAddress = '';
  addressId?: number;
  paymentMethod: PaymentMethod = 'tien_mat';
  notes = '';
  submitting = signal(false);
  error = signal('');

  voucherCode = '';
  applyingVoucher = signal(false);
  voucherError = signal('');
  voucherSuccess = signal('');
  appliedVoucherCode = signal('');
  discountAmount = signal(0);

  shippingZones = signal<ShippingZone[]>([]);
  shippingDistricts = signal<ShippingDistrict[]>([]);
  selectedProvinceId = 0;
  selectedDistrictId = 0;
  loadingShipping = signal(false);
  shippingResult = signal<ShippingCalculationResult | null>(null);

  subTotal = computed(() => this.cart.cartTotal());
  grandTotal = computed(() => this.subTotal() - this.discountAmount() + (this.shippingResult()?.shippingFee || 0));

  ngOnInit() {
    this.cart.refresh();
    this.loadAddresses();
    this.loadShippingZones();
  }

  loadAddresses() {
    this.account.getAddresses().subscribe({
      next: (a) => {
        this.addresses.set(a);
        if (!this.addressId && a.length) this.addressId = a[0].addressId;
      }
    });
  }

  addAddress() {
    const v = this.newAddress.trim();
    if (!v) return;
    this.account.addAddress(v).subscribe({
      next: (r) => {
        if (r.data) {
          this.addresses.update((arr) => [...arr, r.data!]);
          this.addressId = r.data.addressId;
        }
        this.newAddress = '';
        this.showAddressForm.set(false);
      }
    });
  }

  loadShippingZones() {
    this.productService.getShippingZones().subscribe({
      next: (z) => {
        this.shippingZones.set(z);
        if (z.length) {
          this.selectedProvinceId = z[0].provinceId;
          this.loadShippingDistricts(this.selectedProvinceId);
        }
      }
    });
  }

  loadShippingDistricts(provinceId: number) {
    this.productService.getShippingDistricts(provinceId).subscribe({
      next: (d) => {
        this.shippingDistricts.set(d);
        if (d.length) {
          this.selectedDistrictId = d[0].districtId;
          this.calculateShipping();
        } else {
          this.shippingDistricts.set([]);
          this.selectedDistrictId = 0;
          this.calculateShipping();
        }
      }
    });
  }

  onProvinceChange() {
    this.selectedDistrictId = 0;
    this.loadShippingDistricts(this.selectedProvinceId);
  }

  calculateShipping() {
    if (!this.selectedProvinceId || !this.selectedDistrictId) return;
    this.loadingShipping.set(true);
    const totalWeight = this.cart.cartItems().reduce((sum, i) => sum + (i.weight || 0.5) * i.quantity, 0);
    const orderValue = this.subTotal();
    this.productService.calculateShipping(this.selectedProvinceId, this.selectedDistrictId, totalWeight, orderValue).subscribe({
      next: (r) => {
        this.shippingResult.set(r.data ?? null);
        this.loadingShipping.set(false);
      },
      error: () => {
        this.shippingResult.set(null);
        this.loadingShipping.set(false);
      }
    });
  }

  applyVoucher() {
    if (!this.voucherCode.trim() || this.applyingVoucher()) return;
    this.applyingVoucher.set(true);
    this.voucherError.set('');
    this.voucherSuccess.set('');
    const productIds = this.cart.cartItems().map((i) => i.productId);
    this.productService.validatePromotion(this.voucherCode.trim(), this.subTotal(), productIds).subscribe({
      next: (r) => {
        this.applyingVoucher.set(false);
        if (r.data?.isValid) {
          this.discountAmount.set(r.data.discountAmount);
          this.appliedVoucherCode.set(this.voucherCode.trim());
          this.voucherSuccess.set('Áp dụng mã thành công!');
          this.calculateShipping();
        } else {
          this.voucherError.set(r.data?.message || 'Mã không hợp lệ.');
        }
      },
      error: () => {
        this.applyingVoucher.set(false);
        this.voucherError.set('Không thể áp dụng mã.');
      }
    });
  }

  submit(e: Event) {
    e.preventDefault();
    if (!this.addressId) return;
    if (!this.selectedProvinceId || !this.selectedDistrictId) {
      this.error.set('Vui lòng chọn tỉnh/thành và quận/huyện');
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    const orderData = {
      addressId: this.addressId,
      paymentMethod: this.paymentMethod,
      notes: this.notes || undefined,
      voucherCode: this.appliedVoucherCode() || undefined
    };

    if (this.paymentMethod === 'vnpay') {
      this.orders.createVnPayPayment(orderData).subscribe({
        next: (r) => {
          this.submitting.set(false);
          if (r.data?.paymentUrl) {
            window.location.href = r.data.paymentUrl;
          } else {
            this.error.set(r.data?.message || 'Không tạo được URL thanh toán.');
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Không thể tạo thanh toán VNPay.');
          this.submitting.set(false);
        }
      });
    } else {
      this.orders.createOrder(orderData).subscribe({
        next: (r) => {
          this.cart.clearLocal();
          this.submitting.set(false);
          this.router.navigate(['/orders'], { queryParams: { created: r.data?.orderId } });
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Không thể tạo đơn hàng.');
          this.submitting.set(false);
          this.cart.refresh();
        }
      });
    }
  }
}