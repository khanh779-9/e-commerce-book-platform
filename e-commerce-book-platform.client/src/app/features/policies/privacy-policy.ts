import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  template: `
    <div class="space-y-12 max-w-4xl mx-auto py-8">
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Chính Sách Bảo Mật</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Bảo vệ quyền lợi thông tin khách hàng của bạn</p>
      </div>

      <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
        <p>BookZone tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân mà bạn cung cấp cho chúng tôi khi mua sắm tại trang web.</p>
        <p><strong>1. Thu thập thông tin:</strong> Chúng tôi chỉ thu thập thông tin cần thiết như Tên, Email, Số điện thoại và Địa chỉ giao hàng khi bạn đăng ký tài khoản hoặc tiến hành mua hàng.</p>
        <p><strong>2. Sử dụng thông tin:</strong> Thông tin cá nhân thu thập được chỉ được dùng để giao hàng, hỗ trợ dịch vụ sau bán hàng, gửi thông tin khuyến mãi (nếu bạn đăng ký nhận newsletter) và nâng cấp trải nghiệm người dùng.</p>
        <p><strong>3. Chia sẻ thông tin:</strong> BookZone cam kết không bán hay chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào, trừ các đơn vị vận chuyển đối tác để thực hiện giao hàng.</p>
        <p><strong>4. Bảo mật dữ liệu:</strong> Hệ thống lưu trữ dữ liệu của chúng tôi áp dụng các công nghệ mã hóa an toàn nhất nhằm ngăn chặn truy cập trái phép.</p>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent {}
