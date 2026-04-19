import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <app-navbar />
    <main style="min-height: calc(100vh - 64px - 200px);">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast />
  `
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private cartSvc = inject(CartService);

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.loadProfile();
      this.cartSvc.loadCart();
    }
  }
}
