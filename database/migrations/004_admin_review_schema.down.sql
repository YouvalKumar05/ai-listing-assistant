-- =============================================================================
-- Migration: 004_admin_review_schema.down.sql
-- Description: Drop tables for Human Review / Admin Decision Layer
-- =============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS review_decisions CASCADE;
