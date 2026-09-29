import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ProgressStepperComponent, WorkflowStep } from '../../shared/components/progress-stepper/progress-stepper.component';
import { AiAnalysisService } from '../../core/services/ai-analysis.service';
import { ListingService } from '../../core/services/listing.service';
import { ToastService } from '../../core/services/toast.service';
import {
  AiAnalysisResult, AttributeItem, MissingInfoItem, Recommendation,
} from '../../core/models/ai-analysis.model';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent, ProgressStepperComponent],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css',
})
export class AiAssistantComponent implements OnInit {
  listingId = 'LS-1042';
  loading = true;
  loadingStep = 0;
  result: AiAnalysisResult | null = null;
  navigatingToRisk = false;

  // ── Workflow stepper (Page 2 active)
  steps: WorkflowStep[] = [
    { label: 'Add Product',  status: 'complete' },
    { label: 'AI Analysis',  status: 'active'   },
    { label: 'Risk Review',  status: 'pending'  },
    { label: 'Admin Review', status: 'pending'  },
  ];

  // ── Collapsible sections (all primary open by default)
  open: Record<string, boolean> = {
    aiSummary:       true,
    attributes:      true,
    content:         true,
    price:           true,
    missing:         true,
    photos:          true,
    search:          true,
    docs:            true,
    consistency:     true,
    recommendations: true,
    beforeAfter:     false,
    alternatives:    false,
    whyDesc:         false,
    condEdit:        false,
    priceEdit:       false,
  };

  // ── Live editable fields (synced reactive state)
  titleValue = 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones – Black';
  descValue  = '';
  priceValue = 8500;
  condValue  = 'Used – Good';

  titleEdited = false;
  descEdited  = false;
  priceEdited = false;
  condEdited  = false;

  editingTitle = false;
  editingDesc  = false;
  editingPrice = false;
  editingCond  = false;

  condOptions = ['Like New', 'Used – Excellent', 'Used – Good', 'Used – Fair', 'Used – Poor'];

  // ── Attribute editing & evidence expansion
  editingAttrKey: string | null = null;
  attrDraft = '';
  evidenceKey: string | null = null;

  // ── Buyer preview gallery
  galleryIdx = 0;
  readonly gallery = [
    { url: '/images/sony-xm5-hero.jpg',  label: 'Hero Angle' },
    { url: '/images/sony-xm5-side.jpg',  label: 'Side Profile' },
    { url: '/images/sony-xm5-label.jpg', label: 'Label Closeup' },
    { url: '/images/sony-xm5-case.jpg',  label: 'Case & Cables' },
  ];

