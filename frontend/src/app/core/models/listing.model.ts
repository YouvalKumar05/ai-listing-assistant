/** Listing Input & Draft Models */

export interface ImageFile {
  id: string;
  name: string;
  /** Data URL (base64) for preview */
  previewUrl: string;
  sizeBytes: number;
  mimeType: string;
}

export interface SupportingDocument {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  /** Data URL or remote URL */
  fileUrl: string;
  uploadedAt: string;
}

export type SellerType = 'individual' | 'business';

export interface ListingInput {
  images: ImageFile[];
  /** E.g. "Electronics > Cameras & Photography > DSLR Cameras" */
  category: string;
  sellerNotes?: string;
  /** Seller's desired selling price in INR (paisa-free integer) */
  sellingPrice?: number;
  sellerType?: SellerType;
  supportingDocuments?: SupportingDocument[];
  businessDocType?: string;
  businessDoc?: SupportingDocument;
}

export type ListingStatus =
  | 'draft'
  | 'ai_analyzing'
  | 'ai_complete'
  | 'fraud_screening'
  | 'fraud_complete'
  | 'pending_admin'
  | 'approved'
  | 'held'
  | 'removed';

export interface ListingDraft {
  id: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  status: ListingStatus;
  input: ListingInput;
}
