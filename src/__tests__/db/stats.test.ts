/**
 * Unit tests for src/lib/db/stats.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import { getStats, getGoals, updateGoals } from '@/lib/db/stats'
import type { D1Database } from '@cloudflare/workers-types'

describe('Stats Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getStats', () => {
    it('should return empty stats when database is empty', async () => {
      const stats = await getStats(db)

      expect(stats.books.total).toBe(0)
      expect(stats.books.read).toBe(0)
      expect(stats.movies.total).toBe(0)
      expect(stats.shows.total).toBe(0)
      expect(stats.currentYear.booksRead).toBe(0)
    })

    it('should count books by status correctly', async () => {
      seedMockDatabase({
        user_books: [
          testData.userBook({ status: 'read', rating: 5 }),
          testData.userBook({ id: 2, book_id: 'OL456W', status: 'read', rating: 4 }),
          testData.userBook({ id: 3, book_id: 'OL789W', status: 'reading' }),
          testData.userBook({ id: 4, book_id: 'OL101W', status: 'to_read' }),
        ],
      })

      const stats = await getStats(db)

      expect(stats.books.total).toBe(4)
      expect(stats.books.read).toBe(2)
      expect(stats.books.reading).toBe(1)
      expect(stats.books.toRead).toBe(1)
    })

    it('should count movies by status correctly', async () => {
      seedMockDatabase({
        user_movies: [
          testData.userMovie({ status: 'watched', rating: 4 }),
          testData.userMovie({ id: 2, movie_id: '54321', status: 'watched', rating: 5 }),
          testData.userMovie({ id: 3, movie_id: '11111', status: 'to_watch' }),
        ],
      })

      const stats = await getStats(db)

      expect(stats.movies.total).toBe(3)
      expect(stats.movies.watched).toBe(2)
      expect(stats.movies.toWatch).toBe(1)
    })

    it('should count shows by status correctly', async () => {
      seedMockDatabase({
        user_shows: [
          testData.userShow({ status: 'watching' }),
          testData.userShow({ id: 2, show_id: '11111', status: 'watched', rating: 5 }),
          testData.userShow({ id: 3, show_id: '22222', status: 'to_watch' }),
          testData.userShow({ id: 4, show_id: '33333', status: 'to_watch' }),
        ],
      })

      const stats = await getStats(db)

      expect(stats.shows.total).toBe(4)
      expect(stats.shows.watched).toBe(1)
      expect(stats.shows.watching).toBe(1)
      expect(stats.shows.toWatch).toBe(2)
    })

    it('should return goals when they exist', async () => {
      const currentYear = new Date().getFullYear()
      seedMockDatabase({
        goals: [
          testData.goal({ media_type: 'book', target: 24, year: currentYear }),
          testData.goal({ id: 2, media_type: 'movie', target: 52, year: currentYear }),
          testData.goal({ id: 3, media_type: 'show', target: 12, year: currentYear }),
        ],
      })

      const stats = await getStats(db)

      expect(stats.goals).toBeDefined()
      expect(stats.goals?.books).toBe(24)
      expect(stats.goals?.movies).toBe(52)
      expect(stats.goals?.shows).toBe(12)
    })
  })

  describe('getGoals', () => {
    it('should return zeros when no goals exist', async () => {
      const goals = await getGoals(db, 2025)

      expect(goals.books).toBe(0)
      expect(goals.movies).toBe(0)
      expect(goals.shows).toBe(0)
    })

    it('should return goals for the specified year', async () => {
      seedMockDatabase({
        goals: [
          testData.goal({ media_type: 'book', target: 30, year: 2025 }),
          testData.goal({ id: 2, media_type: 'movie', target: 60, year: 2025 }),
          testData.goal({ id: 3, media_type: 'show', target: 15, year: 2025 }),
          // Different year - should not be returned
          testData.goal({ id: 4, media_type: 'book', target: 20, year: 2024 }),
        ],
      })

      const goals2025 = await getGoals(db, 2025)
      expect(goals2025.books).toBe(30)
      expect(goals2025.movies).toBe(60)
      expect(goals2025.shows).toBe(15)

      const goals2024 = await getGoals(db, 2024)
      expect(goals2024.books).toBe(20)
      expect(goals2024.movies).toBe(0)
      expect(goals2024.shows).toBe(0)
    })
  })

  describe('updateGoals', () => {
    it('should create new goals when none exist', async () => {
      await updateGoals(db, 2025, { books: 24, movies: 48, shows: 10 })

      const goals = await getGoals(db, 2025)
      expect(goals.books).toBe(24)
      expect(goals.movies).toBe(48)
      expect(goals.shows).toBe(10)
    })

    it('should update only specified goals', async () => {
      seedMockDatabase({
        goals: [
          testData.goal({ media_type: 'book', target: 20, year: 2025 }),
          testData.goal({ id: 2, media_type: 'movie', target: 40, year: 2025 }),
        ],
      })

      // Only update books goal
      await updateGoals(db, 2025, { books: 30 })

      const goals = await getGoals(db, 2025)
      expect(goals.books).toBe(30) // Updated
      expect(goals.movies).toBe(40) // Unchanged
    })
  })
})
