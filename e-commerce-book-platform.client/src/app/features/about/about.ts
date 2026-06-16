import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="space-y-12 max-w-4xl mx-auto py-8">
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Giới thiệu về BookZone</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Ngôi nhà của những người yêu sách</p>
      </div>

      <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
        <p class="font-bold text-slate-800 text-base">
          Chào mừng bạn đến với BookZone – nơi kết nối độc giả với kho tàng tri thức vô tận của nhân loại.
        </p>
        <p>
          Được thành lập với sứ mệnh lan tỏa văn hóa đọc và đưa những cuốn sách chất lượng nhất tới tay độc giả, BookZone không ngừng nỗ lực chọn lọc hàng ngàn đầu sách chính hãng từ các nhà xuất bản uy tín hàng đầu trong và ngoài nước.
        </p>
        <p>
          Chúng tôi hiểu rằng mỗi cuốn sách là một thế giới mới mở ra. Vì thế, BookZone cam kết cung cấp trải nghiệm mua sắm tiện lợi, đóng gói cẩn thận và dịch vụ khách hàng chuyên nghiệp, chu đáo nhất.
        </p>
        <p class="font-bold text-slate-800">Cam kết của chúng tôi:</p>
        <ul class="list-disc pl-6 space-y-2">
          <li>100% Sách chính hãng, nguyên seal bản quyền.</li>
          <li>Giao hàng nhanh chóng và bảo đảm.</li>
          <li>Hỗ trợ đổi trả linh hoạt đối với sách lỗi do vận chuyển hoặc nhà sản xuất.</li>
          <li>Bảo mật thông tin khách hàng tuyệt đối.</li>
        </ul>
      </div>
    </div>
  `
})
export class AboutComponent {}
