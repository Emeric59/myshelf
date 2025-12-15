/**
 * Unit tests for src/lib/db/shows.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockD1, seedMockDatabase, resetMockDatabase, testData } from '../mocks/d1'
import {
  getUserShows,
  getUserShow,
  getShowFromCache,
  cacheShow,
  addShowToLibrary,
  updateShowStatus,
  updateShowProgress,
  removeShowFromLibrary,
  countShowsByStatus,
} from '@/lib/db/shows'
import type { D1Database } from '@cloudflare/workers-types'
import type { Show } from '@/types'

describe('Shows Database Helpers', () => {
  let db: D1Database

  beforeEach(() => {
    db = createMockD1()
    resetMockDatabase()
  })

  describe('getUserShows', () => {
    it('should return empty array when no shows in library', async () => {
      const shows = await getUserShows(db)
      expect(shows).toEqual([])
    })

    it('should return all shows with their metadata', async () => {
      seedMockDatabase({
        shows: [
          testData.show({ id: '67890', title: 'Breaking Bad' }),
          testData.show({ id: '11111', title: 'The Office' }),
        ],
        user_shows: [
          testData.userShow({ show_id: '67890', status: 'watched' }),
          testData.userShow({ id: 2, show_id: '11111', status: 'watching' }),
        ],
      })

      const shows = await getUserShows(db)

      expect(shows).toHaveLength(2)
    })

    it('should return shows ordered by updated_at DESC', async () => {
      seedMockDatabase({
        shows: [
          testData.show({ id: '1', title: 'Old Show' }),
          testData.show({ id: '2', title: 'Recent Show' }),
        ],
        user_shows: [
          testData.userShow({ show_id: '1', updated_at: '2024-01-01T00:00:00Z' }),
          testData.userShow({ id: 2, show_id: '2', updated_at: '2024-12-01T00:00:00Z' }),
        ],
      })

      const shows = await getUserShows(db)

      // Most recently updated should be first
      expect(shows[0].show_id).toBe('2')
    })
  })

  describe('getUserShow', () => {
    it('should return a specific show by ID', async () => {
      seedMockDatabase({
        shows: [
          testData.show({ id: '67890', title: 'Stranger Things' }),
        ],
        user_shows: [
          testData.userShow({ show_id: '67890', current_season: 4, current_episode: 2 }),
        ],
      })

      const show = await getUserShow(db, '67890')

      expect(show).toBeDefined()
      expect(show?.title).toBe('Stranger Things')
      expect(show?.current_season).toBe(4)
      expect(show?.current_episode).toBe(2)
    })

    it('should return null for non-existent show', async () => {
      const show = await getUserShow(db, 'nonexistent')
      expect(show).toBeNull()
    })
  })

  describe('getShowFromCache', () => {
    it('should return cached show metadata', async () => {
      seedMockDatabase({
        shows: [
          testData.show({ id: '67890', title: 'Game of Thrones', seasons_count: 8 }),
        ],
      })

      const show = await getShowFromCache(db, '67890')

      expect(show).toBeDefined()
      expect(show?.title).toBe('Game of Thrones')
      expect(show?.seasons_count).toBe(8)
    })

    it('should return null if show not in cache', async () => {
      const show = await getShowFromCache(db, 'notcached')
      expect(show).toBeNull()
    })
  })

  describe('cacheShow', () => {
    it('should cache a new show', async () => {
      const show: Show = {
        id: '12345',
        title: 'New Show',
        creator: 'Test Creator',
        poster_url: 'https://example.com/poster.jpg',
        backdrop_url: 'https://example.com/backdrop.jpg',
        description: 'A great new show',
        first_air_date: '2024-01-15',
        genres: ['Drama', 'Thriller'],
        total_seasons: 2,
        total_episodes: 16,
        status: 'Returning Series',
      }

      await cacheShow(db, show)

      const cached = await getShowFromCache(db, '12345')
      expect(cached).toBeDefined()
      expect(cached?.title).toBe('New Show')
    })

    it('should update existing cached show', async () => {
      seedMockDatabase({
        shows: [
          testData.show({ id: '67890', title: 'Original Title', seasons_count: 2 }),
        ],
      })

      await cacheShow(db, {
        id: '67890',
        title: 'Updated Title',
        total_seasons: 3,
      } as Show)

      const cached = await getShowFromCache(db, '67890')
      expect(cached?.title).toBe('Updated Title')
      expect(cached?.total_seasons).toBe(3)
    })
  })

  describe('addShowToLibrary', () => {
    it('should add a show with default status', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
      })

      await addShowToLibrary(db, '67890')

      const show = await getUserShow(db, '67890')
      expect(show).toBeDefined()
      expect(show?.status).toBe('to_watch')
    })

    it('should add a show with specified status', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
      })

      await addShowToLibrary(db, '67890', 'watching')

      const show = await getUserShow(db, '67890')
      expect(show?.status).toBe('watching')
    })
  })

  describe('updateShowStatus', () => {
    it('should update show status', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
        user_shows: [testData.userShow({ show_id: '67890', status: 'watching' })],
      })

      await updateShowStatus(db, '67890', 'watched')

      const show = await getUserShow(db, '67890')
      expect(show?.status).toBe('watched')
    })

    it('should set started_at when status becomes watching', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
        user_shows: [testData.userShow({ show_id: '67890', status: 'to_watch', started_at: null })],
      })

      await updateShowStatus(db, '67890', 'watching')

      const show = await getUserShow(db, '67890')
      expect(show?.started_at).toBeDefined()
    })

    it('should set finished_at when status becomes watched', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
        user_shows: [testData.userShow({ show_id: '67890', status: 'watching', finished_at: null })],
      })

      await updateShowStatus(db, '67890', 'watched')

      const show = await getUserShow(db, '67890')
      expect(show?.finished_at).toBeDefined()
    })
  })

  describe('updateShowProgress', () => {
    it('should update current season and episode', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
        user_shows: [testData.userShow({ show_id: '67890', current_season: 1, current_episode: 1 })],
      })

      await updateShowProgress(db, '67890', 2, 5)

      const show = await getUserShow(db, '67890')
      expect(show?.current_season).toBe(2)
      expect(show?.current_episode).toBe(5)
    })
  })

  describe('removeShowFromLibrary', () => {
    it('should remove a show from the library', async () => {
      seedMockDatabase({
        shows: [testData.show({ id: '67890' })],
        user_shows: [testData.userShow({ show_id: '67890' })],
      })

      await removeShowFromLibrary(db, '67890')

      const show = await getUserShow(db, '67890')
      expect(show).toBeNull()
    })
  })

  describe('countShowsByStatus', () => {
    it('should return zero counts when library is empty', async () => {
      const counts = await countShowsByStatus(db)

      expect(counts.all).toBe(0)
      expect(counts.watching).toBe(0)
      expect(counts.watched).toBe(0)
      expect(counts.to_watch).toBe(0)
    })

    it('should count shows by status correctly', async () => {
      seedMockDatabase({
        user_shows: [
          testData.userShow({ status: 'watching' }),
          testData.userShow({ id: 2, show_id: '2', status: 'watching' }),
          testData.userShow({ id: 3, show_id: '3', status: 'watched' }),
          testData.userShow({ id: 4, show_id: '4', status: 'to_watch' }),
          testData.userShow({ id: 5, show_id: '5', status: 'to_watch' }),
          testData.userShow({ id: 6, show_id: '6', status: 'to_watch' }),
          testData.userShow({ id: 7, show_id: '7', status: 'paused' }),
          testData.userShow({ id: 8, show_id: '8', status: 'abandoned' }),
        ],
      })

      const counts = await countShowsByStatus(db)

      expect(counts.all).toBe(8)
      expect(counts.watching).toBe(2)
      expect(counts.watched).toBe(1)
      expect(counts.to_watch).toBe(3)
      expect(counts.paused).toBe(1)
      expect(counts.abandoned).toBe(1)
    })
  })
})
