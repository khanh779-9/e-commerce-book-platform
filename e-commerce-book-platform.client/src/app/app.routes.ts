import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { HomeComponent } from './features/home/home';
import { ProductListComponent } from './features/products/product-list/product-list';
import { ProductDetailComponent } from './features/products/product-detail/product-detail';
import { CartComponent } from './features/cart/cart';
import { CheckoutComponent } from './features/checkout/checkout';
import { WishlistComponent } from './features/wishlist/wishlist';
import { AccountComponent } from './features/account/account';
import { OrdersComponent } from './features/orders/orders';
import { NotificationsComponent } from './features/notifications/notifications';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AboutComponent } from './features/about/about';
import { ContactComponent } from './features/contact/contact';
import { PrivacyPolicyComponent } from './features/policies/privacy-policy';
import { ReturnPolicyComponent } from './features/policies/return-policy';
import { WarrantyPolicyComponent } from './features/policies/warranty-policy';
import { ShippingPolicyComponent } from './features/policies/shipping-policy';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'account', component: AccountComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'return-policy', component: ReturnPolicyComponent },
      { path: 'warranty-policy', component: WarrantyPolicyComponent },
      { path: 'shipping-delivery', component: ShippingPolicyComponent }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
