/**
 * Unit tests for src/lib/api/tmdb.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  searchMovies,
  searchShows,
  getMovie,
  getShow,
  getImageUrl,
  extractDirector,
  extractCast,
  extractFrenchProviders,
  normalizeMovie,
  normalizeShow,
  type TMDBMovie,
  type TMDBShow,
  type TMDBCredits,
  type TMDBWatchProviders,
} from '@/lib/api/tmdb'

// Mock data
const mockMovieSearchResponse = {
  page: 1,
  results: [
    {
      id: 603,
      title: 'The Matrix',
      original_title: 'The Matrix',
      overview: 'A computer hacker learns about the true nature of reality.',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
      release_date: '1999-03-30',
      runtime: 136,
      vote_average: 8.2,
      vote_count: 22500,
      genre_ids: [28, 878],
      original_language: 'en',
    },
  ],
  total_pages: 1,
  total_results: 1,
}

const mockShowSearchResponse = {
  page: 1,
  results: [
    {
      id: 1396,
      name: 'Breaking Bad',
      original_name: 'Breaking Bad',
      overview: 'A high school chemistry teacher turned meth producer.',
      poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
      first_air_date: '2008-01-20',
      vote_average: 8.9,
      vote_count: 12000,
      genre_ids: [18, 80],
      original_language: 'en',
    },
  ],
  total_pages: 1,
  total_results: 1,
}

const mockMovieDetails: TMDBMovie & { credits: TMDBCredits; 'watch/providers': TMDBWatchProviders } = {
  id: 603,
  title: 'The Matrix',
  original_title: 'The Matrix',
  overview: 'A computer hacker learns about the true nature of reality.',
  poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
  release_date: '1999-03-30',
  runtime: 136,
  vote_average: 8.2,
  vote_count: 22500,
  genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science-Fiction' }],
  original_language: 'en',
  credits: {
    cast: [
      { id: 6384, name: 'Keanu Reeves', character: 'Neo', order: 0 },
      { id: 2975, name: 'Laurence Fishburne', character: 'Morpheus', order: 1 },
      { id: 530, name: 'Carrie-Anne Moss', character: 'Trinity', order: 2 },
      { id: 1331, name: 'Hugo Weaving', character: 'Agent Smith', order: 3 },
      { id: 9206, name: 'Joe Pantoliano', character: 'Cypher', order: 4 },
      { id: 123, name: 'Extra Actor', character: 'Extra', order: 5 },
    ],
    crew: [
      { id: 9340, name: 'Lana Wachowski', job: 'Director', department: 'Directing' },
      { id: 9339, name: 'Lilly Wachowski', job: 'Writer', department: 'Writing' },
    ],
  },
  'watch/providers': {
    results: {
      FR: {
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/logo.png' },
        ],
        rent: [
          { provider_id: 2, provider_name: 'Apple TV', logo_path: '/apple.png' },
        ],
        buy: [
          { provider_id: 3, provider_name: 'Google Play', logo_path: '/google.png' },
        ],
      },
    },
  },
}

const mockShowDetails: TMDBShow & { credits: TMDBCredits; 'watch/providers': TMDBWatchProviders } = {
  id: 1396,
  name: 'Breaking Bad',
  original_name: 'Breaking Bad',
  overview: 'A high school chemistry teacher turned meth producer.',
  poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
  first_air_date: '2008-01-20',
  last_air_date: '2013-09-29',
  status: 'Ended',
  vote_average: 8.9,
  vote_count: 12000,
  genres: [{ id: 18, name: 'Drama' }, { id: 80, name: 'Crime' }],
  number_of_seasons: 5,
  number_of_episodes: 62,
  episode_run_time: [45, 47],
  created_by: [{ id: 17419, name: 'Vince Gilligan' }],
  original_language: 'en',
  credits: {
    cast: [
      { id: 17419, name: 'Bryan Cranston', character: 'Walter White', order: 0 },
      { id: 17420, name: 'Aaron Paul', character: 'Jesse Pinkman', order: 1 },
    ],
    crew: [],
  },
  'watch/providers': {
    results: {
      FR: {
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/logo.png' },
        ],
      },
    },
  },
}

describe('TMDB API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchMovies', () => {
    it('should search for movies and return results', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieSearchResponse),
      } as Response)

      const result = await searchMovies('matrix')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      )
      expect(result.results).toHaveLength(1)
      expect(result.results[0].title).toBe('The Matrix')
    })

    it('should handle pagination', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieSearchResponse),
      } as Response)

      await searchMovies('action', 2)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
    })
  })

  describe('searchShows', () => {
    it('should search for TV shows and return results', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockShowSearchResponse),
      } as Response)

      const result = await searchShows('breaking bad')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/tv'),
        expect.any(Object)
      )
      expect(result.results).toHaveLength(1)
      expect(result.results[0].name).toBe('Breaking Bad')
    })
  })

  describe('getMovie', () => {
    it('should fetch movie details with credits and providers', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieDetails),
      } as Response)

      const movie = await getMovie(603)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/603'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('append_to_response=credits,watch/providers'),
        expect.any(Object)
      )
      expect(movie.title).toBe('The Matrix')
      expect(movie.credits).toBeDefined()
    })
  })

  describe('getShow', () => {
    it('should fetch show details with credits and providers', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockShowDetails),
      } as Response)

      const show = await getShow(1396)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tv/1396'),
        expect.any(Object)
      )
      expect(show.name).toBe('Breaking Bad')
      expect(show.number_of_seasons).toBe(5)
    })
  })

  describe('getImageUrl', () => {
    it('should generate correct poster URL', () => {
      const url = getImageUrl('/abc123.jpg', 'w500')
      expect(url).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg')
    })

    it('should return undefined for null path', () => {
      const url = getImageUrl(null)
      expect(url).toBeUndefined()
    })

    it('should default to w500 size', () => {
      const url = getImageUrl('/test.jpg')
      expect(url).toContain('/w500/')
    })
  })

  describe('extractDirector', () => {
    it('should extract director from credits', () => {
      const director = extractDirector(mockMovieDetails.credits)
      expect(director).toBe('Lana Wachowski')
    })

    it('should return undefined when no director found', () => {
      const director = extractDirector({ cast: [], crew: [] })
      expect(director).toBeUndefined()
    })
  })

  describe('extractCast', () => {
    it('should extract top 5 cast members by default', () => {
      const cast = extractCast(mockMovieDetails.credits)
      expect(cast).toHaveLength(5)
      expect(cast[0]).toBe('Keanu Reeves')
      expect(cast[4]).toBe('Joe Pantoliano')
    })

    it('should respect custom limit', () => {
      const cast = extractCast(mockMovieDetails.credits, 3)
      expect(cast).toHaveLength(3)
    })

    it('should return empty array when no cast', () => {
      const cast = extractCast({ cast: [], crew: [] })
      expect(cast).toEqual([])
    })
  })

  describe('extractFrenchProviders', () => {
    it('should extract French streaming providers', () => {
      const providers = extractFrenchProviders(mockMovieDetails['watch/providers'])

      expect(providers).toBeDefined()
      expect(providers?.flatrate).toContain('Netflix')
      expect(providers?.rent).toContain('Apple TV')
      expect(providers?.buy).toContain('Google Play')
    })

    it('should return undefined when no French providers', () => {
      const providers = extractFrenchProviders({ results: {} })
      expect(providers).toBeUndefined()
    })
  })

  describe('normalizeMovie', () => {
    it('should normalize TMDB movie to our Movie type', () => {
      const normalized = normalizeMovie(mockMovieDetails)

      expect(normalized.id).toBe('603')
      expect(normalized.title).toBe('The Matrix')
      expect(normalized.director).toBe('Lana Wachowski')
      expect(normalized.runtime).toBe(136)
      expect(normalized.genres).toContain('Action')
      expect(normalized.cast_members).toHaveLength(5)
      expect(normalized.streaming_providers?.flatrate).toContain('Netflix')
    })

    it('should handle missing original_title', () => {
      const movie = { ...mockMovieDetails, original_title: 'The Matrix' }
      const normalized = normalizeMovie(movie)
      expect(normalized.original_title).toBeUndefined()
    })
  })

  describe('normalizeShow', () => {
    it('should normalize TMDB show to our Show type', () => {
      const normalized = normalizeShow(mockShowDetails)

      expect(normalized.id).toBe('1396')
      expect(normalized.title).toBe('Breaking Bad')
      expect(normalized.creators).toContain('Vince Gilligan')
      expect(normalized.seasons_count).toBe(5)
      expect(normalized.episodes_count).toBe(62)
      expect(normalized.episode_runtime).toBe(45)
      expect(normalized.status).toBe('Ended')
      expect(normalized.genres).toContain('Drama')
    })
  })
})
