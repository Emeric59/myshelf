/**
 * Mock D1 Database for testing
 * Simulates Cloudflare D1 API with in-memory storage
 */

import { vi } from 'vitest'
import type { D1Database, D1PreparedStatement, D1Result } from '@cloudflare/workers-types'

// In-memory storage for test data
type TableData = Record<string, unknown>[]
type Database = Record<string, TableData>

let mockDatabase: Database = {}

// Helper to reset the mock database
export function resetMockDatabase() {
  mockDatabase = {
    books: [],
    movies: [],
    shows: [],
    user_books: [],
    user_movies: [],
    user_shows: [],
    reviews: [],
    highlights: [],
    tropes: [],
    user_trope_preferences: [],
    media_tropes: [],
    goals: [],
    recommendations: [],
    settings: [],
    streaming_subscriptions: [],
    awards: [],
  }
}

// Helper to seed test data
export function seedMockDatabase(data: Partial<Database>) {
  Object.entries(data).forEach(([table, rows]) => {
    mockDatabase[table] = rows as TableData
  })
}

// Helper to get mock database state
export function getMockDatabase(): Database {
  return mockDatabase
}

// Simple SQL parser for basic queries
function parseSimpleQuery(sql: string, bindings: unknown[]): {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  where?: Record<string, unknown>
  data?: Record<string, unknown>
} {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim().toUpperCase()

  // Extract table name
  let table = ''
  let type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT'

  if (normalizedSql.startsWith('SELECT')) {
    type = 'SELECT'
    const fromMatch = sql.match(/FROM\s+(\w+)/i)
    table = fromMatch?.[1] || ''
  } else if (normalizedSql.startsWith('INSERT')) {
    type = 'INSERT'
    const intoMatch = sql.match(/INTO\s+(\w+)/i)
    table = intoMatch?.[1] || ''
  } else if (normalizedSql.startsWith('UPDATE')) {
    type = 'UPDATE'
    const updateMatch = sql.match(/UPDATE\s+(\w+)/i)
    table = updateMatch?.[1] || ''
  } else if (normalizedSql.startsWith('DELETE')) {
    type = 'DELETE'
    const fromMatch = sql.match(/FROM\s+(\w+)/i)
    table = fromMatch?.[1] || ''
  }

  // Parse WHERE clause for simple conditions
  const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i)
  let where: Record<string, unknown> | undefined
  if (whereMatch && bindings.length > 0) {
    where = { [whereMatch[1]]: bindings[bindings.length - 1] }
  }

  return { type, table, where }
}

// Create a mock prepared statement
function createMockPreparedStatement(sql: string): D1PreparedStatement {
  let bindings: unknown[] = []

  const statement: D1PreparedStatement = {
    bind(...values: unknown[]) {
      bindings = values
      return statement
    },

    async first<T = unknown>(colName?: string): Promise<T | null> {
      const { type, table, where } = parseSimpleQuery(sql, bindings)

      if (type !== 'SELECT' || !mockDatabase[table]) {
        return null
      }

      let results = [...mockDatabase[table]]

      // Apply WHERE filter
      if (where) {
        const [key, value] = Object.entries(where)[0]
        results = results.filter(row => row[key] === value)
      }

      const row = results[0] || null

      if (colName && row) {
        return (row as Record<string, unknown>)[colName] as T
      }

      return row as T
    },

    async all<T = unknown>(): Promise<D1Result<T>> {
      const { type, table, where } = parseSimpleQuery(sql, bindings)

      if (type !== 'SELECT' || !mockDatabase[table]) {
        return {
          results: [] as T[],
          success: true,
          meta: { duration: 0, changes: 0, last_row_id: 0, changed_db: false, size_after: 0, rows_read: 0, rows_written: 0 },
        }
      }

      let results = [...mockDatabase[table]]

      // Apply WHERE filter
      if (where) {
        const [key, value] = Object.entries(where)[0]
        results = results.filter(row => row[key] === value)
      }

      return {
        results: results as T[],
        success: true,
        meta: { duration: 0, changes: 0, last_row_id: 0, changed_db: false, size_after: 0, rows_read: results.length, rows_written: 0 },
      }
    },

    async run<T = unknown>(): Promise<D1Result<T>> {
      const { type, table, where } = parseSimpleQuery(sql, bindings)

      if (!mockDatabase[table]) {
        mockDatabase[table] = []
      }

      let changes = 0
      let lastRowId = 0

      if (type === 'INSERT') {
        // Parse column names and values from INSERT statement
        const colMatch = sql.match(/\(([^)]+)\)\s*VALUES/i)
        const columns = colMatch?.[1].split(',').map(c => c.trim()) || []

        const newRow: Record<string, unknown> = { id: mockDatabase[table].length + 1 }
        columns.forEach((col, i) => {
          if (i < bindings.length) {
            newRow[col] = bindings[i]
          }
        })

        // Handle ON CONFLICT (upsert)
        if (sql.toUpperCase().includes('ON CONFLICT')) {
          const existingIndex = mockDatabase[table].findIndex(
            row => row.id === newRow.id ||
                   (columns[0] && row[columns[0]] === bindings[0])
          )
          if (existingIndex >= 0) {
            mockDatabase[table][existingIndex] = { ...mockDatabase[table][existingIndex], ...newRow }
          } else {
            mockDatabase[table].push(newRow)
          }
        } else {
          mockDatabase[table].push(newRow)
        }

        changes = 1
        lastRowId = mockDatabase[table].length
      } else if (type === 'UPDATE' && where) {
        const [key, value] = Object.entries(where)[0]
        mockDatabase[table] = mockDatabase[table].map(row => {
          if (row[key] === value) {
            changes++
            // Simple update - in real tests you'd parse SET clause
            return { ...row, updated_at: new Date().toISOString() }
          }
          return row
        })
      } else if (type === 'DELETE' && where) {
        const [key, value] = Object.entries(where)[0]
        const originalLength = mockDatabase[table].length
        mockDatabase[table] = mockDatabase[table].filter(row => row[key] !== value)
        changes = originalLength - mockDatabase[table].length
      }

      return {
        results: [] as T[],
        success: true,
        meta: { duration: 0, changes, last_row_id: lastRowId, changed_db: changes > 0, size_after: 0, rows_read: 0, rows_written: changes },
      }
    },

    async raw<T = unknown[]>(): Promise<T[]> {
      const result = await statement.all<Record<string, unknown>>()
      return result.results.map(row => Object.values(row)) as T[]
    },
  }

  return statement
}

