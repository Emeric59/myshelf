# DATABASE.md — Schéma MyShelf

## Vue d'ensemble

Base de données SQLite via Cloudflare D1.

## Tables principales

### Tables de cache (métadonnées)

| Table | Description |
|-------|-------------|
| `books` | Cache Open Library |
| `movies` | Cache TMDB films |
| `shows` | Cache TMDB séries |

### Tables utilisateur

| Table | Description |
|-------|-------------|
| `user_books` | Bibliothèque livres |
| `user_movies` | Bibliothèque films |
| `user_shows` | Bibliothèque séries |

### Avis et annotations

| Table | Description |
|-------|-------------|
| `reviews` | Avis détaillés |
| `highlights` | Passages favoris |
| `awards` | Médailles spéciales |

### Système de tropes

| Table | Description |
|-------|-------------|
| `tropes` | Liste des tropes |
| `user_trope_preferences` | Préférences utilisateur |
| `media_tropes` | Association média-trope |

### Recommandations et stats

| Table | Description |
|-------|-------------|
| `recommendations` | Historique recos |
| `goals` | Objectifs annuels |
| `settings` | Paramètres |
| `streaming_subscriptions` | Abonnements |

## Schéma détaillé

Voir `migrations/001_initial.sql` pour le schéma complet.

## Requêtes utiles

### Stats lecture année en cours

```sql
SELECT
    COUNT(*) as books_read,
    SUM(b.page_count) as pages_read,
    AVG(ub.rating) as avg_rating
FROM user_books ub
JOIN books b ON ub.book_id = b.id
WHERE ub.status = 'read'
AND strftime('%Y', ub.finished_at) = strftime('%Y', 'now');
```

### Livres avec tropes blacklistés

```sql
SELECT DISTINCT mt.media_id
FROM media_tropes mt
JOIN user_trope_preferences utp ON mt.trope_id = utp.trope_id
WHERE mt.media_type = 'book'
AND utp.preference = 'blacklist';
```

### Profil utilisateur pour l'IA

```sql
-- Genres favoris (basé sur les 5 étoiles)
SELECT
    json_each.value as genre,
    COUNT(*) as count
FROM user_books ub
JOIN books b ON ub.book_id = b.id
JOIN json_each(b.genres)
WHERE ub.rating >= 4.5
GROUP BY genre
ORDER BY count DESC
LIMIT 5;
```

## Migrations

```bash
# Appliquer le schéma initial
wrangler d1 execute myshelf-db --file=./migrations/001_initial.sql

# Ajouter les tropes de base
wrangler d1 execute myshelf-db --file=./migrations/002_seed_tropes.sql
```
