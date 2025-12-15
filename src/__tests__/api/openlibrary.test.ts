/**
 * Unit tests for src/lib/api/openlibrary.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  searchBooks,
  getWork,
  getAuthor,
  getCoverUrl,
  extractDescription,
  normalizeSearchResult,
  type OpenLibrarySearchResult,
} from '@/lib/api/openlibrary'

// Mock fetch responses
const mockSearchResponse = {
  numFound: 100,
  docs: [
    {
      key: '/works/OL12345W',
      title: 'The Hobbit',
      author_name: ['J.R.R. Tolkien'],
      author_key: ['OL26320A'],
      first_publish_year: 1937,
      cover_i: 6979861,
      isbn: ['9780547928227', '0547928227'],
      language: ['eng'],
      subject: ['Fantasy', 'Adventure', 'Hobbits'],
      number_of_pages_median: 300,
    },
  ],
}

const mockWorkResponse = {
  key: '/works/OL12345W',
  title: 'The Hobbit',
  description: 'A fantasy novel about a hobbit named Bilbo Baggins.',
  covers: [6979861],
  subjects: ['Fantasy fiction', 'Middle Earth'],
  first_publish_date: '1937',
  authors: [{ author: { key: '/authors/OL26320A' } }],
}

const mockAuthorResponse = {
  key: '/authors/OL26320A',
  name: 'J.R.R. Tolkien',
  bio: 'English author and academic.',
  birth_date: '3 January 1892',
  death_date: '2 September 1973',
}

describe('Open Library API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchBooks', () => {
    it('should search for books and return results', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      } as Response)

      const result = await searchBooks('hobbit')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('openlibrary.org/search.json')
      )
      expect(result.numFound).toBe(100)
      expect(result.docs).toHaveLength(1)
      expect(result.docs[0].title).toBe('The Hobbit')
    })

    it('should pass query parameters correctly', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      } as Response)

      await searchBooks('fantasy', { limit: 10, offset: 20, language: 'fra' })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=20')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('language=fra')
      )
    })

    it('should throw error on API failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(searchBooks('test')).rejects.toThrow('Open Library search failed')
    })
  })

  describe('getWork', () => {
    it('should fetch work details by ID', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkResponse),
      } as Response)

      const work = await getWork('OL12345W')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/works/OL12345W.json')
      )
      expect(work.title).toBe('The Hobbit')
    })

    it('should handle ID with /works/ prefix', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkResponse),
      } as Response)

      await getWork('/works/OL12345W')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/works/OL12345W.json')
      )
    })
  })

  describe('getAuthor', () => {
    it('should fetch author details by ID', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAuthorResponse),
      } as Response)

      const author = await getAuthor('OL26320A')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/authors/OL26320A.json')
      )
      expect(author.name).toBe('J.R.R. Tolkien')
    })
  })

  describe('getCoverUrl', () => {
    it('should generate cover URL with ID', () => {
      const url = getCoverUrl('id', 6979861, 'M')
      expect(url).toBe('https://covers.openlibrary.org/b/id/6979861-M.jpg')
    })

    it('should generate cover URL with ISBN', () => {
      const url = getCoverUrl('isbn', '9780547928227', 'L')
      expect(url).toBe('https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg')
    })

    it('should default to medium size', () => {
      const url = getCoverUrl('id', 12345)
      expect(url).toContain('-M.jpg')
    })
  })

  describe('extractDescription', () => {
    it('should extract string description', () => {
      const desc = extractDescription('A simple description')
      expect(desc).toBe('A simple description')
    })

    it('should extract description from object format', () => {
      const desc = extractDescription({ value: 'Object description' })
      expect(desc).toBe('Object description')
    })

    it('should return undefined for missing description', () => {
      const desc = extractDescription(undefined)
      expect(desc).toBeUndefined()
    })
  })

  describe('normalizeSearchResult', () => {
    it('should normalize search result to Book type', () => {
      const result: OpenLibrarySearchResult = {
        key: '/works/OL12345W',
        title: 'Test Book',
        author_name: ['Test Author'],
        author_key: ['OL123A'],
        first_publish_year: 2020,
        cover_i: 12345,
        isbn: ['9781234567890', '1234567890'],
        language: ['eng'],
        subject: ['Fiction', 'Adventure', 'Mystery', 'Thriller', 'Drama', 'Extra'],
        number_of_pages_median: 250,
      }

      const normalized = normalizeSearchResult(result)

      expect(normalized.id).toBe('OL12345W')
      expect(normalized.title).toBe('Test Book')
      expect(normalized.author).toBe('Test Author')
      expect(normalized.author_id).toBe('OL123A')
      expect(normalized.published_date).toBe('2020')
      expect(normalized.page_count).toBe(250)
      expect(normalized.language).toBe('eng')
      expect(normalized.genres).toHaveLength(5) // Limited to 5
      expect(normalized.isbn_13).toBe('9781234567890')
      expect(normalized.isbn_10).toBe('1234567890')
    })

    it('should handle missing optional fields', () => {
      const result: OpenLibrarySearchResult = {
        key: '/works/OL999W',
        title: 'Minimal Book',
      }

      const normalized = normalizeSearchResult(result)

      expect(normalized.id).toBe('OL999W')
      expect(normalized.title).toBe('Minimal Book')
      expect(normalized.author).toBe('Auteur inconnu')
      expect(normalized.cover_url).toBeUndefined()
      expect(normalized.published_date).toBeUndefined()
    })
  })
})
