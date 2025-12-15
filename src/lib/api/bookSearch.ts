/**
 * Multi-source Book Search Orchestrator
 * Combines Google Books, Open Library, and Hardcover
 */

import { searchGoogleBooks, GoogleBookResult } from "./googleBooks"
import { searchHardcover, getHardcoverBookDetails, HardcoverBookResult } from "./hardcover"
import { searchBooks as searchOpenLibrary, normalizeSearchResult } from "./openLibrary"

export type BookSource = "google" | "openlibrary" | "hardcover"

export interface UnifiedBookResult {
  // Identifiers
  id: string
  googleBooksId?: string
  openLibraryId?: string
  hardcoverId?: number
  hardcoverSlug?: string
  isbn13?: string
  isbn10?: string

  // Basic metadata
  title: string
  authors: string[]
  description?: string
  pageCount?: number
  coverUrl?: string
  publishedDate?: string
  language?: string
  publisher?: string

  // Enrichment data (from Hardcover)
  genres: string[]
  tropes: string[]
  moods: string[]
  contentWarnings: string[]

  // Series info
  seriesName?: string
  seriesPosition?: number

  // Source tracking
  sources: BookSource[]
}

interface OpenLibraryNormalized {
  id: string
  title: string
  author?: string
  author_id?: string
  cover_url?: string
  published_date?: string
  page_count?: number
  language?: string
  genres?: string[]
  isbn_13?: string
  isbn_10?: string
}

/**
 * Search for books across all sources
 */
export async function searchBooksMultiSource(query: string): Promise<UnifiedBookResult[]> {
  // Launch all searches in parallel
  const [googleResults, openLibraryResults, hardcoverResults] = await Promise.allSettled([
    searchGoogleBooks(query, { maxResults: 15 }),
    searchOpenLibrary(query, { limit: 15 }).then((data) =>
      data.docs.map(normalizeSearchResult) as OpenLibraryNormalized[]
    ),
    searchHardcover(query),
  ])

  // Extract results (ignore failures)
  const google =
    googleResults.status === "fulfilled" ? googleResults.value : []
  const openLibrary =
    openLibraryResults.status === "fulfilled" ? openLibraryResults.value : []
  const hardcover =
    hardcoverResults.status === "fulfilled" ? hardcoverResults.value : []

  // Log any errors for debugging
  if (googleResults.status === "rejected") {
    console.warn("Google Books search failed:", googleResults.reason)
  }
  if (openLibraryResults.status === "rejected") {
    console.warn("Open Library search failed:", openLibraryResults.reason)
  }
  if (hardcoverResults.status === "rejected") {
    console.warn("Hardcover search failed:", hardcoverResults.reason)
  }

  // Merge and deduplicate
  const merged = mergeBookResults(google, openLibrary, hardcover)

  // Optionally enrich top results with Hardcover details
  // This is async and may slow down results, so we limit it
  const enriched = await enrichWithHardcoverDetails(merged.slice(0, 8))

  return enriched
}

/**
 * Check if a book should be filtered out (summaries, guides, etc.)
 */
function shouldFilterOut(title: string): boolean {
  const lowerTitle = title.toLowerCase()
  return (
    lowerTitle.includes("summary of") ||
    lowerTitle.includes("summary:") ||
    lowerTitle.includes("guide to") ||
    lowerTitle.includes("analysis of") ||
    lowerTitle.includes("study guide") ||
    lowerTitle.includes("cliff notes") ||
    lowerTitle.includes("sparknotes")
  )
}

/**
 * Merge results from all sources, deduplicating by ISBN or title+author
 */
