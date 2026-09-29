package services

import (
	"database/sql"
	"fmt"
	"mime/multipart"

	"github.com/google/uuid"
	"github.com/youval/ai-listing-assistant/backend/models"
	"github.com/youval/ai-listing-assistant/backend/repository"
)

// ListingService coordinates listing creation and retrieval.
type ListingService interface {
	CreateListing(req *models.CreateListingRequest, images []*multipart.FileHeader, docs []*multipart.FileHeader, docTypes []string) (*models.CreateListingResponse, error)
	GetListing(listingID string) (*models.GetListingResponse, error)
}

type listingService struct {
	db        *sql.DB
	listingRepo repository.ListingRepository
	imageRepo   repository.ImageRepository
	docRepo     repository.DocumentRepository
	fileSvc     FileService
	prepSvc     PreprocessingService
}

// NewListingService creates a new ListingService.
func NewListingService(db *sql.DB, lr repository.ListingRepository, ir repository.ImageRepository, dr repository.DocumentRepository, fs FileService, ps PreprocessingService) ListingService {
	return &listingService{
		db:        db,
		listingRepo: lr,
		imageRepo:   ir,
		docRepo:     dr,
		fileSvc:     fs,
		prepSvc:     ps,
	}
}

// CreateListing handles the complex workflow of saving a listing, its images, and documents.
func (s *listingService) CreateListing(req *models.CreateListingRequest, images []*multipart.FileHeader, docs []*multipart.FileHeader, docTypes []string) (*models.CreateListingResponse, error) {
	// 1. Generate Listing ID
	listingID, err := s.listingRepo.GenerateListingID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate listing id: %w", err)
	}

	// Create listing object
	sellerNotes := req.SellerNotes
	var notesPtr *string
	if sellerNotes != "" {
		notesPtr = &sellerNotes
	}
	
	currency := req.Currency
	if currency == "" {
		currency = "INR"
	}

	sellerType := req.SellerType
	if sellerType == "" {
		sellerType = models.SellerIndividual
	}

	listing := &models.Listing{
		ID:           listingID,
		CategoryPath: req.CategoryPath,
		SellingPrice: req.SellingPrice,
		Currency:     currency,
		SellerNotes:  notesPtr,
		SellerType:   sellerType,
		Status:       models.StatusPreprocessing,
		RequestID:    uuid.New(),
	}

	// 2. Start Transaction
	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 3. Save Listing
	if err := s.listingRepo.CreateListing(tx, listing); err != nil {
		return nil, err
	}

	// 4. Process & Save Images
	imgCount := 0
	for i, fileHeader := range images {
		if i >= 5 {
			break // Enforce max 5 images
		}

		processedFile, err := s.fileSvc.ProcessUploadedFile(fileHeader, listingID, true)
		if err != nil {
			return nil, fmt.Errorf("failed to process image %s: %w", fileHeader.Filename, err)
		}

		// Analyze image
		analysis, err := s.prepSvc.AnalyzeImage(processedFile.StoragePath)
		if err != nil {
			return nil, fmt.Errorf("failed to analyze image %s: %w", fileHeader.Filename, err)
		}

		imgRecord := &models.ListingImage{
			ID:               uuid.New(),
			ListingID:        listingID,
			OriginalFilename: processedFile.OriginalFilename,
			SafeFilename:     processedFile.SafeFilename,
			MimeType:         processedFile.MimeType,
			FileSize:         processedFile.FileSize,
			Width:            &analysis.Width,
			Height:           &analysis.Height,
			Sha256Hash:       processedFile.Sha256Hash,
			PerceptualHash:   &analysis.PerceptualHash,
			BrightnessScore:  &analysis.BrightnessScore,
			BlurScore:        &analysis.BlurScore,
			ContrastScore:    &analysis.ContrastScore,
			ResolutionScore:  &analysis.ResolutionScore,
			StoragePath:      processedFile.StoragePath,
			IsCover:          i == 0, // First image is cover
			SortOrder:        i,
		}

		if err := s.imageRepo.CreateImage(tx, imgRecord); err != nil {
			return nil, err
		}
		imgCount++
	}

	if imgCount == 0 {
		return nil, fmt.Errorf("at least one image is required")
	}

	// 5. Process & Save Documents
	docCount := 0
	for i, fileHeader := range docs {
		docType := "Other Supporting Document"
		if i < len(docTypes) && docTypes[i] != "" {
			docType = docTypes[i]
		}

		processedFile, err := s.fileSvc.ProcessUploadedFile(fileHeader, listingID, false)
		if err != nil {
			return nil, fmt.Errorf("failed to process document %s: %w", fileHeader.Filename, err)
		}

		docRecord := &models.SupportingDocument{
			ID:                 uuid.New(),
			ListingID:          listingID,
			DocumentType:       models.DocumentType(docType),
			OriginalFilename:   processedFile.OriginalFilename,
			SafeFilename:       processedFile.SafeFilename,
			MimeType:           processedFile.MimeType,
			FileSize:           processedFile.FileSize,
			Sha256Hash:         processedFile.Sha256Hash,
			StoragePath:        processedFile.StoragePath,
			OcrStatus:          models.OcrPending,
			VerificationStatus: models.VerifyUnverified,
		}

		if err := s.docRepo.CreateDocument(tx, docRecord); err != nil {
			return nil, err
		}
		docCount++
	}

	// 6. Commit Transaction
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Return Success Response
	return &models.CreateListingResponse{
		ListingID: listingID,
		Status:    listing.Status,
		Message:   "Listing submitted successfully",
		Images:    models.ImageCountSummary{Count: imgCount},
		Documents: models.DocumentCountSummary{Count: docCount},
		NextStep:  "AI_ANALYSIS",
	}, nil
}

// GetListing retrieves listing details, images, and documents.
func (s *listingService) GetListing(listingID string) (*models.GetListingResponse, error) {
	listing, err := s.listingRepo.GetListingByID(listingID)
	if err != nil {
		return nil, err
	}
	if listing == nil {
		return nil, nil // Not found
	}

	images, err := s.imageRepo.GetImagesByListingID(listingID)
	if err != nil {
		return nil, err
	}

	documents, err := s.docRepo.GetDocumentsByListingID(listingID)
	if err != nil {
		return nil, err
	}

	var imgRes []models.ImageResponse
	for _, img := range images {
		imgRes = append(imgRes, models.ImageResponse{
			ID:               img.ID,
			OriginalFilename: img.OriginalFilename,
			MimeType:         img.MimeType,
			FileSize:         img.FileSize,
			IsCover:          img.IsCover,
			Url:              fmt.Sprintf("/api/v1/listings/%s/images/%s", listingID, img.ID),
		})
	}

	var docRes []models.DocumentResponse
	for _, doc := range documents {
		docRes = append(docRes, models.DocumentResponse{
			ID:               doc.ID,
			DocumentType:     doc.DocumentType,
			OriginalFilename: doc.OriginalFilename,
			FileSize:         doc.FileSize,
			OcrStatus:        doc.OcrStatus,
			UploadedAt:       doc.UploadedAt,
			Url:              fmt.Sprintf("/api/v1/listings/%s/documents/%s", listingID, doc.ID),
		})
	}

	return &models.GetListingResponse{
		ListingID:    listing.ID,
		CategoryPath: listing.CategoryPath,
		SellingPrice: listing.SellingPrice,
		Currency:     listing.Currency,
		SellerNotes:  listing.SellerNotes,
		SellerType:   listing.SellerType,
		Status:       listing.Status,
		Images:       imgRes,
		Documents:    docRes,
		CreatedAt:    listing.CreatedAt,
	}, nil
}
