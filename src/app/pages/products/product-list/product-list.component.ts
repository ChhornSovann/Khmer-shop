import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container">
        <div style="display:flex;gap:24px;">
          <!-- Sidebar -->
          <aside style="width:240px;flex-shrink:0;">
            <div style="background:#fff;border-radius:var(--radius);padding:20px;margin-bottom:16px;box-shadow:var(--shadow);">
              <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:12px;">Categories</h3>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <button class="btn btn-secondary btn-sm" style="text-align:left;justify-content:flex-start;" [class.active]="!filters.category" (click)="setFilter('category','')">All Products</button>
                @for (cat of categories(); track cat._id) {
                  <button class="btn btn-secondary btn-sm" style="text-align:left;justify-content:flex-start;" [class.active]="filters.category === cat.slug" (click)="setFilter('category', cat.slug)">{{ cat.name }}</button>
                }
              </div>
            </div>

            <div style="background:#fff;border-radius:var(--radius);padding:20px;margin-bottom:16px;box-shadow:var(--shadow);">
              <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:12px;">Price Range</h3>
              <div style="display:flex;gap:8px;">
                <input type="number" class="input" placeholder="Min" [(ngModel)]="filters.minPrice" style="width:50%;" (change)="load()">
                <input type="number" class="input" placeholder="Max" [(ngModel)]="filters.maxPrice" style="width:50%;" (change)="load()">
              </div>
            </div>

            <div style="background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);">
              <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:12px;">Rating</h3>
              @for (r of [5,4,3]; track r) {
                <button class="btn btn-secondary btn-sm" style="text-align:left;justify-content:flex-start;width:100%;margin-bottom:4px;" (click)="setFilter('rating', r.toString())">
                  {{ '★'.repeat(r) + '☆'.repeat(5-r) }} & up
                </button>
              }
            </div>
          </aside>

          <!-- Main content -->
          <div style="flex:1;min-width:0;">
            <!-- Toolbar -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;background:#fff;border-radius:var(--radius);padding:12px 16px;box-shadow:var(--shadow);">
              <p style="font-size:14px;color:var(--text-muted);">{{ total() }} products</p>
              <div style="display:flex;gap:8px;align-items:center;">
                <label style="font-size:13px;color:var(--text-muted);">Sort:</label>
                <select class="input" style="width:auto;padding:6px 12px;" [(ngModel)]="filters.sort" (change)="load()">
                  <option value="-createdAt">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            @if (loading()) {
              <div style="display:flex;justify-content:center;padding:60px;"><div class="spinner"></div></div>
            } @else if (products().length === 0) {
              <div style="text-align:center;padding:80px;background:#fff;border-radius:var(--radius);">
                <p style="font-size:48px;margin-bottom:12px;">🔍</p>
                <h3>No products found</h3>
                <button class="btn btn-primary" style="margin-top:16px;" (click)="reset()">Clear Filters</button>
              </div>
            } @else {
              <div class="grid-4">
                @for (p of products(); track p._id) {
                  <app-product-card [product]="p" />
                }
              </div>

              <!-- Pagination -->
              <div style="display:flex;justify-content:center;gap:8px;margin-top:32px;">
                <button class="btn btn-secondary btn-sm" [disabled]="filters.page === 1" (click)="changePage(-1)">← Prev</button>
                <span class="btn btn-secondary btn-sm">{{ filters.page }} / {{ pages() }}</span>
                <button class="btn btn-secondary btn-sm" [disabled]="filters.page >= pages()" (click)="changePage(1)">Next →</button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.active { background: var(--primary) !important; color: #fff !important; }`]
})
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  total = signal(0);
  pages = signal(1);
  filters: any = { page: 1, limit: 12, sort: '-createdAt', category: '', search: '', minPrice: '', maxPrice: '', rating: '' };
  private st: any;

  ngOnInit() {
    this.api.getCategories().subscribe(r => this.categories.set(r.data));
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.filters.category = params['category'];
      if (params['search']) this.filters.search = params['search'];
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    const cleanFilters = Object.fromEntries(Object.entries(this.filters).filter(([,v]) => v !== '' && v !== null));
    this.api.getProducts(cleanFilters).subscribe({ next: r => { this.products.set(r.data); this.total.set(r.total || 0); this.pages.set(r.pages || 1); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  setFilter(key: string, val: any) { this.filters[key] = val; this.filters.page = 1; this.load(); }
  changePage(d: number) { this.filters.page += d; this.load(); }
  reset() { this.filters = { page: 1, limit: 12, sort: '-createdAt', category: '', search: '', minPrice: '', maxPrice: '', rating: '' }; this.load(); }
}