function mergeBookResults(
  google: GoogleBookResult[],
  openLibrary: OpenLibraryNormalized[],
  hardcover: HardcoverBookResult[]
): UnifiedBookResult[] {
  const bookMap = new Map<string, UnifiedBookResult>()

  // Generate a dedupe key from cleaned title and author
  const getDedupeKey = (title: string, author: string): string => {
    const cleanedTitle = cleanTitleForDedupe(title)
    return `${normalizeString(cleanedTitle)}::${normalizeString(author)}`
  }

  // Process Google Books (primary source)
  for (const book of google) {
    // Skip summaries, guides, etc.
    if (shouldFilterOut(book.title)) continue

    const author = book.authors[0] || ""
    const key = book.isbn13 || getDedupeKey(book.title, author)

    // Check if we already have this book (fuzzy match on title)
    let existingKey: string | undefined
    for (const [k, v] of bookMap) {
      if (fuzzyMatch(v.title, book.title) && normalizeString(v.authors[0] || "") === normalizeString(author)) {
        existingKey = k
        break
      }
    }

    if (existingKey) {
      // Merge with existing - prefer entry with more data
      const existing = bookMap.get(existingKey)!
      if (!existing.coverUrl && book.thumbnail) {
        existing.coverUrl = book.thumbnail
      }
      if (!existing.description && book.description) {
        existing.description = book.description
      }
      if (!existing.sources.includes("google")) {
        existing.sources.push("google")
      }
    } else if (!bookMap.has(key)) {
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
        publisher: book.publisher,
        genres: book.categories || [],
        tropes: [],
        moods: [],
        contentWarnings: [],
        sources: ["google"],
      })
    }
  }

  // Process Open Library (secondary, enrich existing or add new)
  for (const book of openLibrary) {
    const author = book.author || ""
    const key = book.isbn_13 || getDedupeKey(book.title, author)

    if (bookMap.has(key)) {
      // Enrich existing entry
      const existing = bookMap.get(key)!
      existing.openLibraryId = book.id
      if (!existing.coverUrl && book.cover_url) {
        existing.coverUrl = book.cover_url
      }
      if (!existing.isbn13 && book.isbn_13) {
        existing.isbn13 = book.isbn_13
      }
      if (!existing.sources.includes("openlibrary")) {
        existing.sources.push("openlibrary")
      }
    } else {
      // Add new entry
      bookMap.set(key, {
        id: `ol_${book.id}`,
        openLibraryId: book.id,
        isbn13: book.isbn_13,
        isbn10: book.isbn_10,
        title: book.title,
        authors: book.author ? [book.author] : [],
        description: undefined,
        pageCount: book.page_count,
        coverUrl: book.cover_url,
        publishedDate: book.published_date,
        language: book.language,
        genres: book.genres || [],
        tropes: [],
        moods: [],
        contentWarnings: [],
        sources: ["openlibrary"],
      })
    }
  }

  // Process Hardcover (enrichment source for tropes/moods)
  for (const book of hardcover) {
    const author = book.authors[0] || ""
    const key = getDedupeKey(book.title, author)

    // Try to find by title+author key
    let existing: UnifiedBookResult | undefined

    // First check exact key match
    if (bookMap.has(key)) {
      existing = bookMap.get(key)
    } else {
      // Try to find a fuzzy match
      for (const [k, v] of bookMap) {
        if (fuzzyMatch(v.title, book.title)) {
          existing = v
          break
        }
      }
    }

    if (existing) {
      // Enrich with Hardcover data
      existing.hardcoverId = book.id
      existing.hardcoverSlug = book.slug
      if (book.tropes.length > 0) {
        existing.tropes = book.tropes
      }
      if (book.moods.length > 0) {
        existing.moods = book.moods
      }
      if (book.contentWarnings.length > 0) {
        existing.contentWarnings = book.contentWarnings
      }
      if (book.genres.length > 0) {
        existing.genres = [...new Set([...existing.genres, ...book.genres])]
      }
      if (book.seriesName) {
        existing.seriesName = book.seriesName
        existing.seriesPosition = book.seriesPosition
      }
      if (!existing.coverUrl && book.coverUrl) {
        existing.coverUrl = book.coverUrl
      }
      if (!existing.sources.includes("hardcover")) {
        existing.sources.push("hardcover")
      }
    } else {
      // Add as new entry
      bookMap.set(key, {
        id: `hc_${book.id}`,
        hardcoverId: book.id,
        hardcoverSlug: book.slug,
        title: book.title,
        authors: book.authors,
        description: book.description,
        pageCount: book.pages,
        coverUrl: book.coverUrl,
        publishedDate: book.releaseDate,
        genres: book.genres,
        tropes: book.tropes,
        moods: book.moods,
        contentWarnings: book.contentWarnings,
        seriesName: book.seriesName,
        seriesPosition: book.seriesPosition,
        sources: ["hardcover"],
      })
    }
  }

  // Convert to array and sort by relevance (number of sources, then by Google first)
  return Array.from(bookMap.values()).sort((a, b) => {
    // More sources = more relevant
    if (b.sources.length !== a.sources.length) {
      return b.sources.length - a.sources.length
    }
    // Google results first
    if (a.sources.includes("google") && !b.sources.includes("google")) return -1
    if (b.sources.includes("google") && !a.sources.includes("google")) return 1
    return 0
  })
}

