import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <header class="navbar">
      <div class="container" style="display:flex;align-items:center;gap:16px;height:100%;">
        <!-- Logo -->
        <a routerLink="/" class="nav-logo" style="flex-shrink:0;">🏪 Khmer<span>Shop</span></a>

        <!-- Search -->
        <div style="flex:1;max-width:480px;position:relative;">
          <input type="text" placeholder="Search products..." class="input"
            style="border-radius:50px;padding:8px 40px 8px 16px;"
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()">
          <button (click)="search()"
            style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:18px;">
            🔍
          </button>
        </div>

        <!-- Nav links -->
        <nav style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <a routerLink="/products" class="btn btn-secondary btn-sm" routerLinkActive="active">Products</a>

          @if (auth.isAdmin()) {
            <a routerLink="/admin" class="btn btn-sm" style="background:#1a202c;color:#fff;">⚡ Admin</a>
          }

          @if (auth.isLoggedIn()) {
            <a routerLink="/account" class="btn btn-secondary btn-sm">👤 {{ firstName() }}</a>
          } @else {
            <a routerLink="/auth/login" class="btn btn-secondary btn-sm">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Register</a>
          }

          <!-- Cart -->
          <a routerLink="/cart" class="btn btn-primary btn-sm" style="position:relative;">
            🛒 Cart
            @if (cart.count() > 0) {
              <span style="position:absolute;top:-6px;right:-6px;background:#fff;color:var(--primary);width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;border:2px solid var(--primary);">
                {{ cart.count() }}
              </span>
            }
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`.active { color: var(--primary) !important; }`]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);
  searchQuery = '';

  firstName(): string {
    const name = this.auth.user()?.name;
    if (!name) return '';
    const parts = name.split(' ');
    return parts[0] ?? name;
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
    }
  }
}
