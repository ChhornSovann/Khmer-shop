import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="padding:60px 0;text-align:center;" class="animate-in">
      <div class="container" style="max-width:560px;">
        <div style="background:#fff;border-radius:24px;padding:48px;box-shadow:var(--shadow-lg);">
          <!-- Success icon -->
          <div style="width:80px;height:80px;border-radius:50%;background:#c6f6d5;border:3px solid #48bb78;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px;">
            ✅
          </div>
          <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;">Order Confirmed!</h1>
          <p style="color:var(--text-muted);margin-bottom:24px;">Thank you for your purchase. Your order has been placed successfully.</p>

          @if (order()) {
            <div style="background:#f7fafc;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
              <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border);">
                <span style="color:var(--text-muted);font-size:14px;">Order Number</span>
                <span style="font-weight:700;font-size:14px;color:var(--primary);">{{ order()!.orderNumber }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:var(--text-muted);font-size:14px;">Status</span>
                <span class="badge badge-yellow">{{ order()!.status | titlecase }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:var(--text-muted);font-size:14px;">Payment</span>
                <span class="badge" [ngClass]="order()!.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'">{{ order()!.paymentStatus | titlecase }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:var(--text-muted);font-size:14px;">Items</span>
                <span style="font-size:14px;">{{ order()!.items.length }} item(s)</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-muted);font-size:14px;">Total</span>
                <span style="font-weight:800;color:var(--primary);">\${{ order()!.totalAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          }

          <div style="display:flex;flex-direction:column;gap:12px;">
            <a [routerLink]="['/account/orders', orderId()]" class="btn btn-primary btn-lg btn-full">View Order Details</a>
            <a routerLink="/products" class="btn btn-secondary btn-lg btn-full">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  order = signal<any>(null);
  orderId = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orderId')!;
    this.orderId.set(id);
    this.api.getOrder(id).subscribe(r => this.order.set(r.data?.order));
  }
}
