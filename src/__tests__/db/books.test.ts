/**
 * Unit tests for src/lib/db/books.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import {
  getUserBooks,
  getUserBook,
  getBookFromCache,
  cacheBook,
  addBookToLibrary,
  updateBookStatus,
  updateBookProgress,
  removeBookFromLibrary,
  countBooksByStatus,
} from '@/lib/db/books'
import type { D1Database } from '@cloudflare/workers-types'
import type { Book } from '@/types'

describe('Books Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getUserBooks', () => {
    it('should return empty array when no books in library', async () => {
      const books = await getUserBooks(db)
      expect(books).toEqual([])
    })

    it('should return all books with their metadata', async () => {
      seedMockDatabase({
        books: [
          testData.book({ id: 'OL123W', title: 'Book One' }),
          testData.book({ id: 'OL456W', title: 'Book Two' }),
        ],
        user_books: [
          testData.userBook({ book_id: 'OL123W', status: 'read' }),
          testData.userBook({ id: 2, book_id: 'OL456W', status: 'reading' }),
        ],
      })

      const books = await getUserBooks(db)

      expect(books).toHaveLength(2)
    })
  })

  describe('getUserBook', () => {
    it('should return a specific book by ID', async () => {
      seedMockDatabase({
        books: [
          testData.book({ id: 'OL123W', title: 'The Hobbit', author: 'J.R.R. Tolkien' }),
        ],
        user_books: [
          testData.userBook({ book_id: 'OL123W', current_page: 150, status: 'reading' }),
        ],
      })

      const book = await getUserBook(db, 'OL123W')

      expect(book).toBeDefined()
      expect(book?.title).toBe('The Hobbit')
      expect(book?.author).toBe('J.R.R. Tolkien')
      expect(book?.current_page).toBe(150)
    })

    it('should return null for non-existent book', async () => {
      const book = await getUserBook(db, 'nonexistent')
      expect(book).toBeNull()
    })
  })

  describe('getBookFromCache', () => {
    it('should return cached book metadata', async () => {
      seedMockDatabase({
        books: [
          testData.book({ id: 'OL123W', title: 'Cached Book', page_count: 500 }),
        ],
      })

      const book = await getBookFromCache(db, 'OL123W')

      expect(book).toBeDefined()
      expect(book?.title).toBe('Cached Book')
      expect(book?.page_count).toBe(500)
    })

    it('should return null if book not in cache', async () => {
      const book = await getBookFromCache(db, 'notcached')
      expect(book).toBeNull()
    })
  })

  describe('cacheBook', () => {
    it('should cache a new book', async () => {
      const book: Book = {
        id: 'OL999W',
        title: 'New Book',
        author: 'New Author',
        cover_url: 'https://example.com/cover.jpg',
        description: 'A wonderful book',
        page_count: 350,
        published_date: '2024-06-01',
        genres: ['Fiction', 'Adventure'],
        language: 'en',
      }

      await cacheBook(db, book)

      const cached = await getBookFromCache(db, 'OL999W')
      expect(cached).toBeDefined()
      expect(cached?.title).toBe('New Book')
    })
  })

  describe('addBookToLibrary', () => {
    it('should add a book with default status', async () => {
      seedMockDatabase({
        books: [testData.book({ id: 'OL123W' })],
      })

      await addBookToLibrary(db, 'OL123W')

      const book = await getUserBook(db, 'OL123W')
      expect(book).toBeDefined()
      expect(book?.status).toBe('to_read')
    })

    it('should add a book with specified status', async () => {
      seedMockDatabase({
        books: [testData.book({ id: 'OL123W' })],
      })

      await addBookToLibrary(db, 'OL123W', 'reading')

      const book = await getUserBook(db, 'OL123W')
      expect(book?.status).toBe('reading')
    })
  })

  describe('updateBookStatus', () => {
    it('should update book status', async () => {
      seedMockDatabase({
        books: [testData.book({ id: 'OL123W' })],
        user_books: [testData.userBook({ book_id: 'OL123W', status: 'reading' })],
      })

      await updateBookStatus(db, 'OL123W', 'read')

      const book = await getUserBook(db, 'OL123W')
      expect(book?.status).toBe('read')
    })
  })

  describe('updateBookProgress', () => {
    it('should update current page', async () => {
      seedMockDatabase({
        books: [testData.book({ id: 'OL123W' })],
        user_books: [testData.userBook({ book_id: 'OL123W', current_page: 50 })],
      })

      await updateBookProgress(db, 'OL123W', 100)

      const book = await getUserBook(db, 'OL123W')
      expect(book?.current_page).toBe(100)
    })
  })

  describe('removeBookFromLibrary', () => {
    it('should remove a book from the library', async () => {
      seedMockDatabase({
        books: [testData.book({ id: 'OL123W' })],
        user_books: [testData.userBook({ book_id: 'OL123W' })],
      })

      await removeBookFromLibrary(db, 'OL123W')

      const book = await getUserBook(db, 'OL123W')
      expect(book).toBeNull()
    })
  })

  describe('countBooksByStatus', () => {
    it('should return zero counts when library is empty', async () => {
      const counts = await countBooksByStatus(db)

      expect(counts.all).toBe(0)
      expect(counts.reading).toBe(0)
      expect(counts.read).toBe(0)
      expect(counts.to_read).toBe(0)
    })

    it('should count books by status correctly', async () => {
      seedMockDatabase({
        user_books: [
          testData.userBook({ status: 'reading' }),
          testData.userBook({ id: 2, book_id: '2', status: 'read' }),
          testData.userBook({ id: 3, book_id: '3', status: 'read' }),
          testData.userBook({ id: 4, book_id: '4', status: 'to_read' }),
          testData.userBook({ id: 5, book_id: '5', status: 'abandoned' }),
        ],
      })

      const counts = await countBooksByStatus(db)

      expect(counts.all).toBe(5)
      expect(counts.reading).toBe(1)
      expect(counts.read).toBe(2)
      expect(counts.to_read).toBe(1)
      expect(counts.abandoned).toBe(1)
    })
  })
})
