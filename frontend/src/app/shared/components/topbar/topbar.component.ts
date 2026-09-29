import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TopbarPersona = 'seller' | 'reviewer';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        @if (breadcrumbs.length > 0) {
          <nav class="breadcrumb" aria-label="Breadcrumb">
            @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
              @if (!last) {
                <a class="crumb-link" [routerLink]="crumb.route">{{ crumb.label }}</a>
                <span class="crumb-sep">›</span>
              } @else {
                <span class="crumb-current">{{ crumb.label }}</span>
              }
            }
          </nav>
        }
        @if (pageTitle) {
          <h1 class="topbar-title">{{ pageTitle }}</h1>
        }
      </div>
      <div class="topbar-right">
        <div class="topbar-user" [attr.aria-label]="currentUser.name + ' account'">
          <div class="user-avatar">{{ currentUser.initials }}</div>
          <div class="user-info">
            <span class="user-name">{{ currentUser.name }}</span>
            <span class="user-role">{{ currentUser.role }}</span>
          </div>
          <span class="user-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background: var(--surface-50);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--sp-8);
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }
    .topbar-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
    }
    .crumb-link {
      color: var(--text-muted);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .crumb-link:hover { color: var(--purple-500); }
    .crumb-sep { color: var(--text-muted); }
    .crumb-current { color: var(--text-secondary); font-weight: 500; }
    .topbar-title {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
    }
    .topbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
      color: var(--text-muted);
    }
    .topbar-user:hover {
      background: var(--surface-200);
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      background: var(--purple-500);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .user-role {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .user-chevron {
      display: flex;
      align-items: center;
      color: var(--text-muted);
    }
  `],
})
export class TopbarComponent {
  @Input() pageTitle = '';
  @Input() breadcrumbs: { label: string; route?: string }[] = [];
  @Input() persona: TopbarPersona = 'reviewer';

  get currentUser() {
    if (this.persona === 'seller') {
      return { initials: 'JD', name: 'John Doe', role: 'Seller' };
    }
    return { initials: 'R', name: 'Reviewer', role: 'Admin' };
  }
}
