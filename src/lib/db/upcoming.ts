/**
 * Database helpers pour les prochaines sorties
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { UpcomingRelease, NextEpisodeInfo } from '@/types'

// Interface pour les résultats DB des séries avec prochain épisode
interface ShowWithUpcoming {
  show_id: string
  title: string
  poster_url: string | null
  status: string
  show_status: string // TMDB status (Returning Series, etc.)
  next_episode_air_date: string | null
  next_episode_season: number | null
  next_episode_number: number | null
  next_episode_name: string | null
  upcoming_updated_at: string | null
}

/**
 * Récupérer les séries avec des prochains épisodes
 */
export async function getShowsWithUpcomingEpisodes(
  db: D1Database
): Promise<UpcomingRelease[]> {
  const result = await db
    .prepare(`
      SELECT
        us.show_id,
        s.title,
        s.poster_url,
        us.status,
        s.status as show_status,
        s.next_episode_air_date,
        s.next_episode_season,
        s.next_episode_number,
        s.next_episode_name,
        s.upcoming_updated_at
      FROM user_shows us
      JOIN shows s ON us.show_id = s.id
      WHERE us.status IN ('watching', 'to_watch', 'paused')
        AND s.next_episode_air_date IS NOT NULL
        AND s.next_episode_air_date >= date('now')
      ORDER BY s.next_episode_air_date ASC
    `)
    .all()

  return (result.results as unknown as ShowWithUpcoming[]).map((row) => ({
    media_type: 'show' as const,
    media_id: row.show_id,
    title: row.title,
    poster_url: row.poster_url || undefined,
    release_date: row.next_episode_air_date!,
    release_info: formatEpisodeInfo(
      row.next_episode_season,
      row.next_episode_number,
      row.next_episode_name
    ),
    status: row.status,
  }))
}

/**
 * Récupérer les séries qui ont besoin d'un rafraîchissement TMDB
 * (pas de données ou données vieilles de plus de 24h)
 */
export async function getShowsNeedingRefresh(
  db: D1Database,
  maxAge: number = 24 * 60 * 60 * 1000 // 24h en ms
): Promise<string[]> {
  const cutoff = new Date(Date.now() - maxAge).toISOString()

  const result = await db
    .prepare(`
      SELECT us.show_id
      FROM user_shows us
      JOIN shows s ON us.show_id = s.id
      WHERE us.status IN ('watching', 'to_watch', 'paused')
        AND (s.status = 'Returning Series' OR s.status IS NULL)
        AND (s.upcoming_updated_at IS NULL OR s.upcoming_updated_at < ?)
      LIMIT 20
    `)
    .bind(cutoff)
    .all()

  return (result.results as { show_id: string }[]).map((r) => r.show_id)
}

/**
 * Mettre à jour les infos du prochain épisode pour une série
 */
export async function updateShowNextEpisode(
  db: D1Database,
  showId: string,
  nextEpisode: NextEpisodeInfo | null
): Promise<void> {
  const now = new Date().toISOString()

  if (nextEpisode && nextEpisode.air_date) {
    await db
      .prepare(`
        UPDATE shows
        SET next_episode_air_date = ?,
            next_episode_season = ?,
            next_episode_number = ?,
            next_episode_name = ?,
            upcoming_updated_at = ?
        WHERE id = ?
      `)
      .bind(
        nextEpisode.air_date,
        nextEpisode.season_number,
        nextEpisode.episode_number,
        nextEpisode.name || null,
        now,
        showId
      )
      .run()
  } else {
    // Pas de prochain épisode - mettre à jour le timestamp mais effacer les données
    await db
      .prepare(`
        UPDATE shows
        SET next_episode_air_date = NULL,
            next_episode_season = NULL,
            next_episode_number = NULL,
            next_episode_name = NULL,
            upcoming_updated_at = ?
        WHERE id = ?
      `)
      .bind(now, showId)
      .run()
  }
}

/**
 * Récupérer toutes les séries "Returning Series" de l'utilisateur
 * (pour le rafraîchissement initial)
 */
export async function getActiveShows(
  db: D1Database
): Promise<{ show_id: string; tmdb_status: string | null }[]> {
  const result = await db
    .prepare(`
      SELECT us.show_id, s.status as tmdb_status
      FROM user_shows us
      JOIN shows s ON us.show_id = s.id
      WHERE us.status IN ('watching', 'to_watch', 'paused')
    `)
    .all()

  return result.results as { show_id: string; tmdb_status: string | null }[]
}

/**
 * Formater les infos d'épisode pour l'affichage
 */
function formatEpisodeInfo(
  season: number | null,
  episode: number | null,
  name: string | null
): string {
  if (!season || !episode) return 'Prochain épisode'

  const epCode = `S${season}E${episode}`
  return name ? `${epCode} - ${name}` : epCode
}
