import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <div class="space-y-12 max-w-4xl mx-auto py-8">
      <div class="border-b border-slate-100 pb-10">
        <h1 class="text-4xl font-black text-secondary uppercase tracking-tight">Liên hệ với chúng tôi</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="space-y-6 text-sm text-slate-600">
          <p>Nếu bạn có bất kỳ câu hỏi, góp ý hay yêu cầu hỗ trợ nào, vui lòng liên hệ với BookZone qua các kênh thông tin dưới đây hoặc điền thông tin vào mẫu bên cạnh.</p>
          
          <div class="space-y-4 pt-4 border-t border-slate-100">
            <p><strong>📍 Địa chỉ:</strong> 120 Lê Lợi, Bến Thành, Quận 1, TP. Hồ Chí Minh</p>
            <p><strong>📞 Hotline:</strong> 1900 6789 (8:00 - 21:00 hàng ngày)</p>
            <p><strong>✉️ Email:</strong> support&#64;bookzone.com</p>
          </div>
        </div>

        <form (submit)="$event.preventDefault()" class="space-y-4 bg-white p-6 border border-slate-200 shadow-sm">
          <h3 class="font-black text-secondary text-xs uppercase tracking-widest mb-4">Gửi tin nhắn</h3>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase">Họ và Tên</label>
            <input type="text" class="input-premium" required />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ Email</label>
            <input type="email" class="input-premium" required />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-400 uppercase">Nội dung tin nhắn</label>
            <textarea rows="4" class="input-premium" required></textarea>
          </div>
          <button type="submit" class="w-full btn-dark py-3 text-xs uppercase tracking-widest font-black cursor-pointer">
            Gửi liên hệ
          </button>
        </form>
      </div>
    </div>
  `
})
export class ContactComponent {}
