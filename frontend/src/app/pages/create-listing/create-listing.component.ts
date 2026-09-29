import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ProgressStepperComponent, WorkflowStep } from '../../shared/components/progress-stepper/progress-stepper.component';
import { ListingService } from '../../core/services/listing.service';
import { ToastService } from '../../core/services/toast.service';
import { ImageFile, SupportingDocument } from '../../core/models/listing.model';

/* ------------------------------------------------------------------ */
/*  Category taxonomy                                                   */
/* ------------------------------------------------------------------ */
interface CategoryGroup {
  group: string;
  children: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: 'Electronics',
    children: [
      'Electronics > Cameras & Photography > DSLR Cameras',
      'Electronics > Cameras & Photography > Mirrorless Cameras',
      'Electronics > Cameras & Photography > Point & Shoot',
      'Electronics > Cameras & Photography > Film Cameras',
      'Electronics > Cameras & Photography > Camera Lenses',
      'Electronics > Cameras & Photography > Accessories',
      'Electronics > Computers > Laptops',
      'Electronics > Computers > Desktops',
      'Electronics > Computers > Accessories',
      'Electronics > Mobile Phones',
      'Electronics > Tablets',
      'Electronics > Audio > Headphones',
      'Electronics > Audio > Speakers',
      'Electronics > Audio > Earphones',
      'Electronics > Gaming',
      'Electronics > TV & Home Theatre',
    ],
  },
  {
    group: 'Fashion',
    children: [
      'Fashion > Men > Clothing',
      'Fashion > Men > Shoes',
      'Fashion > Men > Accessories',
      'Fashion > Men > Watches',
      'Fashion > Women > Clothing',
      'Fashion > Women > Shoes',
      'Fashion > Women > Accessories',
      'Fashion > Women > Watches',
      'Fashion > Handbags',
      'Fashion > Sunglasses',
      'Fashion > Jewellery',
    ],
  },
  {
    group: 'Home & Garden',
    children: [
      'Home & Garden > Furniture',
      'Home & Garden > Kitchen',
      'Home & Garden > Home Decor',
      'Home & Garden > Garden',
      'Home & Garden > Lighting',
      'Home & Garden > Appliances',
    ],
  },
  {
    group: 'Sports',
    children: [
      'Sports > Fitness Equipment',
      'Sports > Outdoor & Adventure',
      'Sports > Cycling',
      'Sports > Cricket',
      'Sports > Football',
      'Sports > Other Sports Equipment',
    ],
  },
  {
    group: 'Collectibles',
    children: [
      'Collectibles > Trading Cards',
      'Collectibles > Memorabilia',
      'Collectibles > Antiques',
      'Collectibles > Coins & Currency',
      'Collectibles > Art',
    ],
  },
  {
    group: 'Books & Media',
    children: [
      'Books & Media > Fiction',
      'Books & Media > Non-Fiction',
      'Books & Media > Academic',
      'Books & Media > Comics & Manga',
      'Books & Media > Music',
      'Books & Media > Movies & TV',
    ],
  },
];

const DOCUMENT_TYPES = [
  'Purchase Invoice',
  'Retail Bill / Receipt',
  'E-commerce Order Invoice',
  'Order Confirmation',
  'Warranty Card',
  'Certificate of Authenticity',
  'Other Supporting Document',
];

const BUSINESS_DOC_TYPES = [
  'Business Registration',
  'GST Registration',
  'Other Business Document',
];

