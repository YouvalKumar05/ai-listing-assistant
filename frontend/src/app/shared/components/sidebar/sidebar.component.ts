import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="logo-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9 1L11.09 6.26L17 7.27L13 11.14L13.97 17L9 14.27L4.03 17L5 11.14L1 7.27L6.91 6.26L9 1Z"
                fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
            </svg>
          </div>
          @if (!collapsed) {
            <div class="logo-text">
              <span class="logo-primary">AI Listing</span>
              <span class="logo-secondary">Assistant</span>
            </div>
          }
        </div>
        <button
          class="sidebar-toggle"
          (click)="collapsed = !collapsed"
          [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          [attr.aria-expanded]="!collapsed"
        >
          {{ collapsed ? '›' : '‹' }}
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Main navigation">
        <div class="nav-section-label">
          @if (!collapsed) { <span>Workflow</span> }
        </div>

        <!-- Listing Input -->
        <a class="nav-link" routerLink="/create-listing" routerLinkActive="active"
           [attr.title]="collapsed ? 'Listing Input' : null">
          <span class="nav-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5 5.5h5M5 8.5h5M5 11.5h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
          </span>
          @if (!collapsed) { <span class="nav-label">Listing Input</span> }
        </a>

        <!-- AI Assistant -->
        <a class="nav-link" routerLink="/ai-assistant" routerLinkActive="active"
           [attr.title]="collapsed ? 'AI Assistant' : null">
          <span class="nav-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1.5L9.5 5.8H14.2L10.5 8.4L11.9 12.7L8 10.1L4.1 12.7L5.5 8.4L1.8 5.8H6.5L8 1.5Z"
                stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
            </svg>
          </span>
          @if (!collapsed) { <span class="nav-label">AI Assistant</span> }
        </a>

        <!-- Fraud Detection -->
        <a class="nav-link" routerLink="/fraud-detection" routerLinkActive="active"
           [attr.title]="collapsed ? 'Fraud Detection' : null">
          <span class="nav-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1.5L13.5 4v4c0 3-2.5 5.5-5.5 6C5 13.5 2.5 11 2.5 8V4L8 1.5z"
                stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
              <path d="M5.5 8l1.8 1.8L10.5 6.5" stroke="currentColor" stroke-width="1.4"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          @if (!collapsed) { <span class="nav-label">Fraud Detection</span> }
        </a>

        <!-- Admin Review -->
        <a class="nav-link" routerLink="/admin-review" routerLinkActive="active"
           [attr.title]="collapsed ? 'Admin Review' : null">
          <span class="nav-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M3 13.5c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </span>
          @if (!collapsed) { <span class="nav-label">Admin Review</span> }
        </a>

        <hr class="nav-divider">

        <div class="nav-section-label">
          @if (!collapsed) { <span>General</span> }
        </div>

        <!-- Dashboard -->
        <a class="nav-link" routerLink="/" routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }"
           [attr.title]="collapsed ? 'Dashboard' : null">
          <span class="nav-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
              <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
              <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
              <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
            </svg>
          </span>
          @if (!collapsed) { <span class="nav-label">Dashboard</span> }
        </a>
      </nav>

      <div class="sidebar-footer">
        <a class="nav-link" routerLink="/settings" routerLinkActive="active"
           [attr.title]="collapsed ? 'Settings' : null">
          <span class="nav-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/>
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06"
                stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </span>
          @if (!collapsed) { <span class="nav-label">Settings</span> }
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      min-height: 100vh;
      background: var(--navy-900);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width var(--transition-base);
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
    }

    .sidebar.collapsed { width: 64px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px 16px;
      border-bottom: 1px solid var(--navy-700);
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .logo-icon {
      width: 34px;
      height: 34px;
      background: var(--purple-500);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .logo-primary {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
      white-space: nowrap;
    }

    .logo-secondary {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .sidebar-toggle {
      background: var(--navy-700);
      border: none;
      color: var(--text-muted);
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background var(--transition-fast), color var(--transition-fast);
    }

    .sidebar-toggle:hover { background: var(--navy-600); color: #fff; }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--navy-600) transparent;
    }

    .nav-section-label {
      padding: 8px 8px 4px;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--navy-500);
      min-height: 24px;
    }

    .nav-divider {
      border: none;
      border-top: 1px solid var(--navy-700);
      margin: 8px 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background var(--transition-fast), color var(--transition-fast);
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-link:hover { background: var(--navy-700); color: #e2e8f0; }
    .nav-link.active { background: rgba(124, 58, 237, 0.18); color: var(--purple-300); }

    .nav-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-label { overflow: hidden; text-overflow: ellipsis; }

    .sidebar-footer {
      padding: 8px 8px 20px;
      border-top: 1px solid var(--navy-700);
    }
  `],
})
export class SidebarComponent {
  collapsed = false;
}
