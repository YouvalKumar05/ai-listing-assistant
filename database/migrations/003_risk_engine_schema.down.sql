-- =============================================================================
-- Migration: 003_risk_engine_schema.down.sql
-- Description: Drop tables for Fraud Detection & Marketplace Risk Engine
-- =============================================================================

DROP TABLE IF EXISTS external_reviews CASCADE;
DROP TABLE IF EXISTS web_research_results CASCADE;
DROP TABLE IF EXISTS risk_features CASCADE;
DROP TABLE IF EXISTS risk_evidence CASCADE;
DROP TABLE IF EXISTS risk_signals CASCADE;
DROP TABLE IF EXISTS risk_analyses CASCADE;
DROP TABLE IF EXISTS seller_reputation CASCADE;