/* ------------------------------------------------------------------ */
/*  Analysis steps for loading state                                    */
/* ------------------------------------------------------------------ */
interface AnalysisStep {
  label: string;
  status: 'done' | 'active' | 'pending';
}

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TopbarComponent,
    ProgressStepperComponent,
  ],
  template: `
    <!-- ============================================================ -->
    <!-- TOPBAR                                                        -->
    <!-- ============================================================ -->
    <app-topbar
      persona="seller"
      [breadcrumbs]="[{ label: 'Dashboard', route: '/' }, { label: 'Create Listing' }]"
    ></app-topbar>

    <!-- ============================================================ -->
    <!-- ANALYSIS OVERLAY                                              -->
    <!-- ============================================================ -->
    @if (analyzing) {
      <div class="analysis-overlay" role="status" aria-live="polite" aria-label="Analyzing your listing">
        <div class="analysis-card">
          <div class="analysis-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21L12 18.27L6.82 21L8 14.14L3 9.27L9.91 8.26L12 2Z"
                fill="#7c3aed" stroke="#7c3aed" stroke-width="1" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="analysis-title">Analyzing your listing...</h2>
          <p class="analysis-subtitle">Please wait while the AI prepares your listing.</p>
          <div class="analysis-steps">
            @for (step of analysisSteps; track step.label) {
              <div class="analysis-step" [class]="'step-' + step.status">
                <div class="step-dot">
                  @if (step.status === 'done') {
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  } @else if (step.status === 'active') {
                    <div class="pulse-dot"></div>
                  }
                </div>
                <span>{{ step.label }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- ============================================================ -->
    <!-- PAGE BODY                                                     -->
    <!-- ============================================================ -->
    <div class="cl-body">

      <!-- PAGE HEADER ------------------------------------------------ -->
      <div class="cl-page-header">
        <div class="cl-page-title-row">
          <div class="cl-page-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="1.5" width="13" height="17" rx="2" stroke="#7c3aed" stroke-width="1.7"/>
              <path d="M7 7h6M7 10.5h6M7 14h4" stroke="#7c3aed" stroke-width="1.7" stroke-linecap="round"/>
              <circle cx="17" cy="17" r="4.5" fill="#7c3aed"/>
              <path d="M17 14.5v2.5l1.5 1.5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 class="cl-page-title">Create Listing</h1>
            <p class="cl-page-subtitle">Add your product and let the AI assistant prepare the listing.</p>
          </div>
        </div>
      </div>

      <!-- WORKFLOW STEPPER ------------------------------------------- -->
      <div class="cl-stepper-row">
        <app-progress-stepper [steps]="workflowSteps"></app-progress-stepper>
      </div>

      <form [formGroup]="form" (ngSubmit)="onAnalyze()" novalidate>

        <!-- TWO-COLUMN GRID ------------------------------------------ -->
        <div class="cl-grid">

          <!-- ====================================================== -->
          <!-- LEFT: PRODUCT PHOTOS                                    -->
          <!-- ====================================================== -->
          <section class="card cl-section" aria-labelledby="photos-heading">
            <div class="cl-section-header">
              <div class="cl-section-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="5.5" cy="7" r="1.5" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M1 10l3.5-3 3 2.5 2.5-2 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 class="cl-section-title" id="photos-heading">Product Photos</h2>
                <p class="cl-section-subtitle">Upload clear photos of your product. You can add up to 5 photos.</p>
              </div>
            </div>

            <!-- Drop zone -->
            <div
              class="drop-zone"
              [class.drag-over]="dragging"
              [class.has-images]="photos.length > 0"
              (dragover)="onDragOver($event)"
              (dragleave)="dragging = false"
              (drop)="onDrop($event)"
              (click)="photoInput.click()"
              role="button"
              tabindex="0"
              aria-label="Upload product photos. Click or drag and drop."
              (keydown.enter)="photoInput.click()"
              (keydown.space)="photoInput.click()"
              id="photo-dropzone"
            >
              <input
                #photoInput
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                style="display:none"
                (change)="onPhotoSelect($event)"
                id="photo-file-input"
                aria-label="Select product photos"
              >

              @if (photos.length === 0) {
                <div class="drop-placeholder">
                  <div class="drop-upload-icon" aria-hidden="true">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 24V12M18 12l-4 4M18 12l4 4" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 26c-2.76 0-5-2.24-5-5 0-2.48 1.81-4.55 4.2-4.93A7 7 0 0 1 18 11a7 7 0 0 1 10.8 5.07C31.19 16.45 33 18.52 33 21c0 2.76-2.24 5-5 5H8z" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="drop-text-primary">Upload product photos</div>
                  <div class="drop-text-secondary">Drag &amp; drop or click to browse</div>
                  <div class="drop-text-hint">PNG, JPG up to 10 MB</div>
                </div>
              } @else {
                <div class="drop-add-more">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round"/></svg>
                  <span>Add more photos ({{ photos.length }}/5)</span>
                </div>
              }
            </div>

            <!-- Photo error -->
            @if (showPhotoError) {
              <div class="field-error" role="alert" id="photo-error">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                {{ photoError }}
              </div>
            }

            <!-- Thumbnails -->
            @if (photos.length > 0) {
              <div class="thumbnail-strip" role="list" aria-label="Uploaded photos">
                @for (photo of photos; track photo.id; let i = $index) {
                  <div class="thumbnail-item" [class.is-cover]="i === 0" role="listitem">
                    <img [src]="photo.previewUrl" [alt]="'Product photo ' + (i + 1)" loading="lazy">
                    @if (i === 0) {
                      <div class="cover-badge" aria-label="Cover photo">Cover</div>
                    }
                    <button
                      type="button"
                      class="thumb-remove"
                      (click)="removePhoto(i)"
                      [attr.aria-label]="'Remove photo ' + (i + 1)"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                    </button>
                  </div>
                }
                @if (photos.length < 5) {
                  <button
                    type="button"
                    class="thumb-add-more"
                    (click)="photoInput.click()"
                    aria-label="Add more photos"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    <span>Add more</span>
                  </button>
                }
              </div>
              <p class="photo-count-text">{{ photos.length }} photo{{ photos.length > 1 ? 's' : '' }} uploaded (up to 5)</p>
            }
          </section>

          <!-- ====================================================== -->
          <!-- RIGHT: LISTING DETAILS                                  -->
          <!-- ====================================================== -->
          <section class="card cl-section" aria-labelledby="details-heading">
            <div class="cl-section-header">
              <div class="cl-section-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h2 class="cl-section-title" id="details-heading">Listing Details</h2>
                <p class="cl-section-subtitle">Provide the key information for your listing.</p>
              </div>
            </div>

            <!-- CATEGORY -->
            <div class="form-group">
              <label class="form-label" for="category">
                Category <span class="required-mark" aria-label="required">*</span>
              </label>
              <select
                id="category"
                class="form-control"
                formControlName="category"
                aria-required="true"
                aria-describedby="category-hint"
              >
                <option value="">Select category</option>
                @for (grp of categoryGroups; track grp.group) {
                  <optgroup [label]="grp.group">
                    @for (cat of grp.children; track cat) {
                      <option [value]="cat">{{ getCategoryLabel(cat) }}</option>
                    }
                  </optgroup>
                }
              </select>
              <p class="field-hint" id="category-hint">Choose the category that best matches your product.</p>
              @if (f['category'].invalid && f['category'].touched) {
                <div class="field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  Please select a category.
                </div>
              }
            </div>

            <!-- SELLING PRICE -->
            <div class="form-group">
              <label class="form-label" for="sellingPrice">
                Your Selling Price <span class="required-mark" aria-label="required">*</span>
              </label>
              <div class="price-input-wrapper">
                <span class="price-prefix" aria-hidden="true">₹</span>
                <input
                  id="sellingPrice"
                  type="number"
                  class="form-control price-input"
                  formControlName="sellingPrice"
                  placeholder="0"
                  min="0.01"
                  step="1"
                  aria-required="true"
                  aria-describedby="price-hint"
                >
              </div>
              <p class="field-hint" id="price-hint">AI will compare your price with similar products.</p>
              @if (f['sellingPrice'].invalid && f['sellingPrice'].touched) {
                <div class="field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  @if (f['sellingPrice'].errors?.['required']) {
                    Please enter your selling price.
                  } @else {
                    Enter a valid price greater than ₹0.
                  }
                </div>
              }
            </div>

            <!-- SELLER NOTES -->
            <div class="form-group">
              <label class="form-label" for="sellerNotes">
                Seller Notes
                <span class="optional-tag">Optional</span>
              </label>
              <textarea
                id="sellerNotes"
                class="form-control"
                formControlName="sellerNotes"
                placeholder="Add anything you want the AI to know about the product..."
                rows="4"
                maxlength="500"
                aria-describedby="notes-hint notes-counter"
              ></textarea>
              <div class="notes-footer">
                <p class="field-hint" id="notes-hint">Optional context helps the AI understand your product.</p>
                <span class="char-counter" id="notes-counter" [class.near-limit]="notesLength > 450">
                  {{ notesLength }}/500
                </span>
              </div>
              @if (f['sellerNotes'].invalid && f['sellerNotes'].touched) {
                <div class="field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  Maximum 500 characters allowed.
                </div>
              }
            </div>
          </section>
        </div>
        <!-- end cl-grid -->

        <!-- ============================================================ -->
        <!-- SUPPORTING PRODUCT DOCUMENTS                                 -->
        <!-- ============================================================ -->
        <section class="card cl-section-full" aria-labelledby="docs-heading">
          <div class="cl-section-header">
            <div class="cl-section-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M5 5h5M5 8h5M5 11h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="cl-section-header-text">
              <div class="cl-section-title-row">
                <h2 class="cl-section-title" id="docs-heading">Supporting Product Documents</h2>
                <span class="optional-badge">Optional</span>
              </div>
              <p class="cl-section-subtitle">Upload any available documents related to the product. They may help verify product details and support later authenticity review.</p>
            </div>
          </div>

          <!-- Uploaded documents list -->
          @if (supportingDocs.length > 0) {
            <div class="docs-list" role="list" aria-label="Uploaded supporting documents">
              @for (doc of supportingDocs; track doc.id; let i = $index) {
                <div class="doc-item" role="listitem">
                  <div class="doc-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="#7c3aed" stroke-width="1.4"/>
                      <path d="M5 5h5M5 8h5M5 11h3" stroke="#7c3aed" stroke-width="1.3" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="doc-info">
                    <span class="doc-type">{{ doc.type }}</span>
                    <span class="doc-name">{{ doc.fileName }}</span>
                    <span class="doc-size">{{ formatFileSize(doc.fileSize) }}</span>
                  </div>
                  <button
                    type="button"
                    class="doc-remove"
                    (click)="removeDoc(i)"
                    [attr.aria-label]="'Remove ' + doc.fileName"
                  >Remove</button>
                </div>
              }
            </div>
          }

          <!-- Add document form -->
          @if (showDocForm || supportingDocs.length === 0) {
            <div class="doc-add-form">
              <!-- Document type -->
              <div class="doc-form-row">
                <div class="form-group doc-type-group">
                  <label class="form-label" for="docType">Document Type</label>
                  <select id="docType" class="form-control" [value]="pendingDocType" (change)="pendingDocType = $any($event.target).value">
                    <option value="">Select document type</option>
                    @for (dt of documentTypes; track dt) {
                      <option [value]="dt">{{ dt }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Document upload -->
              <div
                class="doc-drop-zone"
                [class.drag-over]="docDragging"
                (dragover)="onDocDragOver($event)"
                (dragleave)="docDragging = false"
                (drop)="onDocDrop($event)"
                (click)="docInput.click()"
                role="button"
                tabindex="0"
                aria-label="Upload supporting document. Click or drag and drop."
                (keydown.enter)="docInput.click()"
                (keydown.space)="docInput.click()"
                id="doc-dropzone"
              >
                <input
                  #docInput
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  style="display:none"
                  (change)="onDocSelect($event)"
                  id="doc-file-input"
                  aria-label="Select supporting document"
                >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12V5M9 5l-3 3M9 5l3 3" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3.5 13.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.24.9-2.28 2.1-2.47A3.5 3.5 0 0 1 9 5.5a3.5 3.5 0 0 1 5.4 3.03C15.6 8.72 16.5 9.76 16.5 11c0 1.38-1.12 2.5-2.5 2.5H3.5z" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="doc-drop-text">Drag &amp; drop or click to browse</span>
                <span class="doc-drop-hint">JPG, PNG, PDF</span>
              </div>

              @if (docError) {
                <div class="field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  {{ docError }}
                </div>
              }
            </div>
          }

          <!-- Add another document button -->
          @if (supportingDocs.length > 0 && !showDocForm) {
            <button
              type="button"
              class="add-doc-btn"
              (click)="showDocForm = true"
              id="add-another-doc-btn"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              Add another document
            </button>
          }

          <p class="docs-helper-text">
            Examples include a purchase invoice, retail receipt, online order invoice, warranty card or authenticity certificate.
            Providing a document is optional. Available documents may help the system verify product information later.
          </p>
        </section>

        <!-- ============================================================ -->
        <!-- SELLER TYPE                                                   -->
        <!-- ============================================================ -->
        <section class="card cl-section-full seller-type-section" aria-labelledby="seller-type-heading">
          <h2 class="cl-section-title" id="seller-type-heading">Seller Type</h2>
          <div class="seller-type-options" role="radiogroup" aria-labelledby="seller-type-heading">
            <label class="radio-option" [class.selected]="sellerTypeValue === 'individual'">
              <input
                type="radio"
                name="sellerType"
                value="individual"
                formControlName="sellerType"
                id="seller-individual"
              >
              <div class="radio-content">
                <div class="radio-dot"></div>
                <div>
                  <div class="radio-label">Individual</div>
                  <div class="radio-hint">Personal seller</div>
                </div>
              </div>
            </label>
            <label class="radio-option" [class.selected]="sellerTypeValue === 'business'">
              <input
                type="radio"
                name="sellerType"
                value="business"
                formControlName="sellerType"
                id="seller-business"
              >
              <div class="radio-content">
                <div class="radio-dot"></div>
                <div>
                  <div class="radio-label">Business</div>
                  <div class="radio-hint">Registered business or GST holder</div>
                </div>
              </div>
            </label>
          </div>

          <!-- Business verification (conditional) -->
          @if (sellerTypeValue === 'business') {
            <div class="business-doc-section" aria-label="Business verification document">
              <div class="business-doc-header">
                <h3 class="business-doc-title">Business Verification Document</h3>
                <span class="optional-badge">Optional</span>
              </div>
              <p class="cl-section-subtitle">Upload a relevant business document if available.</p>

              <div class="form-group" style="max-width: 340px;">
                <label class="form-label" for="businessDocType">Document Type</label>
                <select
                  id="businessDocType"
                  class="form-control"
                  formControlName="businessDocType"
                >
                  <option value="">Select business document type</option>
                  @for (bt of businessDocTypes; track bt) {
                    <option [value]="bt">{{ bt }}</option>
                  }
                </select>
              </div>

              @if (!businessDoc) {
                <div
                  class="doc-drop-zone"
                  [class.drag-over]="bizDocDragging"
                  (dragover)="onBizDocDragOver($event)"
                  (dragleave)="bizDocDragging = false"
                  (drop)="onBizDocDrop($event)"
                  (click)="bizDocInput.click()"
                  role="button"
                  tabindex="0"
                  aria-label="Upload business document. Click or drag and drop."
                  (keydown.enter)="bizDocInput.click()"
                  (keydown.space)="bizDocInput.click()"
                  id="biz-doc-dropzone"
                >
                  <input
                    #bizDocInput
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    style="display:none"
                    (change)="onBizDocSelect($event)"
                    id="biz-doc-file-input"
                    aria-label="Select business verification document"
                  >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12V5M9 5l-3 3M9 5l3 3" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.5 13.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.24.9-2.28 2.1-2.47A3.5 3.5 0 0 1 9 5.5a3.5 3.5 0 0 1 5.4 3.03C15.6 8.72 16.5 9.76 16.5 11c0 1.38-1.12 2.5-2.5 2.5H3.5z" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="doc-drop-text">Upload Business Document</span>
                  <span class="doc-drop-hint">JPG, PNG, PDF</span>
                </div>
              } @else {
                <div class="doc-item">
                  <div class="doc-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="10" height="13" rx="1.5" stroke="#7c3aed" stroke-width="1.4"/><path d="M5 5h5M5 8h5M5 11h3" stroke="#7c3aed" stroke-width="1.3" stroke-linecap="round"/></svg>
                  </div>
                  <div class="doc-info">
                    <span class="doc-type">{{ businessDoc.type || 'Business Document' }}</span>
                    <span class="doc-name">{{ businessDoc.fileName }}</span>
                    <span class="doc-size">{{ formatFileSize(businessDoc.fileSize) }}</span>
                  </div>
                  <button type="button" class="doc-remove" (click)="businessDoc = null" aria-label="Remove business document">Remove</button>
                </div>
              }

              @if (bizDocError) {
                <div class="field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  {{ bizDocError }}
                </div>
              }
            </div>
          }
        </section>

        <!-- ============================================================ -->
        <!-- WHAT HAPPENS NEXT                                            -->
        <!-- ============================================================ -->
        <div class="what-next-banner" role="note" aria-label="What happens next">
          <div class="what-next-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 1L10.8 6.3H16.5L11.9 9.7L13.6 15L9 11.7L4.4 15L6.1 9.7L1.5 6.3H7.2L9 1Z" fill="#7c3aed" stroke="#7c3aed" stroke-width="0.8" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="what-next-body">
            <div class="what-next-title">What happens next?</div>
            <p class="what-next-text">Our AI will analyze your product, generate listing content, identify important details, compare pricing information and prepare the listing for review.</p>
            <div class="what-next-steps" aria-label="Workflow steps">
              <div class="wn-step wn-active">
                <span class="wn-num">1</span>
                <span class="wn-label">Add Product</span>
              </div>
              <div class="wn-connector" aria-hidden="true"></div>
              <div class="wn-step">
                <span class="wn-num">2</span>
                <span class="wn-label">AI Analysis</span>
              </div>
              <div class="wn-connector" aria-hidden="true"></div>
              <div class="wn-step">
                <span class="wn-num">3</span>
                <span class="wn-label">Risk Review</span>
              </div>
              <div class="wn-connector" aria-hidden="true"></div>
              <div class="wn-step">
                <span class="wn-num">4</span>
                <span class="wn-label">Admin Review</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- BOTTOM ACTIONS                                               -->
        <!-- ============================================================ -->
        <div class="cl-actions">
          <button
            type="button"
            class="btn btn-secondary"
            id="clear-listing-btn"
            (click)="onClear()"
          >
            Clear
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            id="analyze-listing-btn"
            [disabled]="analyzing"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1.5L9.4 5.6H13.8L10.4 8.1L11.8 12.2L8 9.7L4.2 12.2L5.6 8.1L2.2 5.6H6.6L8 1.5Z" fill="white" stroke="white" stroke-width="0.6" stroke-linejoin="round"/>
            </svg>
            Analyze Listing
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

      </form>
    </div>
    <!-- end cl-body -->
  `,
  styles: [`
    /* ============================================================ */
    /* PAGE LAYOUT                                                   */
    /* ============================================================ */
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .cl-body {
      flex: 1;
      padding: 28px 32px 48px;
      max-width: 1200px;
      width: 100%;
    }

    /* ============================================================ */
    /* PAGE HEADER                                                   */
    /* ============================================================ */
    .cl-page-header {
      margin-bottom: 24px;
    }

    .cl-page-title-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .cl-page-icon {
      width: 48px;
      height: 48px;
      background: var(--purple-50);
      border: 1px solid var(--purple-100);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cl-page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
      margin-bottom: 4px;
    }

    .cl-page-subtitle {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ============================================================ */
    /* STEPPER                                                       */
    /* ============================================================ */
    .cl-stepper-row {
      margin-bottom: 28px;
      background: var(--surface-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 20px 28px;
    }

    /* ============================================================ */
    /* SECTION SHARED                                                */
    /* ============================================================ */
    .cl-section-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 20px;
    }

    .cl-section-header-text {
      flex: 1;
    }

    .cl-section-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .cl-section-icon {
      width: 32px;
      height: 32px;
      background: var(--purple-50);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--purple-500);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cl-section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
    }

    .cl-section-subtitle {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ============================================================ */
    /* GRID                                                          */
    /* ============================================================ */
    .cl-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
      align-items: start;
    }

    .cl-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cl-section-full {
      margin-bottom: 20px;
    }

    /* ============================================================ */
    /* PHOTO UPLOAD                                                  */
    /* ============================================================ */
    .drop-zone {
      border: 2px dashed var(--border-medium);
      border-radius: var(--radius-md);
      padding: 32px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color var(--transition-fast), background var(--transition-fast);
      background: var(--surface-100);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 140px;
      outline: none;
    }

    .drop-zone:hover,
    .drop-zone.drag-over {
      border-color: var(--purple-400);
      background: var(--purple-50);
    }

    .drop-zone:focus-visible {
      outline: 2px solid var(--purple-500);
      outline-offset: 2px;
    }

    .drop-zone.has-images {
      padding: 14px 20px;
      min-height: unset;
    }

    .drop-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .drop-upload-icon {
      margin-bottom: 4px;
    }

    .drop-text-primary {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .drop-text-secondary {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .drop-text-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .drop-add-more {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--purple-600);
    }

    /* Thumbnails */
    .thumbnail-strip {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .thumbnail-item {
      position: relative;
      width: 84px;
      height: 84px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 2px solid var(--border-light);
      background: var(--surface-200);
      flex-shrink: 0;
      transition: border-color var(--transition-fast);
    }

    .thumbnail-item.is-cover {
      border-color: var(--purple-400);
    }

    .thumbnail-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-badge {
      position: absolute;
      top: 4px;
      left: 4px;
      background: var(--purple-500);
      color: #fff;
      font-size: 0.625rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .thumb-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      background: rgba(15, 23, 42, 0.75);
      color: #fff;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast);
      opacity: 0;
    }

    .thumbnail-item:hover .thumb-remove {
      opacity: 1;
    }

    .thumb-remove:focus-visible {
      opacity: 1;
      outline: 2px solid var(--purple-400);
    }

    .thumb-add-more {
      width: 84px;
      height: 84px;
      border-radius: var(--radius-md);
      border: 2px dashed var(--border-medium);
      background: var(--surface-100);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: var(--text-muted);
      font-size: 0.6875rem;
      font-weight: 500;
      transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
    }

    .thumb-add-more:hover {
      border-color: var(--purple-400);
      color: var(--purple-500);
      background: var(--purple-50);
    }

    .photo-count-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* ============================================================ */
    /* FORM FIELDS                                                   */
    /* ============================================================ */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .required-mark {
      color: var(--red-600);
      font-size: 0.875rem;
    }

    .optional-tag {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
      background: var(--surface-200);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    .optional-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--surface-200);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--text-primary);
      background: var(--surface-50);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none;
    }

    .form-control:focus {
      border-color: var(--purple-400);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
    }

    .form-control.ng-invalid.ng-touched {
      border-color: var(--red-400);
    }

    select.form-control {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 40px;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .price-input-wrapper {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      background: var(--surface-50);
    }

    .price-input-wrapper:focus-within {
      border-color: var(--purple-400);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
    }

    .price-prefix {
      padding: 0 12px;
      background: var(--surface-200);
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 600;
      border-right: 1px solid var(--border-medium);
      height: 100%;
      display: flex;
      align-items: center;
      align-self: stretch;
    }

    .price-input {
      border: none !important;
      box-shadow: none !important;
      border-radius: 0;
      background: transparent;
      flex: 1;
    }

    .price-input:focus {
      border: none !important;
      box-shadow: none !important;
    }

    /* Remove number input arrows */
    .price-input::-webkit-outer-spin-button,
    .price-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .price-input[type=number] {
      -moz-appearance: textfield;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .field-error {
      font-size: 0.8125rem;
      color: var(--red-600);
      display: flex;
      align-items: center;
      gap: 5px;
      line-height: 1.4;
    }

    .notes-footer {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .char-counter {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .char-counter.near-limit {
      color: var(--amber-600);
      font-weight: 500;
    }

    /* ============================================================ */
    /* SUPPORTING DOCS                                               */
    /* ============================================================ */
    .docs-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: var(--surface-100);
    }

    .doc-icon {
      flex-shrink: 0;
    }

    .doc-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .doc-type {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .doc-name {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .doc-size {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .doc-remove {
      font-size: 0.8125rem;
      color: var(--red-600);
      background: none;
      border: 1px solid var(--red-100);
      border-radius: var(--radius-sm);
      padding: 4px 10px;
      cursor: pointer;
      white-space: nowrap;
      transition: background var(--transition-fast), border-color var(--transition-fast);
      font-family: inherit;
    }

    .doc-remove:hover {
      background: var(--red-50);
      border-color: var(--red-200);
    }

    .doc-add-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .doc-form-row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .doc-type-group {
      flex: 1;
      max-width: 340px;
    }

    .doc-drop-zone {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border: 1.5px dashed var(--border-medium);
      border-radius: var(--radius-md);
      cursor: pointer;
      background: var(--surface-100);
      transition: border-color var(--transition-fast), background var(--transition-fast);
      outline: none;
    }

    .doc-drop-zone:hover,
    .doc-drop-zone.drag-over {
      border-color: var(--purple-400);
      background: var(--purple-50);
    }

    .doc-drop-zone:focus-visible {
      outline: 2px solid var(--purple-500);
      outline-offset: 2px;
    }

    .doc-drop-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .doc-drop-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-left: auto;
    }

    .add-doc-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--purple-600);
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 0;
      font-family: inherit;
      transition: color var(--transition-fast);
    }

    .add-doc-btn:hover {
      color: var(--purple-700);
    }

    .docs-helper-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-top: 12px;
    }

    /* ============================================================ */
    /* SELLER TYPE                                                   */
    /* ============================================================ */
    .seller-type-section {
      padding: var(--sp-5) var(--sp-6);
    }

    .seller-type-section .cl-section-title {
      margin-bottom: 14px;
    }

    .seller-type-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }

    .radio-option {
      display: flex;
      cursor: pointer;
    }

    .radio-option input[type="radio"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio-content {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border: 1.5px solid var(--border-medium);
      border-radius: var(--radius-md);
      background: var(--surface-50);
      transition: border-color var(--transition-fast), background var(--transition-fast);
      min-width: 160px;
    }

    .radio-option.selected .radio-content {
      border-color: var(--purple-400);
      background: var(--purple-50);
    }

    .radio-option:hover .radio-content {
      border-color: var(--purple-300);
    }

    .radio-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--border-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color var(--transition-fast);
    }

    .radio-option.selected .radio-dot {
      border-color: var(--purple-500);
      background: var(--purple-500);
      box-shadow: inset 0 0 0 3px var(--purple-50);
    }

    .radio-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .radio-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .business-doc-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .business-doc-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .business-doc-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* ============================================================ */
    /* WHAT HAPPENS NEXT                                             */
    /* ============================================================ */
    .what-next-banner {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: var(--surface-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      margin-bottom: 20px;
    }

    .what-next-icon {
      width: 36px;
      height: 36px;
      background: var(--purple-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .what-next-body {
      flex: 1;
    }

    .what-next-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 6px;
    }

    .what-next-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .what-next-steps {
      display: flex;
      align-items: center;
      gap: 0;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .wn-step {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .wn-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--surface-300);
      color: var(--text-muted);
      font-size: 0.6875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wn-step.wn-active .wn-num {
      background: var(--purple-500);
      color: #fff;
    }

    .wn-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-muted);
    }

    .wn-step.wn-active .wn-label {
      color: var(--purple-600);
      font-weight: 600;
    }

    .wn-connector {
      flex: 1;
      min-width: 20px;
      height: 1px;
      background: var(--border-light);
      margin: 0 6px;
    }

    /* ============================================================ */
    /* BOTTOM ACTIONS                                                */
    /* ============================================================ */
    .cl-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
      white-space: nowrap;
    }

    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; pointer-events: none; }

    .btn-secondary {
      background: var(--surface-50);
      color: var(--text-primary);
      border-color: var(--border-medium);
    }
    .btn-secondary:hover { background: var(--surface-200); }

    .btn-primary {
      background: var(--purple-500);
      color: #fff;
      border-color: var(--purple-500);
    }
    .btn-primary:hover { background: var(--purple-600); border-color: var(--purple-600); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); }

    .btn-lg {
      padding: 12px 24px;
      font-size: 0.9375rem;
    }

    /* ============================================================ */
    /* ANALYSIS OVERLAY                                              */
    /* ============================================================ */
    .analysis-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(7, 15, 28, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
    }

    .analysis-card {
      background: var(--surface-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 40px 48px;
      min-width: 360px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: var(--shadow-xl);
    }

    .analysis-icon {
      width: 64px;
      height: 64px;
      background: var(--purple-50);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .analysis-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .analysis-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 28px;
    }

    .analysis-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
    }

    .analysis-step {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .analysis-step.step-done { color: var(--green-700); }
    .analysis-step.step-active { color: var(--text-primary); font-weight: 500; }
    .analysis-step.step-pending { color: var(--text-muted); }

    .step-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 2px solid var(--border-medium);
    }

    .step-done .step-dot {
      background: var(--green-600);
      border-color: var(--green-600);
    }

    .step-active .step-dot {
      border-color: var(--purple-400);
      background: var(--purple-50);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--purple-500);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* ============================================================ */
    /* RESPONSIVE                                                    */
    /* ============================================================ */
    @media (max-width: 900px) {
      .cl-grid {
        grid-template-columns: 1fr;
      }

      .cl-body {
        padding: 20px 20px 40px;
      }

      .cl-actions {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .cl-actions .btn {
        justify-content: center;
      }

      .seller-type-options {
        flex-direction: column;
      }

      .radio-content {
        min-width: unset;
      }

      .what-next-steps {
        overflow-x: auto;
      }
    }

    @media (max-width: 600px) {
      .cl-page-title {
        font-size: 1.5rem;
      }

      .analysis-card {
        padding: 32px 24px;
        min-width: unset;
      }
    }
  `],
})
export class CreateListingComponent implements OnInit {
  form!: FormGroup;
  photos: ImageFile[] = [];
  supportingDocs: SupportingDocument[] = [];
  businessDoc: SupportingDocument | null = null;

