# TASK — Intégration Multi-Sources Livres (Google Books + Hardcover)

## 🎯 Objectif

Enrichir la recherche et les données de livres dans MyShelf en ajoutant **Google Books** et **Hardcover** en complément de **Open Library** (actuellement seule source).

### Bénéfices attendus
- **Meilleure couverture** : Plus de livres trouvés, notamment récents et français
- **Données enrichies** : Tropes, moods, content warnings (via Hardcover)
- **Meilleures recommandations IA** : Plus de contexte pour personnaliser

---

## 📊 Architecture cible

```
Recherche utilisateur : "Fourth Wing"
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│                   SEARCH ORCHESTRATOR                      │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ Google Books│  │ Open Library│  │   Hardcover     │   │
│  │  (primary)  │  │ (secondary) │  │  (enrichment)   │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│         │                │                   │            │
│         └────────────────┴───────────────────┘            │
│                          │                                │
│                          ▼                                │
│              ┌───────────────────────┐                   │
│              │   MERGE & DEDUPE      │                   │
│              │   (par ISBN/titre)    │                   │
│              └───────────────────────┘                   │
│                          │                                │
│                          ▼                                │
│              ┌───────────────────────┐                   │
│              │   UNIFIED BOOK DATA   │                   │
│              └───────────────────────┘                   │
└───────────────────────────────────────────────────────────┘
```

---

## 🔌 APIs à intégrer

### 1. Google Books API

**Base URL:** `https://www.googleapis.com/books/v1`

**Authentification:** API Key en query param

**Endpoints utiles:**
```
# Recherche
GET /volumes?q={query}&langRestrict=fr&maxResults=20&key={API_KEY}

# Détail d'un livre
GET /volumes/{volumeId}?key={API_KEY}
```

**Exemple de réponse (simplifié):**
```json
{
  "items": [
    {
      "id": "google_volume_id",
      "volumeInfo": {
        "title": "Fourth Wing",
        "authors": ["Rebecca Yarros"],
        "description": "...",
        "pageCount": 528,
        "categories": ["Fiction / Fantasy / Romance"],
        "imageLinks": {
          "thumbnail": "http://books.google.com/..."
        },
        "industryIdentifiers": [
          { "type": "ISBN_13", "identifier": "9781649374042" }
        ],
        "publishedDate": "2023-05-02",
        "language": "en"
      }
    }
  ]
}
```

**Limites:** 1000 requêtes/jour (gratuit)

---

### 2. Hardcover API (GraphQL)

**Base URL:** `https://api.hardcover.app/v1/graphql`

**Authentification:** Bearer token dans header

**Headers:**
```
Authorization: Bearer {HARDCOVER_API_KEY}
Content-Type: application/json
```

**Query de recherche:**
```graphql
{
  search(
    query: "Fourth Wing"
    query_type: "books"
    per_page: 10
    page: 1
  ) {
    results
  }
}
```

**Query de détails livre (avec tropes/moods):**
```graphql
{
  books(where: { slug: { _eq: "fourth-wing" } }) {
    id
    title
    slug
    description
    pages
    release_date
    cached_image
    cached_contributors
    cached_tags
    series {
      name
      books_count
    }
  }
}
```

**Données clés disponibles:**
- `cached_tags` : Contient les genres, tropes, moods (user-generated)
  - `cached_tags['Genre']` : Genres
  - `cached_tags['Trope']` : Tropes (enemies to lovers, etc.)
  - `cached_tags['Mood']` : Ambiances (dark, funny, emotional...)
  - `cached_tags['Content Warning']` : Avertissements
- `cached_contributors` : Auteurs
- `series` : Information sur la série

**Limites:** Rate limiting (pas de chiffre précis), usage backend uniquement

---

## 📁 Fichiers à créer/modifier

### Nouveaux fichiers à créer

```
src/lib/api/
├── googleBooks.ts      # Client Google Books API
├── hardcover.ts        # Client Hardcover API (GraphQL)
├── bookSearch.ts       # Orchestrateur de recherche multi-sources
└── bookMerger.ts       # Logique de fusion/déduplication
```

### Fichiers existants à modifier

```
src/lib/api/openLibrary.ts   # Adapter pour s'intégrer dans l'orchestrateur
src/app/books/search/        # Utiliser le nouvel orchestrateur
src/app/api/...              # Routes API si nécessaire
.env.local                   # Ajouter les nouvelles clés
```

---

## 🔧 Implémentation détaillée

### 1. Client Google Books (`src/lib/api/googleBooks.ts`)

