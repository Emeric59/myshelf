/**
 * Open Library API Client
 * Documentation: https://openlibrary.org/developers/api
 */

const BASE_URL = "https://openlibrary.org"
const COVERS_URL = "https://covers.openlibrary.org"

export interface OpenLibrarySearchResult {
  key: string // "/works/OL123W"
  title: string
  author_name?: string[]
  author_key?: string[]
  first_publish_year?: number
  cover_i?: number
  isbn?: string[]
  language?: string[]
  subject?: string[]
  publisher?: string[]
  number_of_pages_median?: number
}

export interface OpenLibraryWork {
  key: string
  title: string
  description?: string | { value: string }
  covers?: number[]
  subjects?: string[]
  subject_places?: string[]
  subject_times?: string[]
  first_publish_date?: string
  authors?: Array<{
    author: { key: string }
    type?: { key: string }
  }>
}

export interface OpenLibraryAuthor {
  key: string
  name: string
  bio?: string | { value: string }
  birth_date?: string
  death_date?: string
  photos?: number[]
}

export interface OpenLibraryEdition {
  key: string
  title: string
  publishers?: string[]
  publish_date?: string
  number_of_pages?: number
  isbn_10?: string[]
  isbn_13?: string[]
  covers?: number[]
  languages?: { key: string }[]
}

/**
 * Search for books
 */
export async function searchBooks(
  query: string,
  options: {
    language?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ docs: OpenLibrarySearchResult[]; numFound: number }> {
  const { limit = 20, offset = 0, language } = options

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    offset: offset.toString(),
    fields:
      "key,title,author_name,author_key,first_publish_year,cover_i,isbn,language,subject,publisher,number_of_pages_median",
  })

  if (language) {
    params.set("language", language)
  }

  const response = await fetch(`${BASE_URL}/search.json?${params}`)

  if (!response.ok) {
    throw new Error(`Open Library search failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get work details by ID
 */
export async function getWork(workId: string): Promise<OpenLibraryWork> {
  // Normalize ID format
  const id = workId.startsWith("/works/") ? workId : `/works/${workId}`

  const response = await fetch(`${BASE_URL}${id}.json`)

  if (!response.ok) {
    throw new Error(`Failed to fetch work: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get author details
 */
export async function getAuthor(authorId: string): Promise<OpenLibraryAuthor> {
  const id = authorId.startsWith("/authors/")
    ? authorId
    : `/authors/${authorId}`

  const response = await fetch(`${BASE_URL}${id}.json`)

  if (!response.ok) {
    throw new Error(`Failed to fetch author: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get editions of a work
 */
export async function getWorkEditions(
  workId: string,
  limit = 10
): Promise<{ entries: OpenLibraryEdition[] }> {
  const id = workId.replace("/works/", "")

  const response = await fetch(
    `${BASE_URL}/works/${id}/editions.json?limit=${limit}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch editions: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get cover URL
 */
export function getCoverUrl(
  type: "id" | "isbn" | "olid",
  value: string | number,
  size: "S" | "M" | "L" = "M"
): string {
  return `${COVERS_URL}/b/${type}/${value}-${size}.jpg`
}

/**
 * Extract description text from OpenLibrary format
 */
export function extractDescription(
  desc: string | { value: string } | undefined
): string | undefined {
  if (!desc) return undefined
  return typeof desc === "string" ? desc : desc.value
}

/**
 * Normalize search result to our Book type
 */
export function normalizeSearchResult(result: OpenLibrarySearchResult) {
  const workId = result.key.replace("/works/", "")

  return {
    id: workId,
    title: result.title,
    author: result.author_name?.[0] || "Auteur inconnu",
    author_id: result.author_key?.[0],
    cover_url: result.cover_i
      ? getCoverUrl("id", result.cover_i, "M")
      : undefined,
    published_date: result.first_publish_year?.toString(),
    page_count: result.number_of_pages_median,
    language: result.language?.[0],
    genres: result.subject?.slice(0, 5),
    isbn_13: result.isbn?.find((i) => i.length === 13),
    isbn_10: result.isbn?.find((i) => i.length === 10),
  }
}
