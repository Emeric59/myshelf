-- ============================================================
-- MyShelf Database Schema - Initial Migration
-- ============================================================

-- TABLES DE CACHE (métadonnées des médias)
-- ============================================================

-- Livres (cache Open Library / Google Books)
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,                    -- Open Library work ID (ex: "OL123W")
    title TEXT NOT NULL,
    original_title TEXT,                    -- Si différent du titre FR
    author TEXT,
    author_id TEXT,                         -- Open Library author ID
    cover_url TEXT,
    description TEXT,
    page_count INTEGER,
    published_date TEXT,                    -- Format ISO (YYYY-MM-DD ou YYYY)
    publisher TEXT,
    isbn_10 TEXT,
    isbn_13 TEXT,
    language TEXT,                          -- 'fr', 'en', etc.
    genres TEXT,                            -- JSON array: ["Fantasy", "Romance"]
    series_name TEXT,                       -- Nom de la saga
    series_position INTEGER,                -- Tome N
    external_ids TEXT,                      -- JSON: {"goodreads": "123", "google": "abc"}
    average_rating REAL,                    -- Note moyenne externe
    ratings_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Films (cache TMDB)
CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,                    -- TMDB ID
    title TEXT NOT NULL,
    original_title TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    description TEXT,
    runtime INTEGER,                        -- Durée en minutes
    release_date TEXT,                      -- Format ISO
    director TEXT,
    cast_members TEXT,                      -- JSON array: ["Actor 1", "Actor 2"]
    genres TEXT,                            -- JSON array
    language TEXT,
    external_ids TEXT,                      -- JSON: {"imdb": "tt123"}
    average_rating REAL,
    ratings_count INTEGER,
    streaming_providers TEXT,               -- JSON: {"flatrate": ["Netflix"], "rent": ["Canal VOD"]}
    providers_updated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Séries (cache TMDB)
CREATE TABLE IF NOT EXISTS shows (
    id TEXT PRIMARY KEY,                    -- TMDB ID
    title TEXT NOT NULL,
    original_title TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    description TEXT,
    first_air_date TEXT,
    last_air_date TEXT,
    status TEXT,                            -- 'Returning Series', 'Ended', 'Canceled'
    seasons_count INTEGER,
    episodes_count INTEGER,
    episode_runtime INTEGER,                -- Durée moyenne épisode
    creators TEXT,                          -- JSON array
    cast_members TEXT,                      -- JSON array
    genres TEXT,                            -- JSON array
    language TEXT,
    external_ids TEXT,
    average_rating REAL,
    ratings_count INTEGER,
    streaming_providers TEXT,
    providers_updated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLES UTILISATEUR (bibliothèque personnelle)
-- ============================================================

-- Bibliothèque livres
CREATE TABLE IF NOT EXISTS user_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'to_read',  -- 'to_read', 'reading', 'read', 'abandoned', 'blacklist'
    rating REAL,                             -- 1-5 (demi-étoiles: 3.5)
    started_at DATE,
    finished_at DATE,
    current_page INTEGER DEFAULT 0,
    reread_count INTEGER DEFAULT 0,
    notes TEXT,                              -- Notes rapides perso
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id)                          -- Un seul enregistrement par livre
);

-- Bibliothèque films
CREATE TABLE IF NOT EXISTS user_movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'to_watch', -- 'to_watch', 'watched', 'blacklist'
    rating REAL,
    watched_at DATE,
    rewatch_count INTEGER DEFAULT 0,
    watched_on TEXT,                         -- Plateforme utilisée
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id)
);

-- Bibliothèque séries
CREATE TABLE IF NOT EXISTS user_shows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    show_id TEXT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'to_watch', -- 'to_watch', 'watching', 'watched', 'abandoned', 'paused', 'blacklist'
    rating REAL,
    started_at DATE,
    finished_at DATE,
    current_season INTEGER DEFAULT 1,
    current_episode INTEGER DEFAULT 0,
    watched_on TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(show_id)
);

-- ============================================================
-- AVIS ET ANNOTATIONS
-- ============================================================

-- Avis détaillés (un par média)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT NOT NULL,                -- 'book', 'movie', 'show'
    media_id TEXT NOT NULL,
    comment TEXT,                            -- Commentaire libre
    liked_aspects TEXT,                      -- JSON array: ["personnages", "romance", "worldbuilding"]
    disliked_aspects TEXT,                   -- JSON array
    emotions TEXT,                           -- JSON array: ["m_a_fait_pleurer", "coup_de_coeur"]
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_type, media_id)
);

