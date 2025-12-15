/**
 * Hardcover API Client (GraphQL)
 * Documentation: https://hardcover.app/account/api
 */

const HARDCOVER_URL = "https://api.hardcover.app/v1/graphql"

// Types for Hardcover API responses
interface HardcoverCachedTags {
  Genre?: string[]
  Trope?: string[]
  Mood?: string[]
  "Content Warning"?: string[]
  Theme?: string[]
}

interface HardcoverContributor {
  author?: {
    name: string
  }
}

interface HardcoverSeries {
  name: string
  books_count?: number
  position?: number
}

interface HardcoverBookRaw {
  id: number
  title: string
  slug: string
  description?: string
  pages?: number
  release_date?: string
  cached_image?: string
  cached_contributors?: HardcoverContributor[]
  cached_tags?: HardcoverCachedTags
  series?: HardcoverSeries[]
}

interface HardcoverSearchDocument {
  id: string
  title: string
  slug: string
  description?: string
  pages?: number
  release_date?: string
  release_year?: number
  image?: {
    url?: string
  }
  author_names?: string[]
  genres?: string[]
  moods?: string[]
  content_warnings?: string[]
  tags?: string[]
  series_names?: string[]
}

interface HardcoverSearchHit {
  document: HardcoverSearchDocument
}

interface HardcoverSearchResults {
  hits?: HardcoverSearchHit[]
  found?: number
}

export interface HardcoverBookResult {
  id: number
  title: string
  slug: string
  description?: string
  pages?: number
  releaseDate?: string
  coverUrl?: string
  authors: string[]
  genres: string[]
  tropes: string[]
  moods: string[]
  contentWarnings: string[]
  seriesName?: string
  seriesPosition?: number
}

/**
 * Execute a GraphQL query against Hardcover API
 */
async function executeGraphQL<T>(query: string): Promise<T> {
  const apiKey = process.env.HARDCOVER_API_KEY

  if (!apiKey) {
    throw new Error("HARDCOVER_API_KEY is not configured")
  }

  const response = await fetch(HARDCOVER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`Hardcover API error: ${response.statusText}`)
  }

  interface GraphQLResponse {
    data?: T
    errors?: Array<{ message: string }>
  }

  const data = (await response.json()) as GraphQLResponse

  if (data.errors) {
    console.error("Hardcover GraphQL errors:", data.errors)
    throw new Error(data.errors[0]?.message || "GraphQL query failed")
  }

  return data.data as T
}

/**
 * Search for books on Hardcover
 */
export async function searchHardcover(query: string): Promise<HardcoverBookResult[]> {
  // Escape quotes in query
  const escapedQuery = query.replace(/"/g, '\\"')

  const graphqlQuery = `
    query {
      search(
        query: "${escapedQuery}"
        query_type: "Book"
        per_page: 15
        page: 1
      ) {
        results
      }
    }
  `

  try {
    const data = await executeGraphQL<{ search: { results: HardcoverSearchResults } }>(graphqlQuery)

    // The search results are in hits[].document format
    const hits = data.search?.results?.hits || []
    return parseHardcoverSearchResults(hits)
  } catch (error) {
    console.error("Hardcover search error:", error)
    return []
  }
}

/**
 * Get detailed book information by slug (includes tropes, moods, etc.)
 */
export async function getHardcoverBookDetails(slug: string): Promise<HardcoverBookResult | null> {
  const graphqlQuery = `
    query {
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
  `

  try {
    const data = await executeGraphQL<{ books: HardcoverBookRaw[] }>(graphqlQuery)
    const book = data.books?.[0]

    if (!book) return null

    return parseHardcoverBook(book)
  } catch (error) {
    console.error("Hardcover get book error:", error)
    return null
  }
}

/**
 * Get book details by title and author (fuzzy match)
 */
export async function getHardcoverBookByTitleAuthor(
  title: string,
  author?: string
): Promise<HardcoverBookResult | null> {
  const searchQuery = author ? `${title} ${author}` : title
  const results = await searchHardcover(searchQuery)

  if (results.length === 0) return null

  // Find best match by title similarity
  const normalizedTitle = normalizeString(title)
  const bestMatch = results.find(
    (book) => normalizeString(book.title) === normalizedTitle
  ) || results[0]

  // Get full details if we have a slug
  if (bestMatch.slug) {
    const details = await getHardcoverBookDetails(bestMatch.slug)
    return details || bestMatch
  }

  return bestMatch
}

/**
 * Parse raw Hardcover book data to our format
 */
function parseHardcoverBook(book: HardcoverBookRaw): HardcoverBookResult {
  const tags = book.cached_tags || {}

  // Extract authors from cached_contributors
  const authors = (book.cached_contributors || [])
    .filter((c) => c.author?.name)
    .map((c) => c.author!.name)

  // Get series info
  const series = book.series?.[0]

  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description,
    pages: book.pages,
    releaseDate: book.release_date,
    coverUrl: book.cached_image,
    authors,
    genres: tags.Genre || [],
    tropes: tags.Trope || [],
    moods: tags.Mood || [],
    contentWarnings: tags["Content Warning"] || [],
    seriesName: series?.name,
    seriesPosition: series?.position,
  }
}

/**
 * Parse search results (different format from full book query)
 * Search results come as hits[].document with rich data
 */
function parseHardcoverSearchResults(hits: HardcoverSearchHit[]): HardcoverBookResult[] {
  return hits.map((hit) => {
    const doc = hit.document

    // Extract tropes from tags (tags contains a mix of tropes and other labels)
    // Common tropes patterns: "dragons", "enemies to lovers", etc.
    const tags = doc.tags || []

    return {
      id: parseInt(doc.id, 10) || 0,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      pages: doc.pages,
      coverUrl: doc.image?.url,
      authors: doc.author_names || [],
      genres: doc.genres || [],
      tropes: tags.slice(0, 5), // Tags often contain trope-like data
      moods: doc.moods || [],
      contentWarnings: doc.content_warnings || [],
      seriesName: doc.series_names?.[0],
      releaseDate: doc.release_date || doc.release_year?.toString(),
    }
  })
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Keep only alphanumeric
}
