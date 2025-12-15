/**
 * Unit tests for src/lib/db/movies.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import {
  getUserMovies,
  getUserMovie,
  getMovieFromCache,
  cacheMovie,
  addMovieToLibrary,
  updateMovieStatus,
  removeMovieFromLibrary,
  countMoviesByStatus,
} from '@/lib/db/movies'
import type { D1Database } from '@cloudflare/workers-types'
import type { Movie } from '@/types'

describe('Movies Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getUserMovies', () => {
    it('should return empty array when no movies in library', async () => {
      const movies = await getUserMovies(db)
      expect(movies).toEqual([])
    })

    it('should return all movies with their metadata', async () => {
      seedMockDatabase({
        movies: [
          testData.movie({ id: '12345', title: 'Inception' }),
          testData.movie({ id: '67890', title: 'The Matrix' }),
        ],
        user_movies: [
          testData.userMovie({ movie_id: '12345', status: 'watched' }),
          testData.userMovie({ id: 2, movie_id: '67890', status: 'to_watch' }),
        ],
      })

      const movies = await getUserMovies(db)

      expect(movies).toHaveLength(2)
    })
  })

  describe('getUserMovie', () => {
    it('should return a specific movie by ID', async () => {
      seedMockDatabase({
        movies: [
          testData.movie({ id: '12345', title: 'Pulp Fiction', director: 'Quentin Tarantino' }),
        ],
        user_movies: [
          testData.userMovie({ movie_id: '12345', rating: 5 }),
        ],
      })

      const movie = await getUserMovie(db, '12345')

      expect(movie).toBeDefined()
      expect(movie?.title).toBe('Pulp Fiction')
      expect(movie?.director).toBe('Quentin Tarantino')
      expect(movie?.rating).toBe(5)
    })

    it('should return null for non-existent movie', async () => {
      const movie = await getUserMovie(db, 'nonexistent')
      expect(movie).toBeNull()
    })
  })

  describe('getMovieFromCache', () => {
    it('should return cached movie metadata', async () => {
      seedMockDatabase({
        movies: [
          testData.movie({ id: '12345', title: 'Cached Movie', runtime: 148 }),
        ],
      })

      const movie = await getMovieFromCache(db, '12345')

      expect(movie).toBeDefined()
      expect(movie?.title).toBe('Cached Movie')
      expect(movie?.runtime).toBe(148)
    })

    it('should return null if movie not in cache', async () => {
      const movie = await getMovieFromCache(db, 'notcached')
      expect(movie).toBeNull()
    })
  })

  describe('cacheMovie', () => {
    it('should cache a new movie', async () => {
      const movie: Movie = {
        id: '99999',
        title: 'New Movie',
        director: 'New Director',
        poster_url: 'https://example.com/poster.jpg',
        backdrop_url: 'https://example.com/backdrop.jpg',
        description: 'An amazing movie',
        runtime: 120,
        release_date: '2024-07-15',
        genres: ['Sci-Fi', 'Action'],
      }

      await cacheMovie(db, movie)

      const cached = await getMovieFromCache(db, '99999')
      expect(cached).toBeDefined()
      expect(cached?.title).toBe('New Movie')
    })
  })

  describe('addMovieToLibrary', () => {
    it('should add a movie with default status', async () => {
      seedMockDatabase({
        movies: [testData.movie({ id: '12345' })],
      })

      await addMovieToLibrary(db, '12345')

      const movie = await getUserMovie(db, '12345')
      expect(movie).toBeDefined()
      expect(movie?.status).toBe('to_watch')
    })

    it('should add a movie with specified status', async () => {
      seedMockDatabase({
        movies: [testData.movie({ id: '12345' })],
      })

      await addMovieToLibrary(db, '12345', 'watched')

      const movie = await getUserMovie(db, '12345')
      expect(movie?.status).toBe('watched')
    })
  })

  describe('updateMovieStatus', () => {
    it('should update movie status', async () => {
      seedMockDatabase({
        movies: [testData.movie({ id: '12345' })],
        user_movies: [testData.userMovie({ movie_id: '12345', status: 'to_watch' })],
      })

      await updateMovieStatus(db, '12345', 'watched')

      const movie = await getUserMovie(db, '12345')
      expect(movie?.status).toBe('watched')
    })

    it('should set watched_at when status becomes watched', async () => {
      seedMockDatabase({
        movies: [testData.movie({ id: '12345' })],
        user_movies: [testData.userMovie({ movie_id: '12345', status: 'to_watch', watched_at: null })],
      })

      await updateMovieStatus(db, '12345', 'watched')

      const movie = await getUserMovie(db, '12345')
      expect(movie?.watched_at).toBeDefined()
    })
  })

  describe('removeMovieFromLibrary', () => {
    it('should remove a movie from the library', async () => {
      seedMockDatabase({
        movies: [testData.movie({ id: '12345' })],
        user_movies: [testData.userMovie({ movie_id: '12345' })],
      })

      await removeMovieFromLibrary(db, '12345')

      const movie = await getUserMovie(db, '12345')
      expect(movie).toBeNull()
    })
  })

  describe('countMoviesByStatus', () => {
    it('should return zero counts when library is empty', async () => {
      const counts = await countMoviesByStatus(db)

      expect(counts.all).toBe(0)
      expect(counts.watched).toBe(0)
      expect(counts.to_watch).toBe(0)
    })

    it('should count movies by status correctly', async () => {
      seedMockDatabase({
        user_movies: [
          testData.userMovie({ status: 'watched' }),
          testData.userMovie({ id: 2, movie_id: '2', status: 'watched' }),
          testData.userMovie({ id: 3, movie_id: '3', status: 'watched' }),
          testData.userMovie({ id: 4, movie_id: '4', status: 'to_watch' }),
          testData.userMovie({ id: 5, movie_id: '5', status: 'to_watch' }),
          testData.userMovie({ id: 6, movie_id: '6', status: 'blacklist' }),
        ],
      })

      const counts = await countMoviesByStatus(db)

      expect(counts.all).toBe(6)
      expect(counts.watched).toBe(3)
      expect(counts.to_watch).toBe(2)
      expect(counts.blacklist).toBe(1)
    })
  })
})
