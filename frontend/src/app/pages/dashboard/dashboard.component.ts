import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TopbarComponent],
  template: `
    <app-topbar
      pageTitle="Dashboard"
      [breadcrumbs]="[{ label: 'Dashboard' }]"
    ></app-topbar>

    <div class="page-body">
      <p class="text-secondary" style="margin-bottom: 32px;">
        Welcome back. Here's a summary of your listing pipeline.
      </p>

      <div class="three-col" style="margin-bottom: 32px;">
        <div class="card card-sm stat-card">
          <div class="stat-value">1</div>
          <div class="stat-label">Active Listings</div>
          <div class="stat-sub">Demo data</div>
        </div>
        <div class="card card-sm stat-card stat-warning">
          <div class="stat-value">1</div>
          <div class="stat-label">Pending AI Analysis</div>
          <div class="stat-sub">Awaiting review</div>
        </div>
        <div class="card card-sm stat-card stat-danger">
          <div class="stat-value">1</div>
          <div class="stat-label">Fraud Flags</div>
          <div class="stat-sub">Requires admin action</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px;">
        <h2 style="margin-bottom: 4px;">Quick Start</h2>
        <p class="text-secondary" style="margin-bottom: 20px;">
          Create a new listing and walk through the full AI-assisted workflow.
        </p>
        <div class="flex gap-3 flex-wrap">
          <a routerLink="/create-listing" class="btn btn-primary" id="dashboard-create-listing">
            ＋ Create New Listing
          </a>
          <a routerLink="/admin-review" class="btn btn-secondary" id="dashboard-admin-review">
            ⊙ Admin Review Queue
          </a>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 16px;">Demo Workflow</h3>
        <p class="text-secondary text-sm" style="margin-bottom: 16px;">
          This is a frontend portfolio demo. Follow the workflow below to explore all four pages.
        </p>
        <ol style="padding-left: 20px; display: flex; flex-direction: column; gap: 10px;">
          <li><a routerLink="/create-listing" class="text-purple">1. Listing Input</a> — Upload images, select category, add optional notes</li>
          <li><a routerLink="/ai-assistant/LS-1042" class="text-purple">2. AI Listing Assistant</a> — AI analyses images and generates listing content</li>
          <li><a routerLink="/fraud-detection/LS-1042" class="text-purple">3. Fraud Detection & Risk Review</a> — Automated screening for fraud signals</li>
          <li><a routerLink="/admin-review/LS-1042" class="text-purple">4. Admin Review & Action</a> — Human decision layer: approve, hold, escalate or remove</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .page-body { padding: 32px; max-width: 1100px; }
    .stat-card { text-align: center; }
    .stat-value { font-size: 2.25rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .stat-label { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-top: 6px; }
    .stat-sub   { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .stat-warning .stat-value { color: var(--amber-600); }
    .stat-danger  .stat-value { color: var(--red-600); }
    a { color: inherit; }
  `],
})
export class DashboardComponent {}
