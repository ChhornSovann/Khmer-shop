import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductCardComponent],
  template: `
    <!-- Hero Banner -->
    <section style="background:linear-gradient(135deg,#1a202c 0%,#2d3748 50%,#c53030 100%);color:#fff;padding:80px 0;">
      <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
        <div class="animate-in">
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(246,173,85,0.2);border:1px solid rgba(246,173,85,0.4);color:#f6ad55;padding:6px 14px;border-radius:50px;font-size:12px;font-weight:700;margin-bottom:20px;">
            🇰🇭 KHQR / Bakong Payment Supported
          </div>
          <h1 style="font-size:clamp(36px,5vw,60px);font-weight:900;line-height:1.1;margin-bottom:16px;">Shop Premium<br><span style="color:#f6ad55;">Products Online</span></h1>
          <p style="font-size:16px;color:rgba(255,255,255,0.8);margin-bottom:32px;max-width:440px;">Discover thousands of products with fast delivery across Cambodia. Pay securely with KHQR Bakong.</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a routerLink="/products" class="btn btn-primary btn-lg">Shop Now →</a>
            <a routerLink="/auth/register" class="btn btn-lg" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);">Get Started Free</a>
          </div>
          <div style="display:flex;gap:24px;margin-top:40px;">
            <div><p style="font-size:24px;font-weight:800;">10K+</p><p style="font-size:12px;color:rgba(255,255,255,0.6);">Products</p></div>
            <div><p style="font-size:24px;font-weight:800;">50K+</p><p style="font-size:12px;color:rgba(255,255,255,0.6);">Customers</p></div>
            <div><p style="font-size:24px;font-weight:800;">4.9★</p><p style="font-size:12px;color:rgba(255,255,255,0.6);">Rating</p></div>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.1);border-radius:24px;padding:32px;backdrop-filter:blur(10px);">
            <div style="font-size:72px;margin-bottom:16px;">🛍️</div>
            <div style="background:#fff;border-radius:12px;padding:16px;">
              <p style="font-size:12px;color:#718096;margin-bottom:4px;">Pay with</p>
              <p style="font-size:18px;font-weight:800;color:#c53030;">🇰🇭 KHQR / Bakong</p>
              <p style="font-size:11px;color:#a0aec0;margin-top:4px;">Secure · Fast · Reliable</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Pills -->
    <section style="padding:32px 0;background:#fff;border-bottom:1px solid var(--border);">
      <div class="container">
        <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;">
          <a routerLink="/products" class="btn btn-secondary" style="flex-shrink:0;">🏷️ All</a>
          @for (cat of categories(); track cat._id) {
            <a [routerLink]="['/products']" [queryParams]="{category: cat.slug}" class="btn btn-secondary" style="flex-shrink:0;">{{ cat.name }}</a>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section style="padding:60px 0;">
      <div class="container">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
          <div>
            <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--primary);margin-bottom:6px;">🔥 Hot Picks</p>
            <h2 class="section-title">Featured Products</h2>
          </div>
          <a routerLink="/products" class="btn btn-outline">View All →</a>
        </div>

        @if (loading()) {
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
            @for (i of [1,2,3,4]; track i) {
              <div>
                <div class="skeleton" style="aspect-ratio:1;border-radius:12px;margin-bottom:12px;"></div>
                <div class="skeleton" style="height:16px;margin-bottom:8px;"></div>
                <div class="skeleton" style="height:12px;width:60%;"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid-4">
            @for (p of featured(); track p._id) {
              <app-product-card [product]="p" />
            }
          </div>
        }
      </div>
    </section>

    <!-- KHQR Payment Banner -->
    <section style="padding:60px 0;background:linear-gradient(135deg,#1a202c,#2d3748);">
      <div class="container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
          <div style="color:#fff;">
            <h2 style="font-size:36px;font-weight:800;margin-bottom:16px;">Pay with <span style="color:#f6ad55;">KHQR Bakong</span></h2>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">Scan the QR code to pay instantly using any Bakong-connected banking app in Cambodia.</p>
            <div style="display:flex;flex-direction:column;gap:12px;">
              @for (step of paySteps; track step.num) {
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;">{{ step.num }}</div>
                  <p style="color:rgba(255,255,255,0.8);font-size:14px;">{{ step.text }}</p>
                </div>
              }
            </div>
          </div>
          <div style="text-align:center;">
            <div class="khqr-container" style="max-width:320px;margin:0 auto;">
              <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:12px;">Sample KHQR Code</p>
              <div class="khqr-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021229370016dev.bakong.com.kh0115merchant%40bakong5204599953038405405100.005802KH5909KhmerShop6010PhnomPenh62130509ORDER00163046B2E" alt="KHQR Sample" style="width:200px;height:200px;">
              </div>
              <p style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:12px;">Demo QR — Real QR generated per order</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust badges -->
    <section style="padding:40px 0;background:#fff;">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;">
          @for (b of badges; track b.icon) {
            <div>
              <div style="font-size:36px;margin-bottom:8px;">{{ b.icon }}</div>
              <p style="font-weight:700;font-size:15px;">{{ b.title }}</p>
              <p style="font-size:13px;color:var(--text-muted);margin-top:2px;">{{ b.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  featured = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  paySteps = [
    { num: 1, text: 'Add items to cart and proceed to checkout' },
    { num: 2, text: 'Select KHQR payment method' },
    { num: 3, text: 'Scan QR code with your Bakong banking app' },
    { num: 4, text: 'Payment confirmed automatically!' }
  ];
  badges = [
    { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: '🇰🇭', title: 'KHQR Payment', desc: 'Bakong supported' },
    { icon: '↩️', title: '30-Day Returns', desc: 'Hassle-free' },
    { icon: '🔒', title: 'Secure Checkout', desc: 'SSL encrypted' }
  ];

  ngOnInit() {
    this.api.getFeaturedProducts().subscribe({ next: r => { this.featured.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.api.getCategories().subscribe(r => this.categories.set(r.data.slice(0, 8)));
  }
}
