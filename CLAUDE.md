# CLAUDE.md — MyShelf

> **IMPORTANT :** Consulter [`PROGRESS.md`](./PROGRESS.md) pour l'état actuel du développement et les prochaines étapes.
>
> **QUESTIONS :** Consulter [`QUESTIONS.md`](./QUESTIONS.md) pour les questions en attente de réponse de l'utilisateur.

## Résumé du projet

**MyShelf** est une application personnelle de suivi et recommandation de médias (livres, films, séries).

- **Utilisateur** : Single-user (pas d'auth complexe)
- **Plateforme** : PWA (web + mobile installable)
- **Style** : Whimsical, violet/vert, ambiance nature/cosy
- **Objectif** : Tracker ses lectures/visionnages + obtenir des recommandations IA personnalisées
- **URL Production** : https://myshelf.emericb59.workers.dev

## Stack technique

| Composant | Technologie | Raison |
|-----------|-------------|--------|
| Frontend | Next.js 16 (App Router) + TypeScript | SSR, excellent DX |
| Styling | Tailwind CSS v4 + shadcn/ui | Rapide, customisable |
| Backend | Cloudflare Workers (via OpenNext) | Serverless, pas cher |
| Database | Cloudflare D1 (SQLite) | Simple, gratuit |
| Vectors | Cloudflare Vectorize | Embeddings pour recos (optionnel) |
| IA | Google Gemini 3 Flash Preview | Plus rapide, meilleur raisonnement + thinking mode |
| Déploiement | GitHub Actions → Cloudflare Workers | Auto-deploy depuis Git |

## Commandes

```bash
# Installation
npm install --legacy-peer-deps

# Dev local (avec bindings D1 simulés)
npm run dev

# Build Next.js standard
npm run build

# Preview OpenNext (build + preview local)
npm run preview

# Déploiement manuel (préférer GitHub Actions)
npm run deploy

# Tests unitaires
npm test              # Mode watch
npm run test:run      # Une seule exécution

# Migrations D1 (production)
wrangler d1 execute myshelf-db --file=./migrations/001_initial.sql --remote
```

## Variables d'environnement

### Local (.env.local)
```bash
TMDB_API_KEY=xxx
GEMINI_API_KEY=xxx
HARDCOVER_API_KEY=xxx
GOOGLE_BOOKS_API_KEY=xxx  # Optionnel mais recommandé pour les couvertures
```

### Production (Cloudflare Workers secrets)

Les secrets sont configurés via Wrangler CLI :
```bash
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put HARDCOVER_API_KEY
npx wrangler secret put GOOGLE_BOOKS_API_KEY
```

> **Note :** Les secrets ont été configurés lors de la migration OpenNext (décembre 2024).

## Règles strictes

1. **TypeScript strict** : Pas de `any`, types explicites
2. **Pas de données inventées** : Toujours vérifier via API que le média existe
3. **Blacklist = absolu** : Un trope blacklisté ne doit JAMAIS apparaître
4. **Mobile-first** : Toujours designer pour mobile d'abord
5. **Accessibilité** : Labels, contraste, navigation clavier

---

## Architecture Cloudflare Workers / OpenNext (CRITIQUE)

### Pourquoi OpenNext ?

Le projet a migré de `@cloudflare/next-on-pages` vers `@opennextjs/cloudflare` en décembre 2024 pour résoudre un problème de taille de bundle (> 3 MiB limite free tier).

**Avantages OpenNext :**
- Meilleure gestion du code splitting
- Bundle plus petit (< 3 MiB)
- Support natif des fonctionnalités Next.js
- Pas besoin de `export const runtime = "edge"` sur chaque fichier

### Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| `wrangler.jsonc` | Configuration Cloudflare Workers (bindings D1, assets) |
| `open-next.config.ts` | Configuration OpenNext (vide par défaut) |
| `next.config.ts` | Configuration Next.js + initialisation OpenNext pour dev |
| `.github/workflows/deploy.yml` | CI/CD GitHub Actions pour déploiement |

### Accès à la base de données D1

```typescript
// IMPORTANT: Utiliser getCloudflareContext de @opennextjs/cloudflare
import { getCloudflareContext } from "@opennextjs/cloudflare"

export async function GET() {
  const { env } = getCloudflareContext()
  const db = env.DB
  // ...
}
```

> **ATTENTION :** Anciennement on utilisait `getRequestContext` de `@cloudflare/next-on-pages`. Ce package a été supprimé.

### Déploiement automatique (GitHub Actions)

Le déploiement se fait automatiquement via GitHub Actions à chaque push sur `main`.

**Workflow** (`.github/workflows/deploy.yml`) :
1. Checkout du code
2. Setup Node.js 20
3. `npm ci`
4. `npx opennextjs-cloudflare build`
5. `npx wrangler deploy`

**Secrets GitHub requis :**
- `CLOUDFLARE_API_TOKEN` : Token API avec permissions Workers
- `CLOUDFLARE_ACCOUNT_ID` : ID du compte Cloudflare

> **Note :** Le déploiement via `npm run deploy` ne fonctionne PAS sur Windows (problèmes de parsing npm). Utiliser GitHub Actions.

### Déploiement manuel (Linux/Mac uniquement)

```bash
# Build + deploy
npm run deploy

# Ou étape par étape
npx opennextjs-cloudflare build
npx wrangler deploy
```

---

## Images Next.js - Remote Patterns

Les images externes doivent être autorisées dans `next.config.ts` :

```typescript
images: {
  remotePatterns: [
    { hostname: "covers.openlibrary.org" },    // Open Library
    { hostname: "image.tmdb.org" },            // TMDB
    { hostname: "hardcover.app" },             // Hardcover
    { hostname: "books.google.com" },          // Google Books
    { hostname: "*.googleusercontent.com" },   // Google Books (variantes)
  ],
}
```

> **Bug corrigé (migration OpenNext) :** Les couvertures Google Books ne s'affichaient pas car les domaines n'étaient pas autorisés.

---

## TypeScript - Pièges courants

### 1. `res.json()` retourne `unknown`

```typescript
// MAUVAIS - erreur TypeScript
const data = await res.json()
setData(data)

// BON - assertion de type
const data = await res.json() as MyType
setData(data)
```

### 2. Casing des fichiers

Windows n'est pas sensible à la casse, mais Git l'est !

```typescript
// Le fichier s'appelle openLibrary.ts (camelCase)

// MAUVAIS
import { searchBooks } from '@/lib/api/openlibrary'

// BON
import { searchBooks } from '@/lib/api/openLibrary'
```

### 3. Schéma DB vs Types TypeScript

Les noms de colonnes DB peuvent différer des propriétés TypeScript. Utiliser des alias SQL :

```sql
-- La colonne s'appelle 'creators' mais le type attend 'creator'
SELECT s.creators as creator FROM shows s
```

---

## Composants personnalisés

### RatingStars

```tsx
// Pour le mode édition, utiliser 'interactive' (pas 'editable')
<RatingStars
  rating={book.rating || 0}
  interactive
  size="lg"
  onChange={handleRatingChange}
/>
```

### Progress

Composant custom dans `src/components/ui/progress.tsx` (pas de Radix).

---

## Structure clé

```
myshelf/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD GitHub Actions
├── migrations/                  # Fichiers SQL pour D1
├── src/
│   ├── app/
│   │   ├── books/[id]/page.tsx # Page dynamique livre
│   │   ├── movies/[id]/page.tsx
│   │   ├── shows/[id]/page.tsx
│   │   ├── upcoming/page.tsx   # Prochaines sorties
│   │   └── api/*/route.ts      # API routes
│   ├── lib/
│   │   ├── api/
│   │   │   ├── openLibrary.ts  # ATTENTION: camelCase !
│   │   │   ├── googleBooks.ts  # Google Books API
│   │   │   ├── hardcover.ts    # GraphQL API (tropes, moods)
│   │   │   ├── bookSearch.ts   # Orchestrateur multi-sources
│   │   │   └── tmdb.ts         # Films & séries
│   │   ├── ai/
│   │   │   └── gemini.ts       # Client Gemini
│   │   └── db/                 # Helpers D1
│   └── components/
│       └── ui/progress.tsx     # Composant custom
├── wrangler.jsonc              # Config Workers + D1 bindings
├── open-next.config.ts         # Config OpenNext
└── next.config.ts              # Config Next.js
```

---

## APIs externes

### Open Library (Livres - recherche & données de base)
- Base URL: `https://openlibrary.org`
- Pas d'authentification requise
- Utilisé pour: recherche, couvertures, métadonnées de base

### Google Books (Livres - couvertures haute qualité)
- Base URL: `https://www.googleapis.com/books/v1`
- Authentification: API Key (optionnelle mais recommandée)
- Utilisé pour: couvertures, descriptions, ISBN

### Hardcover (Livres - métadonnées enrichies)
- Base URL: `https://api.hardcover.app/v1/graphql`
- Header: `Authorization: Bearer {HARDCOVER_API_KEY}`
- GraphQL API (via Typesense pour la recherche)
- Fournit: genres, tropes, moods, content warnings
- **Important**: `query_type` doit être `"books"` (minuscules, pluriel)
- **Important**: `cached_tags` peut contenir des strings OU des objets `{tag, tagSlug, ...}`

### TMDB (Films & Séries)
- Base URL: `https://api.themoviedb.org/3`
- Header: `Authorization: Bearer {TMDB_API_KEY}`
- Utilisé pour: recherche, métadonnées, images, épisodes, `next_episode_to_air`

### Gemini (IA)
- SDK: `@google/genai`
- Modèle: `gemini-3-flash-preview` (avec thinking mode)
- Configuration thinking: `thinkingLevel: "high"` (raisonnement approfondi)
- Utilisé pour: recommandations personnalisées, mode surprise
- **Note**: Gemini 3 utilise `thinkingLevel` (string) au lieu de `thinkingBudget` (number)
  - Valeurs possibles: `"minimal"`, `"low"`, `"medium"`, `"high"`

---

## Informations Cloudflare

| Ressource | Valeur |
|-----------|--------|
| **D1 Database ID** | `2bf81530-3003-4748-958a-111383c35183` |
| **Workers URL** | https://myshelf.emericb59.workers.dev |
| **GitHub Repo** | https://github.com/Emeric59/myshelf |
| **Ancienne Pages URL** | https://myshelf-d69.pages.dev (obsolète) |

---

## Historique des migrations d'infrastructure

### Décembre 2024 : Migration OpenNext

**Problème :** Le bundle `@cloudflare/next-on-pages` dépassait la limite de 3 MiB du free tier Cloudflare Workers.

**Solution :** Migration vers `@opennextjs/cloudflare` qui gère mieux le code splitting.

**Changements effectués :**

1. **Packages npm :**
   - Supprimé: `@cloudflare/next-on-pages`
   - Ajouté: `@opennextjs/cloudflare`

2. **Fichiers de configuration :**
   - `wrangler.toml` → `wrangler.jsonc` (format JSON avec commentaires)
   - Nouveau: `open-next.config.ts`
   - Modifié: `next.config.ts` (ajout `initOpenNextCloudflareForDev()`)

3. **Code source :**
   - Tous les imports `getRequestContext` → `getCloudflareContext`
   - Suppression de `export const runtime = "edge"` (17 fichiers API, 3 pages dynamiques)

4. **Déploiement :**
   - Nouveau workflow GitHub Actions (`.github/workflows/deploy.yml`)
   - Cloudflare Pages → Cloudflare Workers
   - Nouvelle URL: `myshelf.emericb59.workers.dev`

5. **Images :**
   - Ajout domaines Google Books dans `remotePatterns`

**Si quelque chose ne fonctionne plus après migration, vérifier :**
- [ ] Import `getCloudflareContext` au lieu de `getRequestContext`
- [ ] Secrets Cloudflare configurés (`wrangler secret list`)
- [ ] Domaines images autorisés dans `next.config.ts`
- [ ] GitHub Actions secrets configurés (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

### Décembre 2025 : Migration Gemini 3 Flash

**Raison :** Google a lancé Gemini 3 Flash (17 déc 2025) avec de meilleures performances et une vitesse 3x supérieure.

**Changements effectués :**

1. **Modèle :**
   - `gemini-2.5-flash` → `gemini-3-flash-preview`

2. **Configuration thinking mode :**
   - Ancien: `thinkingBudget: 8192` (nombre de tokens)
   - Nouveau: `thinkingLevel: "high"` (niveau qualitatif)

3. **Fichier modifié :**
   - `src/lib/ai/gemini.ts` (2 appels API mis à jour)

**Comparaison des prix :**
| Modèle | Input (/1M) | Output (/1M) |
|--------|-------------|--------------|
| Gemini 2.5 Flash | $0.30 | $2.50 |
| Gemini 3 Flash | $0.50 | $3.00 |

**Avantages Gemini 3 Flash :**
- 3x plus rapide
- Meilleur raisonnement (SWE-bench: 78%, GPQA: 90.4%)
- 30% moins de tokens utilisés pour le thinking

**Si les recommandations IA ne fonctionnent plus :**
- [ ] Vérifier que le SDK `@google/genai` est à jour
- [ ] Vérifier que `GEMINI_API_KEY` est configuré
- [ ] Le modèle `gemini-3-flash-preview` peut changer de nom (surveiller la doc Google)
