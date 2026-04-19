import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container" style="max-width:900px;">
        <h1 style="font-size:26px;font-weight:800;margin-bottom:24px;">📦 My Orders</h1>

        @if (loading()) {
          <div style="display:flex;justify-content:center;padding:80px;"><div class="spinner"></div></div>
        } @else if (orders().length === 0) {
          <div style="text-align:center;padding:80px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);">
            <p style="font-size:48px;margin-bottom:12px;">📭</p>
            <h3>No orders yet</h3>
            <a routerLink="/products" class="btn btn-primary" style="margin-top:16px;display:inline-flex;">Start Shopping</a>
          </div>
        } @else {
          <div style="display:flex;flex-direction:column;gap:16px;">
            @for (order of orders(); track order._id) {
              <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                  <div>
                    <p style="font-weight:700;font-size:15px;">{{ order.orderNumber }}</p>
                    <p style="font-size:12px;color:var(--text-muted);">{{ order.createdAt | date:'medium' }}</p>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <span class="badge" [ngClass]="statusBadge(order.status)">{{ order.status | titlecase }}</span>
                    <span class="badge" [ngClass]="order.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'">{{ order.paymentStatus | titlecase }}</span>
                    <span class="badge badge-blue">{{ order.paymentMethod }}</span>
                  </div>
                </div>

                <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;">
                  @for (item of order.items.slice(0,4); track item.product) {
                    <img [src]="item.image || 'https://via.placeholder.com/60'" [alt]="item.name" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;">
                  }
                  @if (order.items.length > 4) {
                    <div style="width:56px;height:56px;border-radius:8px;background:#edf2f7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">+{{ order.items.length - 4 }}</div>
                  }
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <p style="font-weight:800;font-size:18px;color:var(--primary);">\${{ order.totalAmount | number:'1.2-2' }}</p>
                  <a [routerLink]="['/account/orders', order._id]" class="btn btn-secondary btn-sm">View Details →</a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private api = inject(ApiService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() { this.api.getMyOrders().subscribe({ next: r => { this.orders.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  statusBadge(s: string) { return { pending:'badge-yellow', confirmed:'badge-blue', processing:'badge-blue', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red' }[s] || 'badge-gray'; }
}
