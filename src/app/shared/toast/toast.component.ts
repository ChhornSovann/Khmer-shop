import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap">
      @for (t of toastSvc.toasts(); track t.id) {
        <div class="animate-in" [ngClass]="classes[t.type]"
          style="display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer;min-width:240px;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.15);"
          (click)="toastSvc.remove(t.id)">
          <span>{{ icons[t.type] }}</span>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastSvc = inject(ToastService);
  icons: Record<string,string> = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  classes: Record<string,string> = {
    success: 'bg-green', error: 'bg-red', info: 'bg-blue', warning: 'bg-yellow'
  };
}
