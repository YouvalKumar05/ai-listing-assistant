import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'create-listing',
    loadComponent: () =>
      import('./pages/create-listing/create-listing.component').then(m => m.CreateListingComponent),
  },
  {
    path: 'my-listings',
    redirectTo: '',
  },
  {
    path: 'ai-assistant/:id',
    loadComponent: () =>
      import('./pages/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent),
  },
  {
    path: 'ai-assistant',
    redirectTo: 'ai-assistant/LS-1042',
  },
  {
    path: 'fraud-detection/:id',
    loadComponent: () =>
      import('./pages/fraud-detection/fraud-detection.component').then(m => m.FraudDetectionComponent),
  },
  {
    path: 'fraud-detection',
    redirectTo: 'fraud-detection/listing-001',
  },
  {
    path: 'admin-review/:id',
    loadComponent: () =>
      import('./pages/admin-review/admin-review.component').then(m => m.AdminReviewComponent),
  },
  {
    path: 'admin-review',
    redirectTo: 'admin-review/listing-001',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
