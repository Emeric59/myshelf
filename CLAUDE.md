# CLAUDE.md — MyShelf

> **IMPORTANT :** Consulter [`PROGRESS.md`](./PROGRESS.md) pour l'état actuel du développement et les prochaines étapes.

## Résumé du projet

**MyShelf** est une application personnelle de suivi et recommandation de médias (livres, films, séries).

- **Utilisateur** : Single-user (pas d'auth complexe)
- **Plateforme** : PWA (web + mobile installable)
- **Style** : Whimsical, violet/vert, ambiance nature/cosy
- **Objectif** : Tracker ses lectures/visionnages + obtenir des recommandations IA personnalisées

## Stack technique

| Composant | Technologie | Raison |
|-----------|-------------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR, excellent DX |
| Styling | Tailwind CSS + shadcn/ui | Rapide, customisable |
| Backend | Cloudflare Workers (API routes) | Serverless, pas cher |
| Database | Cloudflare D1 (SQLite) | Simple, gratuit |
| Vectors | Cloudflare Vectorize | Embeddings pour recos |
| IA | Google Gemini 2.5 Flash | Bon rapport qualité/prix |
| Déploiement | Cloudflare Pages | Auto-deploy depuis Git |

## Structure du projet

```
myshelf/
├── CLAUDE.md                    # CE FICHIER
├── package.json
├── next.config.ts
├── wrangler.toml                # Config Cloudflare
├── .env.local                   # Variables locales (pas en git)
│
├── docs/
│   ├── FEATURES.md              # Specs fonctionnelles complètes
│   ├── DATABASE.md              # Schéma SQL détaillé
│   └── API.md                   # Documentation endpoints
│
├── migrations/
│   ├── 001_initial.sql          # Schéma initial
│   └── 002_seed_tropes.sql      # Données de seed
│
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # Composants React
│   │   ├── ui/                  # shadcn/ui
│   │   ├── layout/              # Header, BottomNav, etc.
│   │   ├── media/               # MediaCard, RatingStars, etc.
│   │   └── ...
│   ├── lib/                     # Utilitaires et clients
│   │   ├── db/                  # Queries D1
│   │   ├── api/                 # Clients Open Library, TMDB
│   │   └── ai/                  # Client Gemini
│   ├── hooks/                   # Custom hooks
│   └── types/                   # Types TypeScript
│
├── public/
│   ├── icons/                   # PWA icons
│   └── manifest.json            # PWA manifest
│
└── scripts/
    └── seed-tropes.ts           # Script de seed
```

## Design System

### Couleurs

- **Primary (Violet)**: `#8b5cf6` - Couleur principale
- **Secondary (Vert)**: `#10b981` - Accent nature
- **Background (Cream)**: `#FAF7F2` - Fond principal

### Typographie

- **Titres**: Playfair Display (serif, élégant)
- **Corps**: Inter (sans-serif, lisible)

### Icônes

Utiliser **Lucide React** exclusivement.

## APIs externes

### Open Library (Livres)
- Base URL: `https://openlibrary.org`
- Pas d'authentification requise

### TMDB (Films & Séries)
- Base URL: `https://api.themoviedb.org/3`
- Header: `Authorization: Bearer {TMDB_API_KEY}`

### Gemini (IA)
- SDK: `@google/generative-ai`
- Modèle: `gemini-2.0-flash`

## Commandes

```bash
# Installation
npm install --legacy-peer-deps

# Dev local
npm run dev

# Build
npm run build

# Migrations D1
wrangler d1 execute myshelf-db --file=./migrations/001_initial.sql
wrangler d1 execute myshelf-db --file=./migrations/002_seed_tropes.sql
```

## Variables d'environnement

```bash
# .env.local
TMDB_API_KEY=xxx
GEMINI_API_KEY=xxx
```

## Règles strictes

1. **TypeScript strict** : Pas de `any`, types explicites
2. **Pas de données inventées** : Toujours vérifier via API que le média existe
3. **Blacklist = absolu** : Un trope blacklisté ne doit JAMAIS apparaître
4. **Mobile-first** : Toujours designer pour mobile d'abord
5. **Accessibilité** : Labels, contraste, navigation clavier
