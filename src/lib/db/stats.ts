/**
 * Database helpers pour les statistiques
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface StatsData {
  books: {
    total: number
    read: number
    reading: number
    toRead: number
    pagesRead: number
    avgRating: number | null
  }
  movies: {
    total: number
    watched: number
    toWatch: number
    avgRating: number | null
  }
  shows: {
    total: number
    watched: number
    watching: number
    toWatch: number
    avgRating: number | null
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

    // Goals for current year
    db.prepare(`
      SELECT books_goal, movies_goal, shows_goal
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
  ])

  return {
    books: {
      total: (bookStats?.total as number) || 0,
      read: (bookStats?.read as number) || 0,
      reading: (bookStats?.reading as number) || 0,
      toRead: (bookStats?.to_read as number) || 0,
      pagesRead: (pagesRead?.total_pages as number) || 0,
      avgRating: bookStats?.avg_rating as number | null,
    },
    movies: {
      total: (movieStats?.total as number) || 0,
      watched: (movieStats?.watched as number) || 0,
      toWatch: (movieStats?.to_watch as number) || 0,
      avgRating: movieStats?.avg_rating as number | null,
    },
    shows: {
      total: (showStats?.total as number) || 0,
      watched: (showStats?.watched as number) || 0,
      watching: (showStats?.watching as number) || 0,
      toWatch: (showStats?.to_watch as number) || 0,
      avgRating: showStats?.avg_rating as number | null,
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
  }
}

// Récupérer ou créer les objectifs
export async function getGoals(
  db: D1Database,
  year: number
): Promise<{ books: number; movies: number; shows: number }> {
  const goals = await db
    .prepare('SELECT books_goal, movies_goal, shows_goal FROM goals WHERE year = ?')
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
  const now = new Date().toISOString()

  await db
    .prepare(`
      INSERT INTO goals (year, books_goal, movies_goal, shows_goal, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(year) DO UPDATE SET
        books_goal = COALESCE(excluded.books_goal, goals.books_goal),
        movies_goal = COALESCE(excluded.movies_goal, goals.movies_goal),
        shows_goal = COALESCE(excluded.shows_goal, goals.shows_goal),
        updated_at = excluded.updated_at
    `)
    .bind(
      year,
      goals.books ?? null,
      goals.movies ?? null,
      goals.shows ?? null,
      now,
      now
    )
    .run()
}
