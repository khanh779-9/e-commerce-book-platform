import { Component } from '@angular/core';

@Component({
  selector: 'app-warranty-policy',
  standalone: true,
  template: `
    <div class="site-container page-shell">
      <article class="mx-auto max-w-3xl">
        <header class="page-header">
          <p class="eyebrow">Chính sách</p>
          <h1 class="page-title">Chính sách bảo hành</h1>
          <p class="page-description">Thông tin về phạm vi và cách xử lý các lỗi kỹ thuật của sản phẩm.</p>
        </header>
        <div class="space-y-6 text-[15px] leading-8 text-body">
          <p>Vì sản phẩm là sách in ấn bản quyền, chính sách bảo hành chất lượng của chúng tôi áp dụng đối với các lỗi kỹ thuật phát sinh từ phía nhà sản xuất:</p>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">1. Phạm vi áp dụng</h2><p class="mt-3">Áp dụng đối với tất cả các ấn phẩm sách bìa cứng, sách kèm CD/App học tập trực tuyến mua tại BookZone.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">2. Thời hạn bảo hành</h2><p class="mt-3">Lên đến 30 ngày kể từ lúc mua hàng đối với các sản phẩm lỗi code học tập đi kèm sách hoặc bung keo gáy bìa cứng.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">3. Biện pháp xử lý</h2><p class="mt-3">Đổi mới sản phẩm mới tương đương hoặc hoàn tiền cho khách hàng nếu sản phẩm đó đã hết hàng lưu kho.</p></section>
        </div>
      </article>
    </div>
  `
})
export class WarrantyPolicyComponent {}
