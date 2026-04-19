import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container">
        <h1 style="font-size:28px;font-weight:800;margin-bottom:24px;">🛒 Shopping Cart</h1>

        @if (!auth.isLoggedIn()) {
          <div style="text-align:center;padding:80px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);">
            <p style="font-size:48px;margin-bottom:12px;">🔒</p>
            <h3>Please login to view your cart</h3>
            <a routerLink="/auth/login" class="btn btn-primary btn-lg" style="margin-top:20px;display:inline-flex;">Login Now</a>
          </div>
        } @else if (cart.cart().items.length === 0) {
          <div style="text-align:center;padding:80px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);">
            <p style="font-size:64px;margin-bottom:12px;">🛒</p>
            <h3>Your cart is empty</h3>
            <a routerLink="/products" class="btn btn-primary btn-lg" style="margin-top:20px;display:inline-flex;">Start Shopping</a>
          </div>
        } @else {
          <div style="display:grid;grid-template-columns:1fr 360px;gap:24px;">
            <!-- Cart Items -->
            <div style="display:flex;flex-direction:column;gap:16px;">
              @for (item of cart.cart().items; track item._id) {
                <div style="background:#fff;border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);display:flex;gap:16px;align-items:center;">
                  <img [src]="item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'" [alt]="item.product?.name"
                    style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;">
                  <div style="flex:1;min-width:0;">
                    <a [routerLink]="['/products', item.product?.slug]" style="font-weight:600;font-size:15px;display:block;margin-bottom:4px;color:var(--text);">{{ item.product?.name }}</a>
                    @if (item.variant) {
                      <p style="font-size:12px;color:var(--text-muted);">{{ item.variant.name }}: {{ item.variant.value }}</p>
                    }
                    <p style="font-size:14px;color:var(--primary);font-weight:700;margin-top:4px;">\${{ item.price | number:'1.2-2' }} each</p>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="display:flex;align-items:center;border:1.5px solid var(--border);border-radius:8px;overflow:hidden;">
                      <button (click)="updateQty(item._id, item.quantity - 1)" style="width:32px;height:32px;border:none;background:#f7fafc;cursor:pointer;font-size:16px;">−</button>
                      <span style="padding:0 12px;font-weight:700;min-width:36px;text-align:center;">{{ item.quantity }}</span>
                      <button (click)="updateQty(item._id, item.quantity + 1)" style="width:32px;height:32px;border:none;background:#f7fafc;cursor:pointer;font-size:16px;">+</button>
                    </div>
                    <p style="font-weight:700;min-width:72px;text-align:right;">\${{ (item.price * item.quantity) | number:'1.2-2' }}</p>
                    <button (click)="cart.removeItem(item._id)" style="background:none;border:none;cursor:pointer;color:#fc8181;font-size:18px;padding:4px;">🗑</button>
                  </div>
                </div>
              }
              <button (click)="cart.clearCart()" style="background:none;border:none;cursor:pointer;font-size:13px;color:var(--text-muted);text-decoration:underline;align-self:flex-start;">Clear Cart</button>
            </div>

            <!-- Order Summary -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);height:fit-content;position:sticky;top:80px;">
              <h3 style="font-weight:800;font-size:18px;margin-bottom:20px;">Order Summary</h3>
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;font-size:14px;">
                  <span style="color:var(--text-muted);">Subtotal ({{ cart.cart().totalItems }} items)</span>
                  <span>\${{ cart.cart().subtotal | number:'1.2-2' }}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:14px;">
                  <span style="color:var(--text-muted);">Shipping</span>
                  <span [style.color]="cart.cart().subtotal >= 50 ? '#276749' : 'inherit'">{{ cart.cart().subtotal >= 50 ? 'FREE' : '$3.99' }}</span>
                </div>
                @if (cart.cart().subtotal < 50) {
                  <div style="background:#fff5f5;border-radius:8px;padding:10px;font-size:12px;color:var(--primary);">
                    Add \${{ (50 - cart.cart().subtotal) | number:'1.2-2' }} more for free shipping!
                  </div>
                }
              </div>
              <div style="border-top:2px solid var(--border);padding-top:16px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;font-weight:800;font-size:18px;">
                  <span>Total</span>
                  <span style="color:var(--primary);">\${{ grandTotal() | number:'1.2-2' }}</span>
                </div>
              </div>
              <button class="btn btn-primary btn-lg btn-full" (click)="checkout()">Proceed to Checkout →</button>
              <a routerLink="/products" class="btn btn-secondary btn-full" style="margin-top:10px;display:flex;justify-content:center;">← Continue Shopping</a>
              <div style="margin-top:16px;text-align:center;">
                <p style="font-size:12px;color:var(--text-muted);">🔒 Secure checkout · 🇰🇭 KHQR supported</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);

  grandTotal() { const s = this.cart.cart().subtotal; return s + (s >= 50 ? 0 : 3.99); }
  updateQty(itemId: string, qty: number) { if (qty >= 1) this.cart.updateItem(itemId, qty); else this.cart.removeItem(itemId); }
  checkout() { this.router.navigate(['/checkout']); }
}
