import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  template: `
    <div class="site-container page-shell">
      <article class="mx-auto max-w-3xl">
        <header class="page-header">
          <p class="eyebrow">Chính sách</p>
          <h1 class="page-title">Chính sách bảo mật</h1>
          <p class="page-description">Thông tin về cách BookZone thu thập, sử dụng và bảo vệ dữ liệu khách hàng.</p>
        </header>
        <div class="space-y-6 text-[15px] leading-8 text-body">
          <p>BookZone tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân mà bạn cung cấp cho chúng tôi khi mua sắm tại trang web.</p>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">1. Thu thập thông tin</h2><p class="mt-3">Chúng tôi chỉ thu thập thông tin cần thiết như Tên, Email, Số điện thoại và Địa chỉ giao hàng khi bạn đăng ký tài khoản hoặc tiến hành mua hàng.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">2. Sử dụng thông tin</h2><p class="mt-3">Thông tin cá nhân thu thập được chỉ được dùng để giao hàng, hỗ trợ dịch vụ sau bán hàng, gửi thông tin khuyến mãi (nếu bạn đăng ký nhận newsletter) và nâng cấp trải nghiệm người dùng.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">3. Chia sẻ thông tin</h2><p class="mt-3">BookZone cam kết không bán hay chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào, trừ các đơn vị vận chuyển đối tác để thực hiện giao hàng.</p></section>
          <section class="border-t border-border pt-6"><h2 class="font-serif text-xl font-semibold text-secondary">4. Bảo mật dữ liệu</h2><p class="mt-3">Hệ thống lưu trữ dữ liệu của chúng tôi áp dụng các công nghệ mã hóa an toàn nhất nhằm ngăn chặn truy cập trái phép.</p></section>
        </div>
      </article>
    </div>
  `
})
export class PrivacyPolicyComponent {}
