-- Migration 009: dismissed_media table
-- Table pour stocker les médias refusés dans les recommandations IA

CREATE TABLE IF NOT EXISTS dismissed_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT NOT NULL,           -- 'book', 'movie', 'show'
    title TEXT NOT NULL,                -- Titre pour le matching
    media_id TEXT,                      -- ID optionnel si connu
    reason TEXT NOT NULL,               -- 'already_consumed', 'not_interested', 'other'
    reason_detail TEXT,                 -- Texte libre optionnel pour 'other'
    dismissed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_type, title)           -- Empêcher les doublons
);

CREATE INDEX IF NOT EXISTS idx_dismissed_media_type ON dismissed_media(media_type);
CREATE INDEX IF NOT EXISTS idx_dismissed_title ON dismissed_media(title);
