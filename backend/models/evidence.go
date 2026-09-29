package models

import (
	"time"

	"github.com/google/uuid"
)

type EvidenceSourceType string

const (
	SourceTypeInternalListing EvidenceSourceType = "INTERNAL_LISTING"
	SourceTypeImage           EvidenceSourceType = "IMAGE"
	SourceTypeDocument        EvidenceSourceType = "DOCUMENT"
	SourceTypeSellerInput     EvidenceSourceType = "SELLER_INPUT"
	SourceTypePublicWeb       EvidenceSourceType = "PUBLIC_WEB"
	SourceTypePublicReview    EvidenceSourceType = "PUBLIC_REVIEW"
	SourceTypePriceDataset    EvidenceSourceType = "PRICE_DATASET"
	SourceTypeAIObservation   EvidenceSourceType = "AI_OBSERVATION"
)

type RiskEvidence struct {
	ID              uuid.UUID          `json:"id" db:"id"`
	ListingID       string             `json:"listingId" db:"listing_id"`
	SignalGroup     string             `json:"signalGroup" db:"signal_group"`
	SourceType      EvidenceSourceType `json:"sourceType" db:"source_type"`
	SourceReference string             `json:"sourceReference,omitempty" db:"source_reference"`
	SourceURL       string             `json:"sourceUrl,omitempty" db:"source_url"`
	SourceTitle     string             `json:"sourceTitle,omitempty" db:"source_title"`
	EvidenceText    string             `json:"evidenceText" db:"evidence_text"`
	EvidenceValue   string             `json:"evidenceValue,omitempty" db:"evidence_value"`
	Confidence      float64            `json:"confidence" db:"confidence"`
	RetrievedAt     time.Time          `json:"retrievedAt" db:"retrieved_at"`
	CreatedAt       time.Time          `json:"createdAt" db:"created_at"`
}

// EvidenceItemResponse maps directly to Page 3 frontend format
type EvidenceItemResponse struct {
	ID             string  `json:"id"`
	ImageIndex     *int    `json:"imageIndex,omitempty"`
	SourceType     string  `json:"sourceType"` // 'image' | 'text' | 'metadata' | 'price'
	DetectedSignal string  `json:"detectedSignal"`
	Reason         string  `json:"reason"`
	Confidence     float64 `json:"confidence"`
}
