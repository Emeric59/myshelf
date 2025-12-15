# PROGRESS.md — Suivi du développement MyShelf

> Ce fichier est mis à jour à chaque grande étape pour permettre la continuité entre sessions.

## Statut actuel

**Phase :** Phase 4 - IA et recommandations (en cours)
**Dernière mise à jour :** 2025-12-15
**Build :** OK
**Prochaine tâche :** PWA et déploiement

---

## Phases du projet

### Phase 1 : Fondations (UI statique) - TERMINÉE
- [x] Initialisation Next.js 16 + TypeScript + Tailwind CSS v4
- [x] Installation et configuration shadcn/ui
- [x] Configuration wrangler.toml pour D1
- [x] Création des migrations SQL (001_initial.sql, 002_seed_tropes.sql)
- [x] Création des types TypeScript (src/types/index.ts)
- [x] Création des clients API (Open Library, TMDB)
- [x] Création des composants UI (MediaCard, RatingStars, StatusBadge, ProgressBar)
- [x] Création des composants layout (Header, PageHeader, BottomNav)
- [x] Création des pages de bibliothèque (books, movies, shows)
- [x] Création de la page de recherche unifiée
- [x] Création des API routes initiales
- [x] Création des pages recommendations, stats, settings
- [x] Application des migrations D1 en local
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
- [x] Seed de données de test (`migrations/003_seed_test_data.sql`)
- [ ] Import BookNode / TV Time (reporté)

### Phase 4 : IA et recommandations - EN COURS (75%)
- [x] Intégration Gemini 2.5 Flash avec mode thinking
- [x] Client IA (`src/lib/ai/gemini.ts`)
- [x] API route `/api/recommendations/ask`
- [x] Interface conversationnelle connectée
- [ ] Embeddings avec Cloudflare Vectorize (optionnel)

### Phase 5 : PWA et déploiement - TERMINÉE
- [x] Configuration PWA (manifest.json)
- [x] Génération des icons PWA (192, 512, apple-touch)
- [x] Meta tags PWA dans layout
- [x] Déploiement Cloudflare Pages (https://myshelf-d69.pages.dev)
- [x] Migrations D1 en production
- [x] Variables d'environnement configurées (TMDB_API_KEY, GEMINI_API_KEY)

### Phase 6 : Tests et qualité - EN COURS
- [x] Installation Vitest et dépendances de test
- [x] Configuration vitest.config.ts
- [x] Mock D1 pour tests unitaires
- [x] Tests unitaires DB helpers (books, movies, shows, stats, highlights)
- [x] Tests unitaires API clients (Open Library, TMDB, Gemini)
- [ ] Tests d'intégration plus avancés (avec miniflare)
- [ ] Tests E2E (optionnel)

---

## API Routes créées

| Route | Méthodes | Description |
|-------|----------|-------------|
| `/api/search` | GET | Recherche Open Library + TMDB |
| `/api/books` | GET, POST, PATCH, DELETE | CRUD livres |
| `/api/movies` | GET, POST, PATCH, DELETE | CRUD films |
| `/api/shows` | GET, POST, PATCH, DELETE | CRUD séries |
| `/api/reviews` | GET, POST, DELETE | Gestion des avis |
| `/api/tropes` | GET, PATCH | Tropes et préférences |
| `/api/stats` | GET | Statistiques globales |
| `/api/goals` | GET, POST | Objectifs annuels |
| `/api/highlights` | GET, POST, PATCH, DELETE | Passages favoris |
| `/api/recommendations/ask` | POST | Recommandations IA (Gemini 2.5 Flash) |

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
│   ├── page.tsx                    # Dashboard
│   ├── books/page.tsx              # Bibliothèque (useBooks)
│   ├── movies/page.tsx             # Filmothèque (useMovies)
│   ├── shows/page.tsx              # Séries (useShows)
│   ├── search/page.tsx             # Recherche unifiée
│   ├── highlights/page.tsx         # Passages favoris (useHighlights)
│   ├── recommendations/            # Pages recommandations
│   ├── stats/
│   │   ├── page.tsx                # Statistiques (useStats)
│   │   └── goals/page.tsx          # Objectifs (useGoals)
│   ├── settings/
│   │   ├── page.tsx                # Paramètres généraux
│   │   └── tropes/page.tsx         # Tropes (useTropes)
│   └── api/
│       ├── search/route.ts
│       ├── books/route.ts
│       ├── movies/route.ts
│       ├── shows/route.ts
│       ├── reviews/route.ts
│       ├── tropes/route.ts
│       ├── stats/route.ts
│       ├── goals/route.ts
│       ├── highlights/route.ts
│       └── recommendations/ask/route.ts
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── layout/                     # Header, BottomNav
│   └── media/                      # MediaCard, RatingStars
├── lib/
│   ├── api/                        # Clients API externes
│   ├── ai/
│   │   └── gemini.ts               # Client Gemini 2.5 Flash
│   ├── db/
│   │   ├── client.ts
│   │   ├── books.ts
│   │   ├── movies.ts
│   │   ├── shows.ts
│   │   ├── reviews.ts
│   │   ├── tropes.ts
│   │   ├── stats.ts
│   │   ├── highlights.ts
│   │   └── index.ts
│   └── hooks/
│       ├── useBooks.ts
│       ├── useMovies.ts
│       ├── useShows.ts
│       ├── useTropes.ts
│       ├── useStats.ts
│       ├── useGoals.ts
│       ├── useHighlights.ts
│       └── index.ts
├── types/
│   └── index.ts
└── env.d.ts                        # Types Cloudflare
```

---

## Prochaines actions (dans l'ordre)

### Immédiat (Déploiement)
1. Déployer sur Cloudflare Pages (connecter repo Git)
2. Configurer variables d'environnement (GEMINI_API_KEY, TMDB_API_KEY)
3. Créer la DB D1 en production et appliquer les migrations
4. Tester l'app en production

### Optionnel / Plus tard
- Service worker avancé pour mode offline complet
- Import BookNode / TV Time
- Embeddings Vectorize

---

## Notes techniques

- **npm install** nécessite `--legacy-peer-deps`
- **Next.js 16** avec Turbopack
- **Tailwind v4** CSS-first
- **D1 local** dans `.wrangler/state/v3/d1`
- **API Routes** en `runtime = "edge"`
- **getRequestContext()** pour accès D1
- **D1 Database ID** : `2bf81530-3003-4748-958a-111383c35183`

---

## Comment tester

```bash
# Dev local (recherche fonctionne, D1 retourne vide)
npm run dev

# Dev avec D1 local
npx wrangler pages dev .next --d1=DB=myshelf-db

# Tests unitaires
npm test              # Mode watch
npm run test:run      # Une seule exécution
npm run test:coverage # Avec couverture de code
```

## Structure des tests

```
src/__tests__/
├── setup.ts              # Configuration globale (mocks env, fetch)
├── mocks/
│   └── d1.ts             # Mock D1Database + factories de données
├── db/
│   ├── books.test.ts     # Tests helpers livres
│   ├── movies.test.ts    # Tests helpers films
│   ├── shows.test.ts     # Tests helpers séries
│   ├── stats.test.ts     # Tests helpers stats/goals
│   └── highlights.test.ts # Tests helpers passages favoris
└── api/
    ├── openlibrary.test.ts # Tests client Open Library
    ├── tmdb.test.ts        # Tests client TMDB
    └── gemini.test.ts      # Tests client Gemini AI
```

---

## Variables d'environnement

- [x] `.env.local` avec TMDB_API_KEY et GEMINI_API_KEY
