/**
 * Unit tests for src/lib/db/tropes.ts
 *
 * Note: Tests are simplified due to mock D1 limitations with complex SQL queries.
 * The mock D1 only supports basic SELECT/INSERT/UPDATE/DELETE with simple WHERE clauses.
 * Tests involving JOINs and GROUP BY are not possible with the current mock.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import { getAllTropes, getTropesByCategory } from '@/lib/db/tropes'
import type { D1Database } from '@cloudflare/workers-types'

describe('Tropes Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getAllTropes', () => {
    it('should return empty array when no tropes exist', async () => {
      const tropes = await getAllTropes(db)
      expect(tropes).toEqual([])
    })

    it('should return all tropes', async () => {
      seedMockDatabase({
        tropes: [
          testData.trope({ id: 1, name: 'Enemies to Lovers', category: 'romance' }),
          testData.trope({ id: 2, name: 'Found Family', category: 'relationships' }),
          testData.trope({ id: 3, name: 'Slow Burn', category: 'romance' }),
        ],
      })

      const tropes = await getAllTropes(db)

      expect(tropes).toHaveLength(3)
    })
  })

  describe('getTropesByCategory', () => {
    it('should return empty array when no tropes in category', async () => {
      seedMockDatabase({
        tropes: [
          testData.trope({ id: 1, name: 'Enemies to Lovers', category: 'romance' }),
        ],
      })

      const tropes = await getTropesByCategory(db, 'action')

      expect(tropes).toEqual([])
    })

    it('should return only tropes from specified category', async () => {
      seedMockDatabase({
        tropes: [
          testData.trope({ id: 1, name: 'Enemies to Lovers', category: 'romance' }),
          testData.trope({ id: 2, name: 'Slow Burn', category: 'romance' }),
          testData.trope({ id: 3, name: 'Found Family', category: 'relationships' }),
        ],
      })

      const tropes = await getTropesByCategory(db, 'romance')

      expect(tropes).toHaveLength(2)
      expect(tropes.every(t => t.category === 'romance')).toBe(true)
    })
  })
})
