-- ============================================================
-- Episode Tracking Migration
-- Allows tracking watched episodes per season like TV Time
-- ============================================================

-- Cache des saisons (métadonnées TMDB)
CREATE TABLE IF NOT EXISTS show_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL,
    season_number INTEGER NOT NULL,
    name TEXT,
    overview TEXT,
    poster_path TEXT,
    air_date TEXT,
    episode_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(show_id, season_number)
);

-- Episodes vus par l'utilisateur
CREATE TABLE IF NOT EXISTS watched_episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(show_id, season_number, episode_number)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_show_seasons_show ON show_seasons(show_id);
CREATE INDEX IF NOT EXISTS idx_watched_episodes_show ON watched_episodes(show_id);
CREATE INDEX IF NOT EXISTS idx_watched_episodes_show_season ON watched_episodes(show_id, season_number);
