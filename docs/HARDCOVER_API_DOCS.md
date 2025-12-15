# Documentation Hardcover API

> Documentation compilée pour intégration dans MyShelf
> Source : docs.hardcover.app + articles communautaires

---

## 1. Vue d'ensemble

Hardcover est une plateforme de suivi de lecture avec une **API GraphQL** gratuite et ouverte.

### Caractéristiques
- API GraphQL (même API que le site web et les apps mobiles)
- Gratuit pour usage personnel
- Données communautaires riches (tags, tropes, moods, content warnings)
- En beta (peut changer sans préavis)

### Limitations importantes
- **Backend uniquement** : Requêtes depuis localhost ou serveurs uniquement (pas depuis un navigateur client)
- **Rate limiting** : Pas de limite documentée, mais éviter les appels excessifs
- **Token personnel** : Ne pas partager, lié à votre compte

---

## 2. Authentification

### Obtenir un token

1. Créer un compte sur https://hardcover.app
2. Aller dans Settings → Account → Hardcover API
3. Copier le token affiché en haut de la page

### Utilisation du token

```javascript
const headers = {
  'Authorization': 'Bearer YOUR_API_TOKEN',
  'Content-Type': 'application/json'
};
```

---

## 3. Endpoint et structure des requêtes

### URL de l'API

```
POST https://api.hardcover.app/v1/graphql
```

### Structure d'une requête

```javascript
const response = await fetch('https://api.hardcover.app/v1/graphql', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `{ ... }`,        // La query GraphQL
    variables: { ... }       // Variables optionnelles
  }),
});

const data = await response.json();
// Résultat dans data.data
// Erreurs dans data.errors
```

---

## 4. Recherche de livres

### Méthode 1 : API Search (recommandée)

L'API search utilise Typesense en arrière-plan.

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

#### Paramètres de search
| Paramètre | Type | Description |
|-----------|------|-------------|
| `query` | String | Terme de recherche (requis) |
| `query_type` | String | Type de contenu : "books", "authors", "series", "users", "lists", "characters" |
| `per_page` | Int | Nombre de résultats par page |
| `page` | Int | Numéro de page |
| `fields` | String | Champs à chercher (séparés par virgules) |
| `weights` | String | Poids des champs (séparés par virgules) |
| `sort` | String | Tri des résultats |

#### Champs disponibles pour la recherche de livres
- `title` - Titre du livre
- `isbns` - ISBN 10 et 13
- `series_names` - Nom de la série
- `author_names` - Noms des auteurs
- `alternative_titles` - Titres alternatifs

#### Valeurs par défaut pour les livres
```
fields: title,isbns,series_names,author_names,alternative_titles
sort: _text_match:desc,users_count:desc
```

