# API.md — Documentation des endpoints

## APIs externes

### Open Library (Livres)

**Base URL**: `https://openlibrary.org`

#### Recherche
```
GET /search.json?q={query}&language=fre,eng&limit=20
```

#### Détail d'un livre
```
GET /works/{work_id}.json
```

#### Couverture
```
https://covers.openlibrary.org/b/id/{cover_id}-L.jpg
https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg
```

#### Auteur
```
GET /authors/{author_id}.json
```

**Pas d'authentification requise.**

---

### TMDB (Films & Séries)

**Base URL**: `https://api.themoviedb.org/3`

**Headers**:
```
Authorization: Bearer {TMDB_API_KEY}
```

#### Recherche films
```
GET /search/movie?query={q}&language=fr-FR&region=FR
```

#### Recherche séries
```
GET /search/tv?query={q}&language=fr-FR
```

#### Détail film (avec providers)
```
GET /movie/{id}?language=fr-FR&append_to_response=credits,watch/providers
```

#### Détail série
```
GET /tv/{id}?language=fr-FR&append_to_response=credits,watch/providers
```

#### Image
```
https://image.tmdb.org/t/p/w500{poster_path}
```

#### Récupérer les providers FR
```typescript
const providers = response['watch/providers']?.results?.FR
// providers.flatrate = abonnement (Netflix, etc.)
// providers.rent = location
// providers.buy = achat
```

---

### Gemini (IA)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
```

---

## API interne (routes Next.js)

### Books

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/books` | Liste bibliothèque |
| GET | `/api/books/[id]` | Détail livre |
| POST | `/api/books` | Ajouter livre |
| PATCH | `/api/books/[id]` | Modifier statut/note |
| DELETE | `/api/books/[id]` | Supprimer |

### Movies

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/movies` | Liste bibliothèque |
| GET | `/api/movies/[id]` | Détail film |
| POST | `/api/movies` | Ajouter film |
| PATCH | `/api/movies/[id]` | Modifier |
| DELETE | `/api/movies/[id]` | Supprimer |

### Shows

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/shows` | Liste bibliothèque |
| GET | `/api/shows/[id]` | Détail série |
| POST | `/api/shows` | Ajouter série |
| PATCH | `/api/shows/[id]` | Modifier |
| DELETE | `/api/shows/[id]` | Supprimer |

### Search

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/search?q={query}` | Recherche unifiée |
| GET | `/api/search/books?q={query}` | Recherche livres |
| GET | `/api/search/movies?q={query}` | Recherche films |
| GET | `/api/search/shows?q={query}` | Recherche séries |

### Recommendations

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/recommendations` | Liste recos |
| POST | `/api/recommendations/ask` | Demande IA |
| PATCH | `/api/recommendations/[id]` | Accepter/Refuser |

### Import

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/import/booknode` | Import CSV BookNode |
| POST | `/api/import/tvtime` | Import ZIP TV Time |

---

## Types de réponse

### Book
```typescript
interface Book {
  id: string
  title: string
  original_title?: string
  author: string
  author_id?: string
  cover_url?: string
  description?: string
  page_count?: number
  published_date?: string
  genres?: string[]
  series_name?: string
  series_position?: number
  average_rating?: number
}
```

### UserBook
```typescript
interface UserBook {
  id: number
  book_id: string
  book: Book
  status: 'to_read' | 'reading' | 'read' | 'abandoned' | 'blacklist'
  rating?: number
  started_at?: string
  finished_at?: string
  current_page: number
  reread_count: number
}
```

### Movie
```typescript
interface Movie {
  id: string
  title: string
  original_title?: string
  poster_url?: string
  backdrop_url?: string
  description?: string
  runtime?: number
  release_date?: string
  director?: string
  cast_members?: string[]
  genres?: string[]
  average_rating?: number
  streaming_providers?: {
    flatrate?: string[]
    rent?: string[]
    buy?: string[]
  }
}
```

### Show
```typescript
interface Show {
  id: string
  title: string
  original_title?: string
  poster_url?: string
  description?: string
  first_air_date?: string
  status?: 'Returning Series' | 'Ended' | 'Canceled'
  seasons_count?: number
  episodes_count?: number
  genres?: string[]
  average_rating?: number
  streaming_providers?: {
    flatrate?: string[]
    rent?: string[]
  }
}
```

### Recommendation
```typescript
interface Recommendation {
  id: number
  media_type: 'book' | 'movie' | 'show'
  media_id: string
  media: Book | Movie | Show
  source: 'ai_auto' | 'ai_request' | 'similar'
  reason: string
  score?: number
  status: 'pending' | 'accepted' | 'dismissed'
}
```
