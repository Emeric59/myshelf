# PROGRESS.md — Suivi du développement MyShelf

> Ce fichier est mis à jour à chaque grande étape pour permettre la continuité entre sessions.

## Statut actuel

**Phase :** Phase 9 - Améliorations UX et features complémentaires
**Dernière mise à jour :** 2025-12-15
**Build :** OK
**Déployé :** https://myshelf-d69.pages.dev
**État DB prod :** Données réelles seedées (vrais IDs Open Library + TMDB)

---

## Phases du projet

### Phase 1 : Fondations (UI statique) - TERMINÉE
- [x] Initialisation Next.js 16 + TypeScript + Tailwind CSS v4
- [x] Installation et configuration shadcn/ui
- [x] Configuration wrangler.toml pour D1
- [x] Création des migrations SQL
- [x] Création des types TypeScript (src/types/index.ts)
- [x] Création des clients API (Open Library, TMDB)
- [x] Création des composants UI (MediaCard, RatingStars, StatusBadge, Progress)
- [x] Création des composants layout (Header, PageHeader, BottomNav)
- [x] Création des pages de bibliothèque (books, movies, shows)
- [x] Création de la page de recherche unifiée
- [x] Création des API routes initiales
- [x] Création des pages recommendations, stats, settings
- [x] Build validé sans erreurs

### Phase 2 : Intégration données - TERMINÉE
- [x] Créer le client D1 (`src/lib/db/client.ts`)
- [x] Créer les helpers DB (books.ts, movies.ts, shows.ts, reviews.ts)
- [x] Installer @cloudflare/next-on-pages et @cloudflare/workers-types
- [x] Connecter les API routes à D1 (GET, POST, PATCH, DELETE)
- [x] Implémenter la recherche réelle via Open Library + TMDB
- [x] API routes pour ajouter/modifier/supprimer des médias
- [x] Créer les hooks React (useBooks, useMovies, useShows)
- [x] Connecter les pages de bibliothèque aux API
- [x] Créer l'API reviews (`/api/reviews`)

### Phase 3 : Fonctionnalités avancées - TERMINÉE
- [x] Système de tropes : DB helper + API route `/api/tropes`
- [x] Statistiques : DB helper + API route `/api/stats`
- [x] Objectifs : DB helper + API route `/api/goals`
- [x] Créer les hooks (useTropes, useStats, useGoals)
- [x] Connecter la page /settings/tropes à l'API
- [x] Connecter la page /stats à l'API
- [x] Connecter la page /stats/goals à l'API
- [x] Highlights : DB helper + API route `/api/highlights` + hook `useHighlights` + page `/highlights`
- [ ] Import BookNode / TV Time (reporté - optionnel)

### Phase 4 : IA et recommandations - TERMINÉE
- [x] Intégration Gemini 2.0 Flash
- [x] Client IA (`src/lib/ai/gemini.ts`)
- [x] API route `/api/recommendations/ask`
- [x] Interface conversationnelle connectée
- [x] Bouton "Ajouter" fonctionnel sur les recommandations
- [ ] Embeddings avec Cloudflare Vectorize (optionnel)

