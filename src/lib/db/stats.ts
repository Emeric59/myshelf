/**
 * Database helpers pour les statistiques
 */

import type { D1Database } from '@cloudflare/workers-types'

// Temps de lecture par page en minutes (configurable)
export const READING_MINUTES_PER_PAGE = 2

export interface StatsData {
  books: {
    total: number
    read: number
    reading: number
    toRead: number
    pagesRead: number
    avgRating: number | null
    totalReadingMinutes: number // Temps total de lecture estimé
  }
  movies: {
    total: number
    watched: number
    toWatch: number
    avgRating: number | null
    totalWatchMinutes: number // Temps total de visionnage
  }
  shows: {
    total: number
    watched: number
    watching: number
    toWatch: number
    avgRating: number | null
    totalWatchMinutes: number // Temps total de visionnage
    episodesWatched: number // Nombre d'épisodes vus
  }
  currentYear: {
    booksRead: number
    moviesWatched: number
    showsWatched: number
  }
  goals: {
    books: number
    movies: number
    shows: number
  } | null
  totalTimeMinutes: number // Temps total tous médias confondus
}

// Récupérer toutes les statistiques
export async function getStats(db: D1Database): Promise<StatsData> {
  const currentYear = new Date().getFullYear()
  const yearStart = `${currentYear}-01-01`
  const yearEnd = `${currentYear}-12-31`

  // Exécuter toutes les requêtes en parallèle
  const [
    bookStats,
    movieStats,
    showStats,
    booksThisYear,
    moviesThisYear,
    showsThisYear,
    goals,
    pagesRead,
    moviesWatchTime,
    episodesWatched,
  ] = await Promise.all([
    // Books stats
    db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
        SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END) as reading,
        SUM(CASE WHEN status = 'to_read' THEN 1 ELSE 0 END) as to_read,
        AVG(rating) as avg_rating
      FROM user_books
    `).first(),

    // Movies stats
    db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'watched' THEN 1 ELSE 0 END) as watched,
        SUM(CASE WHEN status = 'to_watch' THEN 1 ELSE 0 END) as to_watch,
        AVG(rating) as avg_rating
      FROM user_movies
    `).first(),

    // Shows stats
    db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'watched' THEN 1 ELSE 0 END) as watched,
        SUM(CASE WHEN status = 'watching' THEN 1 ELSE 0 END) as watching,
        SUM(CASE WHEN status = 'to_watch' THEN 1 ELSE 0 END) as to_watch,
        AVG(rating) as avg_rating
      FROM user_shows
    `).first(),

    // Books read this year
    db.prepare(`
      SELECT COUNT(*) as count
      FROM user_books
      WHERE status = 'read'
      AND finished_at >= ? AND finished_at <= ?
    `).bind(yearStart, yearEnd).first(),

    // Movies watched this year
    db.prepare(`
      SELECT COUNT(*) as count
      FROM user_movies
      WHERE status = 'watched'
      AND watched_at >= ? AND watched_at <= ?
    `).bind(yearStart, yearEnd).first(),

    // Shows watched this year
    db.prepare(`
      SELECT COUNT(*) as count
      FROM user_shows
      WHERE status = 'watched'
      AND finished_at >= ? AND finished_at <= ?
    `).bind(yearStart, yearEnd).first(),

    // Goals for current year (pivot the rows)
    db.prepare(`
      SELECT
        MAX(CASE WHEN media_type = 'book' THEN target END) as books_goal,
        MAX(CASE WHEN media_type = 'movie' THEN target END) as movies_goal,
        MAX(CASE WHEN media_type = 'show' THEN target END) as shows_goal
      FROM goals
      WHERE year = ?
    `).bind(currentYear).first(),

    // Total pages read
    db.prepare(`
      SELECT SUM(b.page_count) as total_pages
      FROM user_books ub
      JOIN books b ON ub.book_id = b.id
      WHERE ub.status = 'read'
    `).first(),

    // Total watch time for movies (in minutes)
    db.prepare(`
      SELECT SUM(m.runtime) as total_minutes
      FROM user_movies um
      JOIN movies m ON um.movie_id = m.id
      WHERE um.status = 'watched'
    `).first(),

    // Count episodes watched (from watched_episodes table)
    // Join with shows to get episode_runtime, fallback to 45 min if NULL
    db.prepare(`
      SELECT
        COUNT(*) as total_episodes,
        SUM(COALESCE(s.episode_runtime, 45)) as total_minutes
      FROM watched_episodes we
      JOIN shows s ON we.show_id = s.id
    `).first(),
  ])

  // Calculate time totals
  const totalPagesRead = (pagesRead?.total_pages as number) || 0
  const bookReadingMinutes = totalPagesRead * READING_MINUTES_PER_PAGE
  const movieWatchMinutes = (moviesWatchTime?.total_minutes as number) || 0
  const showWatchMinutes = (episodesWatched?.total_minutes as number) || 0
  const totalEpisodesWatched = (episodesWatched?.total_episodes as number) || 0

  return {
    books: {
      total: (bookStats?.total as number) || 0,
      read: (bookStats?.read as number) || 0,
      reading: (bookStats?.reading as number) || 0,
      toRead: (bookStats?.to_read as number) || 0,
      pagesRead: totalPagesRead,
      avgRating: bookStats?.avg_rating as number | null,
      totalReadingMinutes: bookReadingMinutes,
    },
    movies: {
      total: (movieStats?.total as number) || 0,
      watched: (movieStats?.watched as number) || 0,
      toWatch: (movieStats?.to_watch as number) || 0,
      avgRating: movieStats?.avg_rating as number | null,
      totalWatchMinutes: movieWatchMinutes,
    },
    shows: {
      total: (showStats?.total as number) || 0,
      watched: (showStats?.watched as number) || 0,
      watching: (showStats?.watching as number) || 0,
      toWatch: (showStats?.to_watch as number) || 0,
      avgRating: showStats?.avg_rating as number | null,
      totalWatchMinutes: showWatchMinutes,
      episodesWatched: totalEpisodesWatched,
    },
    currentYear: {
      booksRead: (booksThisYear?.count as number) || 0,
      moviesWatched: (moviesThisYear?.count as number) || 0,
      showsWatched: (showsThisYear?.count as number) || 0,
    },
    goals: goals ? {
      books: (goals.books_goal as number) || 0,
      movies: (goals.movies_goal as number) || 0,
      shows: (goals.shows_goal as number) || 0,
    } : null,
    totalTimeMinutes: bookReadingMinutes + movieWatchMinutes + showWatchMinutes,
  }
}

// Récupérer ou créer les objectifs
export async function getGoals(
  db: D1Database,
  year: number
): Promise<{ books: number; movies: number; shows: number }> {
  const goals = await db
    .prepare(`
      SELECT
        MAX(CASE WHEN media_type = 'book' THEN target END) as books_goal,
        MAX(CASE WHEN media_type = 'movie' THEN target END) as movies_goal,
        MAX(CASE WHEN media_type = 'show' THEN target END) as shows_goal
      FROM goals
      WHERE year = ?
    `)
    .bind(year)
    .first()

  if (goals) {
    return {
      books: (goals.books_goal as number) || 0,
      movies: (goals.movies_goal as number) || 0,
      shows: (goals.shows_goal as number) || 0,
    }
  }

  return { books: 0, movies: 0, shows: 0 }
}

// Mettre à jour les objectifs
export async function updateGoals(
  db: D1Database,
  year: number,
  goals: { books?: number; movies?: number; shows?: number }
): Promise<void> {
  // Insert or update each goal type separately
  const updates: Promise<unknown>[] = []

  if (goals.books !== undefined) {
    updates.push(
      db.prepare(`
        INSERT INTO goals (year, media_type, target)
        VALUES (?, 'book', ?)
        ON CONFLICT(year, media_type) DO UPDATE SET target = excluded.target
      `).bind(year, goals.books).run()
    )
  }

  if (goals.movies !== undefined) {
    updates.push(
      db.prepare(`
        INSERT INTO goals (year, media_type, target)
        VALUES (?, 'movie', ?)
        ON CONFLICT(year, media_type) DO UPDATE SET target = excluded.target
      `).bind(year, goals.movies).run()
    )
  }

  if (goals.shows !== undefined) {
    updates.push(
      db.prepare(`
        INSERT INTO goals (year, media_type, target)
        VALUES (?, 'show', ?)
        ON CONFLICT(year, media_type) DO UPDATE SET target = excluded.target
      `).bind(year, goals.shows).run()
    )
  }

  await Promise.all(updates)
}
