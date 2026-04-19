import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh;background:linear-gradient(135deg,#f7fafc,#edf2f7);display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="width:100%;max-width:420px;">
        <div style="text-align:center;margin-bottom:32px;">
          <a routerLink="/" style="font-size:26px;font-weight:900;color:var(--primary);">🏪 KhmerShop</a>
          <p style="color:var(--text-muted);margin-top:6px;">Sign in to your account</p>
        </div>

        <div style="background:#fff;border-radius:var(--radius);padding:32px;box-shadow:var(--shadow-lg);">
          <form (ngSubmit)="login()">
            <div class="input-group">
              <label class="input-label">Email Address</label>
              <input type="email" class="input" placeholder="you@example.com" [(ngModel)]="email" name="email" required>
            </div>
            <div class="input-group">
              <label class="input-label">Password</label>
              <div style="position:relative;">
                <input [type]="showPw ? 'text' : 'password'" class="input" placeholder="••••••••" [(ngModel)]="password" name="password" required style="padding-right:44px;">
                <button type="button" (click)="showPw = !showPw" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;">{{ showPw ? '🙈' : '👁' }}</button>
              </div>
            </div>

            @if (error()) {
              <div style="background:#fff5f5;border:1px solid #fc8181;border-radius:8px;padding:10px;font-size:13px;color:var(--primary);margin-bottom:16px;">⚠️ {{ error() }}</div>
            }

            <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading()">
              @if (loading()) { <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> }
              @else { Sign In }
            </button>
          </form>

          <!-- Demo -->
          <div style="margin-top:20px;padding:14px;background:#f7fafc;border-radius:8px;border:1px solid var(--border);">
            <p style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">Demo Accounts</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              @for (d of demos; track d.role) {
                <button type="button" (click)="fillDemo(d)" style="background:#fff;border:1px solid var(--border);border-radius:6px;padding:8px;font-size:11px;cursor:pointer;text-align:left;transition:border-color 0.2s;" (mouseover)="$any($event.target).style.borderColor='var(--primary)'" (mouseout)="$any($event.target).style.borderColor='var(--border)'">
                  <p style="font-weight:700;color:var(--primary);text-transform:capitalize;">{{ d.role }}</p>
                  <p style="color:var(--text-muted);">{{ d.email }}</p>
                </button>
              }
            </div>
          </div>

          <p style="text-align:center;margin-top:20px;font-size:14px;color:var(--text-muted);">
            Don't have an account? <a routerLink="/auth/register" style="color:var(--primary);font-weight:600;">Register</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private cartSvc = inject(CartService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = 'admin@khmershop.com';
  password = 'admin123';
  showPw = false;
  loading = signal(false);
  error = signal('');

  demos = [
    { role: 'admin', email: 'admin@khmershop.com', password: 'admin123' },
    { role: 'customer', email: 'customer@khmershop.com', password: 'customer123' }
  ];
  fillDemo(d: any) { this.email = d.email; this.password = d.password; }

  login() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.cartSvc.loadCart();
        this.toast.success('Welcome back! 👋');
        this.router.navigate(['/']);
      },
      error: err => { this.loading.set(false); this.error.set(err.error?.message || 'Invalid credentials'); }
    });
  }
}
