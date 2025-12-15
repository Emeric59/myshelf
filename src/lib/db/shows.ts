/**
 * Database helpers pour les séries
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Show, UserShow, ShowStatus } from '@/types'

// Récupérer toutes les séries de l'utilisateur
export async function getUserShows(db: D1Database): Promise<(UserShow & Show)[]> {
  const result = await db
    .prepare(`
      SELECT
        us.*,
        s.title,
        s.creator,
        s.poster_url,
        s.backdrop_url,
        s.description,
        s.first_air_date,
        s.genres,
        s.total_seasons,
        s.total_episodes,
        s.status as show_status
      FROM user_shows us
      JOIN shows s ON us.show_id = s.id
      ORDER BY us.updated_at DESC
    `)
    .all()

  return result.results as unknown as (UserShow & Show)[]
}

// Récupérer une série par ID
export async function getUserShow(
  db: D1Database,
  showId: string
): Promise<(UserShow & Show) | null> {
  const result = await db
    .prepare(`
      SELECT
        us.*,
        s.title,
        s.creator,
        s.poster_url,
        s.backdrop_url,
        s.description,
        s.first_air_date,
        s.genres,
        s.total_seasons,
        s.total_episodes,
        s.status as show_status
      FROM user_shows us
      JOIN shows s ON us.show_id = s.id
      WHERE us.show_id = ?
    `)
    .bind(showId)
    .first()

  return result as (UserShow & Show) | null
}

// Vérifier si une série existe dans le cache
export async function getShowFromCache(
  db: D1Database,
  showId: string
): Promise<Show | null> {
  const result = await db
    .prepare('SELECT * FROM shows WHERE id = ?')
    .bind(showId)
    .first()

  return result as Show | null
}

// Ajouter une série au cache
export async function cacheShow(db: D1Database, show: Show): Promise<void> {
  await db
    .prepare(`
      INSERT OR REPLACE INTO shows
        (id, title, creator, poster_url, backdrop_url, description, first_air_date, genres, total_seasons, total_episodes, status, tmdb_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      show.id,
      show.title,
      show.creator || null,
      show.poster_url || null,
      show.backdrop_url || null,
      show.description || null,
      show.first_air_date || null,
      show.genres ? JSON.stringify(show.genres) : null,
      show.total_seasons || null,
      show.total_episodes || null,
      show.status || null,
      show.tmdb_id || show.id
    )
    .run()
}

// Ajouter une série à la bibliothèque utilisateur
export async function addShowToLibrary(
  db: D1Database,
  showId: string,
  status: ShowStatus = 'to_watch'
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      INSERT INTO user_shows (show_id, status, current_season, current_episode, created_at, updated_at)
      VALUES (?, ?, 1, 0, ?, ?)
      ON CONFLICT(show_id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at
    `)
    .bind(showId, status, now, now)
    .run()
}

// Mettre à jour le statut d'une série
export async function updateShowStatus(
  db: D1Database,
  showId: string,
  status: ShowStatus
): Promise<void> {
  const now = new Date().toISOString()
  const startedAt = status === 'watching' ? now : null
  const finishedAt = status === 'watched' ? now : null

  await db
    .prepare(`
      UPDATE user_shows
      SET status = ?,
          started_at = COALESCE(?, started_at),
          finished_at = COALESCE(?, finished_at),
          updated_at = ?
      WHERE show_id = ?
    `)
    .bind(status, startedAt, finishedAt, now, showId)
    .run()
}

// Mettre à jour la progression
export async function updateShowProgress(
  db: D1Database,
  showId: string,
  currentSeason: number,
  currentEpisode: number
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      UPDATE user_shows
      SET current_season = ?, current_episode = ?, updated_at = ?
      WHERE show_id = ?
    `)
    .bind(currentSeason, currentEpisode, now, showId)
    .run()
}

// Supprimer une série de la bibliothèque
export async function removeShowFromLibrary(
  db: D1Database,
  showId: string
): Promise<void> {
  await db
    .prepare('DELETE FROM user_shows WHERE show_id = ?')
    .bind(showId)
    .run()
}

// Compter les séries par statut
export async function countShowsByStatus(
  db: D1Database
): Promise<Record<ShowStatus | 'all', number>> {
  const result = await db
    .prepare(`
      SELECT status, COUNT(*) as count
      FROM user_shows
      GROUP BY status
    `)
    .all()

  const counts: Record<ShowStatus | 'all', number> = {
    all: 0,
    to_watch: 0,
    watching: 0,
    watched: 0,
    paused: 0,
    abandoned: 0,
    blacklist: 0,
  }

  for (const row of result.results as { status: ShowStatus; count: number }[]) {
    counts[row.status] = row.count
    counts.all += row.count
  }

  return counts
}
