-- ============================================================
-- Migration 007: Add enrichment columns for multi-source books
-- ============================================================

-- Add columns for source tracking
ALTER TABLE books ADD COLUMN google_books_id TEXT;
ALTER TABLE books ADD COLUMN hardcover_id TEXT;
ALTER TABLE books ADD COLUMN hardcover_slug TEXT;

-- Add columns for Hardcover enrichment data
ALTER TABLE books ADD COLUMN tropes TEXT;           -- JSON array
ALTER TABLE books ADD COLUMN moods TEXT;            -- JSON array
ALTER TABLE books ADD COLUMN content_warnings TEXT; -- JSON array

-- Add indexes for source lookups
CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);
CREATE INDEX IF NOT EXISTS idx_books_hardcover_slug ON books(hardcover_slug);