#### Champs retournés dans les résultats de recherche
| Champ | Description |
|-------|-------------|
| `id` | ID Hardcover du livre |
| `title` | Titre |
| `slug` | Slug URL (pour construire l'URL Hardcover) |
| `author_names` | Liste des auteurs |
| `series_names` | Noms des séries |
| `alternative_titles` | Titres alternatifs |
| `pages` | Nombre de pages |
| `release_year` | Année de publication |
| `release_date_i` | Date de publication (integer) |
| `rating` | Note moyenne Hardcover |
| `ratings_count` | Nombre de notes |
| `reviews_count` | Nombre de reviews |
| `users_count` | Nombre d'utilisateurs ayant ce livre |
| `users_read_count` | Nombre d'utilisateurs ayant lu ce livre |
| `moods` | Top 5 moods |
| `tags` | Top 5 tags |
| `audio_seconds` | Durée audiobook |
| `compilation` | Boolean si compilation |

### Méthode 2 : Query directe sur la table books

```graphql
{
  books(
    where: { title: { _ilike: "%Fourth Wing%" } }
    limit: 10
    order_by: { users_count: desc }
  ) {
    id
    title
    slug
    description
    pages
    release_date
    cached_image
    cached_contributors
    cached_tags
    rating
    ratings_count
    users_count
    users_read_count
  }
}
```

---

## 5. Détails d'un livre

### Query par slug

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
    rating
    ratings_count
    reviews_count
    users_count
    users_read_count
    ratings_distribution
    series {
      name
      slug
      books_count
    }
    editions {
      isbn_10
      isbn_13
      pages
      format
    }
  }
}
```

### Query par ID

```graphql
{
  books(where: { id: { _eq: 123456 } }) {
    id
    title
    # ... autres champs
  }
}
```

---

## 6. Structure des données clés

### cached_contributors

Contient les auteurs et contributeurs du livre.

```json
{
  "cached_contributors": [
    {
      "author": {
        "id": 12345,
        "name": "Rebecca Yarros",
        "slug": "rebecca-yarros",
        "image": "https://..."
      },
      "contribution": "Author"
    },
    {
      "author": {
        "name": "John Doe"
      },
      "contribution": "Translator"
    }
  ]
}
```

**Note** : Le premier élément est généralement l'auteur principal. Les traducteurs et autres contributeurs sont aussi listés.

### cached_tags (IMPORTANT pour les tropes)

Contient les tags générés par la communauté, organisés par catégorie.

```json
{
  "cached_tags": {
    "Genre": ["Fantasy", "Romance", "New Adult"],
    "Trope": ["Enemies to Lovers", "Slow Burn", "Found Family"],
    "Mood": ["Dark", "Emotional", "Adventurous"],
    "Content Warning": ["Violence", "Death"],
    "Pace": ["Fast-paced"],
    "Fiction": ["Fiction"]
  }
}
```

**Catégories disponibles** :
- `Genre` - Genres littéraires
- `Trope` - Tropes narratifs (enemies to lovers, etc.)
- `Mood` - Ambiances (dark, funny, emotional...)
- `Content Warning` - Avertissements de contenu
- `Pace` - Rythme (fast-paced, slow...)
- `Fiction` / `Nonfiction` - Type

**Important** : Les tags sont classés par popularité (nombre de votes). Le premier tag de chaque catégorie est le plus voté.

### cached_image

URL de la couverture du livre.

```json
{
  "cached_image": "https://hardcover.app/images/books/..."
}
```

**Note sur le rate limiting** : Si vous chargez beaucoup d'images simultanément, vous pouvez être rate-limité. Utilisez `loading="lazy"` sur vos balises img.

### ratings_distribution

Distribution des notes (1-5 étoiles).

```json
{
  "ratings_distribution": [
    { "rating": 1, "count": 50 },
    { "rating": 2, "count": 120 },
    { "rating": 3, "count": 500 },
    { "rating": 4, "count": 2000 },
    { "rating": 5, "count": 3000 }
  ]
}
```

---

## 7. Recherche d'auteurs

```graphql
{
  search(
    query: "Sarah J. Maas"
    query_type: "authors"
    per_page: 5
  ) {
    results
  }
}
```

Ou directement :

```graphql
{
  authors(where: { name: { _ilike: "%Sarah J. Maas%" } }) {
    id
    name
    slug
    image
    books_count
    users_count
  }
}
```

---

## 8. Recherche de séries

```graphql
{
  search(
    query: "A Court of Thorns and Roses"
    query_type: "series"
    per_page: 5
  ) {
    results
  }
}
```

Ou avec les livres de la série :

```graphql
{
  series(where: { slug: { _eq: "a-court-of-thorns-and-roses" } }) {
    id
    name
    slug
    books_count
    books(order_by: { series_position: asc }) {
      id
      title
      series_position
      cached_image
    }
  }
}
```

---

## 9. Données utilisateur (nécessite auth)

### Livres de l'utilisateur connecté

```graphql
{
  me {
    user_books(where: { status_id: { _eq: 3 } }) {
      id
      rating
      review_raw
      date_added
      book {
        id
        title
        cached_image
      }
    }
  }
}
```

#### Status IDs
| ID | Statut |
|----|--------|
| 1 | Want to Read |
| 2 | Currently Reading |
| 3 | Read |
| 4 | Did Not Finish |

---

## 10. Exemples de code complets

### Recherche de livre avec enrichissement

```typescript
const HARDCOVER_URL = 'https://api.hardcover.app/v1/graphql';

