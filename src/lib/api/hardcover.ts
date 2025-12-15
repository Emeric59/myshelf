/**
 * Hardcover API Client (GraphQL)
 * Documentation: https://docs.hardcover.app/api/getting-started/
 */

const HARDCOVER_URL = "https://api.hardcover.app/v1/graphql"

// Types for Hardcover API responses

// cached_tags is an object with string arrays (not complex objects)
interface HardcoverCachedTags {
  Genre?: string[]
  Trope?: string[]
  Mood?: string[]
  "Content Warning"?: string[]
  Pace?: string[]
  Fiction?: string[]
  Nonfiction?: string[]
}

interface HardcoverContributor {
  author?: {
    id?: number
    name: string
    slug?: string
  }
  contribution?: string
}

interface HardcoverSeries {
  name: string
  slug?: string
  books_count?: number
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
  rating?: number
  ratings_count?: number
  series?: HardcoverSeries
}

// Search results format (from Typesense via search endpoint)
interface HardcoverSearchResult {
  id: number | string
  title: string
  slug: string
  author_names?: string[]
  series_names?: string[]
  pages?: number
  release_year?: number
  release_date_i?: number
  rating?: number
  ratings_count?: number
  moods?: string[]
  tags?: string[]
  image?: string
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

  // Hardcover expects "Bearer {token}" format
  // Handle case where key might already include "Bearer " prefix or not
  const authHeader = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`

  const response = await fetch(HARDCOVER_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error(`Hardcover API error: ${response.statusText}`)
  }

  interface GraphQLResponse {
    data?: T
    errors?: Array<{ message: string; extensions?: { code?: string } }>
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
 * Uses the search endpoint which is powered by Typesense
 */
export async function searchHardcover(query: string): Promise<HardcoverBookResult[]> {
  // Escape quotes in query
  const escapedQuery = query.replace(/"/g, '\\"')

  // Note: query_type must be "books" (lowercase, plural) per documentation
  const graphqlQuery = `
    query {
      search(
        query: "${escapedQuery}"
        query_type: "books"
        per_page: 15
        page: 1
      ) {
        results
      }
    }
  `

  try {
    const data = await executeGraphQL<{ search: { results: unknown } }>(graphqlQuery)

    // Debug: log the raw results structure
    console.log("[Hardcover] Raw results type:", typeof data.search?.results)
    console.log("[Hardcover] Raw results:", JSON.stringify(data.search?.results)?.slice(0, 500))

    // Results might be a JSON string or an object with hits
    let results: HardcoverSearchResult[] = []
    const rawResults = data.search?.results

    if (Array.isArray(rawResults)) {
      results = rawResults
    } else if (typeof rawResults === "string") {
      // Results might be a JSON string
      try {
        const parsed = JSON.parse(rawResults)
        results = Array.isArray(parsed) ? parsed : parsed.hits || []
      } catch {
        console.error("[Hardcover] Failed to parse results string")
      }
    } else if (rawResults && typeof rawResults === "object") {
      // Results might be an object with hits array
      const obj = rawResults as { hits?: HardcoverSearchResult[] }
      results = obj.hits || []
    }

    return parseHardcoverSearchResults(results)
  } catch (error) {
    console.error("Hardcover search error:", error)
    return []
  }
}

/**
 * Get detailed book information by slug (includes tropes, moods, etc.)
 */
export async function getHardcoverBookDetails(slug: string): Promise<HardcoverBookResult | null> {
  const escapedSlug = slug.replace(/"/g, '\\"')

  const graphqlQuery = `
    query {
      books(where: { slug: { _eq: "${escapedSlug}" } }, limit: 1) {
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
          slug
          books_count
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
 * Used for books query (detailed book info)
 */
function parseHardcoverBook(book: HardcoverBookRaw): HardcoverBookResult {
  const tags = book.cached_tags || {}

  // Extract authors from cached_contributors
  // Filter for "Author" contribution type, fallback to first contributor
  const contributors = book.cached_contributors || []
  const authorContributors = contributors.filter(
    (c) => c.contribution === "Author" || !c.contribution
  )
  const authors = authorContributors.length > 0
    ? authorContributors.map((c) => c.author?.name).filter((n): n is string => !!n)
    : contributors.slice(0, 1).map((c) => c.author?.name).filter((n): n is string => !!n)

  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description,
    pages: book.pages,
    releaseDate: book.release_date,
    coverUrl: book.cached_image,
    authors,
    // cached_tags contains string arrays directly
    genres: tags.Genre?.slice(0, 5) || [],
    tropes: tags.Trope?.slice(0, 8) || [],
    moods: tags.Mood?.slice(0, 5) || [],
    contentWarnings: tags["Content Warning"]?.slice(0, 6) || [],
    seriesName: book.series?.name,
  }
}

/**
 * Parse search results format
 * Search results have a flatter structure than the books query
 */
function parseHardcoverSearchResults(results: HardcoverSearchResult[]): HardcoverBookResult[] {
  return results.map((result) => {
    const id = typeof result.id === "string" ? parseInt(result.id, 10) : result.id

    return {
      id: id || 0,
      title: result.title,
      slug: result.slug,
      pages: result.pages,
      coverUrl: result.image,
      authors: result.author_names || [],
      // Search results have limited tag data
      genres: [],
      tropes: result.tags?.slice(0, 5) || [],
      moods: result.moods || [],
      contentWarnings: [],
      seriesName: result.series_names?.[0],
      releaseDate: result.release_year?.toString(),
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
