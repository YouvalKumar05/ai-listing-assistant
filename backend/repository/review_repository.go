package repository

import (
	"database/sql"
	"fmt"

	"github.com/youval/ai-listing-assistant/backend/models"
)

type ReviewRepository struct {
	db *sql.DB
}

func NewReviewRepository(db *sql.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) CreateReviewDecision(tx *sql.Tx, decision *models.ReviewDecision) error {
	query := `
		INSERT INTO review_decisions (
			listing_id, reviewer_id, action, reason, risk_score_at_review
		) VALUES (
			$1, $2, $3, $4, $5
		) RETURNING id, created_at`

	var executor interface {
		QueryRow(query string, args ...interface{}) *sql.Row
	} = r.db

	if tx != nil {
		executor = tx
	}

	err := executor.QueryRow(
		query,
		decision.ListingID,
		decision.ReviewerID,
		decision.Action,
		decision.Reason,
		decision.RiskScoreAtReview,
	).Scan(&decision.ID, &decision.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create review decision: %w", err)
	}

	return nil
}

func (r *ReviewRepository) GetReviewQueue() ([]models.ReviewQueueItem, error) {
	// A review queue item requires joined data from listings and risk_analyses
	query := `
		SELECT 
			l.id as listing_id,
			COALESCE(c.name, 'Unknown') as category,
			'Business' as seller_type, -- Mocked seller type for MVP
			l.selling_price,
			COALESCE(ra.risk_score, 0.0) as risk_score,
			COALESCE(ra.risk_band, 'REVIEW') as risk_band,
			COALESCE(ra.summary, 'Requires review') as main_concern,
			l.status,
			l.created_at
		FROM listings l
		LEFT JOIN categories c ON l.category_id = c.id
		LEFT JOIN risk_analyses ra ON ra.listing_id = l.id
		WHERE l.status IN ('RISK_REVIEW_PENDING', 'ADMIN_REVIEW', 'AI_ANALYSIS_COMPLETE')
		ORDER BY l.created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query review queue: %w", err)
	}
	defer rows.Close()

	var queue []models.ReviewQueueItem
	for rows.Next() {
		var item models.ReviewQueueItem
		if err := rows.Scan(
			&item.ListingID,
			&item.Category,
			&item.SellerType,
			&item.SellingPrice,
			&item.RiskScore,
			&item.RiskBand,
			&item.MainConcern,
			&item.Status,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan review queue item: %w", err)
		}
		queue = append(queue, item)
	}

	return queue, nil
}
