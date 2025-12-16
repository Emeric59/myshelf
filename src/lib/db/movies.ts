/**
 * Database helpers pour les films
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Movie, UserMovie, MovieStatus } from '@/types'

// Récupérer tous les films de l'utilisateur
export async function getUserMovies(db: D1Database): Promise<(UserMovie & Movie)[]> {
  const result = await db
    .prepare(`
      SELECT
        um.*,
        m.title,
        m.director,
        m.poster_url,
        m.backdrop_url,
        m.description,
        m.runtime,
        m.release_date,
        m.genres
      FROM user_movies um
      JOIN movies m ON um.movie_id = m.id
      ORDER BY um.updated_at DESC
    `)
    .all()

  return result.results as unknown as (UserMovie & Movie)[]
}

// Récupérer un film par ID
export async function getUserMovie(
  db: D1Database,
  movieId: string
): Promise<(UserMovie & Movie) | null> {
  const result = await db
    .prepare(`
      SELECT
        um.*,
        m.title,
        m.director,
        m.poster_url,
        m.backdrop_url,
        m.description,
        m.runtime,
        m.release_date,
        m.genres
      FROM user_movies um
      JOIN movies m ON um.movie_id = m.id
      WHERE um.movie_id = ?
    `)
    .bind(movieId)
    .first()

  return result as (UserMovie & Movie) | null
}

// Vérifier si un film existe dans le cache
export async function getMovieFromCache(
  db: D1Database,
  movieId: string
): Promise<Movie | null> {
  const result = await db
    .prepare('SELECT * FROM movies WHERE id = ?')
    .bind(movieId)
    .first()

  return result as Movie | null
}

// Ajouter un film au cache
export async function cacheMovie(db: D1Database, movie: Movie): Promise<void> {
  await db
    .prepare(`
      INSERT OR REPLACE INTO movies
        (id, title, director, poster_url, backdrop_url, description, runtime, release_date, genres)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      movie.id,
      movie.title,
      movie.director || null,
      movie.poster_url || null,
      movie.backdrop_url || null,
      movie.description || null,
      movie.runtime || null,
      movie.release_date || null,
      movie.genres ? JSON.stringify(movie.genres) : null
    )
    .run()
}

// Ajouter un film à la bibliothèque utilisateur
export async function addMovieToLibrary(
  db: D1Database,
  movieId: string,
  status: MovieStatus = 'to_watch'
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      INSERT INTO user_movies (movie_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(movie_id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at
    `)
    .bind(movieId, status, now, now)
    .run()
}

// Mettre à jour le statut d'un film
export async function updateMovieStatus(
  db: D1Database,
  movieId: string,
  status: MovieStatus
): Promise<void> {
  const now = new Date().toISOString()
  const watchedAt = status === 'watched' ? now : null

  await db
    .prepare(`
      UPDATE user_movies
      SET status = ?,
          watched_at = COALESCE(?, watched_at),
          updated_at = ?
      WHERE movie_id = ?
    `)
    .bind(status, watchedAt, now, movieId)
    .run()
}

// Mettre à jour la note d'un film
export async function updateMovieRating(
  db: D1Database,
  movieId: string,
  rating: number
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      UPDATE user_movies
      SET rating = ?, updated_at = ?
      WHERE movie_id = ?
    `)
    .bind(rating, now, movieId)
    .run()
}

// Supprimer un film de la bibliothèque
export async function removeMovieFromLibrary(
  db: D1Database,
  movieId: string
): Promise<void> {
  await db
    .prepare('DELETE FROM user_movies WHERE movie_id = ?')
    .bind(movieId)
    .run()
}

// Compter les films par statut
export async function countMoviesByStatus(
  db: D1Database
): Promise<Record<MovieStatus | 'all', number>> {
  const result = await db
    .prepare(`
      SELECT status, COUNT(*) as count
      FROM user_movies
      GROUP BY status
    `)
    .all()

  const counts: Record<MovieStatus | 'all', number> = {
    all: 0,
    to_watch: 0,
    watched: 0,
    blacklist: 0,
  }

  for (const row of result.results as { status: MovieStatus; count: number }[]) {
    counts[row.status] = row.count
    counts.all += row.count
  }

  return counts
}

// Récupérer tous les IDs de films dans la bibliothèque (pour batch check)
export async function getLibraryMovieIds(db: D1Database): Promise<Set<string>> {
  const result = await db
    .prepare('SELECT movie_id FROM user_movies')
    .all()

  const ids = new Set<string>()
  for (const row of result.results) {
    ids.add(row.movie_id as string)
  }
  return ids
}
