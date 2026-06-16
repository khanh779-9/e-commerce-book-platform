import { Component } from '@angular/core';

@Component({
  selector: 'app-shipping-policy',
  standalone: true,
  template: `
    <div class="space-y-12 max-w-4xl mx-auto py-8">
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Chính Sách Vận Chuyển</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Nhanh chóng – Bảo đảm – Tận tay</p>
      </div>

      <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
        <p>BookZone cung cấp dịch vụ giao hàng tận nơi tới tất cả các tỉnh thành trên phạm vi cả nước:</p>
        <p><strong>1. Phí giao hàng:</strong> Miễn phí giao hàng tiêu chuẩn đối với tất cả các đơn hàng đặt mua trực tiếp tại website trong đợt khuyến mãi này.</p>
        <div class="space-y-2">
          <p><strong>2. Thời gian giao hàng dự kiến:</strong></p>
          <ul class="list-disc pl-6 space-y-2 mt-2">
            <li>Khu vực nội thành TP.HCM / Hà Nội: 1-2 ngày làm việc.</li>
            <li>Các tỉnh thành khác: 2-4 ngày làm việc.</li>
          </ul>
        </div>
        <p><strong>3. Nhận hàng đồng kiểm:</strong> Khách hàng có quyền kiểm tra hình thức bên ngoài của hộp hàng trước khi thanh toán cho đơn vị vận chuyển đối tác.</p>
      </div>
    </div>
  `
})
export class ShippingPolicyComponent {}
