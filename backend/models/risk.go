package models

import (
	"time"

	"github.com/google/uuid"
)

type RiskAnalysis struct {
	ID                     uuid.UUID `json:"id" db:"id"`
	ListingID              string    `json:"listingId" db:"listing_id"`
	Status                 string    `json:"status" db:"status"` // PENDING, COMPLETED, FAILED
	RiskScore              float64   `json:"riskScore" db:"risk_score"`
	RiskBand               string    `json:"riskBand" db:"risk_band"` // LOW, REVIEW, HIGH
	Confidence             float64   `json:"confidence" db:"confidence"`
	Summary                *string   `json:"summary" db:"summary"`
	AuthenticityStatus     *string   `json:"authenticityStatus" db:"authenticity_status"`
	AuthenticityNote       *string   `json:"authenticityNote" db:"authenticity_note"`
	RecommendedAction      *string   `json:"recommendedAction" db:"recommended_action"`
	RecommendedActionLabel *string   `json:"recommendedActionLabel" db:"recommended_action_label"`
	ModelVersion           string    `json:"modelVersion" db:"model_version"`
	CreatedAt              time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt              time.Time `json:"updatedAt" db:"updated_at"`
}

type RiskSignal struct {
	ID                uuid.UUID `json:"id" db:"id"`
	RiskAnalysisID    uuid.UUID `json:"riskAnalysisId" db:"risk_analysis_id"`
	SignalGroup       string    `json:"signalGroup" db:"signal_group"`
	SignalName        string    `json:"signalName" db:"signal_name"`
	Severity          string    `json:"severity" db:"severity"`
	ScoreContribution float64   `json:"scoreContribution" db:"score_contribution"`
	Confidence        float64   `json:"confidence" db:"confidence"`
	Finding           string    `json:"finding" db:"finding"`
	RecommendedAction *string   `json:"recommendedAction,omitempty" db:"recommended_action"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
}

type RiskFeature struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	ListingID       string     `json:"listingId" db:"listing_id"`
	FeatureGroup    string     `json:"featureGroup" db:"feature_group"`
	FeatureName     string     `json:"featureName" db:"feature_name"`
	FeatureValue    *string    `json:"featureValue,omitempty" db:"feature_value"`
	NormalizedScore float64    `json:"normalizedScore" db:"normalized_score"`
	Severity        string     `json:"severity" db:"severity"`
	Confidence      float64    `json:"confidence" db:"confidence"`
	EvidenceID      *uuid.UUID `json:"evidenceId,omitempty" db:"evidence_id"`
	CreatedAt       time.Time  `json:"createdAt" db:"created_at"`
}

// RiskAnalysisResponse maps directly to Page 3 frontend format and GET /api/v1/listings/{listingId}/risk-analysis
type RiskAnalysisResponse struct {
	ListingID              string                 `json:"listingId"`
	ScreenedAt             string                 `json:"screenedAt"`
	FraudRiskScore         float64                `json:"fraudRiskScore"`
	RiskBand               string                 `json:"riskBand"`
	ScoreDisclaimer        string                 `json:"scoreDisclaimer"`
	SignalGroups           []SignalGroupResponse  `json:"signalGroups"`
	EvidenceItems          []EvidenceItemResponse `json:"evidenceItems"`
	AuthenticityStatus     string                 `json:"authenticityStatus"`
	AuthenticityNote       string                 `json:"authenticityNote"`
	KeyFindings            []string               `json:"keyFindings"`
	RecommendedAction      string                 `json:"recommendedAction"`
	RecommendedActionLabel string                 `json:"recommendedActionLabel"`
	PolicyFlags            []string               `json:"policyFlags"`
}

type SignalGroupResponse struct {
	ID       string         `json:"id"`
	Label    string         `json:"label"`
	Score    float64        `json:"score"`
	MaxScore float64        `json:"maxScore"`
	Severity string         `json:"severity"`
	Summary  string         `json:"summary"`
	Signals  []FraudSignal  `json:"signals"`
}

type FraudSignal struct {
	ID         string  `json:"id"`
	Label      string  `json:"label"`
	Finding    string  `json:"finding"`
	Severity   string  `json:"severity"`
	Confidence float64 `json:"confidence"`
	Evidence   string  `json:"evidence"`
	Score      float64 `json:"score"`
	MaxScore   float64 `json:"maxScore"`
}

type TopRiskFactor struct {
	Signal       string  `json:"signal"`
	Severity     string  `json:"severity"`
	Contribution float64 `json:"contribution"`
	Evidence     string  `json:"evidence"`
}

type PositiveSignal struct {
	Signal string `json:"signal"`
}
