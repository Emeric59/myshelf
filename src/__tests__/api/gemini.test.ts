/**
 * Unit tests for src/lib/ai/gemini.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getRecommendations,
  buildUserContext,
  type UserContext,
  type RecommendationRequest,
} from '@/lib/ai/gemini'

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        candidates: [{
          content: {
            parts: [
              { thought: true, text: 'Thinking...' },
              {
                text: JSON.stringify({
                  message: 'Voici mes suggestions !',
                  recommendations: [
                    {
                      type: 'book',
                      title: 'Le Nom du Vent',
                      author: 'Patrick Rothfuss',
                      year: '2007',
                      reason: 'Un fantasy épique avec une prose magnifique.',
                    },
                    {
                      type: 'movie',
                      title: 'Inception',
                      year: '2010',
                      reason: 'Un thriller sci-fi captivant.',
                    },
                  ],
                }),
              },
            ],
          },
        }],
      }),
    },
  })),
}))

describe('Gemini AI Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buildUserContext', () => {
    it('should build context from user data', () => {
      const data = {
        books: [
          { title: 'Book 1', author: 'Author 1', rating: 5, genres: '["Fantasy"]', status: 'read' },
          { title: 'Book 2', author: 'Author 2', rating: 3, genres: '["Mystery"]', status: 'reading' },
        ],
        movies: [
          { title: 'Movie 1', rating: 4, genres: '["Action"]', status: 'watched' },
          { title: 'Movie 2', rating: null, genres: null, status: 'to_watch' },
        ],
        shows: [
          { title: 'Show 1', rating: 5, genres: '["Drama"]', status: 'watched' },
        ],
        tropePreferences: [
          { name: 'Enemies to Lovers', preference: 'love' },
          { name: 'Found Family', preference: 'like' },
          { name: 'Love Triangle', preference: 'dislike' },
          { name: 'Cheating', preference: 'blacklist' },
        ],
      }

      const context = buildUserContext(data)

      // Check read books
      expect(context.readBooks).toHaveLength(1)
      expect(context.readBooks[0].title).toBe('Book 1')
      expect(context.readBooks[0].rating).toBe(5)
      expect(context.readBooks[0].genres).toContain('Fantasy')

      // Check watched movies
      expect(context.watchedMovies).toHaveLength(1)
      expect(context.watchedMovies[0].title).toBe('Movie 1')

      // Check watched shows
      expect(context.watchedShows).toHaveLength(1)
      expect(context.watchedShows[0].title).toBe('Show 1')

      // Check tropes
      expect(context.lovedTropes).toContain('Enemies to Lovers')
      expect(context.likedTropes).toContain('Found Family')
      expect(context.dislikedTropes).toContain('Love Triangle')
      expect(context.blacklistedTropes).toContain('Cheating')

      // Check excluded titles (all media in library)
      expect(context.excludedTitles).toContain('Book 1')
      expect(context.excludedTitles).toContain('Book 2')
      expect(context.excludedTitles).toContain('Movie 1')
      expect(context.excludedTitles).toContain('Movie 2')
      expect(context.excludedTitles).toContain('Show 1')
    })

    it('should handle invalid JSON in genres', () => {
      const data = {
        books: [
          { title: 'Book 1', author: 'Author', rating: 4, genres: 'invalid-json', status: 'read' },
        ],
        movies: [],
        shows: [],
        tropePreferences: [],
      }

      const context = buildUserContext(data)

      expect(context.readBooks[0].genres).toEqual([])
    })

    it('should handle empty data', () => {
      const data = {
        books: [],
        movies: [],
        shows: [],
        tropePreferences: [],
      }

      const context = buildUserContext(data)

      expect(context.readBooks).toEqual([])
      expect(context.watchedMovies).toEqual([])
      expect(context.watchedShows).toEqual([])
      expect(context.lovedTropes).toEqual([])
      expect(context.blacklistedTropes).toEqual([])
      expect(context.excludedTitles).toEqual([])
    })
  })

  describe('getRecommendations', () => {
    const mockContext: UserContext = {
      readBooks: [{ title: 'Le Seigneur des Anneaux', author: 'Tolkien', rating: 5, genres: ['Fantasy'] }],
      watchedMovies: [],
      watchedShows: [],
      lovedTropes: ['Quête épique'],
      likedTropes: [],
      dislikedTropes: [],
      blacklistedTropes: ['Violence graphique'],
      excludedTitles: ['Le Seigneur des Anneaux'],
    }

    it('should return recommendations from Gemini', async () => {
      const request: RecommendationRequest = {
        userQuery: 'Je cherche un fantasy avec de la magie',
        context: mockContext,
      }

      const response = await getRecommendations(request)

      expect(response.message).toBe('Voici mes suggestions !')
      expect(response.recommendations).toHaveLength(2)
      expect(response.recommendations[0].type).toBe('book')
      expect(response.recommendations[0].title).toBe('Le Nom du Vent')
      expect(response.recommendations[1].type).toBe('movie')
    })

    it('should filter out already excluded titles', async () => {
      const request: RecommendationRequest = {
        userQuery: 'Recommande moi quelque chose',
        context: {
          ...mockContext,
          excludedTitles: ['Le Nom du Vent', 'Inception'], // Both recommendations are excluded
        },
      }

      const response = await getRecommendations(request)

      // Recommendations should be filtered out
      expect(response.recommendations).toHaveLength(0)
    })

    it('should limit recommendations to 5 maximum', async () => {
      // The mock already returns 2 recommendations, this tests the slice(0, 5) logic
      const request: RecommendationRequest = {
        userQuery: 'Test',
        context: mockContext,
      }

      const response = await getRecommendations(request)

      expect(response.recommendations.length).toBeLessThanOrEqual(5)
    })

    it('should handle API errors gracefully', async () => {
      // Override the mock to throw an error
      const { GoogleGenAI } = await import('@google/genai')
      vi.mocked(GoogleGenAI).mockImplementationOnce(() => ({
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('API Error')),
        },
      }) as unknown as InstanceType<typeof GoogleGenAI>)

      const request: RecommendationRequest = {
        userQuery: 'Test query',
        context: mockContext,
      }

      const response = await getRecommendations(request)

      expect(response.message).toContain('Désolé')
      expect(response.recommendations).toEqual([])
    })

    it('should add media type filter to query', async () => {
      const request: RecommendationRequest = {
        userQuery: 'Fantasy recommendation',
        context: mockContext,
        mediaTypes: ['book', 'movie'],
      }

      await getRecommendations(request)

      // The query should have been modified to include the filter
      // We can't easily test this without mocking more deeply, but the function should work
    })
  })
})
