-- =============================================================================
-- Migration: 002_ai_analysis_schema.up.sql
-- Description: Create tables for AI Analysis and Listing Generation
-- =============================================================================

-- =============================================================================
-- AI ANALYSES
-- =============================================================================
CREATE TYPE analysis_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);

CREATE TABLE ai_analyses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    status          analysis_status NOT NULL DEFAULT 'PENDING',
    model_provider  VARCHAR(100),
    model_name      VARCHAR(100),
    prompt_version  VARCHAR(50),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analyses_listing_id ON ai_analyses(listing_id);

-- =============================================================================
-- PRODUCT ATTRIBUTES
-- =============================================================================
CREATE TYPE attribute_status AS ENUM (
    'CONFIRMED',
    'LIKELY',
    'UNKNOWN',
    'MISSING',
    'CONFLICTING'
);

CREATE TABLE product_attributes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    attribute_name  VARCHAR(100) NOT NULL,
    attribute_value TEXT,
    status          attribute_status NOT NULL,
    confidence      NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_attributes_listing_id ON product_attributes(listing_id);

-- =============================================================================
-- ATTRIBUTE EVIDENCE
-- =============================================================================
CREATE TABLE attribute_evidence (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id    UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    source_type     evidence_source_type NOT NULL,
    source_id       VARCHAR(100), -- Can be image ID or document ID
    description     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attribute_evidence_attribute_id ON attribute_evidence(attribute_id);

-- =============================================================================
-- GENERATED LISTING CONTENT
-- =============================================================================
CREATE TABLE generated_listing_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    condition       VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_listing_content_listing_id ON generated_listing_content(listing_id);

CREATE TRIGGER trg_generated_listing_content_updated_at
    BEFORE UPDATE ON generated_listing_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- GENERATED TITLE VARIANTS
-- =============================================================================
CREATE TABLE generated_title_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    rank            INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_title_variants_listing_id ON generated_title_variants(listing_id);

-- =============================================================================
-- LISTING KEYWORDS
-- =============================================================================
CREATE TYPE keyword_type AS ENUM ('KEYWORD', 'TAG', 'HIGHLIGHT');

CREATE TABLE listing_keywords (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    keyword         VARCHAR(200) NOT NULL,
    keyword_type    keyword_type NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_keywords_listing_id ON listing_keywords(listing_id);

-- =============================================================================
-- MISSING INFORMATION
-- =============================================================================
CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE missing_information (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    field_name          VARCHAR(100) NOT NULL,
    reason              TEXT NOT NULL,
    severity            severity_level NOT NULL,
    recommended_action  TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_missing_information_listing_id ON missing_information(listing_id);

-- =============================================================================
-- AI RECOMMENDATIONS
-- =============================================================================
CREATE TYPE recommendation_type AS ENUM (
    'CONTENT',
    'IMAGE',
    'ATTRIBUTE',
    'CONDITION',
    'CATEGORY',
    'PRICE',
    'DOCUMENT'
);

CREATE TABLE ai_recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    recommendation_type recommendation_type NOT NULL,
    priority            severity_level NOT NULL,
    reason              TEXT NOT NULL,
    action              TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_recommendations_listing_id ON ai_recommendations(listing_id);

-- =============================================================================
-- PRICE INTELLIGENCE
-- =============================================================================
CREATE TYPE price_position AS ENUM (
    'BELOW_TYPICAL_RANGE',
    'WITHIN_TYPICAL_RANGE',
    'ABOVE_TYPICAL_RANGE',
    'INSUFFICIENT_DATA'
);

CREATE TABLE price_intelligence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_price        NUMERIC(12, 2) NOT NULL,
    median_price        NUMERIC(12, 2),
    q1                  NUMERIC(12, 2),
    q3                  NUMERIC(12, 2),
    iqr                 NUMERIC(12, 2),
    comparable_count    INT NOT NULL DEFAULT 0,
    price_deviation     NUMERIC(10, 4),
    price_position      price_position NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    confidence          NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    comparison_level    VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_intelligence_listing_id ON price_intelligence(listing_id);

-- =============================================================================
-- LISTING QUALITY
-- =============================================================================
CREATE TABLE listing_quality (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id                  VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_quality               NUMERIC(5,2) NOT NULL DEFAULT 0,
    attribute_completeness      NUMERIC(5,2) NOT NULL DEFAULT 0,
    description_quality         NUMERIC(5,2) NOT NULL DEFAULT 0,
    condition_clarity           NUMERIC(5,2) NOT NULL DEFAULT 0,
    category_consistency        NUMERIC(5,2) NOT NULL DEFAULT 0,
    information_completeness    NUMERIC(5,2) NOT NULL DEFAULT 0,
    overall_score               NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_quality_listing_id ON listing_quality(listing_id);
