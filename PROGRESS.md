# PROGRESS.md — Suivi du développement MyShelf

> Ce fichier est mis à jour à chaque grande étape pour permettre la continuité entre sessions.

## Statut actuel

**Phase :** Phase 7 - Finitions et polish (TERMINÉE)
**Dernière mise à jour :** 2025-12-15
**Build :** OK
**Déployé :** https://myshelf-d69.pages.dev

---

## Phases du projet

### Phase 1 : Fondations (UI statique) - TERMINÉE
- [x] Initialisation Next.js 16 + TypeScript + Tailwind CSS v4
- [x] Installation et configuration shadcn/ui
- [x] Configuration wrangler.toml pour D1
- [x] Création des migrations SQL (001_initial.sql, 002_seed_tropes.sql)
- [x] Création des types TypeScript (src/types/index.ts)
- [x] Création des clients API (Open Library, TMDB)
- [x] Création des composants UI (MediaCard, RatingStars, StatusBadge, Progress)
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
- [ ] Import BookNode / TV Time (reporté - optionnel)

### Phase 4 : IA et recommandations - TERMINÉE
- [x] Intégration Gemini 2.5 Flash avec mode thinking
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
- [x] Système de review/feedback avec UI :
  - Aspects appréciés (personnages, romance, worldbuilding, etc.)
  - Émotions ressenties (m'a fait pleurer, coup de coeur, etc.)
  - Commentaires personnels
- [x] Bouton "Ajouter" fonctionnel dans les recommandations IA
- [x] Gestion des abonnements streaming connectée à la DB
- [x] API route `/api/subscriptions`
- [x] Composant Progress (`src/components/ui/progress.tsx`)
- [ ] Badges streaming sur les résultats de recherche - optionnel

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
│   ├── page.tsx                    # Dashboard
│   ├── books/
│   │   ├── page.tsx                # Bibliothèque (useBooks)
│   │   └── [id]/page.tsx           # Détail livre
│   ├── movies/
│   │   ├── page.tsx                # Filmothèque (useMovies)
│   │   └── [id]/page.tsx           # Détail film
│   ├── shows/
│   │   ├── page.tsx                # Séries (useShows)
│   │   └── [id]/page.tsx           # Détail série
│   ├── search/page.tsx             # Recherche unifiée
│   ├── highlights/page.tsx         # Passages favoris (useHighlights)
│   ├── recommendations/
│   │   ├── page.tsx                # Recommandations
│   │   └── ask/page.tsx            # Chat IA
│   ├── stats/
│   │   ├── page.tsx                # Statistiques (useStats)
│   │   └── goals/page.tsx          # Objectifs (useGoals)
│   ├── settings/
│   │   ├── page.tsx                # Paramètres généraux
│   │   ├── tropes/page.tsx         # Tropes (useTropes)
│   │   ├── subscriptions/page.tsx  # Abonnements streaming
│   │   └── import/page.tsx         # Import données
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
│       ├── subscriptions/route.ts
│       └── recommendations/ask/route.ts
├── components/
│   ├── ui/                         # shadcn/ui + Progress
│   ├── layout/                     # Header, BottomNav
│   └── media/                      # MediaCard, RatingStars
├── lib/
│   ├── api/
│   │   ├── openLibrary.ts          # Client Open Library (ATTENTION: camelCase)
│   │   └── tmdb.ts                 # Client TMDB
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

## Prochaines actions (optionnelles)

- Service worker avancé pour mode offline complet
- Import BookNode / TV Time
- Embeddings Vectorize pour recommandations sémantiques
- Badges streaming sur résultats de recherche
- Tests E2E avec Playwright

---

## Notes techniques IMPORTANTES

### Règles Cloudflare Pages

1. **Edge Runtime obligatoire** : Toutes les pages dynamiques (`[id]`) DOIVENT avoir :
   ```typescript
   export const runtime = 'edge'
   ```

2. **API Routes** : Toutes les routes API DOIVENT avoir :
   ```typescript
   export const runtime = 'edge'
   ```

3. **Accès D1** : Utiliser `getRequestContext()` de `@cloudflare/next-on-pages`

### TypeScript strict

1. **`res.json()` retourne `unknown`** : Toujours ajouter une assertion de type :
   ```typescript
   const data = await res.json() as MyType
   ```

2. **Casing des fichiers** : Windows n'est pas sensible à la casse mais Git l'est.
   - `openLibrary.ts` (camelCase) - NE PAS importer comme `openlibrary`

### Schéma DB vs Types TypeScript

Les noms de colonnes dans la DB peuvent différer des propriétés TypeScript :

| DB (schema) | TypeScript (types) | Notes |
|-------------|-------------------|-------|
| `creators` | `creator` | Alias dans la query SQL |
| `seasons_count` | `total_seasons` | Alias dans la query SQL |
| `episodes_count` | `total_episodes` | Alias dans la query SQL |

### Composants shadcn/ui

- `RatingStars` : Utiliser `interactive` (pas `editable`) pour le mode édition
- `Progress` : Composant custom créé dans `src/components/ui/progress.tsx`

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

# Build local (vérifier avant push)
npm run build
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
    ├── openLibrary.test.ts # Tests client Open Library (ATTENTION: camelCase)
    ├── tmdb.test.ts        # Tests client TMDB
    └── gemini.test.ts      # Tests client Gemini AI
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

1. **Schéma shows.ts** : Colonnes `creator`, `total_seasons`, `total_episodes` n'existaient pas → Utiliser alias SQL
2. **Schéma stats.ts** : `goals` n'a pas de colonnes par type → Utiliser pivot avec `MAX(CASE WHEN...)`
3. **Colonnes inexistantes** : `tmdb_id` et `open_library_id` retirées des INSERT
4. **Import casing** : `openlibrary` → `openLibrary`
5. **RatingStars prop** : `editable` → `interactive`
6. **Composant manquant** : `Progress` créé dans ui/
7. **Edge runtime** : Ajouté aux pages dynamiques `[id]`
