package models

import (
	"time"

	"github.com/google/uuid"
)

// ListingStatus represents the controlled lifecycle of a listing.
type ListingStatus string

const (
	StatusDraft              ListingStatus = "DRAFT"
	StatusSubmitted          ListingStatus = "SUBMITTED"
	StatusPreprocessing      ListingStatus = "PREPROCESSING"
	StatusAIAnalysisPending  ListingStatus = "AI_ANALYSIS_PENDING"
	StatusAIAnalysisComplete ListingStatus = "AI_ANALYSIS_COMPLETE"
	StatusRiskReviewPending  ListingStatus = "RISK_REVIEW_PENDING"
	StatusAdminReview        ListingStatus = "ADMIN_REVIEW"
	StatusApproved           ListingStatus = "APPROVED"
	StatusRejected           ListingStatus = "REJECTED"
)

// SellerType restricts seller classification.
type SellerType string

const (
	SellerIndividual SellerType = "individual"
	SellerBusiness   SellerType = "business"
)

// Listing represents the core listing record stored in PostgreSQL.
type Listing struct {
	ID               string        `json:"listingId" db:"id"`
	SellerID         *uuid.UUID    `json:"sellerId,omitempty" db:"seller_id"`
	CategoryID       *int          `json:"categoryId,omitempty" db:"category_id"`
	CategoryPath     string        `json:"categoryPath" db:"category_path"`
	SellingPrice     float64       `json:"sellingPrice" db:"selling_price"`
	Currency         string        `json:"currency" db:"currency"`
	SellerNotes      *string       `json:"sellerNotes,omitempty" db:"seller_notes"`
	SellerNotesNorm  *string       `json:"-" db:"seller_notes_norm"`
	SellerType       SellerType    `json:"sellerType" db:"seller_type"`
	Status           ListingStatus `json:"status" db:"status"`
	RequestID        uuid.UUID     `json:"requestId" db:"request_id"`
	CreatedAt        time.Time     `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time     `json:"updatedAt" db:"updated_at"`
}

// CreateListingRequest is the validated input from the handler.
type CreateListingRequest struct {
	CategoryPath string     `form:"category_path" binding:"required"`
	SellingPrice float64    `form:"selling_price" binding:"required,gt=0"`
	Currency     string     `form:"currency"`
	SellerNotes  string     `form:"seller_notes"`
	SellerType   SellerType `form:"seller_type"`
}

// CreateListingResponse is returned after successful listing creation.
type CreateListingResponse struct {
	ListingID string              `json:"listingId"`
	Status    ListingStatus       `json:"status"`
	Message   string              `json:"message"`
	Images    ImageCountSummary   `json:"images"`
	Documents DocumentCountSummary `json:"documents"`
	NextStep  string              `json:"nextStep"`
}

// ImageCountSummary is a simple count envelope.
type ImageCountSummary struct {
	Count int `json:"count"`
}

// DocumentCountSummary is a simple count envelope.
type DocumentCountSummary struct {
	Count int `json:"count"`
}

// GetListingResponse is the detailed response for GET /listings/:id
type GetListingResponse struct {
	ListingID    string              `json:"listingId"`
	CategoryPath string              `json:"categoryPath"`
	SellingPrice float64             `json:"sellingPrice"`
	Currency     string              `json:"currency"`
	SellerNotes  *string             `json:"sellerNotes,omitempty"`
	SellerType   SellerType          `json:"sellerType"`
	Status       ListingStatus       `json:"status"`
	Images       []ImageResponse     `json:"images"`
	Documents    []DocumentResponse  `json:"documents"`
	CreatedAt    time.Time           `json:"createdAt"`
}