-- Passages favoris (livres uniquement)
CREATE TABLE IF NOT EXISTS highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    content TEXT NOT NULL,                   -- Le texte du passage
    page_number INTEGER,
    chapter TEXT,
    personal_note TEXT,                      -- Annotation perso
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Médailles spéciales
CREATE TABLE IF NOT EXISTS awards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT NOT NULL,
    media_id TEXT NOT NULL,
    award_type TEXT NOT NULL,                -- 'top1_year', 'all_time_fav', 'hidden_gem', 'must_reread'
    year INTEGER,                            -- Pour les awards annuels
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_type, media_id, award_type, year)
);

-- ============================================================
-- SYSTÈME DE TROPES
-- ============================================================

-- Liste des tropes disponibles
CREATE TABLE IF NOT EXISTS tropes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,               -- Version URL-safe
    category TEXT,                           -- 'romance', 'plot', 'character', 'mood', 'sensitive'
    description TEXT,
    is_sensitive INTEGER DEFAULT 0,          -- 1 si contenu sensible (pour warnings)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Préférences utilisateur pour les tropes
CREATE TABLE IF NOT EXISTS user_trope_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trope_id INTEGER NOT NULL REFERENCES tropes(id) ON DELETE CASCADE,
    preference TEXT NOT NULL,                -- 'love', 'like', 'neutral', 'dislike', 'blacklist'
    weight INTEGER DEFAULT 5,                -- 1-10 pour pondération fine
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trope_id)
);

-- Association médias <-> tropes
CREATE TABLE IF NOT EXISTS media_tropes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT NOT NULL,
    media_id TEXT NOT NULL,
    trope_id INTEGER NOT NULL REFERENCES tropes(id) ON DELETE CASCADE,
    source TEXT DEFAULT 'user',              -- 'user', 'import', 'ai_detected'
    confidence REAL,                         -- Pour les détections IA (0-1)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_type, media_id, trope_id)
);

-- ============================================================
-- RECOMMANDATIONS
-- ============================================================

-- Historique des recommandations
CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_type TEXT NOT NULL,
    media_id TEXT NOT NULL,
    source TEXT NOT NULL,                    -- 'ai_auto', 'ai_request', 'similar', 'trending'
    query TEXT,                              -- La requête utilisateur si "ai_request"
    reason TEXT,                             -- Explication de l'IA
    score REAL,                              -- Score de pertinence
    status TEXT DEFAULT 'pending',           -- 'pending', 'accepted', 'dismissed', 'already_consumed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- OBJECTIFS ET STATS
-- ============================================================

-- Objectifs annuels
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    media_type TEXT NOT NULL,                -- 'book', 'movie', 'show'
    target INTEGER NOT NULL,                 -- Nombre cible
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, media_type)
);

-- ============================================================
-- PARAMÈTRES
-- ============================================================

-- Paramètres généraux (clé-valeur)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Abonnements streaming
CREATE TABLE IF NOT EXISTS streaming_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id TEXT NOT NULL,               -- ID TMDB du provider
    provider_name TEXT NOT NULL,             -- Nom affiché
    provider_logo TEXT,                      -- URL logo
    provider_type TEXT DEFAULT 'video',      -- 'video', 'reading'
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id)
);

-- ============================================================
-- INDEX POUR PERFORMANCES
-- ============================================================

-- Recherche dans la bibliothèque
CREATE INDEX IF NOT EXISTS idx_user_books_status ON user_books(status);
CREATE INDEX IF NOT EXISTS idx_user_books_rating ON user_books(rating);
CREATE INDEX IF NOT EXISTS idx_user_movies_status ON user_movies(status);
CREATE INDEX IF NOT EXISTS idx_user_shows_status ON user_shows(status);

-- Recherche de reviews
CREATE INDEX IF NOT EXISTS idx_reviews_media ON reviews(media_type, media_id);

-- Recherche de tropes
CREATE INDEX IF NOT EXISTS idx_media_tropes_media ON media_tropes(media_type, media_id);
CREATE INDEX IF NOT EXISTS idx_media_tropes_trope ON media_tropes(trope_id);
CREATE INDEX IF NOT EXISTS idx_user_trope_pref ON user_trope_preferences(preference);

-- Recommandations non vues
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status, media_type);

-- Highlights par livre
CREATE INDEX IF NOT EXISTS idx_highlights_book ON highlights(book_id);

-- ============================================================
-- TRIGGERS (mise à jour auto updated_at)
-- ============================================================

CREATE TRIGGER IF NOT EXISTS update_user_books_timestamp
AFTER UPDATE ON user_books
BEGIN
    UPDATE user_books SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_movies_timestamp
AFTER UPDATE ON user_movies
BEGIN
    UPDATE user_movies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_shows_timestamp
AFTER UPDATE ON user_shows
BEGIN
    UPDATE user_shows SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_reviews_timestamp
AFTER UPDATE ON reviews
BEGIN
    UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
