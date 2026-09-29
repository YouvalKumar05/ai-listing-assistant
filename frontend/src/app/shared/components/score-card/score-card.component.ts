import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-card">
      <div class="score-number" [style.color]="scoreColor">
        {{ score }}<span class="score-max">/{{ max }}</span>
      </div>
      <div class="score-label">{{ label }}</div>
      <div class="progress-bar" style="margin-top: 8px;">
        <div
          class="progress-fill"
          [style.width.%]="pct"
          [style.background]="scoreColor"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .score-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .score-number {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }
    .score-max {
      font-size: 1rem;
      font-weight: 400;
      opacity: 0.6;
    }
    .score-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
    }
  `],
})
export class ScoreCardComponent implements OnInit {
  @Input() score = 0;
  @Input() max = 100;
  @Input() label = '';
  /** Colour override — if not provided, colour is auto-derived from score */
  @Input() color?: string;

  pct = 0;
  scoreColor = '';

  ngOnInit(): void {
    this.pct = Math.round((this.score / this.max) * 100);
    this.scoreColor = this.color ?? this.deriveColor();
  }

  private deriveColor(): string {
    if (this.pct >= 80) return 'var(--green-600)';
    if (this.pct >= 60) return 'var(--amber-600)';
    return 'var(--red-600)';
  }
}
