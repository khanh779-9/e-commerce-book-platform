import { Component } from '@angular/core';

@Component({
  selector: 'app-warranty-policy',
  standalone: true,
  template: `
    <div class="space-y-12 max-w-4xl mx-auto py-8">
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Chính Sách Bảo Hành</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Đồng hành cùng chất lượng sản phẩm</p>
      </div>

      <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
        <p>Vì sản phẩm là sách in ấn bản quyền, chính sách bảo hành chất lượng của chúng tôi áp dụng đối với các lỗi kỹ thuật phát sinh từ phía nhà sản xuất:</p>
        <p><strong>1. Phạm vi áp dụng:</strong> Áp dụng đối với tất cả các ấn phẩm sách bìa cứng, sách kèm CD/App học tập trực tuyến mua tại BookZone.</p>
        <p><strong>2. Thời hạn bảo hành:</strong> Lên đến 30 ngày kể từ lúc mua hàng đối với các sản phẩm lỗi code học tập đi kèm sách hoặc bung keo gáy bìa cứng.</p>
        <p><strong>3. Biện pháp xử lý:</strong> Đổi mới sản phẩm mới tương đương hoặc hoàn tiền cho khách hàng nếu sản phẩm đó đã hết hàng lưu kho.</p>
      </div>
    </div>
  `
})
export class WarrantyPolicyComponent {}
