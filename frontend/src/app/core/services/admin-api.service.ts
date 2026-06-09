import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse, AuthorResponse, BookTypeResponse, CategoryResponse, CustomerResponse, DashboardResponse, EmployeeResponse, NotificationResponse, OrderDetailResponse, OrderListResponse, OrderStatus, PaginatedResponse, ProductResponse, PromotionResponse, ProviderResponse, PublisherResponse, ReportResponse, ReviewResponse, UnitResponse } from '../models/models';
import { ConfigService } from './config.service';

export interface AdminPage<T> { data: T[]; currentPage: number; lastPage: number; total: number; items: T[]; page: number; pageSize: number; totalPages: number; }

@Injectable({providedIn:'root'})
export class AdminApiService {
  private http=inject(HttpClient); private config = inject(ConfigService);
  private get base() { return this.config.buildApiUrl('/v1/employee'); }
  private unwrap<T>(r:ApiResponse<T>|T):T{return (r&&typeof r==='object'&&'data'in(r as object)&&(r as ApiResponse<T>).data!==undefined)?(r as ApiResponse<T>).data!:(r as T);}
  private page<T>(r:unknown):AdminPage<T>{const d=this.unwrap(r as any) as any;const items:T[]=Array.isArray(d?.items)?d.items:Array.isArray(d)?d:[];const page=d?.page??1,pageSize=d?.pageSize??20,total=d?.total??items.length,totalPages=d?.totalPages??Math.max(1,Math.ceil(total/pageSize));return{data:items,currentPage:page,lastPage:totalPages,total,items,page,pageSize,totalPages};}
  private params(page=1,limit=20,q=''){let p=new HttpParams().set('page',page).set('limit',limit);if(q)p=p.set('q',q);return p;}

  getDashboard(){return this.http.get<DashboardResponse>(`${this.base}/dashboard`);}
  getOrders(page=1,status='',q=''){let p=new HttpParams().set('page',page).set('pageSize',20);if(status)p=p.set('status',status);if(q)p=p.set('q',q);return this.http.get<PaginatedResponse<OrderListResponse>>(`${this.base}/orders`,{params:p});}
  getOrder(id:number){return this.http.get<OrderDetailResponse>(`${this.base}/orders/${id}`);}
  updateOrderStatus(id:number,status:OrderStatus){return this.http.patch<ApiResponse<OrderDetailResponse>>(`${this.base}/orders/${id}/status`,{status}).pipe(map(r=>r.data!));}
  createManualOrder(payload:unknown){return this.http.post<ApiResponse<OrderDetailResponse>>(`${this.base}/orders`,payload);}

  getProducts(page=1,limit=50){return this.http.get<PaginatedResponse<ProductResponse>>(`${this.base}/products`,{params:{page,limit}}).pipe(map(r=>r.items));}
  getProductsPage(page=1,limit=20,q=''){let p=new HttpParams().set('page',page).set('limit',limit);if(q)p=p.set('q',q);return this.http.get<PaginatedResponse<ProductResponse>>(`${this.base}/products`,{params:p});}
  getProduct(id:number){return this.http.get<ApiResponse<ProductResponse>>(`${this.base}/products/${id}`).pipe(map(r=>r.data!));}
  createProduct(payload:unknown){return this.http.post<ApiResponse<ProductResponse>>(`${this.base}/products`,payload).pipe(map(r=>r.data!));}
  updateProduct(id:number,payload:unknown){return this.http.put<ApiResponse<ProductResponse>>(`${this.base}/products/${id}`,payload).pipe(map(r=>r.data!));}
  deleteProduct(id:number){return this.http.delete<ApiResponse<unknown>>(`${this.base}/products/${id}`);}
  uploadProductImage(id:number,file:File){const form=new FormData();form.append('image',file);return this.http.post<ApiResponse<{image_url:string}>>(`${this.base}/products/${id}/image`,form).pipe(map(r=>r.data!.image_url));}

