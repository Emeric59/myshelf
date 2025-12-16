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

    // Total pages read (finished books: all pages, reading books: current_page)
    db.prepare(`
      SELECT SUM(
        CASE
          WHEN ub.status = 'read' THEN b.page_count
          WHEN ub.status = 'reading' THEN COALESCE(ub.current_page, 0)
          ELSE 0
        END
      ) as total_pages
      FROM user_books ub
      JOIN books b ON ub.book_id = b.id
      WHERE ub.status IN ('read', 'reading')
    `).first(),

    // Total watch time for movies (in minutes)
    db.prepare(`
      SELECT SUM(m.runtime) as total_minutes
      FROM user_movies um
      JOIN movies m ON um.movie_id = m.id
      WHERE um.status = 'watched'
    `).first(),

    // Count episodes watched and sum their stored runtimes
    // Fallback to 45 min if runtime is NULL (old episodes before migration)
    db.prepare(`
      SELECT
        COUNT(*) as total_episodes,
        SUM(COALESCE(we.runtime, 45)) as total_minutes
      FROM watched_episodes we
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

// Types pour les données de graphiques
export interface ChartDataPoint {
  period: string // Format: "2025-01" pour mois, "2025-W01" pour semaine
  label: string // Label lisible: "Jan 2025" ou "Sem 1"
  books: number
  movies: number
  shows: number
  total: number
  // Temps en minutes
  booksMinutes: number
  moviesMinutes: number
  showsMinutes: number
  totalMinutes: number
  // Pages lues (livres seulement)
  pagesRead: number
}

export interface ChartStatsData {
  data: ChartDataPoint[]
  totals: {
    books: number
    movies: number
    shows: number
    total: number
    totalMinutes: number
    pagesRead: number
  }
}

// Récupérer les statistiques pour les graphiques
export async function getChartStats(
  db: D1Database,
  startDate: string,
  endDate: string,
  granularity: 'week' | 'month'
): Promise<ChartStatsData> {
  // Générer tous les périodes entre startDate et endDate
  const periods = generatePeriods(startDate, endDate, granularity)

  // Requêtes pour chaque type de média
  const [booksData, moviesData, showsData, booksPages, moviesTime, showsTime] = await Promise.all([
    // Nombre de livres terminés par période
    db.prepare(`
      SELECT
        ${granularity === 'month'
          ? "strftime('%Y-%m', finished_at)"
          : "strftime('%Y-W%W', finished_at)"
        } as period,
        COUNT(*) as count
      FROM user_books
      WHERE status = 'read'
        AND finished_at >= ? AND finished_at <= ?
      GROUP BY period
    `).bind(startDate, endDate).all(),

    // Nombre de films vus par période
    db.prepare(`
      SELECT
        ${granularity === 'month'
          ? "strftime('%Y-%m', watched_at)"
          : "strftime('%Y-W%W', watched_at)"
        } as period,
        COUNT(*) as count
      FROM user_movies
      WHERE status = 'watched'
        AND watched_at >= ? AND watched_at <= ?
      GROUP BY period
    `).bind(startDate, endDate).all(),

    // Nombre de séries terminées par période
    db.prepare(`
      SELECT
        ${granularity === 'month'
          ? "strftime('%Y-%m', finished_at)"
          : "strftime('%Y-W%W', finished_at)"
        } as period,
        COUNT(*) as count
      FROM user_shows
      WHERE status = 'watched'
        AND finished_at >= ? AND finished_at <= ?
      GROUP BY period
    `).bind(startDate, endDate).all(),

    // Pages lues par période (livres terminés)
    db.prepare(`
      SELECT
        ${granularity === 'month'
          ? "strftime('%Y-%m', ub.finished_at)"
          : "strftime('%Y-W%W', ub.finished_at)"
        } as period,
        SUM(COALESCE(b.page_count, 0)) as pages
      FROM user_books ub
      JOIN books b ON ub.book_id = b.id
      WHERE ub.status = 'read'
        AND ub.finished_at >= ? AND ub.finished_at <= ?
      GROUP BY period
    `).bind(startDate, endDate).all(),

    // Temps de visionnage films par période
    db.prepare(`
      SELECT
        ${granularity === 'month'
          ? "strftime('%Y-%m', um.watched_at)"
          : "strftime('%Y-W%W', um.watched_at)"
        } as period,
        SUM(COALESCE(m.runtime, 0)) as minutes
      FROM user_movies um
      JOIN movies m ON um.movie_id = m.id
      WHERE um.status = 'watched'
        AND um.watched_at >= ? AND um.watched_at <= ?
      GROUP BY period
    `).bind(startDate, endDate).all(),

    // Temps de visionnage séries par période (basé sur episodes watched_at)
    db.prepare(`
      SELECT
        ${granularity === 'month'
          ? "strftime('%Y-%m', we.watched_at)"
          : "strftime('%Y-W%W', we.watched_at)"
        } as period,
        SUM(COALESCE(we.runtime, 45)) as minutes
      FROM watched_episodes we
      WHERE we.watched_at >= ? AND we.watched_at <= ?
      GROUP BY period
    `).bind(startDate, endDate).all(),
  ])

  // Convertir les résultats en maps pour un accès rapide
  const booksMap = new Map(
    (booksData.results as Array<{ period: string; count: number }>)
      .map(r => [r.period, r.count])
  )
  const moviesMap = new Map(
    (moviesData.results as Array<{ period: string; count: number }>)
      .map(r => [r.period, r.count])
  )
  const showsMap = new Map(
    (showsData.results as Array<{ period: string; count: number }>)
      .map(r => [r.period, r.count])
  )
  const booksPagesMap = new Map(
    (booksPages.results as Array<{ period: string; pages: number }>)
      .map(r => [r.period, r.pages])
  )
  const moviesTimeMap = new Map(
    (moviesTime.results as Array<{ period: string; minutes: number }>)
      .map(r => [r.period, r.minutes])
  )
  const showsTimeMap = new Map(
    (showsTime.results as Array<{ period: string; minutes: number }>)
      .map(r => [r.period, r.minutes])
  )

  // Construire les données pour chaque période
  const data: ChartDataPoint[] = periods.map(({ period, label }) => {
    const books = booksMap.get(period) || 0
    const movies = moviesMap.get(period) || 0
    const shows = showsMap.get(period) || 0
    const pagesRead = booksPagesMap.get(period) || 0
    const moviesMinutes = moviesTimeMap.get(period) || 0
    const showsMinutes = showsTimeMap.get(period) || 0
    const booksMinutes = pagesRead * READING_MINUTES_PER_PAGE

    return {
      period,
      label,
      books,
      movies,
      shows,
      total: books + movies + shows,
      booksMinutes,
      moviesMinutes,
      showsMinutes,
      totalMinutes: booksMinutes + moviesMinutes + showsMinutes,
      pagesRead,
    }
  })

  // Calculer les totaux
  const totals = data.reduce(
    (acc, d) => ({
      books: acc.books + d.books,
      movies: acc.movies + d.movies,
      shows: acc.shows + d.shows,
      total: acc.total + d.total,
      totalMinutes: acc.totalMinutes + d.totalMinutes,
      pagesRead: acc.pagesRead + d.pagesRead,
    }),
    { books: 0, movies: 0, shows: 0, total: 0, totalMinutes: 0, pagesRead: 0 }
  )

  return { data, totals }
}

// Générer toutes les périodes entre deux dates
function generatePeriods(
  startDate: string,
  endDate: string,
  granularity: 'week' | 'month'
): Array<{ period: string; label: string }> {
  const periods: Array<{ period: string; label: string }> = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

  if (granularity === 'month') {
    // Parcourir mois par mois
    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      periods.push({
        period: `${year}-${month}`,
        label: `${monthNames[current.getMonth()]} ${year}`,
      })
      current.setMonth(current.getMonth() + 1)
    }
  } else {
    // Parcourir semaine par semaine
    // Trouver le premier lundi >= startDate
    const current = new Date(start)
    const dayOfWeek = current.getDay()
    const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek)
    current.setDate(current.getDate() + daysToMonday)

    while (current <= end) {
      const year = current.getFullYear()
      const weekNum = getWeekNumber(current)
      periods.push({
        period: `${year}-W${String(weekNum).padStart(2, '0')}`,
        label: `Sem ${weekNum}`,
      })
      current.setDate(current.getDate() + 7)
    }
  }

  return periods
}

// Obtenir le numéro de semaine ISO
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
