import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;" class="animate-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div><h1 style="font-size:22px;font-weight:800;">👥 User Management</h1><p style="font-size:13px;color:var(--text-muted);">{{ total() }} users</p></div>
      </div>

      <div style="background:#fff;border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);margin-bottom:20px;display:flex;gap:12px;">
        <input type="text" class="input" placeholder="🔍 Search..." [(ngModel)]="search" (ngModelChange)="load()" style="max-width:260px;">
        <select class="input" [(ngModel)]="filterRole" (change)="load()" style="max-width:140px;">
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div style="background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead style="background:#f7fafc;">
            <tr>
              <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">User</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Role</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Phone</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Joined</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Status</th>
              <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u._id) {
              <tr style="border-top:1px solid var(--border);">
                <td style="padding:12px 16px;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">{{ u.name?.charAt(0) }}</div>
                    <div><p style="font-weight:600;font-size:14px;">{{ u.name }}</p><p style="font-size:12px;color:var(--text-muted);">{{ u.email }}</p></div>
                  </div>
                </td>
                <td style="padding:12px 16px;"><span class="badge" [ngClass]="u.role === 'admin' ? 'badge-blue' : 'badge-gray'">{{ u.role }}</span></td>
                <td style="padding:12px 16px;font-size:13px;color:var(--text-muted);">{{ u.phone || '—' }}</td>
                <td style="padding:12px 16px;font-size:12px;color:var(--text-muted);">{{ u.createdAt | date:'mediumDate' }}</td>
                <td style="padding:12px 16px;"><span class="badge" [ngClass]="u.isActive ? 'badge-green' : 'badge-red'">{{ u.isActive ? 'Active' : 'Disabled' }}</span></td>
                <td style="padding:12px 16px;">
                  <button class="btn btn-sm" [ngClass]="u.isActive ? 'btn-secondary' : 'btn-primary'" (click)="toggleStatus(u)" style="font-size:11px;">
                    {{ u.isActive ? '🔒 Disable' : '🔓 Enable' }}
                  </button>
                </td>
              </tr>
            }
            @empty { <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No users found</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  users = signal<any[]>([]);
  total = signal(0);
  loading = signal(false);
  search = ''; filterRole = 'customer';

  ngOnInit() { this.load(); }
  load() { this.api.getAdminUsers({ search: this.search, role: this.filterRole }).subscribe(r => { this.users.set(r.data); this.total.set(r.total || 0); }); }
  toggleStatus(u: any) {
    this.api.toggleUserStatus(u._id).subscribe({ next: r => { u.isActive = r.data.isActive; this.toast.success('Status updated'); }, error: err => this.toast.error(err.error?.message) });
  }
}
