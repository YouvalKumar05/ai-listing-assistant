import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ProgressStepperComponent, WorkflowStep } from '../../shared/components/progress-stepper/progress-stepper.component';
import { StatusBadgeComponent, BadgeType } from '../../shared/components/status-badge/status-badge.component';
import { FraudService } from '../../core/services/fraud.service';
import { ListingService } from '../../core/services/listing.service';
import { ToastService } from '../../core/services/toast.service';
import { FraudResult, SignalGroup, FraudSignal, EvidenceItem, SignalSeverity, AuthenticityStatus } from '../../core/models/fraud.model';
import { ListingDraft } from '../../core/models/listing.model';

@Component({
  selector: 'app-fraud-detection',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    ProgressStepperComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './fraud-detection.component.html',
  styleUrl: './fraud-detection.component.css',
})
export class FraudDetectionComponent implements OnInit {
  listingId = '';
  loading = true;
  fraudResult: FraudResult | null = null;
  listingDraft: ListingDraft | null = null;
  selectedEvidenceId: string | null = null;
  selectedImageIndex = 0;
  evidenceFilter: 'all' | 'image' | 'text' | 'metadata' | 'price' = 'all';

  steps: WorkflowStep[] = [
    { label: 'Listing Input', status: 'complete' },
    { label: 'AI Assistant', status: 'complete' },
    { label: 'Fraud Detection & Risk Review', status: 'active' },
    { label: 'Admin Review & Action', status: 'pending' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fraudService: FraudService,
    private listingService: ListingService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id') ?? 'listing-001';

    this.listingService.getListing(this.listingId).subscribe(draft => {
      this.listingDraft = draft;
    });

    this.fraudService.screenListing(this.listingId).subscribe({
      next: (result) => {
        this.fraudResult = result;
        this.loading = false;
        this.listingService.updateStatus(this.listingId, 'fraud_complete');
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load fraud screening results.');
      },
    });
  }

  selectEvidence(evidence: EvidenceItem): void {
    this.selectedEvidenceId = evidence.id;
    if (evidence.imageIndex !== undefined) {
      this.selectedImageIndex = evidence.imageIndex;
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
    const match = this.fraudResult?.evidenceItems.find(e => e.imageIndex === index);
    if (match) {
      this.selectedEvidenceId = match.id;
    }
  }

  get filteredEvidenceItems(): EvidenceItem[] {
    if (!this.fraudResult) return [];
    if (this.evidenceFilter === 'all') return this.fraudResult.evidenceItems;
    return this.fraudResult.evidenceItems.filter(e => e.sourceType === this.evidenceFilter);
  }

  /** Convert technical severities into strictly review-oriented human language */
  severityReviewLabel(severity: SignalSeverity): string {
    switch (severity) {
      case 'low':
        return 'Low Concern';
      case 'medium':
        return 'Review Required';
      case 'high':
        return 'Additional Evidence Recommended';
      case 'critical':
        return 'Escalate for Authentication Review';
      default:
        return 'Review Required';
    }
  }

  severityBadgeType(severity: SignalSeverity): BadgeType {
    switch (severity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'critical':
        return 'purple';
      default:
        return 'neutral';
    }
  }

  authenticityLabel(status: AuthenticityStatus): string {
    switch (status) {
      case 'evidence_sufficient':
        return 'Evidence Sufficient';
      case 'evidence_insufficient':
        return 'Evidence Insufficient';
      case 'additional_evidence_recommended':
        return 'Additional Evidence Recommended';
      case 'escalate_for_authentication':
        return 'Escalate for Authentication Review';
      default:
        return 'Review Required';
    }
  }

  authenticityBadgeType(status: AuthenticityStatus): BadgeType {
    switch (status) {
      case 'evidence_sufficient':
        return 'success';
      case 'additional_evidence_recommended':
        return 'warning';
      case 'evidence_insufficient':
        return 'danger';
      case 'escalate_for_authentication':
        return 'purple';
      default:
        return 'warning';
    }
  }

  scoreColor(score: number): string {
    if (score < 40) return 'var(--green-600)';
    if (score < 70) return 'var(--amber-600)';
    return 'var(--red-600)';
  }

  onRequestMoreInfo(): void {
    this.toast.info('Forwarding recommendation: Request More Information to Admin Review.');
    this.navigateToAdminReview('request_more_information');
  }

  onHoldForReview(): void {
    this.toast.warning('Forwarding recommendation: Hold for Review to Admin Review.');
    this.navigateToAdminReview('hold_for_review');
  }

  onEscalateAuth(): void {
    this.toast.info('Forwarding recommendation: Escalate Authentication to Admin Review.');
    this.navigateToAdminReview('escalate_authentication');
  }

  navigateToAdminReview(suggestedAction?: string): void {
    this.router.navigate(['/admin-review', this.listingId], {
      queryParams: suggestedAction ? { action: suggestedAction } : undefined,
    });
  }
}
