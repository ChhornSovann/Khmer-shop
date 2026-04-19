import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./pages/products/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:slug', loadComponent: () => import('./pages/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  {
    path: 'checkout',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'payment/:orderId', loadComponent: () => import('./pages/checkout/payment/payment.component').then(m => m.PaymentComponent) },
      { path: 'success/:orderId', loadComponent: () => import('./pages/checkout/success/success.component').then(m => m.SuccessComponent) }
    ]
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) }
    ]
  },
  {
    path: 'account',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadComponent: () => import('./pages/account/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'orders', loadComponent: () => import('./pages/account/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'orders/:id', loadComponent: () => import('./pages/account/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
      { path: 'wishlist', loadComponent: () => import('./pages/account/wishlist/wishlist.component').then(m => m.WishlistComponent) }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/admin/products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'orders', loadComponent: () => import('./pages/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
