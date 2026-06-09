import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { EmployeeResponse } from '../../../core/models/models';
import { AdminPageHeaderComponent } from '../../../shared/admin-components/admin-page-header';
import { AdminDataTableComponent, TableColumn } from '../../../shared/admin-components/admin-data-table';
import { AdminModalComponent } from '../../../shared/admin-components/admin-modal';
import { AdminSearchInputComponent } from '../../../shared/admin-components/admin-search-input';

type EmployeeForm = { firstName:string; middleName:string; lastName:string; email:string; password:string; phone:string; address:string; birthDate:string; gender:string; startDate:string; role:string; status:string; notes:string };

@Component({selector:'app-admin-employees',standalone:true,imports:[CommonModule,FormsModule,AdminPageHeaderComponent,AdminDataTableComponent,AdminModalComponent,AdminSearchInputComponent],template:`
<div class="admin-page">
  <app-admin-page-header title="Nhân viên" description="Quản lý tài khoản nội bộ, vai trò, trạng thái làm việc và thông tin nhân sự." [showAdd]="true" addLabel="Thêm nhân viên" (add)="openModal()" />
  <app-admin-search-input [value]="searchTerm" (valueChange)="searchTerm=$event;fetchData(1)" placeholder="Tìm tên, email hoặc số điện thoại..." />
  <app-admin-data-table [columns]="columns" [data]="items()" [loading]="loading()" [idField]="'id'" emptyMessage="Không tìm thấy nhân viên" [pagination]="pagination()?{currentPage:pagination()!.currentPage,lastPage:pagination()!.lastPage,onPageChange:(p)=>fetchData(p)}:undefined" (edit)="openModal($event)" (delete)="remove($event)" />

  <app-admin-modal [isOpen]="showModal()" [title]="editingId()?'Sửa nhân viên':'Thêm nhân viên'" subtitle="Thông tin tài khoản và hồ sơ nhân sự" (close)="closeModal()">
    <form (submit)="save($event)" class="space-y-6">
      <section class="grid gap-4 sm:grid-cols-2">
        <div><label class="admin-label">Họ *</label><input [(ngModel)]="form.firstName" name="firstName" required maxlength="50" class="admin-field" /></div>
        <div><label class="admin-label">Tên *</label><input [(ngModel)]="form.lastName" name="lastName" required maxlength="50" class="admin-field" /></div>
        <div class="sm:col-span-2"><label class="admin-label">Tên đệm</label><input [(ngModel)]="form.middleName" name="middleName" maxlength="50" class="admin-field" /></div>
        <div><label class="admin-label">Email *</label><input type="email" [(ngModel)]="form.email" name="email" required maxlength="100" class="admin-field" /></div>
        <div><label class="admin-label">Điện thoại</label><input [(ngModel)]="form.phone" name="phone" maxlength="15" class="admin-field" /></div>
        <div><label class="admin-label">Ngày sinh</label><input type="date" [(ngModel)]="form.birthDate" name="birthDate" class="admin-field" /></div>
        <div><label class="admin-label">Giới tính</label><select [(ngModel)]="form.gender" name="gender" class="admin-field"><option value="">Không khai báo</option><option value="Nam">Nam</option><option value="Nu">Nữ</option><option value="Khac">Khác</option></select></div>
        <div class="sm:col-span-2"><label class="admin-label">Địa chỉ</label><input [(ngModel)]="form.address" name="address" maxlength="255" class="admin-field" /></div>
      </section>

      <section class="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
        <div><label class="admin-label">Vai trò *</label><select [(ngModel)]="form.role" name="role" class="admin-field"><option value="nhanvien">Nhân viên</option><option value="quanly">Quản lý</option><option value="admin">Quản trị viên</option></select></div>
        <div><label class="admin-label">Trạng thái *</label><select [(ngModel)]="form.status" name="status" class="admin-field"><option value="dang_lam">Đang làm</option><option value="tam_nghi">Tạm nghỉ</option><option value="nghi_viec">Nghỉ việc</option></select></div>
        <div><label class="admin-label">Ngày bắt đầu</label><input type="date" [(ngModel)]="form.startDate" name="startDate" class="admin-field" /></div>
        <div><label class="admin-label">Mật khẩu {{ editingId()?'(để trống nếu không đổi)':'*' }}</label><input type="password" [(ngModel)]="form.password" name="password" [required]="!editingId()" minlength="6" class="admin-field" autocomplete="new-password" /></div>
        <div class="sm:col-span-2"><label class="admin-label">Ghi chú nội bộ</label><textarea [(ngModel)]="form.notes" name="notes" rows="3" class="admin-field resize-y"></textarea></div>
      </section>
      @if(errorMessage()){<p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>}
      <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><button type="button" (click)="closeModal()" class="btn-secondary">Hủy</button><button type="submit" [disabled]="saving()" class="btn-dark">{{ saving()?'Đang lưu...':(editingId()?'Lưu thay đổi':'Tạo nhân viên') }}</button></div>
    </form>
  </app-admin-modal>
</div>`})
export class AdminEmployeesComponent implements OnInit {
  private api=inject(AdminApiService); items=signal<EmployeeResponse[]>([]);loading=signal(false);saving=signal(false);showModal=signal(false);editingId=signal<number|null>(null);errorMessage=signal<string|null>(null);searchTerm='';pagination=signal<{currentPage:number;lastPage:number}|null>(null);form:EmployeeForm=this.emptyForm();
  columns:TableColumn[]=[
    {header:'Nhân viên',render:(x:EmployeeResponse)=>`${x.fullName || `${x.firstName} ${x.lastName}`} (#${x.id})`},
    {header:'Liên hệ',render:(x:EmployeeResponse)=>[x.email,x.phone].filter(Boolean).join(' · ')||'-'},
    {header:'Vai trò',render:(x:EmployeeResponse)=>this.roleLabel(x.role)},
    {header:'Trạng thái',render:(x:EmployeeResponse)=>this.statusLabel(x.status)},
    {header:'Ngày vào làm',render:(x:EmployeeResponse)=>x.startDate?new Date(x.startDate).toLocaleDateString('vi-VN'):'-'}
  ];
  ngOnInit(){this.fetchData();}
  fetchData(page=1){this.loading.set(true);this.api.getAdminEmployees(page,this.searchTerm).subscribe({next:r=>{this.items.set(r.data);this.pagination.set({currentPage:r.currentPage,lastPage:r.lastPage});this.loading.set(false);},error:()=>this.loading.set(false)});}
  openModal(item?:EmployeeResponse){this.errorMessage.set(null);if(item){this.editingId.set(item.id);this.form={firstName:item.firstName,middleName:item.middleName||'',lastName:item.lastName,email:item.email||'',password:'',phone:item.phone||'',address:item.address||'',birthDate:this.dateOnly(item.birthDate),gender:item.gender||'',startDate:this.dateOnly(item.startDate),role:item.role,status:item.status,notes:item.notes||''};}else{this.editingId.set(null);this.form=this.emptyForm();}this.showModal.set(true);}
  closeModal(){this.showModal.set(false);this.editingId.set(null);this.errorMessage.set(null);}
  save(ev:Event){ev.preventDefault();if(!this.form.firstName.trim()||!this.form.lastName.trim()||!this.form.email.trim()||(!this.editingId()&&this.form.password.length<6)){this.errorMessage.set('Vui lòng điền đầy đủ các trường bắt buộc.');return;}const payload:any={...this.form,middleName:this.form.middleName||null,phone:this.form.phone||null,address:this.form.address||null,birthDate:this.form.birthDate||null,gender:this.form.gender||null,startDate:this.form.startDate||null,notes:this.form.notes||null};if(this.editingId()&&!payload.password)delete payload.password;this.saving.set(true);const req=this.editingId()?this.api.updateEmployee(this.editingId()!,payload):this.api.createEmployee(payload);req.subscribe({next:()=>{this.saving.set(false);this.closeModal();this.fetchData();},error:e=>{this.saving.set(false);this.errorMessage.set(e?.error?.message||'Không thể lưu nhân viên.');}});}
  remove(id:number){if(!confirm('Xóa nhân viên này? Nếu đã có lịch sử xử lý đơn, hệ thống sẽ chuyển sang trạng thái nghỉ việc.'))return;this.api.deleteEmployee(id).subscribe({next:()=>this.fetchData(),error:e=>alert(e?.error?.message||'Không thể xóa nhân viên.')});}
  roleLabel(v:string){return{admin:'Quản trị viên',quanly:'Quản lý',nhanvien:'Nhân viên'}[v]||v;} statusLabel(v:string){return{dang_lam:'Đang làm',tam_nghi:'Tạm nghỉ',nghi_viec:'Nghỉ việc'}[v]||v;}
  private emptyForm():EmployeeForm{return{firstName:'',middleName:'',lastName:'',email:'',password:'',phone:'',address:'',birthDate:'',gender:'',startDate:new Date().toISOString().slice(0,10),role:'nhanvien',status:'dang_lam',notes:''};} private dateOnly(v?:string){return v?String(v).slice(0,10):'';}
}
