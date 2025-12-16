-- Migration 011: Add runtime column to watched_episodes
-- Stores the duration of each episode when marked as watched

ALTER TABLE watched_episodes ADD COLUMN runtime INTEGER DEFAULT NULL;

-- Update existing episodes with default 45 min (will be overwritten when re-watched)
UPDATE watched_episodes SET runtime = 45 WHERE runtime IS NULL;
