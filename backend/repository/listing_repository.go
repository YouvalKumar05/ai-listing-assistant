package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/youval/ai-listing-assistant/backend/models"
)

// ListingRepository handles database operations for listings.
type ListingRepository interface {
	CreateListing(tx *sql.Tx, listing *models.Listing) error
	GetListingByID(id string) (*models.Listing, error)
	GenerateListingID() (string, error)
	UpdateStatusTx(tx *sql.Tx, listingID string, status models.ListingStatus) error
}

type listingRepository struct {
	db *sql.DB
}

// NewListingRepository returns a new instance of ListingRepository.
func NewListingRepository(db *sql.DB) ListingRepository {
	return &listingRepository{db: db}
}

// GenerateListingID generates a human-readable listing ID (e.g., LS-1001).
func (r *listingRepository) GenerateListingID() (string, error) {
	var seq int64
	err := r.db.QueryRow("SELECT nextval('listing_id_seq')").Scan(&seq)
	if err != nil {
		return "", fmt.Errorf("failed to generate listing id: %w", err)
	}
	return fmt.Sprintf("LS-%d", seq), nil
}

// CreateListing inserts a new listing into the database.
func (r *listingRepository) CreateListing(tx *sql.Tx, listing *models.Listing) error {
	query := `
		INSERT INTO listings (
			id, category_path, selling_price, currency, 
			seller_notes, seller_notes_norm, seller_type, status, request_id
		) VALUES (
			$1, $2, $3, $4, 
			$5, $6, $7, $8, $9
		) RETURNING created_at, updated_at
	`
	
	var sellerNotesNorm *string
	if listing.SellerNotes != nil {
		norm := strings.ToLower(strings.TrimSpace(*listing.SellerNotes))
		sellerNotesNorm = &norm
	}

	var err error
	if tx != nil {
		err = tx.QueryRow(
			query,
			listing.ID, listing.CategoryPath, listing.SellingPrice, listing.Currency,
			listing.SellerNotes, sellerNotesNorm, listing.SellerType, listing.Status, listing.RequestID,
		).Scan(&listing.CreatedAt, &listing.UpdatedAt)
	} else {
		err = r.db.QueryRow(
			query,
			listing.ID, listing.CategoryPath, listing.SellingPrice, listing.Currency,
			listing.SellerNotes, sellerNotesNorm, listing.SellerType, listing.Status, listing.RequestID,
		).Scan(&listing.CreatedAt, &listing.UpdatedAt)
	}

	if err != nil {
		return fmt.Errorf("failed to create listing: %w", err)
	}
	return nil
}

// GetListingByID retrieves a listing by its ID.
func (r *listingRepository) GetListingByID(id string) (*models.Listing, error) {
	query := `
		SELECT 
			id, category_path, selling_price, currency, 
			seller_notes, seller_type, status, request_id, created_at, updated_at
		FROM listings 
		WHERE id = $1
	`
	
	listing := &models.Listing{}
	err := r.db.QueryRow(query, id).Scan(
		&listing.ID, &listing.CategoryPath, &listing.SellingPrice, &listing.Currency,
		&listing.SellerNotes, &listing.SellerType, &listing.Status, &listing.RequestID, &listing.CreatedAt, &listing.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil // Not found
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get listing by id: %w", err)
	}
	
	return listing, nil
}

// UpdateStatusTx updates the status of a listing within a transaction.
func (r *listingRepository) UpdateStatusTx(tx *sql.Tx, listingID string, status models.ListingStatus) error {
	query := `
		UPDATE listings
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`
	var err error
	if tx != nil {
		_, err = tx.Exec(query, status, listingID)
	} else {
		_, err = r.db.Exec(query, status, listingID)
	}
	if err != nil {
		return fmt.Errorf("failed to update listing status: %w", err)
	}
	return nil
}
