import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { EmployeeAuthService } from '../../../core/services/employee-auth.service';
import { NotificationResponse } from '../../../core/models/models';

@Component({
  selector: 'app-admin-notifications', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <header class="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 class="text-2xl font-semibold text-slate-950">Thông báo</h1><p class="mt-1 text-sm text-slate-500">Hộp thư nội bộ và công cụ gửi thông báo cho khách hàng hoặc nhân viên.</p></div>
        <div class="flex gap-2">
          @if (canSend()) { <button type="button" (click)="composer.set(true)" class="btn-dark">Gửi thông báo</button> }
          @if (unreadCount > 0) { <button type="button" (click)="markAllRead()" class="btn-secondary">Đánh dấu tất cả đã đọc</button> }
        </div>
      </header>

      @if (composer()) {
        <section class="admin-panel p-5">
          <div class="flex items-start justify-between gap-4"><div><h2 class="text-base font-semibold text-slate-950">Soạn thông báo</h2><p class="mt-1 text-xs text-slate-500">Mỗi người nhận được một bản ghi riêng để trạng thái đọc độc lập.</p></div><button type="button" (click)="composer.set(false)" class="text-sm text-slate-500 hover:text-slate-900">Đóng</button></div>
          <form class="mt-5 grid gap-4 md:grid-cols-2" (ngSubmit)="send()">
            <label class="space-y-1.5"><span class="admin-label">Đối tượng</span><select class="admin-input" [(ngModel)]="draft.audience" name="audience" (ngModelChange)="onAudienceChange()"><option value="employees">Tất cả nhân viên đang làm</option><option value="customers">Tất cả khách hàng</option><option value="employee">Một nhân viên</option><option value="customer">Một khách hàng</option></select></label>
            <label class="space-y-1.5"><span class="admin-label">Loại</span><select class="admin-input" [(ngModel)]="draft.type" name="type"><option value="noi_bo">Nội bộ</option><option value="he_thong">Hệ thống</option><option value="khach_hang">Khách hàng</option><option value="don_hang">Đơn hàng</option></select></label>
            @if (draft.audience === 'employee' || draft.audience === 'customer') { <label class="space-y-1.5 md:col-span-2"><span class="admin-label">ID người nhận</span><input class="admin-input" type="number" min="1" required [(ngModel)]="draft.recipientId" name="recipientId" /></label> }
            <label class="space-y-1.5 md:col-span-2"><span class="admin-label">Tiêu đề</span><input class="admin-input" maxlength="200" required [(ngModel)]="draft.title" name="title" placeholder="Ví dụ: Cập nhật chính sách giao hàng" /></label>
            <label class="space-y-1.5 md:col-span-2"><span class="admin-label">Nội dung</span><textarea class="admin-input min-h-32 resize-y" maxlength="4000" required [(ngModel)]="draft.content" name="content" placeholder="Nội dung thông báo..."></textarea></label>
            @if (sendMessage()) { <p class="text-sm md:col-span-2" [class.text-emerald-700]="sendOk()" [class.text-rose-700]="!sendOk()">{{ sendMessage() }}</p> }
            <div class="md:col-span-2 flex justify-end"><button class="btn-dark" type="submit" [disabled]="sending()">{{ sending() ? 'Đang gửi...' : 'Gửi thông báo' }}</button></div>
          </form>
        </section>
      }

      <div class="flex gap-1 border-b border-slate-200"><button type="button" (click)="filter.set('all')" [class]="filter() === 'all' ? 'border-slate-900 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'" class="border-b-2 px-3 py-2.5 text-sm font-medium">Tất cả</button><button type="button" (click)="filter.set('unread')" [class]="filter() === 'unread' ? 'border-slate-900 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'" class="border-b-2 px-3 py-2.5 text-sm font-medium">Chưa đọc <span class="ml-1 text-xs text-slate-400">{{ unreadCount }}</span></button></div>

      @if (loading()) { <div class="space-y-3">@for (x of [1,2,3,4]; track x) { <div class="skeleton h-28 rounded-md"></div> }</div> }
      @else if (filteredNotifications.length === 0) { <div class="admin-panel py-14 text-center"><h2 class="text-lg font-semibold text-slate-950">Không có thông báo</h2><p class="mt-1 text-sm text-slate-500">Không có nội dung phù hợp với bộ lọc hiện tại.</p></div> }
      @else { <div class="admin-panel divide-y divide-slate-100 overflow-hidden">@for (notif of filteredNotifications; track notif.notificationId) { <article class="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto]" [class.bg-slate-50]="notif.status === 'chua_doc'"><div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><h2 class="text-sm font-semibold text-slate-950">{{ notif.title }}</h2>@if (notif.status === 'chua_doc') { <span class="rounded-sm bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">Chưa đọc</span> }<span class="rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{{ typeLabel(notif.type) }}</span></div><p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{{ notif.content }}</p><p class="mt-2 text-xs text-slate-400">{{ notif.createdAt | date:'dd/MM/yyyy HH:mm' }}</p></div><div class="flex items-start gap-3 sm:justify-end">@if (notif.status === 'chua_doc') { <button type="button" (click)="markRead(notif.notificationId)" class="text-sm font-medium text-slate-700 hover:underline">Đã đọc</button> }<button type="button" (click)="deleteNotif(notif.notificationId)" class="text-sm font-medium text-red-600 hover:underline">Xóa</button></div></article> }</div> }
    </div>`
})
export class AdminNotificationsComponent implements OnInit {
  private adminApi = inject(AdminApiService); private employeeAuth = inject(EmployeeAuthService);
  notifications = signal<NotificationResponse[]>([]); loading = signal(true); filter = signal<'all'|'unread'>('all'); composer = signal(false); sending = signal(false); sendMessage = signal(''); sendOk = signal(false);
  draft:{audience:string;recipientId:number|null;title:string;content:string;type:string}={audience:'employees',recipientId:null,title:'',content:'',type:'noi_bo'};
  get unreadCount(){return this.notifications().filter(n=>n.status==='chua_doc').length;}
  get filteredNotifications(){return this.filter()==='unread'?this.notifications().filter(n=>n.status==='chua_doc'):this.notifications();}
  ngOnInit(){this.load();}
  canSend(){return ['admin','quanly'].includes(this.employeeAuth.role());}
  private load(){this.loading.set(true);this.adminApi.getNotifications().subscribe({next:r=>{this.notifications.set(r);this.loading.set(false);},error:()=>this.loading.set(false)});}
  typeLabel(type:string){return ({don_hang:'Đơn hàng',he_thong:'Hệ thống',noi_bo:'Nội bộ',khach_hang:'Khách hàng'} as Record<string,string>)[type]||'Khác';}
  onAudienceChange(){this.draft.recipientId=null;this.draft.type=this.draft.audience.includes('customer')?'khach_hang':'noi_bo';}
  send(){this.sendMessage.set('');if(!this.draft.title.trim()||!this.draft.content.trim())return;if((this.draft.audience==='employee'||this.draft.audience==='customer')&&!this.draft.recipientId)return;this.sending.set(true);this.adminApi.sendNotification({...this.draft,title:this.draft.title.trim(),content:this.draft.content.trim()}).subscribe({next:r=>{this.sending.set(false);this.sendOk.set(true);this.sendMessage.set(r.message||'Đã gửi thông báo.');this.draft.title='';this.draft.content='';},error:e=>{this.sending.set(false);this.sendOk.set(false);this.sendMessage.set(e?.error?.message||'Không thể gửi thông báo.');}});}
  markRead(id:number){this.adminApi.markNotificationRead(id).subscribe({next:()=>this.load()});}
  markAllRead(){this.adminApi.markAllNotificationsRead().subscribe({next:()=>this.load()});}
  deleteNotif(id:number){if(!confirm('Xóa thông báo này?'))return;this.adminApi.deleteNotification(id).subscribe({next:()=>this.load()});}
}
