-- =============================================================================
-- Migration: 001_initial_schema.up.sql
-- Description: Create core tables for AI Listing Assistant
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CATEGORIES
-- =============================================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    parent_id   INT REFERENCES categories(id) ON DELETE SET NULL,
    name        VARCHAR(100) NOT NULL,
    path        TEXT NOT NULL UNIQUE,
    slug        VARCHAR(200) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);

-- =============================================================================
-- USERS (Sellers)
-- =============================================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200),
    email       VARCHAR(254) UNIQUE,
    seller_type VARCHAR(20) NOT NULL DEFAULT 'individual'
                CHECK (seller_type IN ('individual', 'business')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- LISTINGS
-- =============================================================================
CREATE TYPE listing_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PREPROCESSING',
    'AI_ANALYSIS_PENDING',
    'AI_ANALYSIS_COMPLETE',
    'RISK_REVIEW_PENDING',
    'ADMIN_REVIEW',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE listings (
    id                  VARCHAR(20) PRIMARY KEY,
    seller_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id         INT REFERENCES categories(id) ON DELETE SET NULL,
    category_path       TEXT NOT NULL,
    selling_price       NUMERIC(12, 2) NOT NULL CHECK (selling_price > 0),
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    seller_notes        TEXT,
    seller_notes_norm   TEXT,
    seller_type         VARCHAR(20) NOT NULL DEFAULT 'individual'
                        CHECK (seller_type IN ('individual', 'business')),
    status              listing_status NOT NULL DEFAULT 'SUBMITTED',
    request_id          UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- =============================================================================
-- LISTING IMAGES
-- =============================================================================
CREATE TABLE listing_images (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    original_filename   VARCHAR(500) NOT NULL,
    safe_filename       VARCHAR(500) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    file_size           BIGINT NOT NULL CHECK (file_size > 0),
    width               INT,
    height              INT,
    sha256_hash         VARCHAR(64) NOT NULL,
    perceptual_hash     VARCHAR(64),
    brightness_score    NUMERIC(5,4),
    blur_score          NUMERIC(5,4),
    contrast_score      NUMERIC(5,4),
    resolution_score    NUMERIC(5,4),
    storage_path        TEXT NOT NULL,
    is_cover            BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_sha256 ON listing_images(sha256_hash);
CREATE INDEX idx_listing_images_is_cover ON listing_images(listing_id, is_cover);

-- =============================================================================
-- SUPPORTING DOCUMENTS
-- =============================================================================
CREATE TYPE document_type AS ENUM (
    'Purchase Invoice',
    'Retail Bill / Receipt',
    'E-commerce Order Invoice',
    'Order Confirmation',
    'Warranty Card',
    'Certificate of Authenticity',
    'Business Registration',
    'GST Registration',
    'Other Supporting Document',
    'Other Business Document'
);

CREATE TYPE ocr_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE', 'FAILED', 'SKIPPED');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

CREATE TABLE supporting_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id          VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    document_type       document_type NOT NULL,
    original_filename   VARCHAR(500) NOT NULL,
    safe_filename       VARCHAR(500) NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    file_size           BIGINT NOT NULL CHECK (file_size > 0),
    sha256_hash         VARCHAR(64) NOT NULL,
    storage_path        TEXT NOT NULL,
    ocr_status          ocr_status NOT NULL DEFAULT 'PENDING',
    ocr_text            TEXT,
    document_metadata   JSONB,
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supporting_documents_listing_id ON supporting_documents(listing_id);
CREATE INDEX idx_supporting_documents_sha256 ON supporting_documents(sha256_hash);
CREATE INDEX idx_supporting_documents_type ON supporting_documents(document_type);

-- =============================================================================
-- EVIDENCE (Prepared for Prompt 3 fraud analysis)
-- =============================================================================
CREATE TYPE evidence_source_type AS ENUM (
    'SELLER_INPUT',
    'IMAGE',
    'DOCUMENT',
    'AI_INFERENCE',
    'WEB_SOURCE',
    'MARKET_DATA'
);

CREATE TABLE evidence (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id      VARCHAR(20) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    source_type     evidence_source_type NOT NULL,
    source_id       UUID,
    field           VARCHAR(100) NOT NULL,
    value           TEXT NOT NULL,
    confidence      NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_listing_id ON evidence(listing_id);
CREATE INDEX idx_evidence_source ON evidence(source_type, source_id);

-- =============================================================================
-- LISTING SEQUENCE (for human-readable IDs like LS-1001)
-- =============================================================================
CREATE SEQUENCE listing_id_seq START WITH 1001;

-- =============================================================================
-- AUTO-UPDATE updated_at trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
