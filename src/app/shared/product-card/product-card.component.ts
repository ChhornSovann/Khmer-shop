import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="product-card">
      <!-- Image -->
      <a [routerLink]="['/products', product.slug]" style="display:block;overflow:hidden;aspect-ratio:1;background:#f7fafc;">
        <img [src]="primaryImage()" [alt]="product.name" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;" loading="lazy">
      </a>

      <!-- Badges -->
      @if (discount() > 0) {
        <div class="product-badge"><span class="badge badge-red">-{{ discount() }}%</span></div>
      }
      @if (product.isFeatured) {
        <div style="position:absolute;top:10px;right:42px;"><span class="badge badge-yellow">⭐ Featured</span></div>
      }

      <!-- Wishlist btn -->
      <button class="product-wishlist btn btn-icon btn-secondary" style="width:32px;height:32px;font-size:14px;" (click)="toggleWishlist($event)">
        {{ isWishlisted() ? '❤️' : '🤍' }}
      </button>

      <!-- Info -->
      <div class="product-info">
        @if (product.brand) {
          <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:4px;">{{ product.brand }}</p>
        }
        <a [routerLink]="['/products', product.slug]" style="font-size:14px;font-weight:600;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;margin-bottom:6px;">{{ product.name }}</a>

        <!-- Rating -->
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;">
          <span class="stars" style="font-size:12px;">{{ stars() }}</span>
          <span style="font-size:12px;color:var(--text-muted);">({{ product.ratings?.count || 0 }})</span>
        </div>

        <!-- Price + Add -->
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span class="price-current">\${{ product.price | number:'1.2-2' }}</span>
            @if (product.comparePrice && product.comparePrice > product.price) {
              <span class="price-original">\${{ product.comparePrice | number:'1.2-2' }}</span>
            }
          </div>
          <button class="btn btn-primary btn-sm" (click)="addToCart($event)" style="width:36px;height:36px;padding:0;border-radius:50%;font-size:18px;" [disabled]="product.stock === 0">
            {{ product.stock === 0 ? '✕' : '+' }}
          </button>
        </div>

        @if (product.stock === 0) {
          <p style="font-size:11px;color:var(--primary);font-weight:600;margin-top:4px;">Out of Stock</p>
        } @else if (product.stock <= 5) {
          <p style="font-size:11px;color:#d69e2e;font-weight:600;margin-top:4px;">Only {{ product.stock }} left!</p>
        }
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  private cartSvc = inject(CartService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  wishlisted = false;

  primaryImage() { return this.product.images?.find(i => i.isPrimary)?.url || this.product.images?.[0]?.url || 'https://via.placeholder.com/400'; }
  discount() { return this.product.comparePrice && this.product.comparePrice > this.product.price ? Math.round((1 - this.product.price / this.product.comparePrice) * 100) : 0; }
  stars() { const r = Math.round(this.product.ratings?.average || 0); return '★'.repeat(r) + '☆'.repeat(5 - r); }
  isWishlisted() {
    const wl = this.auth.user()?.wishlist;
    return wl?.includes(this.product._id) || this.wishlisted;
  }

  addToCart(e: Event) {
    e.preventDefault();
    if (!this.auth.isLoggedIn()) { this.toast.warning('Please login to add to cart'); return; }
    this.cartSvc.addAndRefresh(this.product._id);
  }

  toggleWishlist(e: Event) {
    e.preventDefault();
    if (!this.auth.isLoggedIn()) { this.toast.warning('Please login'); return; }
    this.api.toggleWishlist(this.product._id).subscribe(res => {
      this.wishlisted = res.added;
      this.toast.info(res.message);
    });
  }
}
