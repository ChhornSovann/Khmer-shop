import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container">
        <h1 style="font-size:26px;font-weight:800;margin-bottom:24px;">❤️ My Wishlist ({{ items().length }})</h1>
        @if (loading()) { <div style="display:flex;justify-content:center;padding:80px;"><div class="spinner"></div></div> }
        @else if (items().length === 0) {
          <div style="text-align:center;padding:80px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);">
            <p style="font-size:48px;margin-bottom:12px;">🤍</p>
            <h3>Your wishlist is empty</h3>
          </div>
        } @else {
          <div class="grid-4">
            @for (p of items(); track p._id) { <app-product-card [product]="p" /> }
          </div>
        }
      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  private api = inject(ApiService);
  items = signal<Product[]>([]);
  loading = signal(true);
  ngOnInit() { this.api.getWishlist().subscribe({ next: r => { this.items.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}
