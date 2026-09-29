-- =============================================================================
-- Migration: 001_initial_schema.down.sql
-- Description: Rollback initial schema
-- =============================================================================

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_listings_updated_at ON listings;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP SEQUENCE IF EXISTS listing_id_seq;
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS supporting_documents;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TYPE IF EXISTS evidence_source_type;
DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS ocr_status;
DROP TYPE IF EXISTS document_type;
DROP TYPE IF EXISTS listing_status;
