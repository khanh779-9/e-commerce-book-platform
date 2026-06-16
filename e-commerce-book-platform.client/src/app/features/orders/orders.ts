import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { OrderDetailResponse } from '../../core/models/models';

const STATUS_MAP: { [key: string]: { label: string; color: string } } = {
  cho_thanh_toan: { label: 'Chờ thanh toán', color: 'bg-amber-50 text-amber-600 border border-amber-200' },
  cho_xac_nhan: { label: 'Chờ xác nhận', color: 'bg-blue-50 text-blue-600 border border-blue-200' },
  da_xac_nhan: { label: 'Đã xác nhận', color: 'bg-indigo-50 text-indigo-600 border border-indigo-200' },
  dang_giao_hang: { label: 'Đang vận chuyển', color: 'bg-cyan-50 text-cyan-600 border border-cyan-200' },
  da_giao_hang: { label: 'Giao thành công', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  da_huy: { label: 'Đã hủy đơn', color: 'bg-rose-50 text-rose-600 border border-rose-200' }
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-background min-h-screen pb-24 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        <!-- Render detailed order view if selected -->
        @if (selectedOrderId()) {
          
          <div class="space-y-8 max-w-4xl mx-auto">
            <a routerLink="/orders" [queryParams]="{}" class="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors cursor-pointer">
              ← Quay lại danh sách
            </a>

            @if (loadingDetails()) {
              <div class="py-24 text-center bg-white border border-slate-200">
                <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-none mx-auto mb-4"></div>
                <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải chi tiết đơn hàng...</p>
              </div>
            } @else if (orderDetails(); as details) {
              
              <div class="bg-white border border-slate-200 rounded-none shadow-2xl overflow-hidden">
                <!-- Status Banner -->
                <div [class]="getStatusBg(details.status)" class="p-8 flex items-center justify-between text-white transition-all duration-300">
                  <div class="flex items-center gap-6">
                    <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">{{ getStatusLabel(details.status) }}</h2>
                      <p class="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Mã đơn: #{{ details.orderId }}</p>
                    </div>
                  </div>
                  <div class="text-right hidden sm:block">
                    <p class="text-xs font-bold opacity-70 uppercase tracking-widest">Thời gian đặt</p>
                    <p class="text-lg font-black mt-1">{{ details.orderDate | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>

                <!-- Info Grid -->
                <div class="p-8 md:p-12 space-y-12">
                  <div class="grid md:grid-cols-2 gap-12">
                    <div class="space-y-3">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 Địa chỉ giao hàng</h4>
                      <p class="text-sm font-bold text-secondary leading-relaxed">{{ details.address }}</p>
                    </div>
                    <div class="space-y-3">
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">💳 Hình thức thanh toán</h4>
                      <p class="text-sm font-bold text-secondary uppercase tracking-tight">
                        {{ details.paymentMethod === 'chuyen_khoan' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt khi nhận hàng (COD)' }}
                      </p>
                    </div>
                  </div>

                  <!-- Item List -->
                  <div class="space-y-6">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Danh sách sản phẩm ({{ details.items.length }})</h4>
                    <div class="space-y-4">
                      @for (item of details.items; track item.productId) {
                        <div class="flex items-center gap-6 p-4 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                          <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=100'" class="w-16 h-20 object-contain bg-white border border-slate-100 p-1" alt="" />
                          <div class="flex-1 min-w-0">
                            <p class="font-black text-secondary text-sm uppercase tracking-tight truncate">{{ item.productName }}</p>
                            <p class="text-xs text-slate-400 font-bold mt-1">SỐ LƯỢNG: {{ item.quantity }}</p>
                          </div>
                          <div class="text-right">
                            <p class="font-black text-primary">{{ item.subTotal | currency:'VND':'symbol-narrow':'1.0-0' }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Summary totals -->
                  <div class="pt-10 border-t border-slate-100 flex flex-col items-end">
                    <div class="w-full max-w-xs space-y-4">
                      <div class="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Tạm tính</span>
                        <span class="text-secondary">{{ details.totalAmount | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                      </div>
                      <div class="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                        <span>Phí vận chuyển</span>
                        <span>Miễn phí</span>
                      </div>
                      <div class="h-px bg-slate-100 my-2"></div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm font-black text-secondary uppercase tracking-tight">Tổng thanh toán</span>
                        <span class="text-3xl font-black text-primary tracking-tighter">{{ details.totalAmount | currency:'VND':'symbol-narrow':'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

          </div>

        <!-- Render list of all historical orders -->
        } @else {
          
          <div class="max-w-5xl mx-auto space-y-8">
            <div class="mb-10">
              <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Lịch sử đơn hàng</h1>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Theo dõi hành trình của những cuốn sách bạn đã chọn</p>
            </div>

            @if (loadingList()) {
              <div class="py-24 text-center bg-white border border-slate-200">
                <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-none mx-auto mb-4"></div>
                <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải đơn hàng...</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (order of orders(); track order.orderId) {
                  <div class="bg-white border border-slate-200 rounded-none p-6 hover:shadow-xl transition-all group">
                    <a [routerLink]="['/orders']" [queryParams]="{ id: order.orderId }" class="flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
                      <div class="flex items-center gap-6">
                        <div [class]="getStatusColor(order.status)" class="w-16 h-16 flex items-center justify-center rounded-none text-2xl">
                          📦
                        </div>
                        <div>
                          <h3 class="text-lg font-black text-secondary tracking-tight">ĐƠN HÀNG #{{ order.orderId }}</h3>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Ngày đặt: {{ order.orderDate | date:'dd/MM/yyyy' }}
                          </p>
                        </div>
                      </div>

                      <div class="flex items-center justify-between md:justify-end gap-10">
                        <div class="text-right">
                          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tổng cộng</p>
                          <p class="text-xl font-black text-primary">{{ order.totalAmount | currency:'VND':'symbol-narrow':'1.0-0' }}</p>
                        </div>
                        <div [class]="getStatusColor(order.status)" class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-none">
                          {{ getStatusLabel(order.status) }}
                        </div>
                        <span class="text-slate-300 group-hover:text-primary transition-colors hidden md:block">→</span>
                      </div>
                    </a>
                  </div>
                } @empty {
                  <div class="text-center py-24 bg-white border border-slate-200 rounded-none space-y-4">
                    <div class="text-6xl text-slate-100 mx-auto">📭</div>
                    <h3 class="text-xl font-black text-secondary uppercase tracking-tight">Chưa có đơn hàng nào</h3>
                    <p class="text-slate-400 text-xs font-bold">Bạn chưa thực hiện giao dịch mua sách nào tại BookZone.</p>
                    <a routerLink="/products" class="btn-dark px-10 py-4 uppercase text-xs tracking-widest inline-block">Bắt đầu mua sắm ngay</a>
                  </div>
                }
              </div>
            }
          </div>

        }

      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);

  selectedOrderId = signal<number | null>(null);
  
  orders = signal<OrderDetailResponse[]>([]);
  orderDetails = signal<OrderDetailResponse | null>(null);

  loadingList = signal<boolean>(true);
  loadingDetails = signal<boolean>(true);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.selectedOrderId.set(+id);
        this.loadOrderDetail(+id);
      } else {
        this.selectedOrderId.set(null);
        this.loadOrdersList();
      }
    });
  }

  loadOrdersList() {
    this.loadingList.set(true);
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(Array.isArray(res) ? res : ((res as any).items || (res as any).data || []));
        this.loadingList.set(false);
      },
      error: () => this.loadingList.set(false)
    });
  }

  loadOrderDetail(id: number) {
    this.loadingDetails.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        this.orderDetails.set(res);
        this.loadingDetails.set(false);
      },
      error: () => this.loadingDetails.set(false)
    });
  }

  getStatusLabel(status: string): string {
    return STATUS_MAP[status]?.label || status;
  }

  getStatusColor(status: string): string {
    return STATUS_MAP[status]?.color || 'bg-slate-100 text-slate-500';
  }

  getStatusBg(status: string): string {
    // Return custom color classes for header background in details
    if (status === 'da_giao_hang') return 'bg-emerald-600';
    if (status === 'da_huy') return 'bg-rose-500';
    if (status === 'dang_giao_hang') return 'bg-cyan-600';
    if (status === 'da_xac_nhan') return 'bg-indigo-600';
    return 'bg-blue-600';
  }
}
