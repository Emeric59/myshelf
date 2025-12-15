# CLAUDE.md — MyShelf

> **IMPORTANT :** Consulter [`PROGRESS.md`](./PROGRESS.md) pour l'état actuel du développement et les prochaines étapes.

## Résumé du projet

**MyShelf** est une application personnelle de suivi et recommandation de médias (livres, films, séries).

- **Utilisateur** : Single-user (pas d'auth complexe)
- **Plateforme** : PWA (web + mobile installable)
- **Style** : Whimsical, violet/vert, ambiance nature/cosy
- **Objectif** : Tracker ses lectures/visionnages + obtenir des recommandations IA personnalisées
- **URL Production** : https://myshelf-d69.pages.dev

## Stack technique

| Composant | Technologie | Raison |
|-----------|-------------|--------|
| Frontend | Next.js 16 (App Router) + TypeScript | SSR, excellent DX |
| Styling | Tailwind CSS v4 + shadcn/ui | Rapide, customisable |
| Backend | Cloudflare Workers (API routes) | Serverless, pas cher |
| Database | Cloudflare D1 (SQLite) | Simple, gratuit |
| Vectors | Cloudflare Vectorize | Embeddings pour recos (optionnel) |
| IA | Google Gemini 2.5 Flash | Bon rapport qualité/prix + thinking mode |
| Déploiement | Cloudflare Pages | Auto-deploy depuis Git |

## Commandes

```bash
# Installation
npm install --legacy-peer-deps

# Dev local
npm run dev

# Build (TOUJOURS vérifier avant push)
npm run build

# Tests unitaires
npm test              # Mode watch
npm run test:run      # Une seule exécution

# Migrations D1 (production)
wrangler d1 execute myshelf-db --file=./migrations/001_initial.sql --remote
wrangler d1 execute myshelf-db --file=./migrations/002_seed_tropes.sql --remote
```

## Variables d'environnement

```bash
# .env.local (dev)
TMDB_API_KEY=xxx
GEMINI_API_KEY=xxx

# Production: configurées dans Cloudflare Dashboard
```

## Règles strictes

1. **TypeScript strict** : Pas de `any`, types explicites
2. **Pas de données inventées** : Toujours vérifier via API que le média existe
3. **Blacklist = absolu** : Un trope blacklisté ne doit JAMAIS apparaître
4. **Mobile-first** : Toujours designer pour mobile d'abord
5. **Accessibilité** : Labels, contraste, navigation clavier

## Règles Cloudflare Pages (CRITIQUE)

### Edge Runtime obligatoire

**Toutes les pages dynamiques (`[id]`) ET les API routes DOIVENT avoir :**

```typescript
export const runtime = 'edge'
```

Sans cela, le déploiement Cloudflare échouera avec l'erreur :
```
The following routes were not configured to run with the Edge Runtime
```

### Accès à la base de données D1

```typescript
import { getRequestContext } from "@cloudflare/next-on-pages"

export async function GET() {
  const { env } = getRequestContext()
  const db = env.DB
  // ...
}
```

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

## Structure clé

```
src/
├── app/
│   ├── books/[id]/page.tsx     # runtime = 'edge'
│   ├── movies/[id]/page.tsx    # runtime = 'edge'
│   ├── shows/[id]/page.tsx     # runtime = 'edge'
│   └── api/*/route.ts          # runtime = 'edge'
├── lib/
│   ├── api/
│   │   ├── openLibrary.ts      # ATTENTION: camelCase !
│   │   └── tmdb.ts
│   └── db/                     # Helpers D1
└── components/
    └── ui/progress.tsx         # Composant custom
```

## APIs externes

### Open Library (Livres)
- Base URL: `https://openlibrary.org`
- Pas d'authentification requise

### TMDB (Films & Séries)
- Base URL: `https://api.themoviedb.org/3`
- Header: `Authorization: Bearer {TMDB_API_KEY}`

### Gemini (IA)
- SDK: `@google/genai`
- Modèle: `gemini-2.5-flash` (avec thinking mode activé)

## Informations Cloudflare

- **D1 Database ID** : `2bf81530-3003-4748-958a-111383c35183`
- **Pages URL** : https://myshelf-d69.pages.dev
- **GitHub Repo** : https://github.com/Emeric59/myshelf