  dragging = false;
  docDragging = false;
  bizDocDragging = false;
  analyzing = false;

  showDocForm = false;
  pendingDocType = '';

  photoError = '';
  docError = '';
  bizDocError = '';
  showPhotoError = false;

  categoryGroups = CATEGORY_GROUPS;
  documentTypes = DOCUMENT_TYPES;
  businessDocTypes = BUSINESS_DOC_TYPES;

  workflowSteps: WorkflowStep[] = [
    { label: 'Add Product', status: 'active' },
    { label: 'AI Analysis', status: 'pending' },
    { label: 'Risk Review', status: 'pending' },
    { label: 'Admin Review', status: 'pending' },
  ];

  analysisSteps: AnalysisStep[] = [
    { label: 'Upload validated', status: 'pending' },
    { label: 'Understanding product', status: 'pending' },
    { label: 'Preparing listing content', status: 'pending' },
    { label: 'Preparing analysis', status: 'pending' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private listingService: ListingService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      category:        ['', Validators.required],
      sellingPrice:    [null, [Validators.required, Validators.min(0.01)]],
      sellerNotes:     ['', Validators.maxLength(500)],
      sellerType:      ['individual'],
      businessDocType: [''],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Getters                                                             */
  /* ------------------------------------------------------------------ */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get notesLength(): number {
    return (this.form.get('sellerNotes')?.value ?? '').length;
  }

  get sellerTypeValue(): string {
    return this.form.get('sellerType')?.value ?? 'individual';
  }

  getCategoryLabel(cat: string): string {
    // Show only the deepest level for the option label, with context
    const parts = cat.split(' > ');
    if (parts.length <= 2) return cat;
    return parts.slice(1).join(' > ');
  }

  /* ------------------------------------------------------------------ */
  /*  Photo Upload                                                        */
  /* ------------------------------------------------------------------ */
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragging = true;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    this.processPhotos(files);
  }

  onPhotoSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.processPhotos(files);
    input.value = '';
  }

