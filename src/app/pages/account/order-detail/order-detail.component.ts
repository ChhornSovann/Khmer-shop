import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container" style="max-width:900px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <a routerLink="/account/orders" style="color:var(--text-muted);font-size:14px;">← Orders</a>
          <h1 style="font-size:22px;font-weight:800;">Order Details</h1>
        </div>

        @if (loading()) {
          <div style="display:flex;justify-content:center;padding:80px;"><div class="spinner"></div></div>
        } @else if (order()) {
          <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;">
            <!-- Main -->
            <div style="display:flex;flex-direction:column;gap:16px;">
              <!-- Items -->
              <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
                <h3 style="font-weight:700;margin-bottom:16px;">Items ({{ order()!.items.length }})</h3>
                @for (item of order()!.items; track item.product) {
                  <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
                    <img [src]="item.image || 'https://via.placeholder.com/64'" style="width:64px;height:64px;object-fit:cover;border-radius:8px;">
                    <div style="flex:1;">
                      <p style="font-weight:600;font-size:14px;">{{ item.name }}</p>
                      <p style="font-size:12px;color:var(--text-muted);">Qty: {{ item.quantity }} × \${{ item.price | number:'1.2-2' }}</p>
                    </div>
                    <p style="font-weight:700;">\${{ (item.price * item.quantity) | number:'1.2-2' }}</p>
                  </div>
                }
              </div>

              <!-- Status Timeline -->
              <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
                <h3 style="font-weight:700;margin-bottom:16px;">Order Timeline</h3>
                @for (s of order()!.statusHistory; track s.updatedAt) {
                  <div style="display:flex;gap:12px;margin-bottom:12px;">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">✓</div>
                    <div>
                      <p style="font-weight:600;font-size:14px;text-transform:capitalize;">{{ s.status }}</p>
                      <p style="font-size:12px;color:var(--text-muted);">{{ s.note }}</p>
                      <p style="font-size:11px;color:var(--text-muted);">{{ s.updatedAt | date:'medium' }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- KHQR Payment section if pending -->
              @if (order()!.paymentMethod === 'KHQR' && order()!.paymentStatus !== 'paid') {
                <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);text-align:center;">
                  <p style="font-weight:700;margin-bottom:12px;color:var(--primary);">⏳ Payment Pending</p>
                  <a [routerLink]="['/checkout/payment', order()!._id]" class="btn btn-primary">Pay Now with KHQR</a>
                </div>
              }
            </div>

            <!-- Sidebar -->
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
                <h3 style="font-weight:700;margin-bottom:12px;">Order Info</h3>
                <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Order #</span><span style="font-weight:600;color:var(--primary);">{{ order()!.orderNumber }}</span></div>
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Date</span><span>{{ order()!.createdAt | date:'mediumDate' }}</span></div>
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Status</span><span class="badge" [ngClass]="statusBadge(order()!.status)">{{ order()!.status | titlecase }}</span></div>
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Payment</span><span class="badge" [ngClass]="order()!.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'">{{ order()!.paymentStatus | titlecase }}</span></div>
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Method</span><span>{{ order()!.paymentMethod }}</span></div>
                </div>
              </div>

              <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
                <h3 style="font-weight:700;margin-bottom:12px;">Order Summary</h3>
                <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Subtotal</span><span>\${{ order()!.subtotal | number:'1.2-2' }}</span></div>
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Shipping</span><span>\${{ order()!.shippingFee | number:'1.2-2' }}</span></div>
                  <div style="display:flex;justify-content:space-between;font-weight:800;font-size:16px;border-top:1px solid var(--border);padding-top:8px;margin-top:4px;"><span>Total</span><span style="color:var(--primary);">\${{ order()!.totalAmount | number:'1.2-2' }}</span></div>
                </div>
              </div>

              <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
                <h3 style="font-weight:700;margin-bottom:12px;">Shipping Address</h3>
                <p style="font-size:13px;line-height:1.7;color:var(--text-muted);">
                  {{ order()!.shipping.fullName }}<br>
                  {{ order()!.shipping.phone }}<br>
                  {{ order()!.shipping.street }},<br>
                  {{ order()!.shipping.city }}, {{ order()!.shipping.country }}
                </p>
              </div>

              @if (['pending','confirmed'].includes(order()!.status)) {
                <button class="btn btn-secondary" style="color:var(--primary);border-color:var(--primary);" (click)="cancel()">Cancel Order</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  order = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getOrder(id).subscribe({ next: r => { this.order.set(r.data?.order); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  cancel() {
    if (!confirm('Cancel this order?')) return;
    this.api.cancelOrder(this.order()!._id).subscribe({ next: r => { this.order.set(r.data); this.toast.info('Order cancelled'); }, error: err => this.toast.error(err.error?.message) });
  }

  statusBadge(s: string) { return { pending:'badge-yellow', confirmed:'badge-blue', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red' }[s] || 'badge-gray'; }
}
