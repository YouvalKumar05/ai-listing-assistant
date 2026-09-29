import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ListingDraft, ListingInput, ListingStatus } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private store = new Map<string, BehaviorSubject<ListingDraft>>();
  private counter = 1;

  constructor() {
    this.seedDemoListing('listing-001');
    this.seedDemoListing('LS-1042');
    this.seedDemoListing('demo');
  }

  private createDemoImages() {
    return [
      {
        id: 'img-1',
        name: 'sony-xm5-hero.jpg',
        previewUrl: '/images/sony-xm5-hero.jpg',
        sizeBytes: 312000,
        mimeType: 'image/jpeg',
      },
      {
        id: 'img-2',
        name: 'sony-xm5-side.jpg',
        previewUrl: '/images/sony-xm5-side.jpg',
        sizeBytes: 284000,
        mimeType: 'image/jpeg',
      },
      {
        id: 'img-3',
        name: 'sony-xm5-label.jpg',
        previewUrl: '/images/sony-xm5-label.jpg',
        sizeBytes: 245000,
        mimeType: 'image/jpeg',
      },
      {
        id: 'img-4',
        name: 'sony-xm5-case.jpg',
        previewUrl: '/images/sony-xm5-case.jpg',
        sizeBytes: 295000,
        mimeType: 'image/jpeg',
      },
    ];
  }

  private seedDemoListing(id: string): void {
    const now = new Date().toISOString();
    const draft: ListingDraft = {
      id,
      createdAt: now,
      updatedAt: now,
      status: 'pending_admin',
      input: {
        images: this.createDemoImages(),
        category: 'Electronics > Headphones',
        sellingPrice: 8500,
        sellerNotes: 'Sony WH-1000XM5 wireless noise cancelling headphones in black. Lightly used, excellent audio and battery life. Includes carrying case and cables.',
        sellerType: 'individual',
        supportingDocuments: [
          {
            id: 'doc-1',
            type: 'invoice',
            fileName: 'ABC_Electronics_Invoice_March2025.pdf',
            fileSize: 420000,
            fileUrl: '/images/invoice-preview.pdf',
            uploadedAt: now,
          },
          {
            id: 'doc-2',
            type: 'warranty',
            fileName: 'Sony_India_Warranty_Card.jpg',
            fileSize: 215000,
            fileUrl: '/images/warranty-card.jpg',
            uploadedAt: now,
          },
        ],
      },
    };
    this.store.set(id, new BehaviorSubject<ListingDraft>(draft));
  }

  /** Create a new listing draft and return the generated id */
  createListing(input: ListingInput): string {
    const id = `listing-${String(this.counter++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const draft: ListingDraft = {
      id,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      input,
    };
    this.store.set(id, new BehaviorSubject<ListingDraft>(draft));
    return id;
  }

  /** Retrieve a listing draft by id */
  getListing(id: string): Observable<ListingDraft | null> {
    let subject = this.store.get(id);
    if (!subject) {
      this.seedDemoListing(id);
      subject = this.store.get(id);
    }
    return subject ? subject.asObservable() : of(null);
  }

  /** Update listing status */
  updateStatus(id: string, status: ListingStatus): void {
    const subject = this.store.get(id);
    if (subject) {
      const current = subject.getValue();
      subject.next({ ...current, status, updatedAt: new Date().toISOString() });
    }
  }

  /** Partial update of listing */
  updateListing(id: string, partial: Partial<ListingDraft>): void {
    const subject = this.store.get(id);
    if (subject) {
      const current = subject.getValue();
      subject.next({ ...current, ...partial, updatedAt: new Date().toISOString() });
    }
  }

  /** Get all listings (for My Listings / Dashboard) */
  getAllListings(): ListingDraft[] {
    return Array.from(this.store.values()).map(s => s.getValue());
  }
}
