-- ============================================================
-- Migration 012: Add upcoming releases tracking
-- ============================================================

-- Add columns to shows table for tracking next episode
ALTER TABLE shows ADD COLUMN next_episode_air_date TEXT;
ALTER TABLE shows ADD COLUMN next_episode_season INTEGER;
ALTER TABLE shows ADD COLUMN next_episode_number INTEGER;
ALTER TABLE shows ADD COLUMN next_episode_name TEXT;
ALTER TABLE shows ADD COLUMN upcoming_updated_at DATETIME;

-- Add collection tracking for movies (for sequels)
ALTER TABLE movies ADD COLUMN tmdb_collection_id TEXT;
ALTER TABLE movies ADD COLUMN tmdb_collection_name TEXT;

-- Index for efficient querying of upcoming releases
CREATE INDEX IF NOT EXISTS idx_shows_next_episode ON shows(next_episode_air_date) WHERE next_episode_air_date IS NOT NULL;
