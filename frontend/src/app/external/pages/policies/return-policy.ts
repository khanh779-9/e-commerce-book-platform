import { Component } from '@angular/core';

@Component({
  selector: 'app-return-policy',
  standalone: true,
  template: `
    <div class="site-container page-shell">
      <article class="mx-auto max-w-3xl">
        <header class="page-header">
          <p class="eyebrow">Chính sách</p>
          <h1 class="page-title">Chính sách đổi trả</h1>
          <p class="page-description">Thông tin về thời gian, điều kiện và quy trình đổi trả sản phẩm.</p>
        </header>
        <div class="space-y-6 text-[15px] leading-8 text-body">
          <p>BookZone luôn mong muốn mang lại sự hài lòng cao nhất cho độc giả. Chúng tôi hỗ trợ chính sách đổi trả hàng hóa linh hoạt như sau:</p>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">1. Thời gian đổi trả</h2><p class="mt-3">Trong vòng 7 ngày kể từ ngày bạn nhận được sản phẩm thành công.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">2. Điều kiện đổi trả</h2><p class="mt-3">Sách bị lỗi in ấn, nhầm trang, rách nát trước khi bóc seal giao hàng, hoặc giao không đúng tựa sách bạn đã đặt.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">3. Quy trình thực hiện</h2><p class="mt-3">Vui lòng giữ nguyên hóa đơn đặt hàng và liên hệ trực tiếp với bộ phận chăm sóc khách hàng qua Hotline 1900 6789 để được hướng dẫn đổi trả hoàn toàn miễn phí vận chuyển.</p></section>
        </div>
      </article>
    </div>
  `
})
export class ReturnPolicyComponent {}