interface HardcoverBook {
  id: number;
  title: string;
  slug: string;
  description?: string;
  pages?: number;
  release_date?: string;
  cached_image?: string;
  cached_contributors?: Array<{
    author: { name: string; slug: string };
    contribution: string;
  }>;
  cached_tags?: {
    Genre?: string[];
    Trope?: string[];
    Mood?: string[];
    'Content Warning'?: string[];
  };
  rating?: number;
  ratings_count?: number;
  series?: {
    name: string;
    slug: string;
  };
}

async function searchHardcover(query: string, token: string): Promise<HardcoverBook[]> {
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: graphqlQuery }),
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error('Hardcover API errors:', data.errors);
    return [];
  }

  // Les résultats de search sont dans un format spécifique
  // Il faut les parser selon la structure retournée
  return data.data?.search?.results || [];
}

async function getBookDetails(slug: string, token: string): Promise<HardcoverBook | null> {
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
        rating
        ratings_count
        users_count
        series {
          name
          slug
          books_count
        }
      }
    }
  `;

  const response = await fetch(HARDCOVER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: graphqlQuery }),
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error('Hardcover API errors:', data.errors);
    return null;
  }

  return data.data?.books?.[0] || null;
}

// Extraction des données utiles
function extractBookData(book: HardcoverBook) {
  const tags = book.cached_tags || {};
  const contributors = book.cached_contributors || [];
  
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description,
    pages: book.pages,
    releaseDate: book.release_date,
    coverUrl: book.cached_image,
    
    // Auteur principal (premier contributeur de type "Author")
    author: contributors.find(c => c.contribution === 'Author')?.author?.name 
            || contributors[0]?.author?.name,
    
    // Tags par catégorie
    genres: tags.Genre || [],
    tropes: tags.Trope || [],
    moods: tags.Mood || [],
    contentWarnings: tags['Content Warning'] || [],
    
    // Métriques
    rating: book.rating,
    ratingsCount: book.ratings_count,
    
    // Série
    seriesName: book.series?.name,
    seriesSlug: book.series?.slug,
    
    // URL Hardcover
    hardcoverUrl: `https://hardcover.app/books/${book.slug}`,
  };
}
```

### Recherche avec fallback si pas de résultats

```typescript
async function searchWithFallback(query: string, token: string) {
  // Essayer d'abord la recherche standard
  let results = await searchHardcover(query, token);
  
  // Si pas de résultats, essayer avec une query plus large
  if (results.length === 0) {
    // Essayer juste le premier mot (souvent le titre)
    const firstWord = query.split(' ')[0];
    results = await searchHardcover(firstWord, token);
  }
  
  return results;
}
```

---

## 11. Construction d'URLs

### URL d'un livre
```
https://hardcover.app/books/{slug}
```

### URL d'un auteur
```
https://hardcover.app/authors/{slug}
```

### URL d'une série
```
https://hardcover.app/series/{slug}
```

### URL de l'image
Les images retournées dans `cached_image` sont des URLs complètes utilisables directement.

---

## 12. Bonnes pratiques

### Gestion des erreurs

```typescript
async function safeHardcoverCall(query: string, token: string) {
  try {
    const response = await fetch(HARDCOVER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      // Continuer avec les données partielles si disponibles
    }
    
    return data.data;
  } catch (error) {
    console.error('Hardcover API call failed:', error);
    return null;
  }
}
```

### Cache des résultats

Hardcover recommande de ne pas cacher les données au-delà du header cache HTTP. Cependant, pour une app personnelle :
- Cacher les métadonnées de base (titre, auteur, pages) est raisonnable
- Les tags/tropes peuvent changer avec les votes utilisateurs
- Rafraîchir les données périodiquement (ex: 1 fois par semaine)

### Rate limiting

- Éviter les appels en rafale
- Utiliser `loading="lazy"` pour les images
- Implémenter un délai entre les requêtes si nécessaire

---

## 13. GraphQL Console

Pour tester vos requêtes :

1. Aller sur https://hardcover.app/account/api
2. Copier votre token
3. Aller sur la console GraphQL : https://api.hardcover.app/v1/graphql
4. Mettre le token dans le champ "Authorization Token"
5. Exécuter vos requêtes

---

## 14. Ressources

- Documentation officielle : https://docs.hardcover.app
- GitHub docs : https://github.com/hardcoverapp/hardcover-docs
- Discord : https://discord.gg/edGpYN8ym8
- Console GraphQL : https://api.hardcover.app/v1/graphql

---

## 15. Exemple d'intégration pour MyShelf

```typescript
// src/lib/api/hardcover.ts

