import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;" class="animate-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div><h1 style="font-size:22px;font-weight:800;">🧾 Order Management</h1><p style="font-size:13px;color:var(--text-muted);">{{ total() }} orders</p></div>
      </div>

      <!-- Filters -->
      <div style="background:#fff;border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);margin-bottom:20px;display:flex;gap:12px;flex-wrap:wrap;">
        <input type="text" class="input" placeholder="🔍 Order number..." [(ngModel)]="search" (ngModelChange)="load()" style="max-width:220px;">
        <select class="input" [(ngModel)]="filterStatus" (change)="load()" style="max-width:160px;">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select class="input" [(ngModel)]="filterPayment" (change)="load()" style="max-width:160px;">
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:60px;"><div class="spinner"></div></div>
      } @else {
        <div style="background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#f7fafc;">
              <tr>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Order</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Customer</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Total</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Payment</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Status</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Date</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (o of orders(); track o._id) {
                <tr style="border-top:1px solid var(--border);">
                  <td style="padding:12px 16px;"><p style="font-weight:700;font-size:13px;color:var(--primary);">{{ o.orderNumber }}</p><p style="font-size:11px;color:var(--text-muted);">{{ o.paymentMethod }}</p></td>
                  <td style="padding:12px 16px;"><p style="font-size:13px;font-weight:600;">{{ o.user?.name }}</p><p style="font-size:11px;color:var(--text-muted);">{{ o.user?.email }}</p></td>
                  <td style="padding:12px 16px;font-weight:700;color:var(--primary);">\${{ o.totalAmount | number:'1.2-2' }}</td>
                  <td style="padding:12px 16px;"><span class="badge" [ngClass]="o.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'">{{ o.paymentStatus }}</span></td>
                  <td style="padding:12px 16px;"><span class="badge" [ngClass]="statusBadge(o.status)">{{ o.status }}</span></td>
                  <td style="padding:12px 16px;font-size:12px;color:var(--text-muted);">{{ o.createdAt | date:'mediumDate' }}</td>
                  <td style="padding:12px 16px;">
                    <select class="input" style="padding:4px 8px;font-size:12px;width:auto;" [(ngModel)]="o._selectedStatus" (change)="updateStatus(o)">
                      @for (s of statuses; track s) { <option [value]="s">{{ s | titlecase }}</option> }
                    </select>
                  </td>
                </tr>
              }
              @empty { <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No orders found</td></tr> }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;justify-content:center;gap:8px;margin-top:20px;">
          <button class="btn btn-secondary btn-sm" [disabled]="page() === 1" (click)="changePage(-1)">← Prev</button>
          <span class="btn btn-secondary btn-sm">{{ page() }} / {{ pages() }}</span>
          <button class="btn btn-secondary btn-sm" [disabled]="page() >= pages()" (click)="changePage(1)">Next →</button>
        </div>
      }
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  orders = signal<any[]>([]);
  total = signal(0);
  pages = signal(1);
  page = signal(1);
  loading = signal(true);
  search = ''; filterStatus = ''; filterPayment = '';
  statuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getAdminOrders({ page: this.page(), limit: 20, status: this.filterStatus, paymentStatus: this.filterPayment, search: this.search }).subscribe({
      next: r => {
        this.orders.set(r.data.map((o: any) => ({ ...o, _selectedStatus: o.status })));
        this.total.set(r.total || 0);
        this.pages.set(Math.ceil((r.total || 0) / 20));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(order: any) {
    if (order._selectedStatus === order.status) return;
    this.api.updateOrderStatus(order._id, order._selectedStatus).subscribe({
      next: () => { this.toast.success(`Order updated to ${order._selectedStatus}`); order.status = order._selectedStatus; },
      error: err => this.toast.error(err.error?.message || 'Failed')
    });
  }

  changePage(d: number) { this.page.update(p => p + d); this.load(); }
  statusBadge(s: string): string { return ({ pending:'badge-yellow', confirmed:'badge-blue', processing:'badge-blue', shipped:'badge-blue', delivered:'badge-green', cancelled:'badge-red' } as any)[s] || 'badge-gray'; }
}