```typescript
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1';

export interface GoogleBookResult {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  categories?: string[];
  thumbnail?: string;
  isbn13?: string;
  isbn10?: string;
  publishedDate?: string;
  language?: string;
}

export async function searchGoogleBooks(
  query: string,
  options?: { langRestrict?: string; maxResults?: number }
): Promise<GoogleBookResult[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(options?.maxResults ?? 20),
    key: process.env.GOOGLE_BOOKS_API_KEY!,
  });
  
  if (options?.langRestrict) {
    params.set('langRestrict', options.langRestrict);
  }

  const response = await fetch(`${GOOGLE_BOOKS_URL}/volumes?${params}`);
  const data = await response.json();

  return (data.items || []).map(parseGoogleBookItem);
}

function parseGoogleBookItem(item: any): GoogleBookResult {
  const info = item.volumeInfo || {};
  const identifiers = info.industryIdentifiers || [];
  
  return {
    id: item.id,
    title: info.title,
    authors: info.authors || [],
    description: info.description,
    pageCount: info.pageCount,
    categories: info.categories,
    thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
    isbn13: identifiers.find((i: any) => i.type === 'ISBN_13')?.identifier,
    isbn10: identifiers.find((i: any) => i.type === 'ISBN_10')?.identifier,
    publishedDate: info.publishedDate,
    language: info.language,
  };
}
```

### 2. Client Hardcover (`src/lib/api/hardcover.ts`)

```typescript
const HARDCOVER_URL = 'https://api.hardcover.app/v1/graphql';

export interface HardcoverBookResult {
  id: number;
  title: string;
  slug: string;
  description?: string;
  pages?: number;
  releaseDate?: string;
  coverUrl?: string;
  authors: string[];
  genres: string[];
  tropes: string[];
  moods: string[];
  contentWarnings: string[];
  seriesName?: string;
  seriesPosition?: number;
}

export async function searchHardcover(query: string): Promise<HardcoverBookResult[]> {
  const graphqlQuery = `
    {
      search(
        query: "${query.replace(/"/g, '\\"')}"
        query_type: "books"
        per_page: 15
        page: 1
      ) {
        results
      }
    }
  `;

  const response = await fetch(HARDCOVER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HARDCOVER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: graphqlQuery }),
  });

  const data = await response.json();
  
  // Les résultats sont dans un format spécifique, parser selon la structure
  return parseHardcoverResults(data.data?.search?.results || []);
}

export async function getHardcoverBookDetails(slug: string): Promise<HardcoverBookResult | null> {
  const graphqlQuery = `
    {
      books(where: { slug: { _eq: "${slug}" } }) {
        id
        title
        slug
        description
        pages
        release_date
        cached_image
        cached_contributors
        cached_tags
        series {
          name
          position
        }
      }
    }
  `;

  const response = await fetch(HARDCOVER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HARDCOVER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: graphqlQuery }),
  });

  const data = await response.json();
  const book = data.data?.books?.[0];
  
  if (!book) return null;
  
  return parseHardcoverBook(book);
}

function parseHardcoverBook(book: any): HardcoverBookResult {
  const tags = book.cached_tags || {};
  
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description,
    pages: book.pages,
    releaseDate: book.release_date,
    coverUrl: book.cached_image,
    authors: (book.cached_contributors || [])
      .filter((c: any) => c.author)
      .map((c: any) => c.author.name),
    genres: tags['Genre'] || [],
    tropes: tags['Trope'] || [],
    moods: tags['Mood'] || [],
    contentWarnings: tags['Content Warning'] || [],
    seriesName: book.series?.name,
    seriesPosition: book.series?.position,
  };
}

function parseHardcoverResults(results: any[]): HardcoverBookResult[] {
  // Adapter selon le format exact retourné par l'API search
  // Le format peut différer de la query books
  return results.map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    description: r.description,
    pages: r.pages,
    coverUrl: r.cached_image || r.image,
    authors: r.author_names || [],
    genres: [],  // Non disponible dans search, enrichir après si besoin
    tropes: [],
    moods: r.moods || [],
    contentWarnings: [],
    seriesName: r.series_names?.[0],
  }));
}
```

### 3. Orchestrateur de recherche (`src/lib/api/bookSearch.ts`)

