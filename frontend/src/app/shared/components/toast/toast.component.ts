import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-label="Notifications">
      @for (toast of toasts; track toast.id) {
        <div class="toast toast-{{ toast.type }}" role="alert">
          <span class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else if (toast.type === 'warning') { ⚠ }
            @else { ℹ }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="remove(toast.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      font-size: 0.875rem;
      font-weight: 500;
      animation: toast-in 0.25s ease;
      background: #fff;
      border-left: 4px solid;
    }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .toast-success { border-color: #059669; color: #047857; }
    .toast-error   { border-color: #dc2626; color: #b91c1c; }
    .toast-warning { border-color: #d97706; color: #b45309; }
    .toast-info    { border-color: #2563eb; color: #1d4ed8; }
    .toast-icon    { font-size: 1rem; flex-shrink: 0; }
    .toast-message { flex: 1; color: #0f172a; }
    .toast-close   { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; padding: 0 4px; line-height: 1; }
    .toast-close:hover { color: #475569; }
  `],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private sub?: Subscription;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
      const t = setTimeout(() => this.remove(toast.id), toast.duration);
      this.timers.push(t);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.timers.forEach(t => clearTimeout(t));
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
