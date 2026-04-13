import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="site-container page-shell">
      <div class="mx-auto max-w-4xl">
        <header class="page-header">
          <p class="eyebrow">Về chúng tôi</p>
          <h1 class="page-title">Giới thiệu về BookZone</h1>
          <p class="page-description">Ngôi nhà dành cho những người yêu sách và mong muốn tìm nội dung đọc phù hợp một cách thuận tiện.</p>
        </header>

        <article class="max-w-3xl space-y-7 text-[15px] leading-8 text-body">
          <p class="font-serif text-xl font-medium leading-9 text-secondary">Chào mừng bạn đến với BookZone - nơi kết nối độc giả với kho tàng tri thức vô tận của nhân loại.</p>
          <p>Được thành lập với sứ mệnh lan tỏa văn hóa đọc và đưa những cuốn sách chất lượng nhất tới tay độc giả, BookZone không ngừng nỗ lực chọn lọc hàng ngàn đầu sách chính hãng từ các nhà xuất bản uy tín hàng đầu trong và ngoài nước.</p>
          <p>Chúng tôi hiểu rằng mỗi cuốn sách là một thế giới mới mở ra. Vì thế, BookZone cam kết cung cấp trải nghiệm mua sắm tiện lợi, đóng gói cẩn thận và dịch vụ khách hàng chuyên nghiệp, chu đáo nhất.</p>

          <section class="rounded-xl border border-border bg-surface p-7">
            <h2 class="font-serif text-2xl font-semibold text-secondary">Cam kết của chúng tôi</h2>
            <ul class="mt-5 grid gap-3.5 pl-5 list-disc marker:text-primary">
              <li>100% Sách chính hãng, nguyên seal bản quyền.</li>
              <li>Giao hàng nhanh chóng và bảo đảm.</li>
              <li>Hỗ trợ đổi trả linh hoạt đối với sách lỗi do vận chuyển hoặc nhà sản xuất.</li>
              <li>Bảo mật thông tin khách hàng tuyệt đối.</li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  `
})
export class AboutComponent {}