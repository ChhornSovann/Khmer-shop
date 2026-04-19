import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div style="padding:32px 0 60px;" class="animate-in">
      <div class="container" style="max-width:800px;">
        <h1 style="font-size:26px;font-weight:800;margin-bottom:24px;">👤 My Profile</h1>

        <div style="display:grid;grid-template-columns:200px 1fr;gap:24px;">
          <!-- Sidebar -->
          <div style="display:flex;flex-direction:column;gap:4px;">
            @for (link of navLinks; track link.path) {
              <a [routerLink]="link.path" routerLinkActive="active-link" style="padding:10px 14px;border-radius:8px;font-size:14px;font-weight:500;color:var(--text-muted);display:flex;gap:8px;align-items:center;transition:all 0.2s;" (mouseover)="$any($event.target).closest('a').style.background='#f7fafc'" (mouseout)="$any($event.target).closest('a').style.background='transparent'">
                {{ link.icon }} {{ link.label }}
              </a>
            }
            <button (click)="auth.logout()" style="padding:10px 14px;border-radius:8px;font-size:14px;font-weight:500;color:var(--primary);background:none;border:none;cursor:pointer;text-align:left;display:flex;gap:8px;margin-top:8px;">🚪 Logout</button>
          </div>

          <!-- Main -->
          <div style="display:flex;flex-direction:column;gap:20px;">
            <!-- Profile form -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);">
              <h3 style="font-weight:700;margin-bottom:20px;">Personal Information</h3>
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
                <div style="width:72px;height:72px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;">{{ auth.user()?.name?.charAt(0) }}</div>
                <div>
                  <p style="font-weight:700;font-size:18px;">{{ auth.user()?.name }}</p>
                  <p style="font-size:14px;color:var(--text-muted);">{{ auth.user()?.email }}</p>
                  <span class="badge badge-blue" style="margin-top:4px;">{{ auth.user()?.role | titlecase }}</span>
                </div>
              </div>
              <form (ngSubmit)="updateProfile()">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="input-group"><label class="input-label">Full Name</label><input type="text" class="input" [(ngModel)]="pForm.name" name="name"></div>
                  <div class="input-group"><label class="input-label">Phone</label><input type="text" class="input" [(ngModel)]="pForm.phone" name="phone"></div>
                </div>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Update Profile' }}</button>
              </form>
            </div>

            <!-- Change Password -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);">
              <h3 style="font-weight:700;margin-bottom:16px;">🔑 Change Password</h3>
              <form (ngSubmit)="changePassword()">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                  <div class="input-group"><label class="input-label">Current</label><input type="password" class="input" [(ngModel)]="pwForm.current" name="cur"></div>
                  <div class="input-group"><label class="input-label">New</label><input type="password" class="input" [(ngModel)]="pwForm.new" name="new"></div>
                  <div class="input-group"><label class="input-label">Confirm</label><input type="password" class="input" [(ngModel)]="pwForm.confirm" name="conf"></div>
                </div>
                @if (pwError()) { <p style="font-size:12px;color:var(--primary);margin-bottom:8px;">⚠️ {{ pwError() }}</p> }
                <button type="submit" class="btn btn-primary btn-sm">Change Password</button>
              </form>
            </div>

            <!-- Addresses -->
            <div style="background:#fff;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-weight:700;">📍 Saved Addresses</h3>
                <button class="btn btn-primary btn-sm" (click)="showAddrForm = !showAddrForm">+ Add Address</button>
              </div>
              @if (showAddrForm) {
                <div style="background:#f7fafc;border-radius:8px;padding:16px;margin-bottom:16px;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                    <div class="input-group"><label class="input-label">Full Name</label><input type="text" class="input" [(ngModel)]="addrForm.fullName" name="afn"></div>
                    <div class="input-group"><label class="input-label">Phone</label><input type="text" class="input" [(ngModel)]="addrForm.phone" name="aph"></div>
                    <div class="input-group" style="grid-column:span 2;"><label class="input-label">Street</label><input type="text" class="input" [(ngModel)]="addrForm.street" name="ast"></div>
                    <div class="input-group"><label class="input-label">City</label><input type="text" class="input" [(ngModel)]="addrForm.city" name="aci"></div>
                    <div class="input-group"><label class="input-label">Province</label><input type="text" class="input" [(ngModel)]="addrForm.province" name="apr"></div>
                  </div>
                  <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary btn-sm" (click)="addAddress()">Save Address</button>
                    <button class="btn btn-secondary btn-sm" (click)="showAddrForm = false">Cancel</button>
                  </div>
                </div>
              }
              @for (addr of auth.user()?.addresses; track addr._id) {
                <div style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:start;">
                  <div>
                    <p style="font-weight:600;font-size:14px;">{{ addr.fullName }} · {{ addr.phone }}</p>
                    <p style="font-size:13px;color:var(--text-muted);">{{ addr.street }}, {{ addr.city }}, {{ addr.country }}</p>
                    @if (addr.isDefault) { <span class="badge badge-green" style="margin-top:4px;">Default</span> }
                  </div>
                  <button (click)="deleteAddress(addr._id)" style="background:none;border:none;cursor:pointer;color:#fc8181;font-size:14px;">🗑</button>
                </div>
              }
              @empty { <p style="color:var(--text-muted);font-size:14px;">No addresses saved yet.</p> }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.active-link { background: #fff5f5 !important; color: var(--primary) !important; font-weight: 600 !important; }`]
})
export class ProfileComponent {
  auth = inject(AuthService);
  private toast = inject(ToastService);

  saving = signal(false);
  pwError = signal('');
  showAddrForm = false;
  pForm = { name: this.auth.user()?.name || '', phone: this.auth.user()?.phone || '' };
  pwForm = { current: '', new: '', confirm: '' };
  addrForm: any = { fullName: '', phone: '', street: '', city: '', province: '', country: 'Cambodia' };

  navLinks = [
    { icon: '👤', label: 'Profile', path: '/account/profile' },
    { icon: '📦', label: 'Orders', path: '/account/orders' },
    { icon: '❤️', label: 'Wishlist', path: '/account/wishlist' }
  ];

  updateProfile() {
    this.saving.set(true);
    this.auth.updateProfile(this.pForm).subscribe({ next: () => { this.saving.set(false); this.toast.success('Profile updated!'); }, error: () => { this.saving.set(false); this.toast.error('Update failed'); } });
  }

  changePassword() {
    if (this.pwForm.new !== this.pwForm.confirm) { this.pwError.set('Passwords do not match'); return; }
    this.auth.changePassword(this.pwForm.current, this.pwForm.new).subscribe({ next: () => { this.toast.success('Password changed!'); this.pwForm = { current:'', new:'', confirm:'' }; }, error: err => this.pwError.set(err.error?.message) });
  }

  addAddress() {
    this.auth.addAddress(this.addrForm).subscribe(() => { this.toast.success('Address saved'); this.showAddrForm = false; this.addrForm = { fullName:'', phone:'', street:'', city:'', province:'', country:'Cambodia' }; });
  }

  deleteAddress(id: string) {
    this.auth.deleteAddress(id).subscribe(() => this.toast.info('Address removed'));
  }
}