// Create a mock D1 database
export function createMockD1(): D1Database {
  resetMockDatabase()

  return {
    prepare(sql: string) {
      return createMockPreparedStatement(sql)
    },

    async dump(): Promise<ArrayBuffer> {
      return new ArrayBuffer(0)
    },

    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
      const results: D1Result<T>[] = []
      for (const stmt of statements) {
        results.push(await stmt.run())
      }
      return results
    },

    async exec(sql: string): Promise<D1Result> {
      return {
        results: [],
        success: true,
        meta: { duration: 0, changes: 0, last_row_id: 0, changed_db: false, size_after: 0, rows_read: 0, rows_written: 0 },
      }
    },
  }
}

// Test data factories
export const testData = {
  book: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'OL123W',
    title: 'Test Book',
    author: 'Test Author',
    cover_url: 'https://covers.openlibrary.org/b/id/12345-M.jpg',
    description: 'A test book description',
    page_count: 300,
    published_date: '2023-01-01',
    genres: '["Fiction", "Fantasy"]',
    language: 'en',
    ...overrides,
  }),

  movie: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: '12345',
    title: 'Test Movie',
    director: 'Test Director',
    poster_url: 'https://image.tmdb.org/t/p/w500/test.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/test.jpg',
    description: 'A test movie description',
    runtime: 120,
    release_date: '2023-06-15',
    genres: '["Action", "Adventure"]',
    ...overrides,
  }),

  show: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: '67890',
    title: 'Test Show',
    creators: '["Creator One", "Creator Two"]',
    poster_url: 'https://image.tmdb.org/t/p/w500/show.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/show.jpg',
    description: 'A test show description',
    first_air_date: '2022-01-01',
    status: 'Returning Series',
    seasons_count: 3,
    episodes_count: 24,
    genres: '["Drama", "Sci-Fi"]',
    ...overrides,
  }),

  userBook: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    book_id: 'OL123W',
    status: 'reading',
    rating: 4.5,
    current_page: 150,
    started_at: '2024-01-15',
    finished_at: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    ...overrides,
  }),

  userMovie: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    movie_id: '12345',
    status: 'watched',
    rating: 4,
    watched_at: '2024-02-01',
    created_at: '2024-02-01T20:00:00Z',
    updated_at: '2024-02-01T22:30:00Z',
    ...overrides,
  }),

  userShow: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    show_id: '67890',
    status: 'watching',
    rating: null,
    current_season: 2,
    current_episode: 5,
    started_at: '2024-01-01',
    finished_at: null,
    created_at: '2024-01-01T18:00:00Z',
    updated_at: '2024-03-15T21:00:00Z',
    ...overrides,
  }),

  highlight: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    book_id: 'OL123W',
    content: 'This is a highlighted passage from the book.',
    page_number: 42,
    chapter: 'Chapter 3',
    personal_note: 'I loved this part!',
    created_at: '2024-01-20T14:00:00Z',
    ...overrides,
  }),

  review: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    media_type: 'book',
    media_id: 'OL123W',
    comment: 'Great book with amazing characters!',
    liked_aspects: '["characters", "worldbuilding"]',
    disliked_aspects: '["pacing"]',
    emotions: '["made_me_cry", "favorite"]',
    created_at: '2024-01-25T16:00:00Z',
    updated_at: '2024-01-25T16:00:00Z',
    ...overrides,
  }),

  trope: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    name: 'Enemies to Lovers',
    slug: 'enemies-to-lovers',
    category: 'romance',
    description: 'Characters who start as enemies develop romantic feelings',
    is_sensitive: 0,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  goal: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    year: 2025,
    media_type: 'book',
    target: 24,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }),
}
