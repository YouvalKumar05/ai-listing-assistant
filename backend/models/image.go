package models

import (
	"time"

	"github.com/google/uuid"
)

// ListingImage represents an image uploaded by the seller.
type ListingImage struct {
	ID              uuid.UUID `json:"id" db:"id"`
	ListingID       string    `json:"listingId" db:"listing_id"`
	OriginalFilename string    `json:"originalFilename" db:"original_filename"`
	SafeFilename    string    `json:"-" db:"safe_filename"`
	MimeType        string    `json:"mimeType" db:"mime_type"`
	FileSize        int64     `json:"fileSize" db:"file_size"`
	Width           *int      `json:"width,omitempty" db:"width"`
	Height          *int      `json:"height,omitempty" db:"height"`
	Sha256Hash      string    `json:"sha256Hash" db:"sha256_hash"`
	PerceptualHash  *string   `json:"perceptualHash,omitempty" db:"perceptual_hash"`
	BrightnessScore *float64  `json:"brightnessScore,omitempty" db:"brightness_score"`
	BlurScore       *float64  `json:"blurScore,omitempty" db:"blur_score"`
	ContrastScore   *float64  `json:"contrastScore,omitempty" db:"contrast_score"`
	ResolutionScore *float64  `json:"resolutionScore,omitempty" db:"resolution_score"`
	StoragePath     string    `json:"-" db:"storage_path"`
	IsCover         bool      `json:"isCover" db:"is_cover"`
	SortOrder       int       `json:"sortOrder" db:"sort_order"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
}

// ImageResponse is the API response format for an image.
type ImageResponse struct {
	ID              uuid.UUID `json:"id"`
	OriginalFilename string    `json:"filename"`
	MimeType        string    `json:"mimeType"`
	FileSize        int64     `json:"sizeBytes"`
	IsCover         bool      `json:"isCover"`
	Url             string    `json:"url"` // frontend accessible URL
}
