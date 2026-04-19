import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private api = `${environment.apiUrl}/cart`;

  private _cart = signal<Cart>({ items: [], subtotal: 0, totalItems: 0 });
  cart = this._cart.asReadonly();

  loadCart() {
    this.http.get<{ data: Cart }>(this.api).subscribe({ next: r => this._cart.set(r.data), error: () => {} });
  }

  addToCart(productId: string, quantity = 1, variant?: any) {
    return this.http.post<{ data: Cart }>(`${this.api}/add`, { productId, quantity, variant }).pipe();
  }

  addAndRefresh(productId: string, quantity = 1, variant?: any) {
    this.addToCart(productId, quantity, variant).subscribe({
      next: r => { this._cart.set(r.data); this.toast.success('Added to cart! 🛒'); },
      error: err => this.toast.error(err.error?.message || 'Failed to add')
    });
  }

  updateItem(itemId: string, quantity: number) {
    this.http.put<{ data: Cart }>(`${this.api}/item/${itemId}`, { quantity }).subscribe(r => this._cart.set(r.data));
  }

  removeItem(itemId: string) {
    this.http.delete<{ data: any }>(`${this.api}/item/${itemId}`).subscribe(r => {
      this._cart.update(c => ({ ...c, items: c.items.filter(i => i._id !== itemId), totalItems: c.totalItems - 1 }));
      this.toast.info('Item removed');
    });
  }

  clearCart() {
    this.http.delete(this.api).subscribe(() => this._cart.set({ items: [], subtotal: 0, totalItems: 0 }));
  }

  count() { return this._cart().totalItems; }
}
