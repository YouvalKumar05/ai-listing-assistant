import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FraudDetectionComponent } from './fraud-detection.component';
import { FraudService } from '../../core/services/fraud.service';
import { ListingService } from '../../core/services/listing.service';

describe('FraudDetectionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraudDetectionComponent],
      providers: [
        provideRouter([]),
        FraudService,
        ListingService,
      ],
    }).compileComponents();
  });

  it('should create FraudDetectionComponent', () => {
    const fixture = TestBed.createComponent(FraudDetectionComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should use review-oriented language for severities', () => {
    const fixture = TestBed.createComponent(FraudDetectionComponent);
    const component = fixture.componentInstance;
    expect(component.severityReviewLabel('low')).toBe('Low Concern');
    expect(component.severityReviewLabel('medium')).toBe('Review Required');
    expect(component.severityReviewLabel('high')).toBe('Additional Evidence Recommended');
    expect(component.severityReviewLabel('critical')).toBe('Escalate for Authentication Review');
  });

  it('should format authenticity statuses with review-oriented wording', () => {
    const fixture = TestBed.createComponent(FraudDetectionComponent);
    const component = fixture.componentInstance;
    expect(component.authenticityLabel('additional_evidence_recommended')).toBe('Additional Evidence Recommended');
    expect(component.authenticityLabel('evidence_insufficient')).toBe('Evidence Insufficient');
    expect(component.authenticityLabel('escalate_for_authentication')).toBe('Escalate for Authentication Review');
  });
});
