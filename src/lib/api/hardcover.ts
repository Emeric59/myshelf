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
}

// Search results format (from Typesense via search endpoint)
// Results come as { hits: [{ document: {...} }] }
interface HardcoverSearchDocument {
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

interface HardcoverSearchHit {
  document: HardcoverSearchDocument
}

interface HardcoverSearchResults {
  facet_counts?: unknown[]
  found?: number
  hits?: HardcoverSearchHit[]
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
    const data = await executeGraphQL<{ search: { results: HardcoverSearchResults } }>(graphqlQuery)

    // Results is an object with { hits: [{ document: {...} }] }
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
 * Calculate similarity score between two strings (0 to 1)
 * Uses longest common subsequence ratio
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1)
  const s2 = normalizeString(str2)

  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0

  // Check if one contains the other
  if (s1.includes(s2)) return s2.length / s1.length
  if (s2.includes(s1)) return s1.length / s2.length

  // Calculate Levenshtein distance for more nuanced comparison
  const maxLen = Math.max(s1.length, s2.length)
  const distance = levenshteinDistance(s1, s2)
  return 1 - distance / maxLen
}

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

/**
 * Get book details by title and author (fuzzy match with similarity threshold)
 */
export async function getHardcoverBookByTitleAuthor(
  title: string,
  author?: string
): Promise<HardcoverBookResult | null> {
  const searchQuery = author ? `${title} ${author}` : title
  const results = await searchHardcover(searchQuery)

  if (results.length === 0) return null

  // Find best match by title similarity with threshold
  const SIMILARITY_THRESHOLD = 0.6
  let bestMatch: HardcoverBookResult | null = null
  let bestScore = 0

  for (const book of results) {
    const titleScore = calculateSimilarity(title, book.title)

    // Bonus if author matches
    let authorBonus = 0
    if (author && book.authors.length > 0) {
      const authorScore = Math.max(
        ...book.authors.map(a => calculateSimilarity(author, a))
      )
      if (authorScore > 0.7) authorBonus = 0.15
    }

    const totalScore = titleScore + authorBonus

    if (totalScore > bestScore && titleScore >= SIMILARITY_THRESHOLD) {
      bestScore = totalScore
      bestMatch = book
    }
  }

  // No match found above threshold
  if (!bestMatch) return null

  // Get full details if we have a slug
  if (bestMatch.slug) {
    const details = await getHardcoverBookDetails(bestMatch.slug)
    return details || bestMatch
  }

  return bestMatch
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Extract string from tag (handles both string and object formats)
 * Hardcover API can return tags as strings OR as objects {tag, tagSlug, category, ...}
 * Always capitalizes the first letter for consistency
 */
function extractTagString(tag: unknown): string {
  let result: string
  if (typeof tag === "string") {
    result = tag
  } else if (tag && typeof tag === "object" && "tag" in tag) {
    result = (tag as { tag: string }).tag
  } else {
    result = String(tag)
  }
  return capitalize(result)
}

/**
 * Extract string array from tags (handles mixed formats)
 */
function extractTagStrings(tags: unknown[] | undefined, limit: number): string[] {
  if (!tags || !Array.isArray(tags)) return []
  return tags.slice(0, limit).map(extractTagString)
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
    // cached_tags can contain strings OR objects - extract safely
    genres: extractTagStrings(tags.Genre as unknown[], 5),
    tropes: extractTagStrings(tags.Trope as unknown[], 8),
    moods: extractTagStrings(tags.Mood as unknown[], 5),
    contentWarnings: extractTagStrings(tags["Content Warning"] as unknown[], 6),
    // Series info not available from books query - use search results instead
    seriesName: undefined,
  }
}

/**
 * Parse search results format
 * Search results come as hits[].document
 */
function parseHardcoverSearchResults(hits: HardcoverSearchHit[]): HardcoverBookResult[] {
  return hits.map((hit) => {
    const doc = hit.document
    const id = typeof doc.id === "string" ? parseInt(doc.id, 10) : doc.id

    return {
      id: id || 0,
      title: doc.title || "",
      slug: doc.slug || "",
      pages: doc.pages,
      coverUrl: doc.image,
      authors: doc.author_names || [],
      // Search results have limited tag data - extract safely
      genres: [],
      tropes: extractTagStrings(doc.tags as unknown[], 5),
      moods: extractTagStrings(doc.moods as unknown[], 5),
      contentWarnings: [],
      seriesName: doc.series_names?.[0],
      releaseDate: doc.release_year?.toString(),
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
