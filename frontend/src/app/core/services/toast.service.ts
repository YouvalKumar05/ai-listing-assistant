import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private _toasts$ = new Subject<ToastMessage>();
  readonly toasts$ = this._toasts$.asObservable();

  show(message: string, type: ToastType = 'info', duration = 3500): void {
    this._toasts$.next({
      id: `toast-${this.counter++}`,
      message,
      type,
      duration,
    });
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'error', 5000); }
  warning(message: string): void { this.show(message, 'warning'); }
  info(message: string):    void { this.show(message, 'info'); }
}
