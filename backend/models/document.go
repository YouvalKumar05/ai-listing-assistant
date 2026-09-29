package models

import (
	"time"

	"github.com/google/uuid"
)

// DocumentType represents the kind of document uploaded.
type DocumentType string

const (
	DocPurchaseInvoice       DocumentType = "Purchase Invoice"
	DocRetailBill            DocumentType = "Retail Bill / Receipt"
	DocEcommerceOrder        DocumentType = "E-commerce Order Invoice"
	DocOrderConfirmation     DocumentType = "Order Confirmation"
	DocWarrantyCard          DocumentType = "Warranty Card"
	DocCertOfAuth            DocumentType = "Certificate of Authenticity"
	DocBusinessRegistration  DocumentType = "Business Registration"
	DocGSTRegistration       DocumentType = "GST Registration"
	DocOtherSupporting       DocumentType = "Other Supporting Document"
	DocOtherBusiness         DocumentType = "Other Business Document"
)

// OcrStatus tracks the OCR processing state.
type OcrStatus string

const (
	OcrPending    OcrStatus = "PENDING"
	OcrInProgress OcrStatus = "IN_PROGRESS"
	OcrComplete   OcrStatus = "COMPLETE"
	OcrFailed     OcrStatus = "FAILED"
	OcrSkipped    OcrStatus = "SKIPPED"
)

// VerificationStatus tracks if the document has been verified as authentic.
type VerificationStatus string

const (
	VerifyUnverified  VerificationStatus = "UNVERIFIED"
	VerifyUnderReview VerificationStatus = "UNDER_REVIEW"
	VerifyVerified    VerificationStatus = "VERIFIED"
	VerifyRejected    VerificationStatus = "REJECTED"
)

// SupportingDocument represents an evidentiary document.
type SupportingDocument struct {
	ID                 uuid.UUID          `json:"id" db:"id"`
	ListingID          string             `json:"listingId" db:"listing_id"`
	DocumentType       DocumentType       `json:"documentType" db:"document_type"`
	OriginalFilename   string             `json:"originalFilename" db:"original_filename"`
	SafeFilename       string             `json:"-" db:"safe_filename"`
	MimeType           string             `json:"mimeType" db:"mime_type"`
	FileSize           int64              `json:"fileSize" db:"file_size"`
	Sha256Hash         string             `json:"sha256Hash" db:"sha256_hash"`
	StoragePath        string             `json:"-" db:"storage_path"`
	OcrStatus          OcrStatus          `json:"ocrStatus" db:"ocr_status"`
	OcrText            *string            `json:"ocrText,omitempty" db:"ocr_text"`
	DocumentMetadata   *string            `json:"documentMetadata,omitempty" db:"document_metadata"` // Stored as JSONB in DB
	VerificationStatus VerificationStatus `json:"verificationStatus" db:"verification_status"`
	UploadedAt         time.Time          `json:"uploadedAt" db:"uploaded_at"`
}

// DocumentResponse is the API response format for a document.
type DocumentResponse struct {
	ID               uuid.UUID          `json:"id"`
	DocumentType     DocumentType       `json:"type"`
	OriginalFilename string             `json:"filename"`
	FileSize         int64              `json:"sizeBytes"`
	OcrStatus        OcrStatus          `json:"ocrStatus"`
	UploadedAt       time.Time          `json:"uploadedAt"`
	Url              string             `json:"url"` // frontend accessible URL
}