### Phase 5 : PWA et déploiement - TERMINÉE
- [x] Configuration PWA (manifest.json)
- [x] Génération des icons PWA (192, 512, apple-touch)
- [x] Meta tags PWA dans layout
- [x] Déploiement Cloudflare Pages (https://myshelf-d69.pages.dev)
- [x] Migrations D1 en production
- [x] Variables d'environnement configurées (TMDB_API_KEY, GEMINI_API_KEY)

### Phase 6 : Tests et qualité - TERMINÉE
- [x] Installation Vitest et dépendances de test
- [x] Configuration vitest.config.ts
- [x] Mock D1 pour tests unitaires
- [x] Tests unitaires DB helpers (books, movies, shows, stats, highlights)
- [x] Tests unitaires API clients (Open Library, TMDB, Gemini)
- [ ] Tests d'intégration plus avancés (avec miniflare) - optionnel
- [ ] Tests E2E - optionnel

### Phase 7 : Fonctionnalités manquantes - TERMINÉE
- [x] Pages de détail médias (`/books/[id]`, `/movies/[id]`, `/shows/[id]`)
- [x] Système de review/feedback avec UI
- [x] Bouton "Ajouter" fonctionnel dans les recommandations IA
- [x] Gestion des abonnements streaming connectée à la DB
- [x] API route `/api/subscriptions`
- [x] Composant Progress (`src/components/ui/progress.tsx`)
- [ ] Badges streaming sur les résultats de recherche - optionnel

### Phase 8 : Polish et données réelles - TERMINÉE
- [x] Dashboard dynamique (stats réelles depuis APIs)
- [x] API `/api/books?id=xxx` pour récupérer un livre spécifique
- [x] Tropes seedés en production (54 tropes)
- [x] Données réelles avec vrais IDs (migration 004_real_data_seed.sql)
  - 10 livres (vrais IDs Open Library)
  - 10 films (vrais IDs TMDB)
  - 10 séries (vrais IDs TMDB)
  - Reviews, highlights, objectifs 2025

### Phase 9 : Améliorations UX - EN COURS
- [x] Fix API movies/shows pour récupération média unique (`?id=xxx`)
- [x] Ajout fonctions `updateMovieRating` et `updateShowRating`
- [x] Page `/library` comme hub central (livres, films, séries)
- [x] BottomNav pointe vers `/library` au lieu de `/books`
- [x] Fix hook `useTropes` (préférences déjà fusionnées par API)
- [x] Page `/stats/rankings` - Top 10 par catégorie
- [x] Recommandations par mood connectées à l'IA
- [x] Dashboard enrichi avec section "En cours"
- [ ] Export des données (optionnel)
- [ ] Thème clair/sombre (optionnel)

---

## Migrations D1

| Fichier | Description | Appliquée en prod |
|---------|-------------|-------------------|
| `001_initial.sql` | Schéma complet | ✅ |
| `002_seed_tropes.sql` | 54 tropes + providers streaming | ✅ |
| `003_seed_test_data.sql` | Données fictives (OBSOLÈTE) | ❌ Remplacé |
| `004_real_data_seed.sql` | Données réelles avec vrais IDs | ✅ |

---

## API Routes créées

| Route | Méthodes | Description |
|-------|----------|-------------|
| `/api/search` | GET | Recherche Open Library + TMDB |
| `/api/books` | GET, POST, PATCH, DELETE | CRUD livres (`?id=xxx` pour un seul) |
| `/api/movies` | GET, POST, PATCH, DELETE | CRUD films |
| `/api/shows` | GET, POST, PATCH, DELETE | CRUD séries |
| `/api/reviews` | GET, POST, DELETE | Gestion des avis |
| `/api/tropes` | GET, PATCH | Tropes et préférences |
| `/api/stats` | GET | Statistiques globales |
| `/api/goals` | GET, POST | Objectifs annuels |
| `/api/highlights` | GET, POST, PATCH, DELETE | Passages favoris |
| `/api/recommendations/ask` | POST | Recommandations IA (Gemini 2.0 Flash) |
| `/api/subscriptions` | GET, POST | Abonnements streaming |

---

## Hooks créés

| Hook | Description |
|------|-------------|
| `useBooks` | Gestion des livres (fetch, add, update, remove) |
| `useMovies` | Gestion des films |
| `useShows` | Gestion des séries |
| `useTropes` | Gestion des tropes et préférences |
| `useStats` | Récupération des statistiques |
| `useGoals` | Gestion des objectifs annuels |
| `useHighlights` | Gestion des passages favoris |

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx                    # Dashboard (section "En cours")
│   ├── library/page.tsx            # Hub central bibliothèque
│   ├── books/
│   │   ├── page.tsx                # Bibliothèque (useBooks)
│   │   └── [id]/page.tsx           # Détail livre (edge runtime)
│   ├── movies/
│   │   ├── page.tsx                # Filmothèque (useMovies)
│   │   └── [id]/page.tsx           # Détail film (edge runtime)
│   ├── shows/
│   │   ├── page.tsx                # Séries (useShows)
│   │   └── [id]/page.tsx           # Détail série (edge runtime)
│   ├── search/page.tsx             # Recherche unifiée
│   ├── highlights/page.tsx         # Passages favoris
│   ├── recommendations/
│   │   ├── page.tsx                # Recommandations par mood
│   │   └── ask/page.tsx            # Chat IA
│   ├── stats/
│   │   ├── page.tsx                # Statistiques
│   │   ├── goals/page.tsx          # Objectifs
│   │   └── rankings/page.tsx       # Top 10 par catégorie
│   ├── settings/
│   │   ├── page.tsx                # Paramètres
│   │   ├── tropes/page.tsx         # Tropes
│   │   ├── subscriptions/page.tsx  # Abonnements
│   │   └── import/page.tsx         # Import
│   └── api/                        # Routes API (edge runtime)
├── components/
│   ├── ui/                         # shadcn/ui + Progress
│   ├── layout/                     # Header, BottomNav
│   └── media/                      # MediaCard, RatingStars
├── lib/
│   ├── api/
│   │   ├── openLibrary.ts          # ATTENTION: camelCase !
│   │   └── tmdb.ts
│   ├── ai/
│   │   └── gemini.ts
│   ├── db/                         # Helpers D1
│   └── hooks/                      # Custom hooks
├── types/
│   └── index.ts
└── env.d.ts
```

---

## Prochaines actions (optionnelles)

- Service worker avancé pour mode offline complet
- Import BookNode / TV Time
- Embeddings Vectorize pour recommandations sémantiques
- Badges streaming sur résultats de recherche
- Tests E2E avec Playwright

---

## Notes techniques IMPORTANTES

### Règles Cloudflare Pages

1. **Edge Runtime obligatoire** : Toutes les pages dynamiques (`[id]`) ET API routes :
   ```typescript
   export const runtime = 'edge'
   ```

2. **Accès D1** : Utiliser `getRequestContext()` de `@cloudflare/next-on-pages`

### TypeScript strict

1. **`res.json()` retourne `unknown`** :
   ```typescript
   const data = await res.json() as MyType
   ```

2. **Casing des fichiers** : `openLibrary.ts` (camelCase) - NE PAS importer comme `openlibrary`

### Schéma DB vs Types TypeScript

| DB (schema) | TypeScript (types) | Notes |
|-------------|-------------------|-------|
| `creators` | `creator` | Alias SQL |
| `seasons_count` | `total_seasons` | Alias SQL |
| `episodes_count` | `total_episodes` | Alias SQL |

### Composants

- `RatingStars` : Utiliser `interactive` (pas `editable`)
- `Progress` : Composant custom dans `ui/progress.tsx`

---

## Comment tester

```bash
# Dev local
npm run dev

# Dev avec D1 local
npx wrangler pages dev .next --d1=DB=myshelf-db

# Tests unitaires
npm test              # Mode watch
npm run test:run      # Une seule exécution

# Build local (TOUJOURS vérifier avant push)
npm run build
```

---

## Commandes D1 production

```bash
# Appliquer une migration
wrangler d1 execute myshelf-db --file=./migrations/xxx.sql --remote

# Exécuter une commande SQL
wrangler d1 execute myshelf-db --remote --command="SELECT * FROM books;"
```

---

## Variables d'environnement

### Local (.env.local)
```bash
TMDB_API_KEY=xxx
GEMINI_API_KEY=xxx
```

### Production (Cloudflare Dashboard)
- TMDB_API_KEY
- GEMINI_API_KEY

---

## Informations Cloudflare

- **D1 Database ID** : `2bf81530-3003-4748-958a-111383c35183`
- **Pages URL** : https://myshelf-d69.pages.dev
- **GitHub Repo** : https://github.com/Emeric59/myshelf

---

## Bugs corrigés (historique)

1. **Schéma shows.ts** : Alias SQL pour colonnes
2. **Schéma stats.ts** : Pivot avec `MAX(CASE WHEN...)`
3. **Colonnes inexistantes** : `tmdb_id` et `open_library_id` retirées
4. **Import casing** : `openlibrary` → `openLibrary`
5. **RatingStars prop** : `editable` → `interactive`
6. **Composant manquant** : `Progress` créé
7. **Edge runtime** : Ajouté aux pages `[id]`
8. **Dashboard stats** : Rendu dynamique (fetch APIs)
9. **Données fictives** : Remplacées par vrais IDs Open Library + TMDB
10. **Tropes vides** : Migration seedée en production
11. **API movies/shows GET** : Ajout support paramètre `?id=xxx` pour média unique
12. **Hook useTropes** : Simplification (préférences déjà fusionnées par API)
13. **Navigation Biblio** : Pointe vers `/library` au lieu de `/books`
14. **Page d'accueil** : Utilise maintenant le composant BottomNav partagé
