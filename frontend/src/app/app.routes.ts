import { Routes } from '@angular/router';
import { MainLayoutComponent } from './external/layouts/main-layout/main-layout';
import { AuthLayoutComponent } from './external/layouts/auth-layout/auth-layout';
import { HomeComponent } from './external/pages/home/home';
import { ProductListComponent } from './external/pages/products/product-list/product-list';
import { ProductDetailComponent } from './external/pages/products/product-detail/product-detail';
import { CartComponent } from './external/pages/cart/cart';
import { CheckoutComponent } from './external/pages/checkout/checkout';
import { WishlistComponent } from './external/pages/wishlist/wishlist';
import { AccountComponent } from './external/pages/account/account';
import { OrdersComponent } from './external/pages/orders/orders';
import { NotificationsComponent } from './external/pages/notifications/notifications';
import { LoginComponent } from './external/pages/auth/login/login';
import { RegisterComponent } from './external/pages/auth/register/register';
import { ForgotPasswordComponent } from './external/pages/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './external/pages/auth/reset-password/reset-password';
import { AboutComponent } from './external/pages/about/about';
import { ContactComponent } from './external/pages/contact/contact';
import { PrivacyPolicyComponent } from './external/pages/policies/privacy-policy';
import { ReturnPolicyComponent } from './external/pages/policies/return-policy';
import { WarrantyPolicyComponent } from './external/pages/policies/warranty-policy';
import { ShippingPolicyComponent } from './external/pages/policies/shipping-policy';
import { AdminLoginComponent } from './internal/pages/admin-login/admin-login';
import { AdminShellComponent } from './internal/layouts/admin-layout/admin-layout';
import { AdminOverviewComponent } from './internal/pages/admin-overview/admin-overview';
import { AdminOrdersComponent } from './internal/pages/admin-orders/admin-orders';
import { AdminProductsComponent } from './internal/pages/admin-products/admin-products';
import { AdminCategoriesComponent } from './internal/pages/admin-categories/admin-categories';
import { AdminPublishersComponent } from './internal/pages/admin-publishers/admin-publishers';
import { AdminProvidersComponent } from './internal/pages/admin-providers/admin-providers';
import { AdminCustomersComponent } from './internal/pages/admin-customers/admin-customers';
import { AdminEmployeesComponent } from './internal/pages/admin-employees/admin-employees';
import { AdminReportsComponent } from './internal/pages/admin-reports/admin-reports';
import { AdminNotificationsComponent } from './internal/pages/admin-notifications/admin-notifications';
import { AdminAuthorsComponent } from './internal/pages/admin-authors/admin-authors';
import { AdminUnitsComponent } from './internal/pages/admin-units/admin-units';
import { AdminBookTypesComponent } from './internal/pages/admin-book-types/admin-book-types';
import { AdminPromotionsComponent } from './internal/pages/admin-promotions/admin-promotions';
import { AdminReviewsComponent } from './internal/pages/admin-reviews/admin-reviews';
import { NotFoundComponent } from './external/pages/not-found/not-found';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';
import { employeeRoleGuard } from './core/guards/employee-role.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', canActivate: [customerGuard], component: CheckoutComponent },
      { path: 'wishlist', canActivate: [customerGuard], component: WishlistComponent },
      { path: 'account', canActivate: [customerGuard], component: AccountComponent },
      { path: 'orders', canActivate: [customerGuard], component: OrdersComponent },
      { path: 'notifications', canActivate: [customerGuard], component: NotificationsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'return-policy', component: ReturnPolicyComponent },
      { path: 'warranty-policy', component: WarrantyPolicyComponent },
      { path: 'shipping-delivery', component: ShippingPolicyComponent },
      { path: 'not-found', component: NotFoundComponent },
      { path: '**', redirectTo: 'not-found' }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent }
    ]
  },
  // Internal (employee / admin) routes
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminOverviewComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'authors', component: AdminAuthorsComponent },
      { path: 'units', component: AdminUnitsComponent },
      { path: 'book-types', component: AdminBookTypesComponent },
      { path: 'promotions', component: AdminPromotionsComponent },
      { path: 'publishers', component: AdminPublishersComponent },
      { path: 'providers', component: AdminProvidersComponent },
      { path: 'customers', component: AdminCustomersComponent },
      { path: 'employees', component: AdminEmployeesComponent, canActivate: [employeeRoleGuard], data: { roles: ['admin'] } },
      { path: 'reports', component: AdminReportsComponent, canActivate: [employeeRoleGuard], data: { roles: ['admin', 'quanly'] } },
      { path: 'reviews', component: AdminReviewsComponent, canActivate: [employeeRoleGuard], data: { roles: ['admin', 'quanly'] } },
      { path: 'notifications', component: AdminNotificationsComponent },
    ]
  }
];
