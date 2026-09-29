import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WorkflowStep {
  label: string;
  status: 'complete' | 'active' | 'pending';
}

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="stepper" aria-label="Workflow progress">
      @for (step of steps; track step.label; let i = $index, last = $last) {
        <div class="step step-{{ step.status }}">
          <div class="step-indicator" [attr.aria-current]="step.status === 'active' ? 'step' : null">
            @if (step.status === 'complete') {
              <span class="step-check">✓</span>
            } @else {
              <span class="step-num">{{ i + 1 }}</span>
            }
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
        @if (!last) {
          <div class="step-connector step-connector-{{ step.status }}"></div>
        }
      }
    </nav>
  `,
  styles: [`
    .stepper {
      display: flex;
      align-items: center;
      gap: 0;
      flex-wrap: nowrap;
      overflow-x: auto;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-width: 80px;
    }
    .step-indicator {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 600;
      border: 2px solid;
      flex-shrink: 0;
      transition: background 0.2s, border-color 0.2s;
    }
    .step-complete .step-indicator {
      background: var(--green-600);
      border-color: var(--green-600);
      color: #fff;
    }
    .step-active .step-indicator {
      background: var(--purple-500);
      border-color: var(--purple-500);
      color: #fff;
    }
    .step-pending .step-indicator {
      background: var(--surface-200);
      border-color: var(--border-medium);
      color: var(--text-muted);
    }
    .step-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-align: center;
      white-space: nowrap;
    }
    .step-complete .step-label { color: var(--green-700); }
    .step-active .step-label   { color: var(--purple-600); font-weight: 600; }
    .step-pending .step-label  { color: var(--text-muted); }
    .step-connector {
      flex: 1;
      min-width: 24px;
      height: 2px;
      margin-bottom: 18px; /* align with indicator center */
    }
    .step-connector-complete { background: var(--green-500); }
    .step-connector-active   { background: var(--purple-300); }
    .step-connector-pending  { background: var(--border-light); }
  `],
})
export class ProgressStepperComponent {
  @Input() steps: WorkflowStep[] = [];
}
