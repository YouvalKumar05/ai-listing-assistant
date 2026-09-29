-- =============================================================================
-- Migration: 002_ai_analysis_schema.down.sql
-- Description: Drop tables for AI Analysis and Listing Generation
-- =============================================================================

DROP TABLE IF EXISTS listing_quality;
DROP TABLE IF EXISTS price_intelligence;
DROP TYPE IF EXISTS price_position;
DROP TABLE IF EXISTS ai_recommendations;
DROP TYPE IF EXISTS recommendation_type;
DROP TABLE IF EXISTS missing_information;
DROP TYPE IF EXISTS severity_level;
DROP TABLE IF EXISTS listing_keywords;
DROP TYPE IF EXISTS keyword_type;
DROP TABLE IF EXISTS generated_title_variants;
DROP TRIGGER IF EXISTS trg_generated_listing_content_updated_at ON generated_listing_content;
DROP TABLE IF EXISTS generated_listing_content;
DROP TABLE IF EXISTS attribute_evidence;
DROP TABLE IF EXISTS product_attributes;
DROP TYPE IF EXISTS attribute_status;
DROP TABLE IF EXISTS ai_analyses;
DROP TYPE IF EXISTS analysis_status;
