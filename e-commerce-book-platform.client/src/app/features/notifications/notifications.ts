import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService, NotificationResponse } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-background min-h-screen pb-24 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-10">
          <div>
            <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Thông báo</h1>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Cập nhật tin tức & trạng thái đơn hàng của bạn</p>
          </div>
          @if (notifications().length > 0) {
            <button (click)="markAllRead()" class="btn-secondary py-3 text-xs uppercase tracking-widest font-black shrink-0 cursor-pointer">
              Đánh dấu tất cả đã đọc
            </button>
          }
        </div>

        @if (loading()) {
          <div class="py-24 text-center bg-white border border-slate-200">
            <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-none mx-auto mb-4"></div>
            <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tìm thông báo...</p>
          </div>
        } @else {
          
          <div class="space-y-4">
            @for (noti of notifications(); track noti.notificationId) {
              
              <div [class]="noti.status === 'chua_doc' ? 'border-l-4 border-l-primary bg-blue-50/20' : 'bg-white'"
                   class="p-6 border border-slate-200 rounded-none shadow-sm flex items-start gap-6 relative group transition-all">
                
                <!-- Icon/Type indicator -->
                <div [class]="getIndicatorBg(noti.type)" 
                     class="w-12 h-12 rounded-none flex items-center justify-center shrink-0 text-xl font-bold uppercase tracking-wider">
                  {{ noti.type.charAt(0).toUpperCase() }}
                </div>

                <!-- Content -->
                <div class="flex-grow space-y-2">
                  <div class="flex items-center gap-3">
                    <h3 [class]="noti.status === 'chua_doc' ? 'font-black text-secondary' : 'font-bold text-slate-700'" class="text-sm uppercase tracking-tight">{{ noti.title }}</h3>
                    @if (noti.status === 'chua_doc') {
                      <span class="text-[8px] bg-primary text-white px-2 py-0.5 rounded-none font-black uppercase tracking-widest">Mới</span>
                    }
                  </div>
                  <p class="text-xs text-slate-500 font-semibold leading-relaxed">{{ noti.content }}</p>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ noti.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="toggleRead(noti)" class="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest cursor-pointer">
                    {{ noti.status === 'chua_doc' ? 'Đã đọc' : 'Chưa đọc' }}
                  </button>
                  <button (click)="archive(noti.notificationId)" class="text-[10px] font-black text-rose-400 hover:text-rose-500 uppercase tracking-widest cursor-pointer">
                    Xóa
                  </button>
                </div>

              </div>

            } @empty {
              <div class="text-center py-24 bg-white border border-slate-200 rounded-none space-y-4">
                <div class="text-6xl text-slate-100 mx-auto">🔔</div>
                <h3 class="text-xl font-black text-secondary uppercase tracking-tight">Hộp thư trống</h3>
                <p class="text-slate-400 text-xs font-bold">Bạn không có thông báo nào mới tại BookZone.</p>
                <a routerLink="/" class="btn-dark px-10 py-4 uppercase text-xs tracking-widest inline-block">Trở về trang chủ</a>
              </div>
            }
          </div>

        }

      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<NotificationResponse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        this.notifications.set(Array.isArray(res) ? res : ((res as any).items || (res as any).data || []));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe(() => {
      this.loadNotifications();
      alert('Đã đánh dấu tất cả thông báo là đã đọc!');
    });
  }

  toggleRead(noti: NotificationResponse) {
    this.notificationService.toggleRead(noti.notificationId).subscribe(res => {
      this.loadNotifications();
    });
  }

  archive(id: number) {
    this.notificationService.archive(id).subscribe(() => {
      this.loadNotifications();
      alert('Đã xóa thông báo thành công!');
    });
  }

  getIndicatorBg(type: string): string {
    if (type === 'system') return 'bg-amber-50 text-amber-500 border border-amber-100';
    if (type === 'order') return 'bg-emerald-50 text-emerald-500 border border-emerald-100';
    if (type === 'promotion') return 'bg-rose-50 text-rose-500 border border-rose-100';
    return 'bg-blue-50 text-blue-500 border border-blue-100';
  }
}
