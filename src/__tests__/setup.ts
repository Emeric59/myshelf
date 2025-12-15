/**
 * Vitest test setup file
 * Runs before each test file
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock environment variables
vi.stubEnv('TMDB_API_KEY', 'test-tmdb-api-key')
vi.stubEnv('GEMINI_API_KEY', 'test-gemini-api-key')

// Mock fetch globally
global.fetch = vi.fn()

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
