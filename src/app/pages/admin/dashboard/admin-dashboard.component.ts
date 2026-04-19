import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="padding:24px;" class="animate-in">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <h1 style="font-size:24px;font-weight:800;">⚡ Admin Dashboard</h1>
          <p style="font-size:13px;color:var(--text-muted);">KhmerShop Management Console</p>
        </div>
        <div style="display:flex;gap:8px;">
          <a routerLink="/admin/products" class="btn btn-primary btn-sm">Manage Products</a>
          <a routerLink="/admin/orders" class="btn btn-secondary btn-sm">Manage Orders</a>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:80px;"><div class="spinner"></div></div>
      } @else {
        <!-- Stats Grid -->
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px;">
          @for (stat of stats(); track stat.label) {
            <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);border-left:4px solid;" [style.borderLeftColor]="stat.color">
              <p style="font-size:28px;font-weight:800;color:var(--text);">{{ stat.value }}</p>
              <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">{{ stat.label }}</p>
              <p style="font-size:11px;margin-top:4px;" [style.color]="stat.color">{{ stat.sub }}</p>
            </div>
          }
        </div>

        <!-- Charts Row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
          <!-- Daily Revenue Chart (simple bar) -->
          <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
            <h3 style="font-weight:700;margin-bottom:16px;font-size:15px;">📈 Revenue (Last 7 days)</h3>
            <div style="display:flex;align-items:flex-end;gap:8px;height:120px;">
              @for (d of dailyRevenue(); track d._id) {
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                  <span style="font-size:10px;color:var(--text-muted);">\${{ d.revenue | number:'1.0-0' }}</span>
                  <div style="width:100%;background:var(--primary);border-radius:4px 4px 0 0;min-height:4px;" [style.height.px]="barHeight(d.revenue)"></div>
                  <span style="font-size:9px;color:var(--text-muted);">{{ d._id | slice:5:10 }}</span>
                </div>
              }
              @empty { <p style="color:var(--text-muted);font-size:13px);width:100%;text-align:center;">No data yet</p> }
            </div>
          </div>

          <!-- Orders by status -->
          <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
            <h3 style="font-weight:700;margin-bottom:16px;font-size:15px;">📊 Orders by Status</h3>
            @for (s of ordersByStatus(); track s._id) {
              <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                  <span style="text-transform:capitalize;">{{ s._id }}</span>
                  <span style="font-weight:700;">{{ s.count }}</span>
                </div>
                <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
                  <div style="height:100%;background:var(--primary);border-radius:4px;" [style.width.%]="statusPct(s.count)"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Top Products + Recent Orders -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <!-- Top Products -->
          <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
            <h3 style="font-weight:700;margin-bottom:16px;font-size:15px;">🏆 Top Products</h3>
            @for (p of topProducts(); track p._id) {
              <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
                <img [src]="p.images?.[0]?.url || 'https://via.placeholder.com/40'" style="width:40px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                  <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ p.name }}</p>
                  <p style="font-size:11px;color:var(--text-muted);">{{ p.soldCount }} sold</p>
                </div>
                <p style="font-weight:700;font-size:13px;flex-shrink:0;">\${{ p.price | number:'1.2-2' }}</p>
              </div>
            }
            @empty { <p style="color:var(--text-muted);font-size:13px;">No products yet</p> }
          </div>

          <!-- Recent Orders -->
          <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
              <h3 style="font-weight:700;font-size:15px;">🧾 Recent Orders</h3>
              <a routerLink="/admin/orders" style="font-size:12px;color:var(--primary);">View all →</a>
            </div>
            @for (o of recentOrders(); track o._id) {
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                <div>
                  <p style="font-size:13px;font-weight:600;">{{ o.orderNumber }}</p>
                  <p style="font-size:11px;color:var(--text-muted);">{{ o.user?.name }}</p>
                </div>
                <div style="text-align:right;">
                  <p style="font-size:13px;font-weight:700;">\${{ o.totalAmount | number:'1.2-2' }}</p>
                  <span class="badge" [ngClass]="statusBadge(o.status)" style="font-size:10px;">{{ o.status }}</span>
                </div>
              </div>
            }
            @empty { <p style="color:var(--text-muted);font-size:13px;">No orders yet</p> }
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(true);
  stats = signal<any[]>([]);
  dailyRevenue = signal<any[]>([]);
  ordersByStatus = signal<any[]>([]);
  topProducts = signal<any[]>([]);
  recentOrders = signal<any[]>([]);
  private maxRevenue = 0;
  private maxOrders = 0;

  ngOnInit() {
    this.api.getAdminDashboard().subscribe({
      next: r => {
        const d = r.data;
        this.stats.set([
          { label: 'Total Revenue', value: '$' + (d.stats.totalRevenue || 0).toFixed(0), sub: `${d.stats.paidOrders} paid orders`, color: '#e53e3e' },
          { label: 'Total Orders', value: d.stats.totalOrders, sub: 'All time', color: '#3182ce' },
          { label: 'Customers', value: d.stats.totalUsers, sub: 'Registered', color: '#38a169' },
          { label: 'Products', value: d.stats.totalProducts, sub: 'Active', color: '#d69e2e' },
          { label: 'Avg Order', value: d.stats.totalOrders ? '$' + (d.stats.totalRevenue / d.stats.paidOrders || 0).toFixed(2) : '$0', sub: 'Per order', color: '#805ad5' }
        ]);
        this.dailyRevenue.set(d.dailyRevenue || []);
        this.ordersByStatus.set(d.ordersByStatus || []);
        this.topProducts.set(d.topProducts || []);
        this.recentOrders.set(d.recentOrders || []);
        this.maxRevenue = Math.max(...(d.dailyRevenue || []).map((x: any) => x.revenue), 1);
        this.maxOrders = Math.max(...(d.ordersByStatus || []).map((x: any) => x.count), 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  barHeight(v: number) { return Math.max(4, (v / this.maxRevenue) * 100); }
  statusPct(v: number) { return (v / this.maxOrders) * 100; }
  statusBadge(s: string): string { return ({ pending:'badge-yellow', confirmed:'badge-blue', delivered:'badge-green', cancelled:'badge-red' } as any)[s] || 'badge-gray'; }
}
