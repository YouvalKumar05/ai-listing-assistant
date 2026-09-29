package models

import (
	"time"

	"github.com/google/uuid"
)

type ExternalReview struct {
	ID               uuid.UUID `json:"id" db:"id"`
	ListingID        string    `json:"listingId" db:"listing_id"`
	SellerID         string    `json:"sellerId,omitempty" db:"seller_id"`
	SourceURL        string    `json:"sourceUrl,omitempty" db:"source_url"`
	SourceDomain     string    `json:"sourceDomain,omitempty" db:"source_domain"`
	ReviewDate       time.Time `json:"reviewDate" db:"review_date"`
	Rating           float64   `json:"rating" db:"rating"`
	ReviewText       string    `json:"reviewText" db:"review_text"`
	Sentiment        string    `json:"sentiment" db:"sentiment"` // positive, neutral, negative
	ComplaintTheme   string    `json:"complaintTheme,omitempty" db:"complaint_theme"`
	ReviewConfidence float64   `json:"reviewConfidence" db:"review_confidence"`
	CreatedAt        time.Time `json:"createdAt" db:"created_at"`
}

type WebResearchResult struct {
	ID             uuid.UUID `json:"id" db:"id"`
	ListingID      string    `json:"listingId" db:"listing_id"`
	SellerID       string    `json:"sellerId,omitempty" db:"seller_id"`
	Query          string    `json:"query" db:"query"`
	SourceURL      string    `json:"sourceUrl" db:"source_url"`
	SourceDomain   string    `json:"sourceDomain" db:"source_domain"`
	SourceType     string    `json:"sourceType" db:"source_type"`
	Title          string    `json:"title" db:"title"`
	Snippet        string    `json:"snippet" db:"snippet"`
	RetrievedAt    time.Time `json:"retrievedAt" db:"retrieved_at"`
	RelevanceScore float64   `json:"relevanceScore" db:"relevance_score"`
	Confidence     float64   `json:"confidence" db:"confidence"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
}
