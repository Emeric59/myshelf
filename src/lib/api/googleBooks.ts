/**
 * Google Books API Client
 * Documentation: https://developers.google.com/books/docs/v1/using
 */

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1"

export interface GoogleBooksVolumeInfo {
  title: string
  subtitle?: string
  authors?: string[]
  publisher?: string
  publishedDate?: string
  description?: string
  industryIdentifiers?: Array<{
    type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER"
    identifier: string
  }>
  pageCount?: number
  categories?: string[]
  averageRating?: number
  ratingsCount?: number
  imageLinks?: {
    smallThumbnail?: string
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
    extraLarge?: string
  }
  language?: string
  previewLink?: string
  infoLink?: string
}

export interface GoogleBooksVolume {
  id: string
  etag?: string
  selfLink: string
  volumeInfo: GoogleBooksVolumeInfo
}

export interface GoogleBooksSearchResponse {
  kind: string
  totalItems: number
  items?: GoogleBooksVolume[]
}

export interface GoogleBookResult {
  id: string
  title: string
  authors: string[]
  description?: string
  pageCount?: number
  categories?: string[]
  thumbnail?: string
  isbn13?: string
  isbn10?: string
  publishedDate?: string
  language?: string
  averageRating?: number
  publisher?: string
}

/**
 * Search for books using Google Books API
 */
export async function searchGoogleBooks(
  query: string,
  options?: {
    langRestrict?: string
    maxResults?: number
    orderBy?: "relevance" | "newest"
  }
): Promise<GoogleBookResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY

  const params = new URLSearchParams({
    q: query,
    maxResults: String(options?.maxResults ?? 15),
    orderBy: options?.orderBy ?? "relevance",
    printType: "books",
  })

  // Add API key if available
  if (apiKey) {
    params.set("key", apiKey)
  }

  if (options?.langRestrict) {
    params.set("langRestrict", options.langRestrict)
  }

  const response = await fetch(`${GOOGLE_BOOKS_URL}/volumes?${params}`)

  if (!response.ok) {
    throw new Error(`Google Books search failed: ${response.statusText}`)
  }

  const data = (await response.json()) as GoogleBooksSearchResponse

  return (data.items || []).map(parseGoogleBookItem)
}

/**
 * Get a specific book by Google Books ID
 */
export async function getGoogleBook(volumeId: string): Promise<GoogleBookResult | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY

  const params = new URLSearchParams()
  if (apiKey) {
    params.set("key", apiKey)
  }

  const url = params.toString()
    ? `${GOOGLE_BOOKS_URL}/volumes/${volumeId}?${params}`
    : `${GOOGLE_BOOKS_URL}/volumes/${volumeId}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch Google Book: ${response.statusText}`)
  }

  const data = (await response.json()) as GoogleBooksVolume

  return parseGoogleBookItem(data)
}

/**
 * Search by ISBN
 */
export async function searchGoogleBooksByISBN(isbn: string): Promise<GoogleBookResult | null> {
  const results = await searchGoogleBooks(`isbn:${isbn}`, { maxResults: 1 })
  return results[0] || null
}

/**
 * Parse Google Books API item to our format
 */
function parseGoogleBookItem(item: GoogleBooksVolume): GoogleBookResult {
  const info = item.volumeInfo || ({} as GoogleBooksVolumeInfo)
  const identifiers = info.industryIdentifiers || []

  // Get the best quality thumbnail available
  let thumbnail = info.imageLinks?.thumbnail
    || info.imageLinks?.small
    || info.imageLinks?.medium
    || info.imageLinks?.smallThumbnail

  // Upgrade to HTTPS
  if (thumbnail) {
    thumbnail = thumbnail.replace("http:", "https:")
    // Remove zoom parameter for better quality
    thumbnail = thumbnail.replace("&edge=curl", "")
  }

  return {
    id: item.id,
    title: info.title,
    authors: info.authors || [],
    description: info.description,
    pageCount: info.pageCount,
    categories: info.categories,
    thumbnail,
    isbn13: identifiers.find((i) => i.type === "ISBN_13")?.identifier,
    isbn10: identifiers.find((i) => i.type === "ISBN_10")?.identifier,
    publishedDate: info.publishedDate,
    language: info.language,
    averageRating: info.averageRating,
    publisher: info.publisher,
  }
}