  getCategories(){return this.http.get<PaginatedResponse<CategoryResponse>>(`${this.base}/categories`,{params:{limit:100}}).pipe(map(r=>r.items));}
  getAdminCategories(page=1,q=''){return this.http.get(`${this.base}/categories`,{params:this.params(page,20,q)}).pipe(map(r=>this.page<CategoryResponse>(r)));}
  createCategory(p:unknown){return this.http.post<ApiResponse<CategoryResponse>>(`${this.base}/categories`,p).pipe(map(r=>r.data!));}
  updateCategory(id:number,p:unknown){return this.http.put<ApiResponse<CategoryResponse>>(`${this.base}/categories/${id}`,p).pipe(map(r=>r.data!));}
  deleteCategory(id:number){return this.http.delete(`${this.base}/categories/${id}`);}

  getAuthors(){return this.http.get<PaginatedResponse<AuthorResponse>>(`${this.base}/authors`,{params:{limit:100}}).pipe(map(r=>r.items));}
  getAdminAuthors(page=1,q=''){return this.http.get(`${this.base}/authors`,{params:this.params(page,20,q)}).pipe(map(r=>this.page<AuthorResponse>(r)));}
  createAuthor(p:unknown){return this.http.post<ApiResponse<AuthorResponse>>(`${this.base}/authors`,p).pipe(map(r=>r.data!));}
  updateAuthor(id:number,p:unknown){return this.http.put<ApiResponse<AuthorResponse>>(`${this.base}/authors/${id}`,p).pipe(map(r=>r.data!));}
  deleteAuthor(id:number){return this.http.delete(`${this.base}/authors/${id}`);}

  getPublishers(){return this.http.get<PaginatedResponse<PublisherResponse>>(`${this.base}/publishers`,{params:{limit:100}}).pipe(map(r=>r.items));}
  getAdminPublishers(page=1,q=''){return this.http.get(`${this.base}/publishers`,{params:this.params(page,20,q)}).pipe(map(r=>this.page<PublisherResponse>(r)));}
  createPublisher(p:unknown){return this.http.post<ApiResponse<PublisherResponse>>(`${this.base}/publishers`,p).pipe(map(r=>r.data!));}
  updatePublisher(id:number,p:unknown){return this.http.put<ApiResponse<PublisherResponse>>(`${this.base}/publishers/${id}`,p).pipe(map(r=>r.data!));}
  deletePublisher(id:number){return this.http.delete(`${this.base}/publishers/${id}`);}

  getProviders(){return this.http.get<PaginatedResponse<ProviderResponse>>(`${this.base}/providers`,{params:{limit:100}}).pipe(map(r=>r.items));}
  getAdminProviders(page=1,q=''){return this.http.get(`${this.base}/providers`,{params:this.params(page,20,q)}).pipe(map(r=>this.page<ProviderResponse>(r)));}
  createProvider(p:unknown){return this.http.post<ApiResponse<ProviderResponse>>(`${this.base}/providers`,p).pipe(map(r=>r.data!));}
  updateProvider(id:number,p:unknown){return this.http.put<ApiResponse<ProviderResponse>>(`${this.base}/providers/${id}`,p).pipe(map(r=>r.data!));}
  deleteProvider(id:number){return this.http.delete(`${this.base}/providers/${id}`);}

  getUnits(){return this.http.get<PaginatedResponse<UnitResponse>>(`${this.base}/units`,{params:{limit:100}}).pipe(map(r=>r.items));}
  getAdminUnits(page=1){return this.http.get(`${this.base}/units`,{params:this.params(page)}).pipe(map(r=>this.page<UnitResponse>(r)));}
  createUnit(p:unknown){return this.http.post<ApiResponse<UnitResponse>>(`${this.base}/units`,p).pipe(map(r=>r.data!));}
  updateUnit(id:number,p:unknown){return this.http.put<ApiResponse<UnitResponse>>(`${this.base}/units/${id}`,p).pipe(map(r=>r.data!));}
  deleteUnit(id:number){return this.http.delete(`${this.base}/units/${id}`);}

  getBookTypes(){return this.http.get<PaginatedResponse<BookTypeResponse>>(`${this.base}/book-types`,{params:{limit:100}}).pipe(map(r=>r.items));}
  getAdminBookTypes(page=1){return this.http.get(`${this.base}/book-types`,{params:this.params(page)}).pipe(map(r=>this.page<BookTypeResponse>(r)));}
  createBookType(p:unknown){return this.http.post<ApiResponse<BookTypeResponse>>(`${this.base}/book-types`,p).pipe(map(r=>r.data!));}
  updateBookType(code:string,p:unknown){return this.http.put<ApiResponse<BookTypeResponse>>(`${this.base}/book-types/${encodeURIComponent(code)}`,p).pipe(map(r=>r.data!));}
  deleteBookType(code:string){return this.http.delete(`${this.base}/book-types/${encodeURIComponent(code)}`);}

