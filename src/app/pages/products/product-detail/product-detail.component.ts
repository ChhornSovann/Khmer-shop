import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { Product, Review } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container">
        @if (loading()) {
          <div style="display:flex;justify-content:center;padding:80px;"><div class="spinner"></div></div>
        } @else if (product()) {
          <!-- Breadcrumb -->
          <nav style="font-size:13px;color:var(--text-muted);margin-bottom:24px;display:flex;gap:8px;align-items:center;">
            <a routerLink="/">Home</a> <span>›</span>
            <a routerLink="/products">Products</a> <span>›</span>
            <span style="color:var(--text);">{{ product()!.name }}</span>
          </nav>

          <div style="display:grid;grid-template-columns:55% 1fr;gap:40px;margin-bottom:48px;">
            <!-- Images -->
            <div>
              <div style="background:#f7fafc;border-radius:var(--radius);overflow:hidden;aspect-ratio:1;margin-bottom:12px;">
                <img [src]="selectedImage()" [alt]="product()!.name" style="width:100%;height:100%;object-fit:contain;">
              </div>
              <div style="display:flex;gap:8px;overflow-x:auto;">
                @for (img of product()!.images; track img.url) {
                  <div style="width:72px;height:72px;flex-shrink:0;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;"
                    [style.borderColor]="selectedImage() === img.url ? 'var(--primary)' : 'transparent'"
                    (click)="selectedImage.set(img.url)">
                    <img [src]="img.url" [alt]="img.alt" style="width:100%;height:100%;object-fit:cover;">
                  </div>
                }
              </div>
            </div>

            <!-- Info -->
            <div>
              @if (product()!.brand) {
                <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--primary);margin-bottom:6px;">{{ product()!.brand }}</p>
              }
              <h1 style="font-size:26px;font-weight:800;margin-bottom:12px;line-height:1.3;">{{ product()!.name }}</h1>

              <!-- Rating -->
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <span class="stars">{{ stars() }}</span>
                <span style="font-size:14px;color:var(--text-muted);">{{ product()!.ratings?.average | number:'1.1-1' }} ({{ product()!.ratings?.count }} reviews)</span>
                @if (product()!.soldCount > 0) {
                  <span style="font-size:12px;color:var(--text-muted);">· {{ product()!.soldCount }}+ sold</span>
                }
              </div>

              <!-- Price -->
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
                <span class="price-current" style="font-size:32px;">\${{ product()!.price | number:'1.2-2' }}</span>
                @if (product()!.comparePrice && product()!.comparePrice! > product()!.price) {
                  <span class="price-original">\${{ product()!.comparePrice | number:'1.2-2' }}</span>
                  <span class="price-discount">{{ discount() }}% OFF</span>
                }
              </div>

              <!-- Short desc -->
              @if (product()!.shortDescription) {
                <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px;line-height:1.7;">{{ product()!.shortDescription }}</p>
              }

              <!-- Variants -->
              @for (variant of product()!.variants; track variant.name) {
                <div style="margin-bottom:16px;">
                  <p style="font-size:13px;font-weight:600;margin-bottom:8px;">{{ variant.name }}:</p>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    @for (opt of variant.options; track opt.value) {
                      <button class="btn btn-secondary btn-sm"
                        [style.border]="selectedVariants[variant.name] === opt.value ? '2px solid var(--primary)' : ''"
                        [disabled]="opt.stock === 0"
                        (click)="selectedVariants[variant.name] = opt.value">
                        {{ opt.value }}
                        @if (opt.stock === 0) { <span style="text-decoration:line-through;opacity:0.5;"> (0)</span> }
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Qty & Stock -->
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;border:1.5px solid var(--border);border-radius:8px;overflow:hidden;">
                  <button (click)="decQty()" class="btn btn-secondary" style="border-radius:0;border:none;width:40px;padding:0;">−</button>
                  <span style="padding:0 16px;font-weight:700;min-width:48px;text-align:center;">{{ qty }}</span>
                  <button (click)="incQty()" class="btn btn-secondary" style="border-radius:0;border:none;width:40px;padding:0;">+</button>
                </div>
                @if (product()!.stock > 0) {
                  <span style="font-size:13px;color:#276749;font-weight:600;">✅ {{ product()!.stock }} in stock</span>
                } @else {
                  <span style="font-size:13px;color:var(--primary);font-weight:600;">❌ Out of stock</span>
                }
              </div>

              <!-- CTAs -->
              <div style="display:flex;gap:12px;margin-bottom:24px;">
                <button class="btn btn-primary btn-lg" style="flex:1;" [disabled]="product()!.stock === 0" (click)="addToCart()">
                  🛒 Add to Cart
                </button>
                <button class="btn btn-outline btn-lg" style="width:52px;padding:0;" (click)="toggleWishlist()">
                  {{ isWishlisted ? '❤️' : '🤍' }}
                </button>
              </div>

              <!-- Meta -->
              <div style="background:#f7fafc;border-radius:var(--radius);padding:16px;">
                <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
                  <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);">Category</span><span>{{ product()!.category?.name }}</span></div>
                  @if (product()!.tags?.length) {
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="color:var(--text-muted);">Tags</span>
                      <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
                        @for (tag of product()!.tags; track tag) {
                          <span class="badge badge-gray">{{ tag }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Payment methods -->
              <div style="margin-top:16px;padding:12px;border:1px solid var(--border);border-radius:8px;font-size:12px;text-align:center;">
                <p style="color:var(--text-muted);">Secure payment via</p>
                <p style="font-weight:700;color:var(--primary);font-size:14px;">🇰🇭 KHQR / Bakong &amp; Cash on Delivery</p>
              </div>
            </div>
          </div>

          <!-- Tabs: Description + Reviews -->
          <div style="margin-bottom:48px;">
            <div style="display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:24px;">
              @for (tab of ['Description', 'Reviews ('+(reviews().length)+')']; track tab) {
                <button class="btn" style="border-radius:0;border-bottom:3px solid transparent;margin-bottom:-2px;padding:12px 24px;"
                  [style.borderBottomColor]="activeTab === tab.split('(')[0].trim() ? 'var(--primary)' : 'transparent'"
                  [style.color]="activeTab === tab.split('(')[0].trim() ? 'var(--primary)' : 'var(--text-muted)'"
                  (click)="activeTab = tab.split('(')[0].trim()">
                  {{ tab }}
                </button>
              }
            </div>

            @if (activeTab === 'Description') {
              <div style="font-size:15px;line-height:1.8;color:var(--text);white-space:pre-line;">{{ product()!.description }}</div>
            }

            @if (activeTab === 'Reviews') {
              @if (auth.isLoggedIn()) {
                <div style="background:#fff;border-radius:var(--radius);padding:24px;margin-bottom:24px;box-shadow:var(--shadow);">
                  <h3 style="font-weight:700;margin-bottom:16px;">Write a Review</h3>
                  <div style="display:flex;gap:8px;margin-bottom:12px;">
                    @for (s of [1,2,3,4,5]; track s) {
                      <button (click)="newReview.rating = s" style="background:none;border:none;font-size:28px;cursor:pointer;transition:transform 0.1s;" [style.transform]="newReview.rating >= s ? 'scale(1.2)' : 'scale(1)'">
                        {{ newReview.rating >= s ? '★' : '☆' }}
                      </button>
                    }
                  </div>
                  <input type="text" class="input" placeholder="Review title" [(ngModel)]="newReview.title" style="margin-bottom:8px;">
                  <textarea class="input" placeholder="Share your experience..." [(ngModel)]="newReview.body" style="height:100px;resize:vertical;margin-bottom:12px;"></textarea>
                  <button class="btn btn-primary" (click)="submitReview()">Submit Review</button>
                </div>
              }

              @if (reviewsLoading()) {
                <div style="display:flex;justify-content:center;padding:40px;"><div class="spinner"></div></div>
              } @else {
                @for (rev of reviews(); track rev._id) {
                  <div style="background:#fff;border-radius:var(--radius);padding:20px;margin-bottom:16px;box-shadow:var(--shadow);">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">{{ rev.user?.name?.charAt(0) }}</div>
                        <div>
                          <p style="font-weight:600;font-size:14px;">{{ rev.user?.name }}</p>
                          <p style="font-size:12px;color:var(--text-muted);">{{ rev.createdAt | date:'mediumDate' }}</p>
                        </div>
                      </div>
                      <span class="stars">{{ '★'.repeat(rev.rating) + '☆'.repeat(5-rev.rating) }}</span>
                    </div>
                    @if (rev.title) { <p style="font-weight:600;margin-bottom:4px;">{{ rev.title }}</p> }
                    <p style="font-size:14px;color:var(--text-muted);">{{ rev.body }}</p>
                    @if (rev.isVerifiedPurchase) { <span class="badge badge-green" style="margin-top:8px;">✅ Verified Purchase</span> }
                  </div>
                }
                @empty { <p style="text-align:center;color:var(--text-muted);padding:40px;">No reviews yet. Be the first!</p> }
              }
            }
          </div>

          <!-- Related Products -->
          @if (related().length) {
            <div>
              <h2 class="section-title" style="margin-bottom:24px;">Related Products</h2>
              <div class="grid-4">
                @for (p of related(); track p._id) { <app-product-card [product]="p" /> }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cartSvc = inject(CartService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  reviewsLoading = signal(false);
  selectedImage = signal('');
  qty = 1;
  selectedVariants: Record<string, string> = {};
  isWishlisted = false;
  activeTab = 'Description';
  newReview = { rating: 5, title: '', body: '' };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug')!;
      this.loading.set(true);
      this.qty = 1;
      this.api.getProduct(slug).subscribe({
        next: r => {
          this.product.set(r.data);
          this.selectedImage.set(r.data.images?.find((i: any) => i.isPrimary)?.url || r.data.images?.[0]?.url || '');
          this.loading.set(false);
          this.loadReviews(r.data._id);
          this.api.getRelatedProducts(r.data._id).subscribe(rel => this.related.set(rel.data));
        },
        error: () => this.loading.set(false)
      });
    });
  }

  loadReviews(productId: string) {
    this.reviewsLoading.set(true);
    this.api.getProductReviews(productId).subscribe({
      next: r => { this.reviews.set(r.data); this.reviewsLoading.set(false); },
      error: () => this.reviewsLoading.set(false)
    });
  }

  stars(): string {
    const r = Math.round(this.product()?.ratings?.average || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  discount(): number {
    const p = this.product();
    if (!p || !p.comparePrice) return 0;
    return Math.round((1 - p.price / p.comparePrice) * 100);
  }

  incQty(): void {
    const stock = this.product()?.stock ?? 0;
    if (this.qty < stock) this.qty++;
  }

  decQty(): void {
    if (this.qty > 1) this.qty--;
  }

  addToCart(): void {
    if (!this.auth.isLoggedIn()) { this.toast.warning('Please login'); return; }
    const keys = Object.keys(this.selectedVariants);
    const variant = keys.length > 0
      ? { name: keys[0] ?? '', value: this.selectedVariants[keys[0] ?? ''] ?? '' }
      : undefined;
    this.cartSvc.addAndRefresh(this.product()!._id, this.qty, variant);
  }

  toggleWishlist(): void {
    if (!this.auth.isLoggedIn()) { this.toast.warning('Please login'); return; }
    this.api.toggleWishlist(this.product()!._id).subscribe(r => {
      this.isWishlisted = r.added;
      this.toast.info(r.message);
    });
  }

  submitReview(): void {
    if (!this.newReview.body.trim()) { this.toast.error('Please write a review'); return; }
    this.api.createReview({ product: this.product()!._id, ...this.newReview }).subscribe({
      next: r => {
        this.reviews.update(rev => [r.data, ...rev]);
        this.toast.success('Review submitted!');
        this.newReview = { rating: 5, title: '', body: '' };
      },
      error: err => this.toast.error(err.error?.message || 'Failed')
    });
  }
}