  private processPhotos(files: File[]): void {
    this.showPhotoError = false;
    this.photoError = '';

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const remaining = 5 - this.photos.length;

    if (remaining === 0) {
      this.photoError = 'Maximum 5 photos allowed.';
      this.showPhotoError = true;
      return;
    }

    let hasError = false;
    let processed = 0;

    for (const file of files) {
      if (processed >= remaining) break;

      if (!allowed.includes(file.type)) {
        this.photoError = 'Only JPG and PNG images are supported.';
        this.showPhotoError = true;
        hasError = true;
        continue;
      }

      if (file.size > maxSize) {
        this.photoError = `"${file.name}" exceeds the 10 MB limit.`;
        this.showPhotoError = true;
        hasError = true;
        continue;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        this.photos.push({
          id: `img-${Date.now()}-${Math.random()}`,
          name: file.name,
          previewUrl: ev.target?.result as string,
          sizeBytes: file.size,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
      processed++;
    }

    if (!hasError) {
      this.showPhotoError = false;
    }
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
    if (this.photos.length > 0) {
      this.showPhotoError = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Supporting Documents                                                */
  /* ------------------------------------------------------------------ */
  onDocDragOver(e: DragEvent): void { e.preventDefault(); this.docDragging = true; }

  onDocDrop(e: DragEvent): void {
    e.preventDefault();
    this.docDragging = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files[0]) this.processDoc(files[0]);
  }

  onDocSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processDoc(file);
    input.value = '';
  }

  private processDoc(file: File): void {
    this.docError = '';
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 20 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      this.docError = 'Unsupported document format. Please use JPG, PNG or PDF.';
      return;
    }
    if (file.size > maxSize) {
      this.docError = 'This document exceeds the allowed file size.';
      return;
    }
    if (!this.pendingDocType) {
      this.docError = 'Please select a document type first.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.supportingDocs.push({
        id: `doc-${Date.now()}-${Math.random()}`,
        type: this.pendingDocType,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: ev.target?.result as string,
        uploadedAt: new Date().toISOString(),
      });
      this.pendingDocType = '';
      this.showDocForm = false;
    };
    reader.readAsDataURL(file);
  }

