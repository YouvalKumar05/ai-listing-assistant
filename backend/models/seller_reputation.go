package models

import (
	"time"
)

type SellerReputation struct {
	SellerID               string    `json:"sellerId" db:"seller_id"`
	PublicPresenceScore    float64   `json:"publicPresenceScore" db:"public_presence_score"`
	NameConsistencyScore   float64   `json:"nameConsistencyScore" db:"name_consistency_score"`
	DomainConsistencyScore float64   `json:"domainConsistencyScore" db:"domain_consistency_score"`
	ReviewVolume           int       `json:"reviewVolume" db:"review_volume"`
	AverageRating          float64   `json:"averageRating" db:"average_rating"`
	NegativeReviewRatio    float64   `json:"negativeReviewRatio" db:"negative_review_ratio"`
	ComplaintCount         int       `json:"complaintCount" db:"complaint_count"`
	RecentComplaintCount   int       `json:"recentComplaintCount" db:"recent_complaint_count"`
	SellerReputationScore  float64   `json:"sellerReputationScore" db:"seller_reputation_score"`
	DataConfidence         float64   `json:"dataConfidence" db:"data_confidence"`
	UpdatedAt              time.Time `json:"updatedAt" db:"updated_at"`
}
