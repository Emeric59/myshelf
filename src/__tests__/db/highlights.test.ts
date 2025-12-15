/**
 * Unit tests for src/lib/db/highlights.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import {
  getHighlights,
  getHighlightsByBook,
  getHighlightById,
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from '@/lib/db/highlights'
import type { D1Database } from '@cloudflare/workers-types'

describe('Highlights Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getHighlights', () => {
    it('should return empty array when no highlights exist', async () => {
      const highlights = await getHighlights(db)
      expect(highlights).toEqual([])
    })

    it('should return all highlights ordered by creation date', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1, content: 'First highlight', created_at: '2024-01-01T10:00:00Z' }),
          testData.highlight({ id: 2, content: 'Second highlight', created_at: '2024-01-02T10:00:00Z' }),
          testData.highlight({ id: 3, content: 'Third highlight', created_at: '2024-01-03T10:00:00Z' }),
        ],
        books: [
          testData.book(),
        ],
      })

      const highlights = await getHighlights(db)

      expect(highlights).toHaveLength(3)
    })
  })

  describe('getHighlightsByBook', () => {
    it('should return only highlights for a specific book', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1, book_id: 'OL123W', content: 'Book 1 highlight' }),
          testData.highlight({ id: 2, book_id: 'OL456W', content: 'Book 2 highlight' }),
          testData.highlight({ id: 3, book_id: 'OL123W', content: 'Another Book 1 highlight' }),
        ],
      })

      const highlights = await getHighlightsByBook(db, 'OL123W')

      expect(highlights).toHaveLength(2)
      expect(highlights.every(h => h.book_id === 'OL123W')).toBe(true)
    })

    it('should return empty array when book has no highlights', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ book_id: 'OL456W' }),
        ],
      })

      const highlights = await getHighlightsByBook(db, 'OL123W')

      expect(highlights).toEqual([])
    })
  })

  describe('getHighlightById', () => {
    it('should return a highlight by its ID', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1, content: 'Target highlight' }),
          testData.highlight({ id: 2, content: 'Other highlight' }),
        ],
      })

      const highlight = await getHighlightById(db, 1)

      expect(highlight).toBeDefined()
      expect(highlight?.id).toBe(1)
      expect(highlight?.content).toBe('Target highlight')
    })

    it('should return null when highlight does not exist', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1 }),
        ],
      })

      const highlight = await getHighlightById(db, 999)

      expect(highlight).toBeNull()
    })
  })

  describe('createHighlight', () => {
    it('should create a new highlight', async () => {
      seedMockDatabase({
        books: [testData.book()],
      })

      const newHighlight = await createHighlight(db, {
        book_id: 'OL123W',
        content: 'A beautiful passage',
        page_number: 42,
        chapter: 'Chapter 5',
        personal_note: 'This moved me',
      })

      expect(newHighlight).toBeDefined()
      expect(newHighlight.content).toBe('A beautiful passage')
      expect(newHighlight.page_number).toBe(42)
    })

    it('should create highlight without optional fields', async () => {
      seedMockDatabase({
        books: [testData.book()],
      })

      const newHighlight = await createHighlight(db, {
        book_id: 'OL123W',
        content: 'Just the content',
      })

      expect(newHighlight).toBeDefined()
      expect(newHighlight.content).toBe('Just the content')
      expect(newHighlight.page_number).toBeUndefined()
    })
  })

  describe('updateHighlight', () => {
    it('should update an existing highlight', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1, content: 'Original content', personal_note: 'Old note' }),
        ],
      })

      await updateHighlight(db, 1, {
        content: 'Updated content',
        personal_note: 'New note',
      })

      const updated = await getHighlightById(db, 1)
      expect(updated?.content).toBe('Updated content')
      expect(updated?.personal_note).toBe('New note')
    })

    it('should update only specified fields', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1, content: 'Original', page_number: 10, personal_note: 'Note' }),
        ],
      })

      await updateHighlight(db, 1, {
        page_number: 20,
      })

      const updated = await getHighlightById(db, 1)
      expect(updated?.content).toBe('Original') // Unchanged
      expect(updated?.page_number).toBe(20) // Updated
      expect(updated?.personal_note).toBe('Note') // Unchanged
    })
  })

  describe('deleteHighlight', () => {
    it('should delete an existing highlight', async () => {
      seedMockDatabase({
        highlights: [
          testData.highlight({ id: 1 }),
          testData.highlight({ id: 2 }),
        ],
      })

      await deleteHighlight(db, 1)

      const deleted = await getHighlightById(db, 1)
      const remaining = await getHighlightById(db, 2)

      expect(deleted).toBeNull()
      expect(remaining).toBeDefined()
    })
  })
})
