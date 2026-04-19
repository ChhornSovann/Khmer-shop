import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;" class="animate-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div><h1 style="font-size:22px;font-weight:800;">📦 Product Management</h1><p style="font-size:13px;color:var(--text-muted);">{{ total() }} products</p></div>
        <button class="btn btn-primary" (click)="showForm.set(true)">➕ Add Product</button>
      </div>

      <!-- Filters -->
      <div style="background:#fff;border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);margin-bottom:20px;display:flex;gap:12px;flex-wrap:wrap;">
        <input type="text" class="input" placeholder="🔍 Search..." [(ngModel)]="search" (ngModelChange)="onSearch()" style="max-width:280px;">
        <select class="input" [(ngModel)]="filterCategory" (change)="load()" style="max-width:180px;">
          <option value="">All Categories</option>
          @for (c of categories(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
        </select>
      </div>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:60px;"><div class="spinner"></div></div>
      } @else {
        <div style="background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#f7fafc;">
              <tr>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Product</th>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Category</th>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Price</th>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Stock</th>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Sold</th>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Status</th>
                <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of products(); track p._id) {
                <tr style="border-top:1px solid var(--border);">
                  <td style="padding:12px 16px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img [src]="p.images?.[0]?.url || 'https://via.placeholder.com/40'" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                      <div>
                        <p style="font-weight:600;font-size:14px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ p.name }}</p>
                        <p style="font-size:11px;color:var(--text-muted);">{{ p.brand }}</p>
                      </div>
                    </div>
                  </td>
                  <td style="padding:12px 16px;font-size:13px;">{{ p.category?.name }}</td>
                  <td style="padding:12px 16px;"><span style="font-weight:700;color:var(--primary);">\${{ p.price | number:'1.2-2' }}</span></td>
                  <td style="padding:12px 16px;">
                    <span class="badge" [ngClass]="p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-yellow' : 'badge-red'">{{ p.stock }}</span>
                  </td>
                  <td style="padding:12px 16px;font-size:13px;">{{ p.soldCount }}</td>
                  <td style="padding:12px 16px;"><span class="badge" [ngClass]="p.isActive ? 'badge-green' : 'badge-red'">{{ p.isActive ? 'Active' : 'Off' }}</span></td>
                  <td style="padding:12px 16px;">
                    <div style="display:flex;gap:6px;">
                      <button class="btn btn-secondary btn-sm" (click)="editProduct(p)">✏️</button>
                      <button class="btn btn-sm" style="background:#fff5f5;color:var(--primary);border:1px solid #fc8181;" (click)="deleteProduct(p._id)">🗑</button>
                    </div>
                  </td>
                </tr>
              }
              @empty { <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No products found</td></tr> }
            </tbody>
          </table>
        </div>
      }

      <!-- Add/Edit Modal -->
      @if (showForm()) {
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;padding:16px;" (click)="showForm.set(false)">
          <div style="background:#fff;border-radius:var(--radius);padding:28px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
            <h3 style="font-weight:700;font-size:18px;margin-bottom:20px;">{{ editMode ? 'Edit' : 'Add' }} Product</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="input-group" style="grid-column:span 2;"><label class="input-label">Product Name *</label><input type="text" class="input" [(ngModel)]="form.name" name="n" required></div>
              <div class="input-group" style="grid-column:span 2;"><label class="input-label">Short Description</label><input type="text" class="input" [(ngModel)]="form.shortDescription" name="sd"></div>
              <div class="input-group" style="grid-column:span 2;"><label class="input-label">Description *</label><textarea class="input" [(ngModel)]="form.description" name="d" style="height:80px;resize:vertical;" required></textarea></div>
              <div class="input-group"><label class="input-label">Price *</label><input type="number" class="input" [(ngModel)]="form.price" name="p" required></div>
              <div class="input-group"><label class="input-label">Compare Price</label><input type="number" class="input" [(ngModel)]="form.comparePrice" name="cp"></div>
              <div class="input-group">
                <label class="input-label">Category *</label>
                <select class="input" [(ngModel)]="form.category" name="cat" required>
                  @for (c of categories(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
                </select>
              </div>
              <div class="input-group"><label class="input-label">Brand</label><input type="text" class="input" [(ngModel)]="form.brand" name="br"></div>
              <div class="input-group"><label class="input-label">Stock *</label><input type="number" class="input" [(ngModel)]="form.stock" name="s" required></div>
              <div class="input-group"><label class="input-label">Tags (comma separated)</label><input type="text" class="input" [(ngModel)]="form.tagsStr" name="t" placeholder="phone, apple, mobile"></div>
              <div class="input-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" [(ngModel)]="form.isFeatured" name="feat"> Featured Product</label></div>
            </div>
            <div style="display:flex;gap:10px;margin-top:20px;">
              <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Saving...' : (editMode ? 'Update' : 'Create') }}</button>
              <button class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  categories = signal<any[]>([]);
  total = signal(0);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editMode = false;
  editId = '';
  search = '';
  filterCategory = '';
  private searchTimeout: any;
  form: any = { name:'', shortDescription:'', description:'', price:0, comparePrice:null, category:'', brand:'', stock:0, tagsStr:'', isFeatured:false };

  ngOnInit() {
    this.api.getCategories().subscribe(r => this.categories.set(r.data));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getProducts({ search: this.search, category: this.filterCategory }).subscribe({ next: r => { this.products.set(r.data); this.total.set(r.total || 0); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  onSearch() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => this.load(), 400); }

  editProduct(p: Product) {
    this.editMode = true; this.editId = p._id;
    this.form = { name: p.name, shortDescription: p.shortDescription || '', description: p.description, price: p.price, comparePrice: p.comparePrice, category: (p.category as any)?._id || p.category, brand: p.brand || '', stock: p.stock, tagsStr: p.tags?.join(', ') || '', isFeatured: p.isFeatured };
    this.showForm.set(true);
  }

  save() {
    this.saving.set(true);
    const data = { ...this.form, tags: this.form.tagsStr?.split(',').map((t: string) => t.trim()).filter(Boolean) };
    delete data.tagsStr;
    const call = this.editMode ? this.api.updateProduct(this.editId, data) : this.api.createProduct(data);
    call.subscribe({ next: () => { this.toast.success(this.editMode ? 'Updated!' : 'Product created!'); this.cancelForm(); this.load(); this.saving.set(false); }, error: err => { this.toast.error(err.error?.message || 'Failed'); this.saving.set(false); } });
  }

  deleteProduct(id: string) {
    if (!confirm('Deactivate this product?')) return;
    this.api.deleteProduct(id).subscribe(() => { this.toast.success('Product deactivated'); this.load(); });
  }

  cancelForm() { this.showForm.set(false); this.editMode = false; this.editId = ''; this.form = { name:'', shortDescription:'', description:'', price:0, comparePrice:null, category:'', brand:'', stock:0, tagsStr:'', isFeatured:false }; }
}