  // ── Regenerate modal
  showRegenModal = false;
  regenTarget: 'all' | 'title' | 'description' = 'all';
  regenTone: 'professional' | 'concise' | 'detailed' = 'professional';
  regenerating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiService: AiAnalysisService,
    private listingService: ListingService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.listingId = id ?? 'LS-1042';
      this.startAnalysis();
    });
  }

  private startAnalysis(): void {
    this.loading = true;
    this.loadingStep = 1;
    const tick = (step: number, ms: number) => setTimeout(() => this.loadingStep = step, ms);
    tick(2, 350); tick(3, 750); tick(4, 1200);
    setTimeout(() => {
      this.aiService.analyzeListing(this.listingId).subscribe({
        next: r => { this.result = r; this.initEdits(r); this.loading = false; },
        error: () => { this.loading = false; this.toast.error('AI analysis could not be completed.'); },
      });
    }, 1500);
  }

  private initEdits(r: AiAnalysisResult): void {
    this.titleValue = r.content.title.optimized;
    this.descValue  = r.content.description.optimized;
    this.priceValue = r.priceIntelligence.askingPrice;
    this.condValue  = r.productUnderstanding.condition;
  }

  // ── Section toggle
  toggle(k: string): void { this.open[k] = !this.open[k]; }

  // ── Title editing & alternatives
  startEditTitle(): void { this.editingTitle = true; }
  saveTitle(): void {
    if (!this.titleValue.trim()) { this.toast.error('Title cannot be empty.'); return; }
    if (this.result) this.result.content.title.optimized = this.titleValue.trim();
    this.editingTitle = false; this.titleEdited = true; this.toast.success('Title updated.');
  }
  cancelTitle(): void { if (this.result) this.titleValue = this.result.content.title.optimized; this.editingTitle = false; }
  applyAlt(t: string): void {
    this.titleValue = t;
    if (this.result) this.result.content.title.optimized = t;
    this.titleEdited = true;
    this.toast.success('Alternative title applied.');
  }

  // ── Description editing
  startEditDesc(): void { this.editingDesc = true; }
  saveDesc(): void {
    if (!this.descValue.trim()) { this.toast.error('Description cannot be empty.'); return; }
    if (this.result) this.result.content.description.optimized = this.descValue.trim();
    this.editingDesc = false; this.descEdited = true; this.toast.success('Description updated.');
  }
  cancelDesc(): void { if (this.result) this.descValue = this.result.content.description.optimized; this.editingDesc = false; }

  // ── Price editing
  startEditPrice(): void { this.open['priceEdit'] = true; this.editingPrice = true; }
  savePrice(): void {
    const v = Number(this.priceValue);
    if (!v || v <= 0) { this.toast.error('Enter a valid price.'); return; }
    if (this.result) { this.result.priceIntelligence.askingPrice = v; this.recalcPosition(v); }
    this.editingPrice = false; this.priceEdited = true; this.toast.success('Price updated.');
  }
  cancelPrice(): void { if (this.result) this.priceValue = this.result.priceIntelligence.askingPrice; this.editingPrice = false; }
  private recalcPosition(p: number): void {
    if (!this.result) return;
    const pi = this.result.priceIntelligence;
    if (p < pi.marketRangeLow) { pi.pricePosition = 'below'; pi.pricePositionLabel = 'Below typical range'; }
    else if (p > pi.marketRangeHigh) { pi.pricePosition = 'above'; pi.pricePositionLabel = 'Above typical range'; }
    else { pi.pricePosition = 'within'; pi.pricePositionLabel = 'Within typical range'; }
  }

  // ── Condition editing
  saveCondition(val: string): void {
    this.condValue = val;
    if (this.result) {
      this.result.productUnderstanding.condition = val;
      const a = this.result.attributes.find(x => x.key === 'condition');
      if (a) { a.value = val; a.sellerEdited = true; }
    }
    this.condEdited = true; this.open['condEdit'] = false; this.toast.success('Condition updated.');
  }

  // ── Attribute editing
  startEditAttr(a: AttributeItem): void { this.editingAttrKey = a.key; this.attrDraft = a.value ?? ''; }
  saveAttr(a: AttributeItem): void {
    a.value = this.attrDraft.trim() || a.value;
    a.sellerEdited = true;
    this.editingAttrKey = null;
    this.toast.success(`${a.label} updated.`);
  }
  cancelAttr(): void { this.editingAttrKey = null; }
  toggleEvidence(k: string): void { this.evidenceKey = this.evidenceKey === k ? null : k; }

  // ── Missing info actions
  resolveItem(item: MissingInfoItem): void { item.status = 'resolved'; this.toast.success('Information marked as clarified.'); }
  dismissItem(item: MissingInfoItem): void { item.status = 'dismissed'; }

  // ── Recommendations actions
  applyRec(r: Recommendation): void {
    this.aiService.applyRecommendation(this.listingId, r.id).subscribe(recs => {
      if (this.result) this.result.recommendations = recs;
      this.toast.success(`Applied: ${r.title}`);
    });
  }
  dismissRec(r: Recommendation): void {
    this.aiService.dismissRecommendation(this.listingId, r.id).subscribe(recs => {
      if (this.result) this.result.recommendations = recs;
    });
  }

  // ── Gallery navigation
  prevImg(): void { this.galleryIdx = (this.galleryIdx - 1 + this.gallery.length) % this.gallery.length; }
  nextImg(): void { this.galleryIdx = (this.galleryIdx + 1) % this.gallery.length; }
  setImg(i: number): void { this.galleryIdx = i; }

  // ── Regenerate modal
  openRegen(t: 'all' | 'title' | 'description' = 'all'): void { this.regenTarget = t; this.showRegenModal = true; }
  closeRegen(): void { this.showRegenModal = false; }
  execRegen(): void {
    this.regenerating = true;
    setTimeout(() => {
      this.regenerating = false; this.showRegenModal = false;
      if (!this.result) return;
      if (this.regenTarget !== 'description') {
        const tones: Record<string, string> = {
          professional: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones – Black',
          concise:      'Sony WH-1000XM5 Wireless Headphones (Black)',
          detailed:     'Sony WH-1000XM5 Premium Noise Cancelling Bluetooth Over-Ear Headphones – Black (Case & Cables Included)',
        };
        this.titleValue = tones[this.regenTone];
        this.result.content.title.optimized = this.titleValue;
        this.titleEdited = false;
      }
      if (this.regenTarget !== 'title') {
        if (this.regenTone === 'concise') {
          this.descValue = 'Sony WH-1000XM5 wireless headphones in black. Used – Good condition. Includes original travel case, USB-C and 3.5mm cable. 30-hour battery, ANC, clean ear pads.';
        } else {
          this.descValue = this.result.content.description.optimized;
        }
        this.result.content.description.optimized = this.descValue;
        this.descEdited = false;
      }
      this.toast.success(`Content regenerated (${this.regenTone} tone).`);
    }, 600);
  }

  // ── Save changes toast
  saveAllChanges(): void {
    this.toast.success('Listing edits saved successfully.');
  }

  // ── Navigation flow
  back(): void { this.router.navigate(['/create-listing']); }
  approve(): void {
    this.navigatingToRisk = true;
    this.listingService.updateStatus(this.listingId, 'fraud_screening');
    setTimeout(() => this.router.navigate(['/fraud-detection', this.listingId]), 350);
  }

  // ── Helpers
  get anyEdits(): boolean { return this.titleEdited || this.descEdited || this.priceEdited || this.condEdited; }
  get pendingMissing(): number { return this.result?.missingInformation?.filter(m => m.status === 'pending').length ?? 0; }
  get pendingRecs(): Recommendation[] { return this.result?.recommendations.filter(r => r.status === 'pending') ?? []; }

  confClass(c: string): string {
    return c === 'confirmed' ? 'badge-conf' : c === 'likely' ? 'badge-like' : c === 'review' ? 'badge-rev' : 'badge-nd';
  }
  confLabel(c: string): string {
    return c === 'confirmed' ? 'Confirmed' : c === 'likely' ? 'Likely' : c === 'review' ? 'Needs Review' : 'Not Detected';
  }
  pricePosPct(price: number): number {
    if (!this.result) return 50;
    const { marketRangeLow: lo, marketRangeHigh: hi } = this.result.priceIntelligence;
    const band = hi - lo;
    if (price <= lo) return Math.max(5, ((price - (lo - band * 0.5)) / (band * 1.5)) * 100);
    if (price >= hi) return Math.min(95, ((price - lo) / (band * 1.5)) * 100);
    return 30 + ((price - lo) / band) * 40;
  }
}
