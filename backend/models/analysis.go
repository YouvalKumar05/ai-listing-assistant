package models

import (
	"time"
)

type AnalysisStatus string

const (
	AnalysisPending    AnalysisStatus = "PENDING"
	AnalysisProcessing AnalysisStatus = "PROCESSING"
	AnalysisCompleted  AnalysisStatus = "COMPLETED"
	AnalysisFailed     AnalysisStatus = "FAILED"
)

// Response models for the GET /analysis endpoint
type AIAnalysisResponse struct {
	ListingID          string                 `json:"listingId"`
	Status             AnalysisStatus         `json:"status"`
	Summary            AISummary              `json:"summary"`
	Attributes         []ProductAttribute     `json:"attributes"`
	GeneratedContent   GeneratedContent       `json:"generatedContent"`
	Condition          ConditionSuggestion    `json:"condition"`
	MissingInformation []MissingInformation   `json:"missingInformation"`
	ImageIntelligence  ImageIntelligence      `json:"imageIntelligence"`
	SearchDiscovery    SearchDiscovery        `json:"searchDiscovery"`
	PriceIntelligence  PriceIntelligence      `json:"priceIntelligence"`
	ListingQuality     ListingQuality         `json:"listingQuality"`
	Recommendations    []AIRecommendation     `json:"recommendations"`
}

type AISummary struct {
	Provider     string    `json:"provider"`
	ModelName    string    `json:"modelName"`
	PromptVer    string    `json:"promptVersion"`
	StartedAt    time.Time `json:"startedAt"`
	CompletedAt  time.Time `json:"completedAt"`
}

type ProductAttribute struct {
	Name       string               `json:"name"`
	Value      string               `json:"value"`
	Status     string               `json:"status"` // CONFIRMED, LIKELY, UNKNOWN, MISSING, CONFLICTING
	Confidence float64              `json:"confidence"`
	Evidence   []AttributeEvidence  `json:"evidence"`
}

type AttributeEvidence struct {
	SourceType  string `json:"sourceType"` // IMAGE, SELLER_NOTE, DOCUMENT, etc.
	SourceID    string `json:"sourceId,omitempty"`
	Description string `json:"description"`
}

type GeneratedContent struct {
	Title             string   `json:"title"`
	Description       string   `json:"description"`
	AlternativeTitles []string `json:"alternativeTitles"`
}

type ConditionSuggestion struct {
	SuggestedCondition string   `json:"suggestedCondition"`
	Confidence         float64  `json:"confidence"`
	Observations       []string `json:"observations"`
}

type MissingInformation struct {
	Field             string `json:"field"`
	Reason            string `json:"reason"`
	Severity          string `json:"severity"`
	RecommendedAction string `json:"recommendedAction"`
}

type ImageIntelligence struct {
	OverallQuality string `json:"overallQuality"`
	Resolution     string `json:"resolution"`
	Brightness     string `json:"brightness"`
	Blur           string `json:"blur"`
	Coverage       string `json:"coverage"`
	Centering      string `json:"centering"`
}

type SearchDiscovery struct {
	Keywords []string `json:"keywords"`
	Tags     []string `json:"tags"`
	Highlights []string `json:"highlights"`
}

type PriceIntelligence struct {
	SellerPrice      float64 `json:"sellerPrice"`
	Currency         string  `json:"currency"`
	ComparableCount  int     `json:"comparableCount"`
	MedianPrice      float64 `json:"medianPrice"`
	Q1               float64 `json:"q1"`
	Q3               float64 `json:"q3"`
	TypicalRangeMin  float64 `json:"typicalRangeMin"`
	TypicalRangeMax  float64 `json:"typicalRangeMax"`
	PricePosition    string  `json:"pricePosition"`
	PriceDeviation   float64 `json:"priceDeviation"`
	Confidence       float64 `json:"confidence"`
	ComparisonLevel  string  `json:"comparisonLevel"`
}

type ListingQuality struct {
	ImageQuality            float64 `json:"imageQuality"`
	AttributeCompleteness   float64 `json:"attributeCompleteness"`
	DescriptionQuality      float64 `json:"descriptionQuality"`
	ConditionClarity        float64 `json:"conditionClarity"`
	CategoryConsistency     float64 `json:"categoryConsistency"`
	InformationCompleteness float64 `json:"informationCompleteness"`
	OverallScore            float64 `json:"overallScore"`
}

type AIRecommendation struct {
	Type     string `json:"type"`
	Priority string `json:"priority"`
	Reason   string `json:"reason"`
	Action   string `json:"action"`
}

// Internal structures for communicating with python service
type AIAnalysisRequestPayload struct {
	ListingID    string             `json:"listing_id"`
	Category     CategoryInfo       `json:"category"`
	SellingPrice float64            `json:"selling_price"`
	Currency     string             `json:"currency"`
	SellerNotes  string             `json:"seller_notes"`
	Images       []ImagePayload     `json:"images"`
	Documents    []DocumentPayload  `json:"documents"`
}

type CategoryInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
}

type ImagePayload struct {
	ImageID string `json:"image_id"`
	URL     string `json:"url"` // Local file path or accessible URL for python
	Width   int    `json:"width"`
	Height  int    `json:"height"`
}

type DocumentPayload struct {
	DocumentID string `json:"document_id"`
	Type       string `json:"type"`
}