/**
 * Enrich books with detailed Hardcover data (tropes, moods)
 * Only enriches books that have a Hardcover slug but missing tropes
 */
async function enrichWithHardcoverDetails(
  books: UnifiedBookResult[]
): Promise<UnifiedBookResult[]> {
  const enrichPromises = books.map(async (book) => {
    // Only enrich if we have a slug and missing tropes data
    if (book.hardcoverSlug && book.tropes.length === 0) {
      try {
        const details = await getHardcoverBookDetails(book.hardcoverSlug)
        if (details) {
          book.tropes = details.tropes
          book.moods = details.moods
          book.contentWarnings = details.contentWarnings
          if (details.genres.length > 0) {
            book.genres = [...new Set([...book.genres, ...details.genres])]
          }
          if (details.seriesName && !book.seriesName) {
            book.seriesName = details.seriesName
            book.seriesPosition = details.seriesPosition
          }
        }
      } catch (error) {
        console.warn(`Failed to enrich ${book.title}:`, error)
      }
    }
    return book
  })

  return Promise.all(enrichPromises)
}

/**
 * Normalize string for comparison (remove accents, lowercase, alphanumeric only)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Keep only alphanumeric
}

/**
 * Clean title for deduplication (remove edition suffixes, translations markers, etc.)
 */
function cleanTitleForDedupe(title: string): string {
  return title
    .toLowerCase()
    // Remove common edition/translation suffixes
    .replace(/\s*[-–:]\s*(version française|french edition|édition française)/gi, "")
    .replace(/\s*[-–:]\s*(svensk utgåva|swedish edition)/gi, "")
    .replace(/\s*[-–:]\s*(deutsche ausgabe|german edition)/gi, "")
    .replace(/\s*\(.*?(edition|édition|ausgabe|version).*?\)/gi, "")
    .replace(/\s*[-–]\s*tome\s*\d+/gi, "")
    .replace(/\s+by\s+.*$/gi, "") // Remove "by Author" suffix
    .replace(/\s+summary$/gi, "") // Remove "Summary" suffix
    .trim()
}

/**
 * Fuzzy match two strings (for title matching)
 */
function fuzzyMatch(str1: string, str2: string): boolean {
  const normalized1 = normalizeString(cleanTitleForDedupe(str1))
  const normalized2 = normalizeString(cleanTitleForDedupe(str2))

  // Exact match after normalization
  if (normalized1 === normalized2) return true

  // One contains the other (at least 80% of the shorter one)
  const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2
  const longer = normalized1.length < normalized2.length ? normalized2 : normalized1

  if (longer.includes(shorter) && shorter.length / longer.length > 0.7) {
    return true
  }

  return false
}
