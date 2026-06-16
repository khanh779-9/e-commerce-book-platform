import { Component } from '@angular/core';

@Component({
  selector: 'app-return-policy',
  standalone: true,
  template: `
    <div class="space-y-12 max-w-4xl mx-auto py-8">
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Chính Sách Đổi Trả</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Đảm bảo quyền lợi mua sắm tốt nhất</p>
      </div>

      <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
        <p>BookZone luôn mong muốn mang lại sự hài lòng cao nhất cho độc giả. Chúng tôi hỗ trợ chính sách đổi trả hàng hóa linh hoạt như sau:</p>
        <p><strong>1. Thời gian đổi trả:</strong> Trong vòng 7 ngày kể từ ngày bạn nhận được sản phẩm thành công.</p>
        <p><strong>2. Điều kiện đổi trả:</strong> Sách bị lỗi in ấn, nhầm trang, rách nát trước khi bóc seal giao hàng, hoặc giao không đúng tựa sách bạn đã đặt.</p>
        <p><strong>3. Quy trình thực hiện:</strong> Vui lòng giữ nguyên hóa đơn đặt hàng và liên hệ trực tiếp với bộ phận chăm sóc khách hàng qua Hotline 1900 6789 để được hướng dẫn đổi trả hoàn toàn miễn phí vận chuyển.</p>
      </div>
    </div>
  `
})
export class ReturnPolicyComponent {}
