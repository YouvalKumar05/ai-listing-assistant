-- =============================================================================
-- Migration: 003_risk_engine_schema.up.sql
-- Description: Create tables for Fraud Detection & Marketplace Risk Engine
-- =============================================================================

-- =============================================================================
-- SELLER REPUTATION
-- =============================================================================
CREATE TABLE IF NOT EXISTS seller_reputation (
    seller_id                   VARCHAR(100) PRIMARY KEY,
    public_presence_score       NUMERIC(5,2) DEFAULT 0.0,
    name_consistency_score      NUMERIC(5,2) DEFAULT 0.0,
    domain_consistency_score    NUMERIC(5,2) DEFAULT 0.0,
    review_volume               INT DEFAULT 0,
    average_rating              NUMERIC(3,2) DEFAULT 0.0,
    negative_review_ratio       NUMERIC(4,3) DEFAULT 0.0,
    complaint_count             INT DEFAULT 0,
    recent_complaint_count      INT DEFAULT 0,
    seller_reputation_score     NUMERIC(5,2) DEFAULT 50.0,
    data_confidence             NUMERIC(4,3) DEFAULT 0.5,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_reputation_seller_id ON seller_reputation(seller_id);

-- =============================================================================
-- RISK ANALYSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS risk_analyses (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id                  VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    status                      VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    risk_score                  NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    risk_band                   VARCHAR(20) NOT NULL DEFAULT 'LOW',
    confidence                  NUMERIC(4,3) NOT NULL DEFAULT 0.5,
    summary                     TEXT,
    authenticity_status         VARCHAR(50) DEFAULT 'evidence_sufficient',
    authenticity_note           TEXT,
    recommended_action          VARCHAR(50) DEFAULT 'proceed_to_admin_review',
    recommended_action_label    VARCHAR(100) DEFAULT 'Proceed to Admin Review',
    model_version               VARCHAR(50) NOT NULL DEFAULT '1.0.0-heuristic',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_analyses_listing_id ON risk_analyses(listing_id);

-- =============================================================================
-- RISK SIGNALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS risk_signals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_analysis_id    UUID NOT NULL REFERENCES risk_analyses(id) ON DELETE CASCADE,
    signal_group        VARCHAR(50) NOT NULL,
    signal_name         VARCHAR(100) NOT NULL,
    severity            VARCHAR(20) NOT NULL,
    score_contribution  NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    confidence          NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    finding             TEXT NOT NULL,
    recommended_action  VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_signals_analysis_id ON risk_signals(risk_analysis_id);

-- =============================================================================
-- RISK EVIDENCE
-- =============================================================================
CREATE TABLE IF NOT EXISTS risk_evidence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    signal_group        VARCHAR(50) NOT NULL,
    source_type         VARCHAR(50) NOT NULL,
    source_reference    VARCHAR(255),
    source_url          TEXT,
    source_title        VARCHAR(255),
    evidence_text       TEXT NOT NULL,
    evidence_value      TEXT,
    confidence          NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    retrieved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_evidence_listing_id ON risk_evidence(listing_id);

-- =============================================================================
-- RISK FEATURES
-- =============================================================================
CREATE TABLE IF NOT EXISTS risk_features (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    feature_group       VARCHAR(50) NOT NULL,
    feature_name        VARCHAR(100) NOT NULL,
    feature_value       VARCHAR(255),
    normalized_score    NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    severity            VARCHAR(20) NOT NULL DEFAULT 'LOW',
    confidence          NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    evidence_id         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_features_listing_id ON risk_features(listing_id);

-- =============================================================================
-- WEB RESEARCH RESULTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS web_research_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_id           VARCHAR(100),
    query               TEXT NOT NULL,
    source_url          TEXT NOT NULL,
    source_domain       VARCHAR(255) NOT NULL,
    source_type         VARCHAR(50) NOT NULL,
    title               VARCHAR(255),
    snippet             TEXT,
    retrieved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    relevance_score     NUMERIC(4,3) NOT NULL DEFAULT 1.0,
    confidence          NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_web_research_listing_id ON web_research_results(listing_id);
CREATE INDEX IF NOT EXISTS idx_web_research_source_domain ON web_research_results(source_domain);

-- =============================================================================
-- EXTERNAL REVIEWS
-- =============================================================================
CREATE TABLE IF NOT EXISTS external_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_id           VARCHAR(100),
    source_url          TEXT,
    source_domain       VARCHAR(255),
    review_date         TIMESTAMPTZ,
    rating              NUMERIC(3,2),
    review_text         TEXT NOT NULL,
    sentiment           VARCHAR(20),
    complaint_theme     VARCHAR(100),
    review_confidence   NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_reviews_listing_id ON external_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_external_reviews_seller_id ON external_reviews(seller_id);