```typescript
import { searchGoogleBooks, GoogleBookResult } from './googleBooks';
import { searchHardcover, getHardcoverBookDetails, HardcoverBookResult } from './hardcover';
import { searchOpenLibrary, OpenLibraryResult } from './openLibrary';

export interface UnifiedBookResult {
  // Identifiants
  id: string;                    // ID interne généré
  googleBooksId?: string;
  openLibraryId?: string;
  hardcoverId?: number;
  hardcoverSlug?: string;
  isbn13?: string;
  isbn10?: string;
  
  // Métadonnées de base
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  coverUrl?: string;
  publishedDate?: string;
  language?: string;
  
  // Enrichissement (Hardcover)
  genres: string[];
  tropes: string[];
  moods: string[];
  contentWarnings: string[];
  
  // Série
  seriesName?: string;
  seriesPosition?: number;
  
  // Source tracking
  sources: ('google' | 'openlibrary' | 'hardcover')[];
}

export async function searchBooks(query: string): Promise<UnifiedBookResult[]> {
  // Lancer les recherches en parallèle
  const [googleResults, openLibraryResults, hardcoverResults] = await Promise.allSettled([
    searchGoogleBooks(query, { maxResults: 15 }),
    searchOpenLibrary(query),
    searchHardcover(query),
  ]);

  // Extraire les résultats (ignorer les erreurs)
  const google = googleResults.status === 'fulfilled' ? googleResults.value : [];
  const openLibrary = openLibraryResults.status === 'fulfilled' ? openLibraryResults.value : [];
  const hardcover = hardcoverResults.status === 'fulfilled' ? hardcoverResults.value : [];

  // Fusionner et dédupliquer
  const merged = mergeBookResults(google, openLibrary, hardcover);
  
  // Enrichir les top résultats avec les tropes Hardcover si disponible
  const enriched = await enrichWithHardcoverDetails(merged.slice(0, 10));

  return enriched;
}

function mergeBookResults(
  google: GoogleBookResult[],
  openLibrary: OpenLibraryResult[],
  hardcover: HardcoverBookResult[]
): UnifiedBookResult[] {
  const bookMap = new Map<string, UnifiedBookResult>();

  // Fonction pour générer une clé de déduplication
  const getDedupeKey = (title: string, author: string): string => {
    return `${normalizeString(title)}::${normalizeString(author)}`;
  };

  // Ajouter les résultats Google (priorité haute)
  for (const book of google) {
    const key = book.isbn13 || getDedupeKey(book.title, book.authors[0] || '');
    
    if (!bookMap.has(key)) {
      bookMap.set(key, {
        id: `g_${book.id}`,
        googleBooksId: book.id,
        isbn13: book.isbn13,
        isbn10: book.isbn10,
        title: book.title,
        authors: book.authors,
        description: book.description,
        pageCount: book.pageCount,
        coverUrl: book.thumbnail,
        publishedDate: book.publishedDate,
        language: book.language,
        genres: book.categories || [],
        tropes: [],
        moods: [],
        contentWarnings: [],
        sources: ['google'],
      });
    }
  }

  // Enrichir/ajouter avec Open Library
  for (const book of openLibrary) {
    const key = book.isbn13 || getDedupeKey(book.title, book.author || '');
    
    if (bookMap.has(key)) {
      // Enrichir l'existant
      const existing = bookMap.get(key)!;
      existing.openLibraryId = book.id;
      if (!existing.coverUrl && book.coverUrl) {
        existing.coverUrl = book.coverUrl;
      }
      if (!existing.sources.includes('openlibrary')) {
        existing.sources.push('openlibrary');
      }
    } else {
      // Ajouter nouveau
      bookMap.set(key, {
        id: `ol_${book.id}`,
        openLibraryId: book.id,
        isbn13: book.isbn13,
        title: book.title,
        authors: book.author ? [book.author] : [],
        description: book.description,
        pageCount: book.pageCount,
        coverUrl: book.coverUrl,
        publishedDate: book.publishedDate,
        genres: [],
        tropes: [],
        moods: [],
        contentWarnings: [],
        sources: ['openlibrary'],
      });
    }
  }

  // Enrichir/ajouter avec Hardcover (tropes, moods)
  for (const book of hardcover) {
    const key = getDedupeKey(book.title, book.authors[0] || '');
    
    if (bookMap.has(key)) {
      // Enrichir avec les données Hardcover (tropes, moods)
      const existing = bookMap.get(key)!;
      existing.hardcoverId = book.id;
      existing.hardcoverSlug = book.slug;
      existing.tropes = book.tropes;
      existing.moods = book.moods;
      existing.contentWarnings = book.contentWarnings;
      if (book.genres.length > 0) {
        existing.genres = [...new Set([...existing.genres, ...book.genres])];
      }
      if (book.seriesName) {
        existing.seriesName = book.seriesName;
        existing.seriesPosition = book.seriesPosition;
      }
      if (!existing.sources.includes('hardcover')) {
        existing.sources.push('hardcover');
      }
    } else {
      // Ajouter nouveau
      bookMap.set(key, {
        id: `hc_${book.id}`,
        hardcoverId: book.id,
        hardcoverSlug: book.slug,
        title: book.title,
        authors: book.authors,
        description: book.description,
        pageCount: book.pages,
        coverUrl: book.coverUrl,
        genres: book.genres,
        tropes: book.tropes,
        moods: book.moods,
        contentWarnings: book.contentWarnings,
        seriesName: book.seriesName,
        seriesPosition: book.seriesPosition,
        sources: ['hardcover'],
      });
    }
  }

  // Convertir en array et trier par pertinence (nombre de sources)
  return Array.from(bookMap.values())
    .sort((a, b) => b.sources.length - a.sources.length);
}

async function enrichWithHardcoverDetails(books: UnifiedBookResult[]): Promise<UnifiedBookResult[]> {
  // Pour les livres qui ont un slug Hardcover mais pas encore de tropes
  const enrichPromises = books.map(async (book) => {
    if (book.hardcoverSlug && book.tropes.length === 0) {
      try {
        const details = await getHardcoverBookDetails(book.hardcoverSlug);
        if (details) {
          book.tropes = details.tropes;
          book.moods = details.moods;
          book.contentWarnings = details.contentWarnings;
          if (details.genres.length > 0) {
            book.genres = [...new Set([...book.genres, ...details.genres])];
          }
        }
      } catch (e) {
        // Ignorer les erreurs d'enrichissement
        console.warn(`Failed to enrich ${book.title}:`, e);
      }
    }
    return book;
  });

  return Promise.all(enrichPromises);
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Supprimer accents
    .replace(/[^a-z0-9]/g, '');        // Garder que alphanum
}
```

