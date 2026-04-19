import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container" style="max-width:960px;">
        <!-- Steps -->
        <div class="checkout-steps" style="margin-bottom:40px;">
          <div class="step done"><div class="step-num">✓</div><span style="font-size:12px;">Cart</span></div>
          <div class="step-line done"></div>
          <div class="step active"><div class="step-num">2</div><span style="font-size:12px;">Checkout</span></div>
          <div class="step-line"></div>
          <div class="step"><div class="step-num">3</div><span style="font-size:12px;">Payment</span></div>
          <div class="step-line"></div>
          <div class="step"><div class="step-num">4</div><span style="font-size:12px;">Done</span></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 360px;gap:24px;">
          <!-- Form -->
          <div>
            <!-- Shipping Info -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);margin-bottom:16px;">
              <h3 style="font-weight:700;margin-bottom:20px;font-size:16px;">📦 Shipping Information</h3>

              <!-- Saved addresses -->
              @if (auth.user()?.addresses?.length) {
                <div style="margin-bottom:16px;">
                  <p style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">Saved Addresses:</p>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    @for (addr of auth.user()!.addresses; track addr._id) {
                      <div style="border:2px solid;border-radius:8px;padding:10px;cursor:pointer;transition:all 0.2s;"
                        [style.borderColor]="selectedAddrId === addr._id ? 'var(--primary)' : 'var(--border)'"
                        (click)="selectAddress(addr)">
                        <p style="font-weight:600;font-size:13px;">{{ addr.fullName }} · {{ addr.phone }}</p>
                        <p style="font-size:12px;color:var(--text-muted);">{{ addr.street }}, {{ addr.city }}</p>
                      </div>
                    }
                  </div>
                  <button (click)="selectedAddrId='';useNewAddr=true" style="background:none;border:none;color:var(--primary);font-size:13px;cursor:pointer;margin-top:8px;">+ Use a different address</button>
                </div>
              }

              @if (!auth.user()?.addresses?.length || useNewAddr) {
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="input-group"><label class="input-label">Full Name *</label><input type="text" class="input" [(ngModel)]="form.fullName" name="fn" required></div>
                  <div class="input-group"><label class="input-label">Phone *</label><input type="text" class="input" [(ngModel)]="form.phone" name="phone" required></div>
                  <div class="input-group" style="grid-column:span 2;"><label class="input-label">Street Address *</label><input type="text" class="input" [(ngModel)]="form.street" name="street" required></div>
                  <div class="input-group"><label class="input-label">City *</label><input type="text" class="input" [(ngModel)]="form.city" name="city" required></div>
                  <div class="input-group"><label class="input-label">Province</label><input type="text" class="input" [(ngModel)]="form.province" name="prov"></div>
                  <div class="input-group"><label class="input-label">Postal Code</label><input type="text" class="input" [(ngModel)]="form.postalCode" name="post"></div>
                  <div class="input-group"><label class="input-label">Country</label><input type="text" class="input" [(ngModel)]="form.country" value="Cambodia" name="country"></div>
                </div>
              }
            </div>

            <!-- Payment Method -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);margin-bottom:16px;">
              <h3 style="font-weight:700;margin-bottom:20px;font-size:16px;">💳 Payment Method</h3>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <label style="display:flex;align-items:center;gap:12px;border:2px solid;border-radius:10px;padding:16px;cursor:pointer;transition:all 0.2s;"
                  [style.borderColor]="payMethod === 'KHQR' ? 'var(--primary)' : 'var(--border)'"
                  [style.background]="payMethod === 'KHQR' ? '#fff5f5' : '#fff'">
                  <input type="radio" [(ngModel)]="payMethod" value="KHQR" name="pm" style="accent-color:var(--primary);">
                  <div style="flex:1;">
                    <p style="font-weight:700;font-size:15px;">🇰🇭 KHQR / Bakong</p>
                    <p style="font-size:12px;color:var(--text-muted);">Scan QR code with any Bakong-connected app</p>
                  </div>
                  <span style="font-size:24px;">📱</span>
                </label>
                <label style="display:flex;align-items:center;gap:12px;border:2px solid;border-radius:10px;padding:16px;cursor:pointer;transition:all 0.2s;"
                  [style.borderColor]="payMethod === 'COD' ? 'var(--primary)' : 'var(--border)'"
                  [style.background]="payMethod === 'COD' ? '#fff5f5' : '#fff'">
                  <input type="radio" [(ngModel)]="payMethod" value="COD" name="pm" style="accent-color:var(--primary);">
                  <div style="flex:1;">
                    <p style="font-weight:700;font-size:15px;">💵 Cash on Delivery</p>
                    <p style="font-size:12px;color:var(--text-muted);">Pay when your order arrives</p>
                  </div>
                  <span style="font-size:24px;">🚚</span>
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);">
              <h3 style="font-weight:700;margin-bottom:12px;font-size:16px;">📝 Order Notes (optional)</h3>
              <textarea class="input" [(ngModel)]="notes" placeholder="Special instructions..." style="height:80px;resize:vertical;"></textarea>
            </div>
          </div>

          <!-- Order Summary -->
          <div style="height:fit-content;position:sticky;top:80px;">
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);margin-bottom:16px;">
              <h3 style="font-weight:800;font-size:16px;margin-bottom:16px;">Order Summary</h3>
              <div style="max-height:300px;overflow-y:auto;margin-bottom:16px;">
                @for (item of cartSvc.cart().items; track item._id) {
                  <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
                    <img [src]="item.product?.images?.[0]?.url" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                      <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ item.product?.name }}</p>
                      <p style="font-size:12px;color:var(--text-muted);">Qty: {{ item.quantity }}</p>
                    </div>
                    <p style="font-size:13px;font-weight:700;flex-shrink:0;">\${{ (item.price * item.quantity) | number:'1.2-2' }}</p>
                  </div>
                }
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Subtotal</span><span>\${{ cartSvc.cart().subtotal | number:'1.2-2' }}</span></div>
                <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Shipping</span><span [style.color]="cartSvc.cart().subtotal >= 50 ? '#276749' : ''">{{ cartSvc.cart().subtotal >= 50 ? 'FREE' : '$3.99' }}</span></div>
                <div style="display:flex;justify-content:space-between;font-weight:800;font-size:18px;border-top:2px solid var(--border);padding-top:10px;margin-top:4px;">
                  <span>Total</span>
                  <span style="color:var(--primary);">\${{ grandTotal() | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            @if (error()) {
              <div style="background:#fff5f5;border:1px solid #fc8181;border-radius:8px;padding:12px;font-size:13px;color:var(--primary);margin-bottom:12px;">⚠️ {{ error() }}</div>
            }

            <button class="btn btn-primary btn-lg btn-full" (click)="placeOrder()" [disabled]="loading()">
              @if (loading()) { <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> }
              @else { {{ payMethod === 'KHQR' ? '🇰🇭 Pay with KHQR' : '✅ Place Order' }} }
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  private api = inject(ApiService);
  cartSvc = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);
  error = signal('');
  payMethod = 'KHQR';
  notes = '';
  selectedAddrId = '';
  useNewAddr = false;
  form: any = { fullName: '', phone: '', street: '', city: '', province: '', country: 'Cambodia', postalCode: '' };

  ngOnInit() {
    const def = this.auth.user()?.addresses?.find(a => a.isDefault);
    if (def) { this.selectedAddrId = def._id; this.form = { ...def }; }
  }

  grandTotal() { const s = this.cartSvc.cart().subtotal; return s + (s >= 50 ? 0 : 3.99); }

  selectAddress(addr: any) { this.selectedAddrId = addr._id; this.form = { ...addr }; this.useNewAddr = false; }

  placeOrder() {
    if (!this.form.fullName || !this.form.phone || !this.form.street || !this.form.city) {
      this.error.set('Please fill in all required shipping fields'); return;
    }
    this.error.set('');
    this.loading.set(true);
    this.api.createOrder({ shipping: this.form, paymentMethod: this.payMethod, notes: this.notes }).subscribe({
      next: r => {
        this.loading.set(false);
        this.cartSvc.loadCart();
        if (this.payMethod === 'KHQR') {
          this.router.navigate(['/checkout/payment', r.data.order._id], { state: { payment: r.data.payment } });
        } else {
          this.router.navigate(['/checkout/success', r.data.order._id]);
        }
      },
      error: err => { this.loading.set(false); this.error.set(err.error?.message || 'Failed to place order'); }
    });
  }
}