const HARDCOVER_API_URL = 'https://api.hardcover.app/v1/graphql';

export interface HardcoverSearchResult {
  id: number;
  title: string;
  slug: string;
  authors: string[];
  coverUrl?: string;
  pages?: number;
  releaseYear?: number;
  rating?: number;
  genres: string[];
  tropes: string[];
  moods: string[];
  contentWarnings: string[];
  seriesName?: string;
}

export async function searchHardcoverBooks(
  query: string
): Promise<HardcoverSearchResult[]> {
  const token = process.env.HARDCOVER_API_KEY;
  
  if (!token) {
    console.warn('HARDCOVER_API_KEY not set');
    return [];
  }

  const graphqlQuery = `
    {
      search(
        query: "${query.replace(/"/g, '\\"')}"
        query_type: "books"
        per_page: 15
      ) {
        results
      }
    }
  `;

  try {
    const response = await fetch(HARDCOVER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const data = await response.json();
    const results = data.data?.search?.results || [];
    
    return results.map(parseSearchResult);
  } catch (error) {
    console.error('Hardcover search failed:', error);
    return [];
  }
}

export async function getHardcoverBookBySlug(
  slug: string
): Promise<HardcoverSearchResult | null> {
  const token = process.env.HARDCOVER_API_KEY;
  
  if (!token) return null;

  const graphqlQuery = `
    {
      books(where: { slug: { _eq: "${slug}" } }, limit: 1) {
        id
        title
        slug
        description
        pages
        release_date
        cached_image
        cached_contributors
        cached_tags
        rating
        series {
          name
        }
      }
    }
  `;

  try {
    const response = await fetch(HARDCOVER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const data = await response.json();
    const book = data.data?.books?.[0];
    
    if (!book) return null;
    
    return parseBookDetails(book);
  } catch (error) {
    console.error('Hardcover book fetch failed:', error);
    return null;
  }
}

function parseSearchResult(result: any): HardcoverSearchResult {
  return {
    id: result.id,
    title: result.title,
    slug: result.slug,
    authors: result.author_names || [],
    coverUrl: result.image || result.cached_image,
    pages: result.pages,
    releaseYear: result.release_year,
    rating: result.rating,
    genres: [],      // Non disponible dans search
    tropes: [],      // Non disponible dans search
    moods: result.moods || [],
    contentWarnings: [],
    seriesName: result.series_names?.[0],
  };
}

function parseBookDetails(book: any): HardcoverSearchResult {
  const tags = book.cached_tags || {};
  const contributors = book.cached_contributors || [];
  
  const authors = contributors
    .filter((c: any) => c.contribution === 'Author' || !c.contribution)
    .map((c: any) => c.author?.name)
    .filter(Boolean);

  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    authors: authors.length > 0 ? authors : [contributors[0]?.author?.name].filter(Boolean),
    coverUrl: book.cached_image,
    pages: book.pages,
    releaseYear: book.release_date ? new Date(book.release_date).getFullYear() : undefined,
    rating: book.rating,
    genres: tags.Genre || [],
    tropes: tags.Trope || [],
    moods: tags.Mood || [],
    contentWarnings: tags['Content Warning'] || [],
    seriesName: book.series?.name,
  };
}
```
