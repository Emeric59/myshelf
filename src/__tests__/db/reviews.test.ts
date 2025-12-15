/**
 * Unit tests for src/lib/db/reviews.ts
 *
 * Note: Tests are simplified due to mock D1 limitations with complex SQL queries.
 * The mock D1 only supports basic SELECT/INSERT/UPDATE/DELETE with simple WHERE clauses.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import { getReview, getRecentReviews } from '@/lib/db/reviews'
import type { D1Database } from '@cloudflare/workers-types'

describe('Reviews Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getReview', () => {
    it('should return null when no review exists', async () => {
      const review = await getReview(db, 'book', 'nonexistent')
      expect(review).toBeNull()
    })
  })

  describe('getRecentReviews', () => {
    it('should return empty array when no reviews', async () => {
      const reviews = await getRecentReviews(db)
      expect(reviews).toEqual([])
    })
  })
})
