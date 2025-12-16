-- Migration 010: wishlist table
-- Table pour stocker les médias en liste d'envies (sans les ajouter à la bibliothèque)

CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT NOT NULL CHECK(media_type IN ('book', 'movie', 'show')),
    external_id TEXT,                     -- ID externe (ISBN, TMDB ID, etc.)
    title TEXT NOT NULL,
    subtitle TEXT,                        -- Auteur ou année
    image_url TEXT,
    description TEXT,                     -- Synopsis
    genres TEXT,                          -- JSON array
    reason TEXT,                          -- Raison de la reco IA
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_type, title)             -- Empêcher les doublons
);

CREATE INDEX IF NOT EXISTS idx_wishlist_media_type ON wishlist(media_type);
CREATE INDEX IF NOT EXISTS idx_wishlist_added_at ON wishlist(added_at);
