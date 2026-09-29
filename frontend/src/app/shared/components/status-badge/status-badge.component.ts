import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge badge-{{ type }}">
      @if (dot) {
        <span class="badge-dot"></span>
      }
      {{ label }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
  `],
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() type: BadgeType = 'neutral';
  @Input() dot = false;
}
