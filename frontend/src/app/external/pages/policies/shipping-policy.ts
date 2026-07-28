import { Component } from '@angular/core';

@Component({
  selector: 'app-shipping-policy',
  standalone: true,
  template: `
    <div class="site-container page-shell">
      <article class="mx-auto max-w-3xl">
        <header class="page-header">
          <p class="eyebrow">Chính sách</p>
          <h1 class="page-title">Chính sách vận chuyển</h1>
          <p class="page-description">Thông tin về phí, thời gian dự kiến và quy trình nhận hàng.</p>
        </header>
        <div class="space-y-6 text-[15px] leading-8 text-body">
          <p>BookZone cung cấp dịch vụ giao hàng tận nơi tới tất cả các tỉnh thành trên phạm vi cả nước:</p>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">1. Phí giao hàng</h2><p class="mt-3">Miễn phí giao hàng tiêu chuẩn đối với tất cả các đơn hàng đặt mua trực tiếp tại website trong đợt khuyến mãi này.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">2. Thời gian giao hàng dự kiến</h2><ul class="mt-3 list-disc space-y-2 pl-5 marker:text-primary"><li>Khu vực nội thành TP.HCM / Hà Nội: 1-2 ngày làm việc.</li><li>Các tỉnh thành khác: 2-4 ngày làm việc.</li></ul></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">3. Nhận hàng đồng kiểm</h2><p class="mt-3">Khách hàng có quyền kiểm tra hình thức bên ngoài của hộp hàng trước khi thanh toán cho đơn vị vận chuyển đối tác.</p></section>
        </div>
      </article>
    </div>
  `
})
export class ShippingPolicyComponent {}
