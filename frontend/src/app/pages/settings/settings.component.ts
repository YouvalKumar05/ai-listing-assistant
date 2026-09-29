import { Component } from '@angular/core';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TopbarComponent],
  template: `
    <app-topbar
      pageTitle="Settings"
      [breadcrumbs]="[{ label: 'Dashboard', route: '/' }, { label: 'Settings' }]"
    ></app-topbar>
    <div class="page-body">
      <div class="card" style="max-width: 540px;">
        <h2 style="margin-bottom: 4px;">Application Settings</h2>
        <p class="text-secondary" style="margin-bottom: 24px;">
          Configuration options for this portfolio demo application.
        </p>
        <div class="setting-row">
          <div>
            <div class="font-semibold text-sm">Theme</div>
            <div class="text-xs text-muted">Light workspace / dark sidebar</div>
          </div>
          <span class="badge badge-neutral">Light</span>
        </div>
        <hr class="divider">
        <div class="setting-row">
          <div>
            <div class="font-semibold text-sm">Backend Integration</div>
            <div class="text-xs text-muted">All data is currently mocked</div>
          </div>
          <span class="badge badge-warning">Mock</span>
        </div>
        <hr class="divider">
        <div class="setting-row">
          <div>
            <div class="font-semibold text-sm">Fraud Score Formula</div>
            <div class="text-xs text-muted">Prototype demo values — not a production formula</div>
          </div>
          <span class="badge badge-info">Demo</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-body { padding: 32px; }
    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
  `],
})
export class SettingsComponent {}