  removeDoc(index: number): void {
    this.supportingDocs.splice(index, 1);
  }

  /* ------------------------------------------------------------------ */
  /*  Business Document                                                   */
  /* ------------------------------------------------------------------ */
  onBizDocDragOver(e: DragEvent): void { e.preventDefault(); this.bizDocDragging = true; }

  onBizDocDrop(e: DragEvent): void {
    e.preventDefault();
    this.bizDocDragging = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files[0]) this.processBizDoc(files[0]);
  }

  onBizDocSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processBizDoc(file);
    input.value = '';
  }

  private processBizDoc(file: File): void {
    this.bizDocError = '';
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 20 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      this.bizDocError = 'Unsupported format. Please use JPG, PNG or PDF.';
      return;
    }
    if (file.size > maxSize) {
      this.bizDocError = 'This document exceeds the allowed file size.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.businessDoc = {
        id: `biz-${Date.now()}`,
        type: this.form.get('businessDocType')?.value || 'Business Document',
        fileName: file.name,
        fileSize: file.size,
        fileUrl: ev.target?.result as string,
        uploadedAt: new Date().toISOString(),
      };
    };
    reader.readAsDataURL(file);
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                             */
  /* ------------------------------------------------------------------ */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /* ------------------------------------------------------------------ */
  /*  Clear                                                               */
  /* ------------------------------------------------------------------ */
  onClear(): void {
    this.form.reset({ sellerType: 'individual', category: '', sellingPrice: null, sellerNotes: '', businessDocType: '' });
    this.photos = [];
    this.supportingDocs = [];
    this.businessDoc = null;
    this.showPhotoError = false;
    this.photoError = '';
    this.docError = '';
    this.bizDocError = '';
    this.pendingDocType = '';
    this.showDocForm = false;
  }

  /* ------------------------------------------------------------------ */
  /*  Submit                                                              */
  /* ------------------------------------------------------------------ */
  onAnalyze(): void {
    this.form.markAllAsTouched();

    // Validate photos
    if (this.photos.length === 0) {
      this.photoError = 'No product photo has been uploaded.';
      this.showPhotoError = true;
    } else {
      this.showPhotoError = false;
    }

    if (this.photos.length === 0 || this.form.invalid) {
      this.toastService.error('Please complete all required fields before continuing.');
      return;
    }

    // Create listing in service
    const listingId = this.listingService.createListing({
      images: this.photos,
      category: this.form.value.category,
      sellingPrice: this.form.value.sellingPrice,
      sellerNotes: this.form.value.sellerNotes,
      sellerType: this.form.value.sellerType,
      supportingDocuments: this.supportingDocs,
      businessDocType: this.form.value.businessDocType || undefined,
      businessDoc: this.businessDoc ?? undefined,
    });

    // Show analysis overlay
    this.analyzing = true;
    this.runAnalysisProgress(listingId);
  }

  private runAnalysisProgress(listingId: string): void {
    // Reset steps
    this.analysisSteps = [
      { label: 'Upload validated', status: 'active' },
      { label: 'Understanding product', status: 'pending' },
      { label: 'Preparing listing content', status: 'pending' },
      { label: 'Preparing analysis', status: 'pending' },
    ];

    const delays = [400, 800, 500, 500];
    let currentStep = 0;

    const advance = () => {
      if (currentStep < this.analysisSteps.length) {
        this.analysisSteps[currentStep].status = 'done';
        currentStep++;
        if (currentStep < this.analysisSteps.length) {
          this.analysisSteps[currentStep].status = 'active';
          setTimeout(advance, delays[currentStep] ?? 500);
        } else {
          // All done — navigate
          setTimeout(() => {
            this.analyzing = false;
            this.router.navigate(['/ai-assistant', listingId]);
          }, 500);
        }
      }
    };

    setTimeout(advance, delays[0]);
  }
}
