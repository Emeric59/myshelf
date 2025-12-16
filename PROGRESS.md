# PROGRESS.md — Suivi du développement MyShelf

> Ce fichier est mis à jour à chaque grande étape pour permettre la continuité entre sessions.

## Statut actuel

**Phase :** Phase 14 - Amélioration précision recherche (TERMINÉE)
**Dernière mise à jour :** 2025-12-16 (session 9 - fix fuzzy match + debounce)
**Build :** OK
**Déployé :** https://myshelf-d69.pages.dev
**État DB prod :** Vraies données avec descriptions en français (10 livres, 10 films, 10 séries)

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
- [x] Intégration Gemini 2.5 Flash (avec thinking mode)
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

### Phase 8 : Polish et infrastructure - TERMINÉE
- [x] Dashboard dynamique (stats réelles depuis APIs)
- [x] API `/api/books?id=xxx` pour récupérer un livre spécifique
- [x] Tropes seedés en production (54 tropes)
- [x] Infrastructure prête pour les vraies données utilisateur

### Phase 9 : Améliorations UX - EN COURS
- [x] Fix API movies/shows pour récupération média unique (`?id=xxx`)
- [x] Ajout fonctions `updateMovieRating` et `updateShowRating`
- [x] Page `/library` comme hub central (livres, films, séries)
- [x] BottomNav pointe vers `/library` au lieu de `/books`
- [x] Fix hook `useTropes` (préférences déjà fusionnées par API)
- [x] Page `/stats/rankings` - Top 10 par catégorie
- [x] Recommandations par mood connectées à l'IA
- [x] Dashboard enrichi avec section "En cours"
- [x] Filtre par type de média (Livres/Films/Séries) sur les recommandations
- [x] Fix images Next.js pour Cloudflare Pages (`unoptimized: true`)
- [x] Nettoyage migrations et reset DB pour vraies données
- [x] **Rankings refactorisé** : groupes par étoiles (5, 4, 3, 2, 1) au lieu de Top 10
- [x] **Notes personnelles** : label "privé" ajouté (non utilisé par l'IA)
- [x] **Fix overflow mobile** : CSS global pour empêcher le scroll horizontal
- [x] **QUESTIONS.md** : fichier pour questions en attente (référencé dans CLAUDE.md)
- [x] **Descriptions/synopsis** : migration 005 + 006 (descriptions en français)
- [x] **Rankings complet** : affiche tous les groupes d'étoiles (1-5) même vides
- [ ] Export des données (optionnel)
- [ ] Thème clair/sombre (optionnel)

### Phase 10 : Recherche multi-sources livres - TERMINÉE
- [x] **Google Books API** : Client `src/lib/api/googleBooks.ts`
- [x] **Hardcover API** : Client GraphQL `src/lib/api/hardcover.ts`
- [x] **Orchestrateur multi-sources** : `src/lib/api/bookSearch.ts`
- [x] **Migration enrichissement** : Colonnes tropes, moods, content_warnings, google_books_id, hardcover_slug
- [x] **SearchDetailModal** : Popup avec détails avant ajout à la bibliothèque
- [x] **Déduplication** : Fusion des résultats par ISBN ou titre+auteur
- [x] **Enrichissement Hardcover** : Tropes, moods, content warnings, description
- [x] **Synopsis affiché** : Dans le modal et sauvegardé en DB
- [x] **Fix Cloudflare env** : Flag `nodejs_compat_populate_process_env` pour `process.env`
- [x] **Fix query_type** : Changé de `"Book"` à `"books"` (minuscule, pluriel)
- [x] **Fix search results** : Format `results.hits[].document`
- [x] **Parsing JSON DB** : Ajout fonction `parseBookJsonFields` pour genres/tropes/moods
- [x] **Affichage tropes/moods** : Section avec badges colorés sur `/books/[id]`
- [x] **Documentation API** : Fichier `docs/HARDCOVER_API_DOCS.md` ajouté
- [x] **Fix tags robuste** : `extractTagStrings()` gère strings ET objets `{tag, tagSlug, ...}`
- [x] **SearchDetailModal amélioré** : Badges colorés (genres gris, tropes violet, moods vert, warnings orange)

### Phase 11 : Tracking épisodes séries - TERMINÉE
- [x] **Capitalisation tags** : Première lettre majuscule pour genres, tropes, moods, warnings
- [x] **Titres recherche** : Affichage sur 2 lignes au lieu de truncate 1 ligne
- [x] **Fix date doublée** : Films/séries n'affichent plus la date en subtitle ET year
- [x] **Fix progression séries** : Nouvelles séries à 0% au lieu de 50% erroné
- [x] **Migration episode tracking** : Tables `show_seasons` et `watched_episodes`
- [x] **API TMDB saisons** : Fonctions `getSeason()` et `getAllSeasons()` dans tmdb.ts
- [x] **API /api/episodes** : GET (progression), POST (marquer vu), DELETE (démarquer)
- [x] **UI tracking épisodes** : Accordéon par saison, liste d'épisodes cliquables
- [x] **Progression automatique** : Calculée depuis épisodes vus (pas saison courante)
- [x] **Actions rapides** : "Tout marquer vu" et "Réinitialiser" par saison

### Phase 12 : Filtres et UX - TERMINÉE
- [x] **Filtre par année** : Slider 1985-2025 sur recherche et recommandations IA
- [x] **Composant Slider** : `src/components/ui/slider.tsx` avec support valeur nulle
- [x] **Dismiss suggestions IA** : Bouton X avec dialog de confirmation
- [x] **Raisons de refus** : "Déjà vu/lu", "Pas intéressé", "Autre" (stockées en DB)
- [x] **Table dismissed_media** : Migration 009, stockage permanent des refus
- [x] **API /api/dismissed** : GET, POST, DELETE pour gérer les médias refusés
- [x] **Exclusion auto** : Médias refusés exclus des futures recommandations IA
- [x] **Tri bibliothèque** : "En cours d'abord" par défaut (livres, films, séries)
- [x] **Options de tri** : En cours d'abord, Récent, Note
- [x] **Utilitaire sorting** : `src/lib/utils/sorting.ts` avec priorités par statut

### Phase 13 : Gestion des suggestions refusées - TERMINÉE
- [x] **Page /settings/dismissed** : Liste des médias refusés avec possibilité de retirer
- [x] **Affichage détaillé** : Type de média, raison du refus, date, détail optionnel
- [x] **Suppression avec confirmation** : Dialog pour confirmer le retrait de la liste
- [x] **Flow "Déjà vu/lu" amélioré** : Propose d'ajouter à la bibliothèque au lieu de juste dismiss
- [x] **Ajout avec statut complété** : Médias ajoutés via ce flow ont le statut "lu"/"vu"
- [x] **Lien dans paramètres** : Accès depuis /settings > Préférences > Suggestions refusées
- [x] **Règle anti-making-of** : Gemini n'inclut plus les making-of/behind the scenes
- [x] **Fix DismissDialog** : Reset du state à chaque ouverture du dialog

### Phase 14 : Amélioration précision recherche - TERMINÉE
- [x] **Debounce augmenté** : 500ms → 700ms pour réduire les requêtes intermédiaires
- [x] **Fuzzy match intelligent** : Algorithme Levenshtein pour comparaison de titres
- [x] **Seuil de similarité** : 60% minimum requis pour accepter un match Hardcover
- [x] **Bonus auteur** : +15% si l'auteur correspond aussi (>70% similaire)
- [x] **Élimination faux positifs** : Plus de pollution par des livres non pertinents ("The Marine Corps Gazette" pour "Fourth Wing")

---

## Migrations D1

| Fichier | Description | Appliquée en prod |
|---------|-------------|-------------------|
| `001_initial.sql` | Schéma complet (toutes les tables) | ✅ |
| `002_seed_tropes.sql` | 54 tropes + providers streaming | ✅ |
| `003_reset_for_real_data.sql` | Reset des données (utilitaire) | ✅ |
| `004_real_data_seed.sql` | Vraies données (10 livres, 10 films, 10 séries) | ✅ |
| `005_add_descriptions.sql` | Descriptions/synopsis (anglais) | ✅ |
| `006_french_descriptions.sql` | Descriptions traduites en français | ✅ |
| `007_add_book_enrichment.sql` | Colonnes enrichissement livres (tropes, moods, hardcover_slug, etc.) | ✅ |
| `008_episode_tracking.sql` | Tables `show_seasons` et `watched_episodes` pour tracking épisodes | ✅ |
| `009_dismissed_media.sql` | Table `dismissed_media` pour refus de suggestions IA | ✅ |

> **Note :** La DB contient des données réelles avec descriptions en français, IDs vérifiés via APIs officielles (Open Library + TMDB).

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
| `/api/recommendations/ask` | POST | Recommandations IA (Gemini 2.5 Flash) |
| `/api/subscriptions` | GET, POST | Abonnements streaming |
| `/api/episodes` | GET, POST, DELETE | Tracking épisodes séries (style TV Time) |
| `/api/dismissed` | GET, POST, DELETE | Médias refusés dans recommandations IA |

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
│   │   └── rankings/page.tsx       # Favoris par étoiles (groupes)
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
│   │   ├── tmdb.ts
│   │   ├── googleBooks.ts          # Google Books API client
│   │   ├── hardcover.ts            # Hardcover GraphQL API client
│   │   └── bookSearch.ts           # Orchestrateur multi-sources
│   ├── ai/
│   │   └── gemini.ts
│   ├── db/                         # Helpers D1
│   └── hooks/                      # Custom hooks
├── types/
│   └── index.ts
└── env.d.ts
```

---

## Prochaines actions

> Voir **NEXT_SESSION.md** pour les idées détaillées de la prochaine session.

**Prioritaires :**
- Images livres dans les recos IA + clic pour voir la fiche
- Corriger l'affichage du synopsis (avant la note)
- Filtres avancés (genre, note minimum, tropes)

**Optionnelles :**
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
GOOGLE_BOOKS_API_KEY=xxx
HARDCOVER_API_KEY=xxx
```

### Production (Cloudflare Dashboard)
- TMDB_API_KEY
- GEMINI_API_KEY
- GOOGLE_BOOKS_API_KEY
- HARDCOVER_API_KEY

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
9. **Tropes vides** : Migration seedée en production
10. **API movies/shows GET** : Ajout support paramètre `?id=xxx` pour média unique
11. **Hook useTropes** : Simplification (préférences déjà fusionnées par API)
12. **Navigation Biblio** : Pointe vers `/library` au lieu de `/books`
13. **Page d'accueil** : Utilise maintenant le composant BottomNav partagé
14. **Tropes SQL** : Colonne `name_fr` inexistante retirée de la requête
15. **Images non chargées** : Ajout `unoptimized: true` dans next.config.ts (Cloudflare Pages)
16. **Rankings 404** : IDs de navigation corrigés (`book_id` au lieu de `id` row)
17. **Mood recommendations** : Paramètre API corrigé (`query` au lieu de `message`)
18. **Ajout depuis recommandations** : Type de recherche corrigé (singulier au lieu de pluriel)
19. **Migrations nettoyées** : Suppression des migrations obsolètes, reset DB pour vraies données
20. **Overflow mobile** : Ajout `overflow-x-hidden` global dans CSS pour empêcher scroll horizontal
21. **Rankings redesign** : Passage de Top 10 à groupes par étoiles (5★ Coups de coeur, 4★ Excellents, etc.)
22. **Notes personnelles** : Label mis à jour pour indiquer que c'est privé (non utilisé par IA)
23. **Hardcover parsing** : Les tags sont des objets `{tag, tagSlug, category}` pas des strings simples
24. **Tropes Hardcover** : Combinaison des catégories "Trope" et "Tag" (Hardcover utilise "Tag" pour les tropes)
25. **Synopsis manquant** : Ajout de `description` et `pageCount` au payload d'ajout livre
26. **Enrichissement pollué** : Fallback aveugle `results[0]` remplacé par fuzzy match avec seuil 60%
27. **Debounce trop court** : 500ms → 700ms pour éviter requêtes intermédiaires

---

## Architecture recherche livres multi-sources

```
Recherche "Fourth Wing"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              searchBooksMultiSource()                    │
│                   (bookSearch.ts)                        │
└─────────────────────────────────────────────────────────┘
         │
         ├──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  Google  │      │   Open   │      │ Hardcover│
   │  Books   │      │ Library  │      │ (GraphQL)│
   └──────────┘      └──────────┘      └──────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
              ┌─────────────────────────┐
              │   mergeBookResults()    │
              │   - Dédupe par ISBN     │
              │   - Dédupe par titre    │
              │   - Fusion métadonnées  │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │ enrichWithHardcover()   │
              │   - Fetch détails       │
              │   - Tropes, moods       │
              │   - Content warnings    │
              └─────────────────────────┘
                            │
                            ▼
                   UnifiedBookResult[]
```

### Données récupérées par source

| Source | Données |
|--------|---------|
| Google Books | Titre, auteurs, ISBN, description, couverture, pages, catégories |
| Open Library | Titre, auteur, ISBN, couverture, date publication |
| Hardcover | Genres, tropes (via "Tag"), moods, content warnings, série |

### Debug logs

Pour voir les logs en temps réel lors d'une recherche :
```bash
npx wrangler pages deployment tail myshelf --project-name=myshelf
```

Les logs montrent :
```
[BookSearch] Query: "Fourth Wing"
[BookSearch] Google Books: 15 results
[BookSearch] Open Library: 12 results
[BookSearch] Hardcover: 8 results
[Enrich] Found Fourth Wing on Hardcover by title search
```
