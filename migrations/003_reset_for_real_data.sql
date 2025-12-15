-- ============================================================
-- Migration: Reset des données média en attendant les vraies données
-- ============================================================
-- Cette migration supprime toutes les données fictives (livres, films, séries)
-- tout en conservant le schéma et les tropes.
-- L'utilisateur ajoutera ses propres données via l'app.

-- Supprimer les reviews et highlights liés aux médias fictifs
DELETE FROM reviews;
DELETE FROM highlights;

-- Supprimer les données utilisateur
DELETE FROM user_books;
DELETE FROM user_movies;
DELETE FROM user_shows;

-- Supprimer les médias fictifs
DELETE FROM books;
DELETE FROM movies;
DELETE FROM shows;

-- Supprimer les objectifs fictifs
DELETE FROM goals;

-- Note: Les tropes et préférences de tropes sont conservés
-- Note: Les abonnements streaming sont conservés
