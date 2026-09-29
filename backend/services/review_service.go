package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/youval/ai-listing-assistant/backend/models"
	"github.com/youval/ai-listing-assistant/backend/repository"
)

type ReviewService struct {
	db          *sql.DB
	listingRepo repository.ListingRepository
	reviewRepo  *repository.ReviewRepository
	auditRepo   *repository.AuditRepository
}

func NewReviewService(
	db *sql.DB,
	listingRepo repository.ListingRepository,
	reviewRepo *repository.ReviewRepository,
	auditRepo *repository.AuditRepository,
) *ReviewService {
	return &ReviewService{
		db:          db,
		listingRepo: listingRepo,
		reviewRepo:  reviewRepo,
		auditRepo:   auditRepo,
	}
}

func (s *ReviewService) ProcessDecision(ctx context.Context, listingID string, reviewerID *uuid.UUID, req models.DecisionRequest) (*models.DecisionResponse, error) {
	// 1. Validate reason requirements
	if req.Action != models.ActionApprove && req.Reason == "" {
		return nil, errors.New("reason is required for this action")
	}

	// 2. Begin Transaction
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 3. Get current listing to check status
	listing, err := s.listingRepo.GetListingByID(listingID)
	if err != nil {
		return nil, fmt.Errorf("failed to get listing: %w", err)
	}
	if listing == nil {
		return nil, errors.New("listing not found")
	}

	previousStatus := listing.Status

	// 4. Validate allowed transitions
	var newStatus string
	switch req.Action {
	case models.ActionApprove:
		newStatus = string(models.StatusApproved)
	case models.ActionRequestInformation:
		newStatus = "REQUEST_INFORMATION"
	case models.ActionHold:
		newStatus = "HOLD"
	case models.ActionEscalateAuthentication:
		newStatus = "ESCALATE_AUTHENTICATION"
	case models.ActionRestrict:
		newStatus = "RESTRICTED"
	default:
		return nil, errors.New("invalid review action")
	}

	if string(previousStatus) == newStatus {
		return nil, errors.New("listing is already in the requested status")
	}

	// 5. Update listing status
	err = s.listingRepo.UpdateStatusTx(tx, listingID, models.ListingStatus(newStatus))
	if err != nil {
		return nil, fmt.Errorf("failed to update listing status: %w", err)
	}

	// 6. Create Review Decision record
	decision := &models.ReviewDecision{
		ListingID:  listingID,
		ReviewerID: reviewerID,
		Action:     req.Action,
		Reason:     req.Reason,
	}

	// Optional: we could fetch the current risk score from risk_analyses and populate RiskScoreAtReview
	// For MVP, we'll leave it nil or fetch it if needed.

	err = s.reviewRepo.CreateReviewDecision(tx, decision)
	if err != nil {
		return nil, fmt.Errorf("failed to create review decision: %w", err)
	}

	// 7. Create Audit Log record
	audit := &models.AuditLog{
		ListingID:      listingID,
		ReviewerID:     reviewerID,
		Action:         string(req.Action),
		Reason:         req.Reason,
		PreviousStatus: string(previousStatus),
		NewStatus:      newStatus,
	}
	err = s.auditRepo.CreateAuditLog(tx, audit)
	if err != nil {
		return nil, fmt.Errorf("failed to create audit log: %w", err)
	}

	// 8. Commit
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// 9. Return Response
	return &models.DecisionResponse{
		ListingID:      listingID,
		PreviousStatus: string(previousStatus),
		NewStatus:      newStatus,
		Action:         req.Action,
		Reason:         req.Reason,
		AuditLogID:     audit.ID.String(),
		Timestamp:      time.Now(),
	}, nil
}
