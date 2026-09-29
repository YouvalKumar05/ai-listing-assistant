package repository

import (
	"database/sql"
	"fmt"

	"github.com/youval/ai-listing-assistant/backend/models"
)

// ImageRepository handles database operations for listing images.
type ImageRepository interface {
	CreateImage(tx *sql.Tx, image *models.ListingImage) error
	GetImagesByListingID(listingID string) ([]models.ListingImage, error)
}

type imageRepository struct {
	db *sql.DB
}

// NewImageRepository returns a new instance of ImageRepository.
func NewImageRepository(db *sql.DB) ImageRepository {
	return &imageRepository{db: db}
}

// CreateImage inserts a new listing image into the database.
func (r *imageRepository) CreateImage(tx *sql.Tx, img *models.ListingImage) error {
	query := `
		INSERT INTO listing_images (
			id, listing_id, original_filename, safe_filename, mime_type, file_size, 
			width, height, sha256_hash, perceptual_hash, brightness_score, blur_score, 
			contrast_score, resolution_score, storage_path, is_cover, sort_order
		) VALUES (
			$1, $2, $3, $4, $5, $6, 
			$7, $8, $9, $10, $11, $12, 
			$13, $14, $15, $16, $17
		) RETURNING created_at
	`

	var err error
	if tx != nil {
		err = tx.QueryRow(
			query,
			img.ID, img.ListingID, img.OriginalFilename, img.SafeFilename, img.MimeType, img.FileSize,
			img.Width, img.Height, img.Sha256Hash, img.PerceptualHash, img.BrightnessScore, img.BlurScore,
			img.ContrastScore, img.ResolutionScore, img.StoragePath, img.IsCover, img.SortOrder,
		).Scan(&img.CreatedAt)
	} else {
		err = r.db.QueryRow(
			query,
			img.ID, img.ListingID, img.OriginalFilename, img.SafeFilename, img.MimeType, img.FileSize,
			img.Width, img.Height, img.Sha256Hash, img.PerceptualHash, img.BrightnessScore, img.BlurScore,
			img.ContrastScore, img.ResolutionScore, img.StoragePath, img.IsCover, img.SortOrder,
		).Scan(&img.CreatedAt)
	}

	if err != nil {
		return fmt.Errorf("failed to create image: %w", err)
	}
	return nil
}

// GetImagesByListingID retrieves all images for a given listing ID.
func (r *imageRepository) GetImagesByListingID(listingID string) ([]models.ListingImage, error) {
	query := `
		SELECT 
			id, listing_id, original_filename, mime_type, file_size, 
			width, height, sha256_hash, perceptual_hash, storage_path, is_cover, sort_order, created_at
		FROM listing_images 
		WHERE listing_id = $1
		ORDER BY sort_order ASC
	`
	
	rows, err := r.db.Query(query, listingID)
	if err != nil {
		return nil, fmt.Errorf("failed to query images: %w", err)
	}
	defer rows.Close()

	var images []models.ListingImage
	for rows.Next() {
		var img models.ListingImage
		if err := rows.Scan(
			&img.ID, &img.ListingID, &img.OriginalFilename, &img.MimeType, &img.FileSize,
			&img.Width, &img.Height, &img.Sha256Hash, &img.PerceptualHash, &img.StoragePath, &img.IsCover, &img.SortOrder, &img.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan image row: %w", err)
		}
		images = append(images, img)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}
	
	return images, nil
}
