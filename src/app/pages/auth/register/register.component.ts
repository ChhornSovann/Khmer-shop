import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div style="min-height:100vh;background:linear-gradient(135deg,#f7fafc,#edf2f7);display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="width:100%;max-width:440px;">
        <div style="text-align:center;margin-bottom:32px;">
          <a routerLink="/" style="font-size:26px;font-weight:900;color:var(--primary);">🏪 KhmerShop</a>
          <p style="color:var(--text-muted);margin-top:6px;">Create your free account</p>
        </div>
        <div style="background:#fff;border-radius:var(--radius);padding:32px;box-shadow:var(--shadow-lg);">
          <form (ngSubmit)="register()">
            <div class="input-group"><label class="input-label">Full Name *</label><input type="text" class="input" placeholder="John Doe" [(ngModel)]="form.name" name="name" required></div>
            <div class="input-group"><label class="input-label">Email *</label><input type="email" class="input" placeholder="you@example.com" [(ngModel)]="form.email" name="email" required></div>
            <div class="input-group"><label class="input-label">Phone</label><input type="text" class="input" placeholder="+855 xx xxx xxx" [(ngModel)]="form.phone" name="phone"></div>
            <div class="input-group">
              <label class="input-label">Password * <span style="font-size:11px;color:var(--text-muted);">(min 6 chars)</span></label>
              <input type="password" class="input" placeholder="••••••••" [(ngModel)]="form.password" name="password" required minlength="6">
            </div>
            <div class="input-group">
              <label class="input-label">Confirm Password *</label>
              <input type="password" class="input" placeholder="••••••••" [(ngModel)]="form.confirm" name="confirm" required>
            </div>
            @if (error()) {
              <div style="background:#fff5f5;border:1px solid #fc8181;border-radius:8px;padding:10px;font-size:13px;color:var(--primary);margin-bottom:16px;">⚠️ {{ error() }}</div>
            }
            <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading()">
              @if (loading()) { <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> }
              @else { Create Account }
            </button>
          </form>
          <p style="text-align:center;margin-top:20px;font-size:14px;color:var(--text-muted);">Already have an account? <a routerLink="/auth/login" style="color:var(--primary);font-weight:600;">Login</a></p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cartSvc = inject(CartService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form = { name: '', email: '', phone: '', password: '', confirm: '' };
  loading = signal(false);
  error = signal('');

  register() {
    if (this.form.password !== this.form.confirm) { this.error.set('Passwords do not match'); return; }
    if (this.form.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    this.error.set('');
    this.loading.set(true);
    this.auth.register(this.form.name, this.form.email, this.form.password, this.form.phone).subscribe({
      next: () => {
        this.loading.set(false);
        this.cartSvc.loadCart();
        this.toast.success('Account created! Welcome 🎉');
        this.router.navigate(['/']);
      },
      error: err => { this.loading.set(false); this.error.set(err.error?.message || 'Registration failed'); }
    });
  }
}
