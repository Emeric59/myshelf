-- ============================================================
-- Migration: Séparation des préférences tropes par type de média
-- ============================================================

-- Ajouter la colonne media_type à user_trope_preferences
-- NULL = global (s'applique à tous les types)
-- 'book' = uniquement pour les livres
-- 'movie' = uniquement pour les films
-- 'show' = uniquement pour les séries

-- D'abord, créer une nouvelle table avec la bonne structure
CREATE TABLE IF NOT EXISTS user_trope_preferences_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trope_id INTEGER NOT NULL REFERENCES tropes(id) ON DELETE CASCADE,
    media_type TEXT,                         -- NULL = global, 'book', 'movie', 'show'
    preference TEXT NOT NULL,                -- 'love', 'like', 'neutral', 'dislike', 'blacklist'
    weight INTEGER DEFAULT 5,                -- 1-10 pour pondération fine
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trope_id, media_type)             -- Un seul enregistrement par trope ET type de média
);

-- Copier les données existantes (comme préférences globales)
INSERT INTO user_trope_preferences_new (trope_id, media_type, preference, weight, created_at, updated_at)
SELECT trope_id, NULL, preference, weight, created_at, updated_at
FROM user_trope_preferences;

-- Supprimer l'ancienne table
DROP TABLE user_trope_preferences;

-- Renommer la nouvelle table
ALTER TABLE user_trope_preferences_new RENAME TO user_trope_preferences;

-- Créer un index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_trope_prefs_media_type ON user_trope_preferences(media_type);
CREATE INDEX IF NOT EXISTS idx_trope_prefs_preference ON user_trope_preferences(preference);
