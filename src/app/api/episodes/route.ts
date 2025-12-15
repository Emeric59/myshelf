import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getSeason } from "@/lib/api/tmdb"

export const runtime = "edge"

interface WatchedEpisode {
  show_id: string
  season_number: number
  episode_number: number
  watched_at: string
}

interface ShowSeason {
  show_id: string
  season_number: number
  name: string | null
  episode_count: number
}

/**
 * GET /api/episodes?showId=123
 * Get seasons and watched episodes for a show
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const showId = searchParams.get("showId")
  const seasonNumber = searchParams.get("season")

  if (!showId) {
    return NextResponse.json({ error: "showId is required" }, { status: 400 })
  }

  try {
    const { env } = getRequestContext()
    const db = env.DB

    // Get watched episodes for this show
    const watchedResult = await db
      .prepare(
        `SELECT show_id, season_number, episode_number, watched_at
         FROM watched_episodes
         WHERE show_id = ?
         ORDER BY season_number, episode_number`
      )
      .bind(showId)
      .all()

    const watchedEpisodes = watchedResult.results as unknown as WatchedEpisode[]

    // Get cached seasons info
    const seasonsResult = await db
      .prepare(
        `SELECT show_id, season_number, name, episode_count
         FROM show_seasons
         WHERE show_id = ?
         ORDER BY season_number`
      )
      .bind(showId)
      .all()

    const cachedSeasons = seasonsResult.results as unknown as ShowSeason[]

    // If requesting specific season details from TMDB
    if (seasonNumber) {
      const season = await getSeason(showId, parseInt(seasonNumber))

      // Cache the season info
      await db
        .prepare(
          `INSERT OR REPLACE INTO show_seasons (show_id, season_number, name, episode_count, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
        )
        .bind(showId, season.season_number, season.name, season.episode_count)
        .run()

      // Mark which episodes are watched
      const watchedInSeason = watchedEpisodes
        .filter((w) => w.season_number === parseInt(seasonNumber))
        .map((w) => w.episode_number)

      const episodesWithStatus = season.episodes?.map((ep) => ({
        ...ep,
        watched: watchedInSeason.includes(ep.episode_number),
      }))

      return NextResponse.json({
        season: {
          ...season,
          episodes: episodesWithStatus,
        },
        watchedCount: watchedInSeason.length,
        totalCount: season.episode_count,
      })
    }

    // Return summary of watched episodes per season
    const watchedBySeason: Record<number, number> = {}
    for (const ep of watchedEpisodes) {
      watchedBySeason[ep.season_number] = (watchedBySeason[ep.season_number] || 0) + 1
    }

    return NextResponse.json({
      showId,
      watchedEpisodes,
      watchedBySeason,
      cachedSeasons,
      totalWatched: watchedEpisodes.length,
    })
  } catch (error) {
    console.error("Error fetching episodes:", error)
    return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 })
  }
}

/**
 * POST /api/episodes
 * Mark episode(s) as watched
 * Body: { showId, seasonNumber, episodeNumber } or { showId, seasonNumber, upToEpisode }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      showId: string
      seasonNumber: number
      episodeNumber?: number
      upToEpisode?: number // Mark all episodes up to this one
    }

    const { showId, seasonNumber, episodeNumber, upToEpisode } = body

    if (!showId || !seasonNumber) {
      return NextResponse.json(
        { error: "showId and seasonNumber are required" },
        { status: 400 }
      )
    }

    const { env } = getRequestContext()
    const db = env.DB

    const now = new Date().toISOString()

    if (upToEpisode) {
      // Mark all episodes from 1 to upToEpisode as watched
      const statements = []
      for (let ep = 1; ep <= upToEpisode; ep++) {
        statements.push(
          db
            .prepare(
              `INSERT OR IGNORE INTO watched_episodes (show_id, season_number, episode_number, watched_at)
               VALUES (?, ?, ?, ?)`
            )
            .bind(showId, seasonNumber, ep, now)
        )
      }
      await db.batch(statements)
    } else if (episodeNumber) {
      // Mark single episode as watched
      await db
        .prepare(
          `INSERT OR IGNORE INTO watched_episodes (show_id, season_number, episode_number, watched_at)
           VALUES (?, ?, ?, ?)`
        )
        .bind(showId, seasonNumber, episodeNumber, now)
        .run()
    } else {
      return NextResponse.json(
        { error: "episodeNumber or upToEpisode is required" },
        { status: 400 }
      )
    }

    // Update user_shows progress
    await updateShowProgress(db, showId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking episode watched:", error)
    return NextResponse.json({ error: "Failed to mark episode" }, { status: 500 })
  }
}

/**
 * DELETE /api/episodes
 * Unmark episode(s) as watched
 * Body: { showId, seasonNumber, episodeNumber } or { showId, seasonNumber } to clear whole season
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json() as {
      showId: string
      seasonNumber: number
      episodeNumber?: number
    }

    const { showId, seasonNumber, episodeNumber } = body

    if (!showId || !seasonNumber) {
      return NextResponse.json(
        { error: "showId and seasonNumber are required" },
        { status: 400 }
      )
    }

    const { env } = getRequestContext()
    const db = env.DB

    if (episodeNumber) {
      // Remove single episode
      await db
        .prepare(
          `DELETE FROM watched_episodes
           WHERE show_id = ? AND season_number = ? AND episode_number = ?`
        )
        .bind(showId, seasonNumber, episodeNumber)
        .run()
    } else {
      // Remove all episodes in season
      await db
        .prepare(
          `DELETE FROM watched_episodes
           WHERE show_id = ? AND season_number = ?`
        )
        .bind(showId, seasonNumber)
        .run()
    }

    // Update user_shows progress
    await updateShowProgress(db, showId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unmarking episode:", error)
    return NextResponse.json({ error: "Failed to unmark episode" }, { status: 500 })
  }
}

/**
 * Update user_shows current_season and current_episode based on watched_episodes
 */
async function updateShowProgress(db: D1Database, showId: string) {
  // Get the highest watched episode
  const result = await db
    .prepare(
      `SELECT season_number, MAX(episode_number) as episode_number
       FROM watched_episodes
       WHERE show_id = ?
       GROUP BY season_number
       ORDER BY season_number DESC
       LIMIT 1`
    )
    .bind(showId)
    .first() as { season_number: number; episode_number: number } | null

  if (result) {
    await db
      .prepare(
        `UPDATE user_shows
         SET current_season = ?, current_episode = ?, updated_at = CURRENT_TIMESTAMP
         WHERE show_id = ?`
      )
      .bind(result.season_number, result.episode_number, showId)
      .run()
  } else {
    // No episodes watched, reset to 0
    await db
      .prepare(
        `UPDATE user_shows
         SET current_season = 1, current_episode = 0, updated_at = CURRENT_TIMESTAMP
         WHERE show_id = ?`
      )
      .bind(showId)
      .run()
  }
}

// Type declaration for D1Database (from Cloudflare Workers)
type D1Database = ReturnType<typeof getRequestContext>["env"]["DB"]
