-- =============================================================================
-- Migration: 004_admin_review_schema.up.sql
-- Description: Create tables for Human Review / Admin Decision Layer
-- =============================================================================

-- =============================================================================
-- REVIEW DECISIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS review_decisions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id              VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reviewer_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    action                  VARCHAR(50) NOT NULL,
    reason                  TEXT,
    risk_score_at_review    NUMERIC(5,2),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_decisions_listing_id ON review_decisions(listing_id);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id              VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reviewer_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    action                  VARCHAR(50) NOT NULL,
    reason                  TEXT,
    previous_status         VARCHAR(50),
    new_status              VARCHAR(50) NOT NULL,
    risk_score_snapshot     NUMERIC(5,2),
    metadata                JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_listing_id ON audit_logs(listing_id);