  getPromotions(page=1){return this.http.get<PaginatedResponse<PromotionResponse>>(`${this.base}/promotions`,{params:{page,limit:20}});}
  getPromotion(id:number){return this.http.get<ApiResponse<PromotionResponse>>(`${this.base}/promotions/${id}`).pipe(map(r=>r.data!));}
  createPromotion(p:unknown){return this.http.post<ApiResponse<PromotionResponse>>(`${this.base}/promotions`,p).pipe(map(r=>r.data!));}
  updatePromotion(id:number,p:unknown){return this.http.put<ApiResponse<PromotionResponse>>(`${this.base}/promotions/${id}`,p).pipe(map(r=>r.data!));}
  deletePromotion(id:number){return this.http.delete(`${this.base}/promotions/${id}`);}
  addPromotionDetail(id:number,p:unknown){return this.http.post(`${this.base}/promotions/${id}/details`,p);}
  updatePromotionDetail(id:number,detailId:number,p:unknown){return this.http.put(`${this.base}/promotions/${id}/details/${detailId}`,p);}
  deletePromotionDetail(id:number,detailId:number){return this.http.delete(`${this.base}/promotions/${id}/details/${detailId}`);}

  getAdminCustomers(page=1,q=''){return this.http.get(`${this.base}/customers`,{params:this.params(page,20,q)}).pipe(map(r=>this.page<CustomerResponse>(r)));}
  getCustomerOptions(q=''){return this.http.get<PaginatedResponse<CustomerResponse>>(`${this.base}/customers`,{params:this.params(1,100,q)}).pipe(map(r=>r.items));}
  getAdminCustomer(id:number){return this.http.get<ApiResponse<CustomerResponse>>(`${this.base}/customers/${id}`).pipe(map(r=>r.data!));}
  updateCustomerNotes(id:number,notes:string){return this.http.patch(`${this.base}/customers/${id}/notes`,{notes});}
  getAdminEmployees(page=1,q=''){return this.http.get(`${this.base}/employees`,{params:this.params(page,20,q)}).pipe(map(r=>this.page<EmployeeResponse>(r)));}
  createEmployee(p:unknown){return this.http.post<ApiResponse<EmployeeResponse>>(`${this.base}/employees`,p).pipe(map(r=>r.data!));}
  updateEmployee(id:number,p:unknown){return this.http.put<ApiResponse<EmployeeResponse>>(`${this.base}/employees/${id}`,p).pipe(map(r=>r.data!));}
  deleteEmployee(id:number){return this.http.delete(`${this.base}/employees/${id}`);}

  getReviews(page=1,rating?:number,q=''){let p=new HttpParams().set('page',page).set('pageSize',20);if(rating)p=p.set('rating',rating);if(q)p=p.set('q',q);return this.http.get<PaginatedResponse<ReviewResponse>>(`${this.base}/reviews`,{params:p});}
  deleteReview(id:number){return this.http.delete(`${this.base}/reviews/${id}`);}
  getReports(year?:number,month?:number){const params:any={};if(year)params.year=year;if(month)params.month=month;return this.http.get<ApiResponse<ReportResponse>>(`${this.base}/reports`,{params}).pipe(map(r=>r.data!));}

  getNotifications(){return this.http.get<PaginatedResponse<NotificationResponse>>(`${this.base}/notifications`,{params:{limit:100}}).pipe(map(r=>r.items));}
  sendNotification(payload:{audience:string;recipientId?:number|null;title:string;content:string;type:string}){return this.http.post<ApiResponse<unknown>>(`${this.base}/notifications/send`,payload);}
  markNotificationRead(id:number){return this.http.patch(`${this.base}/notifications/${id}/read`,{});}
  markAllNotificationsRead(){return this.http.patch(`${this.base}/notifications/read-all`,{});}
  deleteNotification(id:number){return this.http.delete(`${this.base}/notifications/${id}`);}
}
