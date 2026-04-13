import { Component } from '@angular/core';
import { AppIconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="site-container page-shell">
      <header class="page-header">
        <p class="eyebrow">Hỗ trợ</p>
        <h1 class="page-title">Liên hệ với BookZone</h1>
        <p class="page-description">Gửi câu hỏi, góp ý hoặc yêu cầu hỗ trợ. Chúng tôi sẽ phản hồi qua thông tin bạn cung cấp.</p>
      </header>

      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:gap-16">
        <section class="max-w-xl">
          <h2 class="font-serif text-2xl font-semibold text-secondary">Thông tin liên hệ</h2>
          <p class="mt-4 text-[15px] leading-8 text-body">Nếu bạn có bất kỳ câu hỏi, góp ý hay yêu cầu hỗ trợ nào, vui lòng liên hệ với BookZone qua các kênh dưới đây hoặc gửi biểu mẫu.</p>
          <dl class="mt-8 border-t border-border text-sm">
            <div class="grid gap-2 border-b border-border py-5 sm:grid-cols-[130px_1fr]"><dt class="flex items-center gap-2 font-medium text-secondary"><app-icon name="map-pin" class="h-4 w-4 text-primary"/>Địa chỉ</dt><dd class="leading-6 text-body">120 Lê Lợi, Bến Thành, Quận 1, TP. Hồ Chí Minh</dd></div>
            <div class="grid gap-2 border-b border-border py-5 sm:grid-cols-[130px_1fr]"><dt class="flex items-center gap-2 font-medium text-secondary"><app-icon name="bell" class="h-4 w-4 text-primary"/>Hotline</dt><dd class="text-body">1900 6789 · 8:00-21:00 hàng ngày</dd></div>
            <div class="grid gap-2 border-b border-border py-5 sm:grid-cols-[130px_1fr]"><dt class="flex items-center gap-2 font-medium text-secondary"><app-icon name="clock" class="h-4 w-4 text-primary"/>Email</dt><dd class="text-body">support&#64;bookzone.com</dd></div>
          </dl>
        </section>

        <form (submit)="$event.preventDefault()" class="h-fit rounded-xl border border-border bg-surface p-6 sm:p-7">
          <h2 class="font-serif text-2xl font-semibold text-secondary">Gửi tin nhắn</h2>
          <div class="mt-7 space-y-5">
            <div><label for="contact-name" class="field-label">Họ và tên</label><input id="contact-name" type="text" class="field" required /></div>
            <div><label for="contact-email" class="field-label">Email</label><input id="contact-email" type="email" class="field" required /></div>
            <div><label for="contact-message" class="field-label">Nội dung</label><textarea id="contact-message" rows="5" class="field resize-y" required></textarea></div>
            <button type="submit" class="btn-primary w-full min-h-12">Gửi liên hệ</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ContactComponent {}