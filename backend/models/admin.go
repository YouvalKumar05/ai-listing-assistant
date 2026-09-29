package models

import (
	"time"

	"github.com/google/uuid"
)

type ReviewAction string

const (
	ActionApprove                ReviewAction = "APPROVE"
	ActionRequestInformation     ReviewAction = "REQUEST_INFORMATION"
	ActionHold                   ReviewAction = "HOLD"
	ActionEscalateAuthentication ReviewAction = "ESCALATE_AUTHENTICATION"
	ActionRestrict               ReviewAction = "RESTRICT"
)

type ReviewDecision struct {
	ID                 uuid.UUID    `json:"id" db:"id"`
	ListingID          string       `json:"listingId" db:"listing_id"`
	ReviewerID         *uuid.UUID   `json:"reviewerId,omitempty" db:"reviewer_id"`
	Action             ReviewAction `json:"action" db:"action"`
	Reason             string       `json:"reason" db:"reason"`
	RiskScoreAtReview  *float64     `json:"riskScoreAtReview,omitempty" db:"risk_score_at_review"`
	CreatedAt          time.Time    `json:"createdAt" db:"created_at"`
}

type AuditLog struct {
	ID                uuid.UUID    `json:"id" db:"id"`
	ListingID         string       `json:"listingId" db:"listing_id"`
	ReviewerID        *uuid.UUID   `json:"reviewerId,omitempty" db:"reviewer_id"`
	Action            string       `json:"action" db:"action"`
	Reason            string       `json:"reason" db:"reason"`
	PreviousStatus    string       `json:"previousStatus" db:"previous_status"`
	NewStatus         string       `json:"newStatus" db:"new_status"`
	RiskScoreSnapshot *float64     `json:"riskScoreSnapshot,omitempty" db:"risk_score_snapshot"`
	Metadata          *string      `json:"metadata,omitempty" db:"metadata"` // JSONB string
	CreatedAt         time.Time    `json:"createdAt" db:"created_at"`
}

// DecisionRequest payload for POST /api/v1/admin/reviews/{listingId}/decision
type DecisionRequest struct {
	Action ReviewAction `json:"action" binding:"required"`
	Reason string       `json:"reason"`
}

// DecisionResponse for returning final decision details
type DecisionResponse struct {
	ListingID      string       `json:"listingId"`
	PreviousStatus string       `json:"previousStatus"`
	NewStatus      string       `json:"newStatus"`
	Action         ReviewAction `json:"action"`
	Reason         string       `json:"reason"`
	AuditLogID     string       `json:"auditLogId"`
	Timestamp      time.Time    `json:"timestamp"`
}

// ReviewQueueItem represents a single item in the review queue
type ReviewQueueItem struct {
	ListingID    string    `json:"listingId"`
	Category     string    `json:"category"`
	SellerType   string    `json:"sellerType"`
	SellingPrice float64   `json:"sellingPrice"`
	RiskScore    float64   `json:"riskScore"`
	RiskBand     string    `json:"riskBand"`
	MainConcern  string    `json:"mainConcern"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
}

// FullReviewData represents the complete view for a single listing review
type FullReviewData struct {
	Listing          Listing              `json:"listing"`
	AIAnalysis       *AIAnalysisResponse  `json:"aiAnalysis"`
	RiskAnalysis     *RiskAnalysisResponse `json:"riskAnalysis"`
	ReviewHistory    []AuditLog           `json:"reviewHistory"`
}
