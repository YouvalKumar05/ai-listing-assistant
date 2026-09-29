package repository

import (
	"database/sql"
	"fmt"

	"github.com/youval/ai-listing-assistant/backend/models"
)

// DocumentRepository handles database operations for supporting documents.
type DocumentRepository interface {
	CreateDocument(tx *sql.Tx, doc *models.SupportingDocument) error
	GetDocumentsByListingID(listingID string) ([]models.SupportingDocument, error)
}

type documentRepository struct {
	db *sql.DB
}

// NewDocumentRepository returns a new instance of DocumentRepository.
func NewDocumentRepository(db *sql.DB) DocumentRepository {
	return &documentRepository{db: db}
}

// CreateDocument inserts a new supporting document into the database.
func (r *documentRepository) CreateDocument(tx *sql.Tx, doc *models.SupportingDocument) error {
	query := `
		INSERT INTO supporting_documents (
			id, listing_id, document_type, original_filename, safe_filename, 
			mime_type, file_size, sha256_hash, storage_path, 
			ocr_status, document_metadata, verification_status
		) VALUES (
			$1, $2, $3, $4, $5, 
			$6, $7, $8, $9, 
			$10, $11, $12
		) RETURNING uploaded_at
	`

	var err error
	if tx != nil {
		err = tx.QueryRow(
			query,
			doc.ID, doc.ListingID, doc.DocumentType, doc.OriginalFilename, doc.SafeFilename,
			doc.MimeType, doc.FileSize, doc.Sha256Hash, doc.StoragePath,
			doc.OcrStatus, doc.DocumentMetadata, doc.VerificationStatus,
		).Scan(&doc.UploadedAt)
	} else {
		err = r.db.QueryRow(
			query,
			doc.ID, doc.ListingID, doc.DocumentType, doc.OriginalFilename, doc.SafeFilename,
			doc.MimeType, doc.FileSize, doc.Sha256Hash, doc.StoragePath,
			doc.OcrStatus, doc.DocumentMetadata, doc.VerificationStatus,
		).Scan(&doc.UploadedAt)
	}

	if err != nil {
		return fmt.Errorf("failed to create document: %w", err)
	}
	return nil
}

// GetDocumentsByListingID retrieves all documents for a given listing ID.
func (r *documentRepository) GetDocumentsByListingID(listingID string) ([]models.SupportingDocument, error) {
	query := `
		SELECT 
			id, listing_id, document_type, original_filename, mime_type, file_size, 
			sha256_hash, storage_path, ocr_status, verification_status, uploaded_at
		FROM supporting_documents 
		WHERE listing_id = $1
		ORDER BY uploaded_at ASC
	`
	
	rows, err := r.db.Query(query, listingID)
	if err != nil {
		return nil, fmt.Errorf("failed to query documents: %w", err)
	}
	defer rows.Close()

	var docs []models.SupportingDocument
	for rows.Next() {
		var doc models.SupportingDocument
		if err := rows.Scan(
			&doc.ID, &doc.ListingID, &doc.DocumentType, &doc.OriginalFilename, &doc.MimeType, &doc.FileSize,
			&doc.Sha256Hash, &doc.StoragePath, &doc.OcrStatus, &doc.VerificationStatus, &doc.UploadedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan document row: %w", err)
		}
		docs = append(docs, doc)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}
	
	return docs, nil
}
