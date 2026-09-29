package repository

import (
	"database/sql"
	"fmt"

	"github.com/youval/ai-listing-assistant/backend/models"
)

type AuditRepository struct {
	db *sql.DB
}

func NewAuditRepository(db *sql.DB) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) CreateAuditLog(tx *sql.Tx, log *models.AuditLog) error {
	query := `
		INSERT INTO audit_logs (
			listing_id, reviewer_id, action, reason, 
			previous_status, new_status, risk_score_snapshot, metadata
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		) RETURNING id, created_at`

	var executor interface {
		QueryRow(query string, args ...interface{}) *sql.Row
	} = r.db

	if tx != nil {
		executor = tx
	}

	err := executor.QueryRow(
		query,
		log.ListingID,
		log.ReviewerID,
		log.Action,
		log.Reason,
		log.PreviousStatus,
		log.NewStatus,
		log.RiskScoreSnapshot,
		log.Metadata,
	).Scan(&log.ID, &log.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	return nil
}

func (r *AuditRepository) GetAuditLogsByListingID(listingID string) ([]models.AuditLog, error) {
	query := `
		SELECT id, listing_id, reviewer_id, action, reason, 
		       previous_status, new_status, risk_score_snapshot, metadata, created_at
		FROM audit_logs
		WHERE listing_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(query, listingID)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit logs: %w", err)
	}
	defer rows.Close()

	var logs []models.AuditLog
	for rows.Next() {
		var log models.AuditLog
		if err := rows.Scan(
			&log.ID, &log.ListingID, &log.ReviewerID, &log.Action, &log.Reason,
			&log.PreviousStatus, &log.NewStatus, &log.RiskScoreSnapshot, &log.Metadata, &log.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan audit log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, nil
}
