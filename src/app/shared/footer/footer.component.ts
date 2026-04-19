import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer style="background:#1a202c;color:#e2e8f0;padding:48px 0 24px;margin-top:64px;">
      <div class="container">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px;margin-bottom:32px;">
          <div>
            <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:12px;">🏪 KhmerShop</div>
            <p style="font-size:14px;color:#a0aec0;line-height:1.7;">Cambodia's premium online store. Shop with confidence using KHQR/Bakong payment.</p>
          </div>
          <div>
            <h4 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a0aec0;margin-bottom:12px;">Shop</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a routerLink="/products" style="font-size:14px;color:#e2e8f0;opacity:0.7;">All Products</a>
              <a routerLink="/products?featured=true" style="font-size:14px;color:#e2e8f0;opacity:0.7;">Featured</a>
            </div>
          </div>
          <div>
            <h4 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a0aec0;margin-bottom:12px;">Account</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a routerLink="/account/profile" style="font-size:14px;color:#e2e8f0;opacity:0.7;">Profile</a>
              <a routerLink="/account/orders" style="font-size:14px;color:#e2e8f0;opacity:0.7;">Orders</a>
              <a routerLink="/account/wishlist" style="font-size:14px;color:#e2e8f0;opacity:0.7;">Wishlist</a>
            </div>
          </div>
          <div>
            <h4 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a0aec0;margin-bottom:12px;">Payment</h4>
            <div style="background:#2d3748;border-radius:8px;padding:12px;font-size:12px;">
              <p style="color:#f6ad55;font-weight:700;margin-bottom:4px;">🇰🇭 KHQR / Bakong</p>
              <p style="color:#a0aec0;">Secure & Fast Payment</p>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid #2d3748;padding-top:16px;display:flex;justify-content:space-between;font-size:12px;color:#718096;">
          <p>© 2024 KhmerShop. All rights reserved.</p>
          <p>Built with Angular + Node.js + MongoDB</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
