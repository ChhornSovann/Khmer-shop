import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:40px 0 60px;" class="animate-in">
      <div class="container" style="max-width:600px;">
        <!-- Steps -->
        <div class="checkout-steps" style="margin-bottom:40px;">
          <div class="step done"><div class="step-num">✓</div><span style="font-size:12px;">Cart</span></div>
          <div class="step-line done"></div>
          <div class="step done"><div class="step-num">✓</div><span style="font-size:12px;">Checkout</span></div>
          <div class="step-line done"></div>
          <div class="step active"><div class="step-num">3</div><span style="font-size:12px;">Payment</span></div>
          <div class="step-line"></div>
          <div class="step"><div class="step-num">4</div><span style="font-size:12px;">Done</span></div>
        </div>

        <div class="khqr-container">
          <!-- Header -->
          <div style="margin-bottom:24px;">
            <p style="font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px;">🇰🇭 KHQR / Bakong Payment</p>
            <h2 style="font-size:26px;font-weight:800;margin-top:6px;">Scan to Pay</h2>
          </div>

          <!-- Amount -->
          <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="font-size:12px;color:rgba(255,255,255,0.6);">Amount Due</p>
              <p class="payment-timer" style="font-size:28px;">\${{ payment()?.amount | number:'1.2-2' }}</p>
            </div>
            <div style="text-align:right;">
              <p style="font-size:12px;color:rgba(255,255,255,0.6);">Order</p>
              <p style="font-size:14px;font-weight:700;color:#f6ad55;">{{ orderId()?.slice(0,8)?.toUpperCase() }}</p>
            </div>
          </div>

          <!-- QR Code -->
          @if (payment()?.qrCode) {
            <div class="khqr-qr" style="margin:0 auto 24px;">
              <img [src]="payment()!.qrCode" alt="KHQR Code" style="width:220px;height:220px;">
            </div>
          } @else {
            <div style="width:220px;height:220px;background:rgba(255,255,255,0.1);border-radius:12px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
              <div class="spinner"></div>
            </div>
          }

          <!-- Timer -->
          @if (timeLeft() > 0) {
            <div style="margin-bottom:20px;">
              <p style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:4px;">⏱ QR expires in</p>
              <p class="payment-timer">{{ formatTime(timeLeft()) }}</p>
            </div>
          } @else if (expired()) {
            <div style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);border-radius:10px;padding:12px;margin-bottom:16px;">
              <p style="color:#fc8181;font-weight:700;">⚠️ QR Code Expired</p>
              <button class="btn btn-primary btn-sm" style="margin-top:8px;" (click)="regenerate()">Generate New QR</button>
            </div>
          }

          <!-- Status -->
          @if (status() === 'paid') {
            <div style="background:rgba(72,187,120,0.2);border:1px solid rgba(72,187,120,0.4);border-radius:12px;padding:16px;margin-bottom:16px;">
              <p style="font-size:18px;font-weight:800;color:#68d391;">✅ Payment Confirmed!</p>
              <p style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">Redirecting to order confirmation...</p>
            </div>
          } @else if (polling()) {
            <div style="display:flex;align-items:center;gap:10px;color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:16px;">
              <div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>
              <span>Waiting for payment... checking every 5 seconds</span>
            </div>
          }

          <!-- Instructions -->
          <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:16px;text-align:left;">
            <p style="font-size:13px;font-weight:700;margin-bottom:10px;color:rgba(255,255,255,0.9);">How to pay:</p>
            @for (s of steps; track s.n) {
              <div style="display:flex;gap:10px;margin-bottom:8px;">
                <span style="color:#f6ad55;font-weight:700;flex-shrink:0;">{{ s.n }}.</span>
                <span style="font-size:13px;color:rgba(255,255,255,0.7);">{{ s.t }}</span>
              </div>
            }
          </div>

          <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-secondary btn-sm" (click)="checkManually()">🔄 Check Payment</button>
            @if (process.env?.['NODE_ENV'] !== 'production') {
              <button class="btn btn-sm" style="background:#276749;color:#fff;" (click)="simulatePayment()">⚡ Simulate Payment (Dev)</button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  orderId = signal('');
  payment = signal<any>(null);
  status = signal('pending');
  timeLeft = signal(0);
  expired = signal(false);
  polling = signal(false);
  process = { env: { NODE_ENV: 'development' } }; // expose for dev simulate btn

  private pollInterval: any;
  private timerInterval: any;

  steps = [
    { n: 1, t: 'Open your Bakong or banking app' },
    { n: 2, t: 'Tap "Scan QR" or "Pay"' },
    { n: 3, t: 'Scan the KHQR code above' },
    { n: 4, t: 'Confirm the amount and complete payment' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orderId')!;
    this.orderId.set(id);

    // Get payment data from router state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;
    if (state?.payment) {
      this.payment.set(state.payment);
      this.startTimer(state.payment.expiresAt);
      this.startPolling(state.payment.paymentId);
    } else {
      // Regenerate if no state
      this.api.regenerateKHQR(id).subscribe(r => {
        this.payment.set(r.data);
        this.startTimer(r.data.expiresAt);
        this.startPolling(r.data.paymentId);
      });
    }
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
    clearInterval(this.timerInterval);
  }

  startTimer(expiresAt: string) {
    const expiry = new Date(expiresAt).getTime();
    this.timerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      this.timeLeft.set(remaining);
      if (remaining === 0) { this.expired.set(true); clearInterval(this.timerInterval); clearInterval(this.pollInterval); }
    }, 1000);
  }

  startPolling(paymentId: string) {
    this.polling.set(true);
    this.pollInterval = setInterval(() => this.verify(paymentId), 5000);
  }

  verify(paymentId: string, simulate = false) {
    this.api.verifyKHQR(paymentId, simulate).subscribe(r => {
      if (r.paid) {
        this.status.set('paid');
        this.polling.set(false);
        clearInterval(this.pollInterval);
        clearInterval(this.timerInterval);
        this.toast.success('🎉 Payment confirmed!');
        setTimeout(() => this.router.navigate(['/checkout/success', this.orderId()]), 2000);
      } else if (r.status === 'expired') {
        this.expired.set(true);
        this.polling.set(false);
        clearInterval(this.pollInterval);
      }
    });
  }

  checkManually() { if (this.payment()?.paymentId) this.verify(this.payment().paymentId); }
  simulatePayment() { if (this.payment()?.paymentId) this.verify(this.payment().paymentId, true); }

  regenerate() {
    this.api.regenerateKHQR(this.orderId()).subscribe(r => {
      this.payment.set(r.data);
      this.expired.set(false);
      this.startTimer(r.data.expiresAt);
      this.startPolling(r.data.paymentId);
    });
  }

  formatTime(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}`; }
}
