import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ProgressStepperComponent, WorkflowStep } from '../../shared/components/progress-stepper/progress-stepper.component';
import { StatusBadgeComponent, BadgeType } from '../../shared/components/status-badge/status-badge.component';
import { ListingService } from '../../core/services/listing.service';
import { AiAnalysisService } from '../../core/services/ai-analysis.service';
import { FraudService } from '../../core/services/fraud.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { ListingDraft, ListingStatus } from '../../core/models/listing.model';
import { AiAnalysisResult } from '../../core/models/ai-analysis.model';
import { FraudResult, SignalSeverity, SignalGroup, EvidenceItem } from '../../core/models/fraud.model';
import { ActionType, AuditRecord, ActionConfig, ADMIN_ACTION_CONFIGS } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TopbarComponent,
    ProgressStepperComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-review.component.html',
  styleUrl: './admin-review.component.css',
})
export class AdminReviewComponent implements OnInit {
  listingId = '';
  loading = true;
  submitting = false;

  listingDraft: ListingDraft | null = null;
  aiResult: AiAnalysisResult | null = null;
  fraudResult: FraudResult | null = null;
  auditRecords: AuditRecord[] = [];

  // Selected action state
  selectedAction: ActionType | null = null;
  actionReason = '';
  reasonError = false;
  selectedImageIndex = 0;
  activeEvidenceTab: 'all' | 'image' | 'policy' | 'price' = 'all';

  readonly actionConfigs: ActionConfig[] = ADMIN_ACTION_CONFIGS;

  steps: WorkflowStep[] = [
    { label: 'Listing Input', status: 'complete' },
    { label: 'AI Assistant', status: 'complete' },
    { label: 'Fraud Detection', status: 'complete' },
    { label: 'Admin Review & Action', status: 'active' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    private aiService: AiAnalysisService,
    private fraudService: FraudService,
    private adminService: AdminService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id') ?? 'listing-001';

    // Check if suggested action passed from Page 3
    const queryAction = this.route.snapshot.queryParamMap.get('action') as ActionType | null;
    if (queryAction && this.actionConfigs.some(c => c.type === queryAction)) {
      this.selectedAction = queryAction;
    }

    this.loadData();
  }

  private loadData(): void {
    this.listingService.getListing(this.listingId).subscribe(draft => {
      this.listingDraft = draft;
    });

    this.aiService.analyzeListing(this.listingId).subscribe(ai => {
      this.aiResult = ai;
    });

    this.fraudService.screenListing(this.listingId).subscribe(fraud => {
      this.fraudResult = fraud;
      this.loading = false;
    });

    this.loadAuditHistory();
  }

  private loadAuditHistory(): void {
    this.adminService.getAuditLog(this.listingId).subscribe(records => {
      if (records.length === 0) {
        // Pre-seed an initial intake record if none exists for demo
        this.auditRecords = [
          {
            id: 'audit-init-001',
            listingId: this.listingId,
            actionType: 'hold_for_review',
            actionLabel: 'Automated Screening Flag',
            reason: 'Automated intake flagged lens marking ambiguity and serial visibility. Routed to queue for manual admin decision.',
            reviewerName: 'System Screening Engine',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ];
      } else {
        this.auditRecords = records;
      }
    });
  }

  selectAction(type: ActionType): void {
    this.selectedAction = type;
    this.reasonError = false;
  }

  get currentActionConfig(): ActionConfig | undefined {
    return this.actionConfigs.find(c => c.type === this.selectedAction);
  }

  submitDecision(): void {
    if (!this.selectedAction) {
      this.toast.error('Please select an action to submit.');
      return;
    }

    const config = this.currentActionConfig;
    const trimmedReason = this.actionReason.trim();

    // Enforce Reason Rules:
    // Approve: optional
    // All other actions: reason required
    if (config?.requiresReason && !trimmedReason) {
      this.reasonError = true;
      this.toast.error(`Reason is required for action "${config.label}".`);
      return;
    }

    this.reasonError = false;
    this.submitting = true;

    this.adminService.submitAction({
      listingId: this.listingId,
      actionType: this.selectedAction,
      reason: trimmedReason || 'Approved for publication without additional notes.',
      reviewerId: 'rev-042',
      reviewerName: 'Admin Reviewer (You)',
      timestamp: new Date().toISOString(),
    }).subscribe({
      next: (record) => {
        this.submitting = false;
        this.auditRecords.unshift(record);

        // Update listing status in service
        let newStatus: ListingStatus = 'pending_admin';
        if (this.selectedAction === 'approve') newStatus = 'approved';
        else if (this.selectedAction === 'hold_for_review') newStatus = 'held';
        else if (this.selectedAction === 'restrict_remove') newStatus = 'removed';

        this.listingService.updateStatus(this.listingId, newStatus);
        if (this.listingDraft) {
          this.listingDraft = { ...this.listingDraft, status: newStatus };
        }

        this.toast.success(`Action applied successfully: ${record.actionLabel}`);
        // Reset form
        this.actionReason = '';
      },
      error: () => {
        this.submitting = false;
        this.toast.error('Failed to submit administrative decision.');
      },
    });
  }

  severityReviewLabel(severity: SignalSeverity): string {
    switch (severity) {
      case 'low': return 'Low Concern';
      case 'medium': return 'Review Required';
      case 'high': return 'Additional Evidence Recommended';
      case 'critical': return 'Escalate for Authentication Review';
      default: return 'Review Required';
    }
  }

  severityBadgeType(severity: SignalSeverity): BadgeType {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'purple';
      default: return 'neutral';
    }
  }

  statusBadgeType(status?: ListingStatus): BadgeType {
    switch (status) {
      case 'approved': return 'success';
      case 'held': return 'warning';
      case 'removed': return 'danger';
      case 'pending_admin': return 'purple';
      default: return 'neutral';
    }
  }

  statusDisplayLabel(status?: ListingStatus): string {
    switch (status) {
      case 'approved': return 'Approved & Published';
      case 'held': return 'On Hold for Review';
      case 'removed': return 'Restricted / Removed';
      case 'pending_admin': return 'Under Admin Review';
      default: return 'Pending Review';
    }
  }

  scoreColor(score: number): string {
    if (score < 40) return 'var(--green-600)';
    if (score < 70) return 'var(--amber-600)';
    return 'var(--red-600)';
  }

  formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }
}
