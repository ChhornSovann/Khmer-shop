import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Product, Category, Order, Review } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private buildParams(obj: any): HttpParams {
    let p = new HttpParams();
    if (obj) Object.entries(obj).forEach(([k, v]) => v != null && v !== '' && (p = p.set(k, String(v))));
    return p;
  }

  // Products
  getProducts(filters?: any): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.base}/products`, { params: this.buildParams(filters) });
  }
  getProduct(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.base}/products/${slug}`);
  }
  getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.base}/products/featured`);
  }
  getRelatedProducts(id: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.base}/products/${id}/related`);
  }
  createProduct(data: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.base}/products`, data);
  }
  updateProduct(id: string, data: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.base}/products/${id}`, data);
  }
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.base}/products/${id}`);
  }

  // Categories
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.base}/categories`);
  }
  getCategoryTree(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.base}/categories/tree`);
  }
  createCategory(data: any): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.base}/categories`, data);
  }

  // Orders
  createOrder(data: any): Observable<any> {
    return this.http.post(`${this.base}/orders`, data);
  }
  getMyOrders(params?: any): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.base}/orders/my`, { params: this.buildParams(params) });
  }
  getOrder(id: string): Observable<any> {
    return this.http.get(`${this.base}/orders/${id}`);
  }
  cancelOrder(id: string): Observable<any> {
    return this.http.post(`${this.base}/orders/${id}/cancel`, {});
  }

  // Payments
  verifyKHQR(paymentId: string, simulate = false): Observable<any> {
    return this.http.post(`${this.base}/payments/khqr/verify/${paymentId}${simulate ? '?simulate=true' : ''}`, {});
  }
  getPaymentStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.base}/payments/status/${orderId}`);
  }
  regenerateKHQR(orderId: string): Observable<any> {
    return this.http.post(`${this.base}/payments/khqr/regenerate/${orderId}`, {});
  }

  // Reviews
  getProductReviews(productId: string, params?: any): Observable<any> {
    return this.http.get(`${this.base}/reviews/product/${productId}`, { params: this.buildParams(params) });
  }
  createReview(data: any): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.base}/reviews`, data);
  }
  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.base}/reviews/${id}`);
  }

  // Wishlist
  getWishlist(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.base}/wishlist`);
  }
  toggleWishlist(productId: string): Observable<any> {
    return this.http.post(`${this.base}/wishlist/${productId}`, {});
  }

  // Admin
  getAdminDashboard(): Observable<any> { return this.http.get(`${this.base}/admin/dashboard`); }
  getAdminOrders(params?: any): Observable<any> { return this.http.get(`${this.base}/admin/orders`, { params: this.buildParams(params) }); }
  updateOrderStatus(id: string, status: string, note?: string): Observable<any> { return this.http.patch(`${this.base}/admin/orders/${id}/status`, { status, note }); }
  getAdminUsers(params?: any): Observable<any> { return this.http.get(`${this.base}/admin/users`, { params: this.buildParams(params) }); }
  toggleUserStatus(id: string): Observable<any> { return this.http.patch(`${this.base}/admin/users/${id}/toggle`, {}); }
}
