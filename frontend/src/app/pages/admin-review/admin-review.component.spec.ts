import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminReviewComponent } from './admin-review.component';
import { ListingService } from '../../core/services/listing.service';
import { AiAnalysisService } from '../../core/services/ai-analysis.service';
import { FraudService } from '../../core/services/fraud.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';

describe('AdminReviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewComponent],
      providers: [
        provideRouter([]),
        ListingService,
        AiAnalysisService,
        FraudService,
        AdminService,
        ToastService,
      ],
    }).compileComponents();
  });

  it('should create AdminReviewComponent', () => {
    const fixture = TestBed.createComponent(AdminReviewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should require reason for Hold for Review, Request More Information, Escalate, and Restrict', () => {
    const fixture = TestBed.createComponent(AdminReviewComponent);
    const component = fixture.componentInstance;

    component.selectAction('hold_for_review');
    component.actionReason = '';
    component.submitDecision();
    expect(component.reasonError).toBe(true);

    component.selectAction('request_more_information');
    component.actionReason = '';
    component.submitDecision();
    expect(component.reasonError).toBe(true);

    component.selectAction('escalate_authentication');
    component.actionReason = '';
    component.submitDecision();
    expect(component.reasonError).toBe(true);

    component.selectAction('restrict_remove');
    component.actionReason = '';
    component.submitDecision();
    expect(component.reasonError).toBe(true);
  });

  it('should allow Approve without requiring a reason', () => {
    const fixture = TestBed.createComponent(AdminReviewComponent);
    const component = fixture.componentInstance;

    component.selectAction('approve');
    component.actionReason = '';
    component.submitDecision();
    expect(component.reasonError).toBe(false);
  });
});