### 4. Mise à jour du schéma de base de données

Ajouter ces colonnes à la table `books` si elles n'existent pas :

```sql
-- Migration : Ajouter colonnes Hardcover
ALTER TABLE books ADD COLUMN hardcover_id INTEGER;
ALTER TABLE books ADD COLUMN hardcover_slug TEXT;
ALTER TABLE books ADD COLUMN tropes TEXT;           -- JSON array
ALTER TABLE books ADD COLUMN moods TEXT;            -- JSON array
ALTER TABLE books ADD COLUMN content_warnings TEXT; -- JSON array
ALTER TABLE books ADD COLUMN google_books_id TEXT;

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_books_hardcover_slug ON books(hardcover_slug);
CREATE INDEX IF NOT EXISTS idx_books_google_id ON books(google_books_id);
```

---

## 🔐 Variables d'environnement

Ajouter dans `.env.local` :

```bash
# Existant
TMDB_API_KEY=xxx

# Nouveaux
GOOGLE_BOOKS_API_KEY=xxx
HARDCOVER_API_KEY=xxx
```

Pour obtenir les clés :
- **Google Books** : https://console.cloud.google.com/apis/library/books.googleapis.com
- **Hardcover** : https://hardcover.app/account/api (créer un compte gratuit d'abord)

---

## ✅ Checklist d'implémentation

### Phase 1 : Clients API
- [ ] Créer `src/lib/api/googleBooks.ts`
- [ ] Créer `src/lib/api/hardcover.ts`
- [ ] Tester chaque client individuellement

### Phase 2 : Orchestrateur
- [ ] Créer `src/lib/api/bookSearch.ts`
- [ ] Implémenter la fusion/déduplication
- [ ] Gérer les erreurs (une source down ne doit pas bloquer)

### Phase 3 : Intégration
- [ ] Modifier la page de recherche pour utiliser `searchBooks()`
- [ ] Afficher les tropes/moods dans les résultats
- [ ] Afficher les tropes/moods dans la fiche livre

### Phase 4 : Base de données
- [ ] Ajouter les nouvelles colonnes
- [ ] Sauvegarder les tropes/moods lors de l'ajout à la bibliothèque

### Phase 5 : Recommandations
- [ ] Mettre à jour la logique IA pour utiliser les tropes Hardcover
- [ ] Améliorer le matching basé sur les moods

---

## 🧪 Tests à effectuer

1. **Recherche "Fourth Wing"** → Doit trouver le livre avec tropes (enemies to lovers, dragons, etc.)
2. **Recherche "Un palais d'épines et de roses"** → Doit trouver en FR
3. **Recherche livre obscur FR** → Fallback sur Open Library si pas dans Google/Hardcover
4. **Recherche avec erreur réseau** → Une source down ne bloque pas les autres
5. **Affichage tropes** → Les tropes s'affichent sur la fiche livre

---

## 📝 Notes importantes

1. **Rate limiting** : Hardcover peut rate-limit. Implémenter un cache (KV ou mémoire) pour éviter les appels répétés.

2. **Enrichissement async** : L'enrichissement Hardcover (tropes détaillés) peut être fait en arrière-plan après l'affichage initial des résultats.

3. **Fallback gracieux** : Si Hardcover est down, l'app doit continuer à fonctionner avec Google + Open Library.

4. **Priorité des données** :
   - Titre/Auteur : Google Books (meilleure qualité FR)
   - Couverture : Google Books > Open Library
   - Tropes/Moods : Hardcover uniquement
   - Description : Google Books > Hardcover > Open Library

5. **Cache des tropes** : Une fois récupérés, stocker les tropes en base pour ne pas re-fetch à chaque fois.
