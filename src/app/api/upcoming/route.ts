import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getShow } from "@/lib/api"
import {
  getShowsWithUpcomingEpisodes,
  getShowsNeedingRefresh,
  updateShowNextEpisode,
  getActiveShows,
} from "@/lib/db"
import type { UpcomingRelease, NextEpisodeInfo } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

/**
 * GET /api/upcoming - Get upcoming releases
 * Query params:
 * - refresh: "true" to force refresh from TMDB (slower)
 */
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get("refresh") === "true"

    // If force refresh requested, update data from TMDB first
    if (forceRefresh) {
      await refreshUpcomingData(env.DB)
    } else {
      // Check if we have shows needing refresh and do it in the background
      // For now, we'll do a quick refresh of shows that need it
      const showsNeedingRefresh = await getShowsNeedingRefresh(env.DB)
      if (showsNeedingRefresh.length > 0) {
        // Refresh up to 5 shows per request to avoid timeout
        await refreshShowsData(env.DB, showsNeedingRefresh.slice(0, 5))
      }
    }

    // Get upcoming shows from DB
    const upcomingShows = await getShowsWithUpcomingEpisodes(env.DB)

    // Group by month for easier display
    const grouped = groupByMonth(upcomingShows)

    return NextResponse.json({
      upcoming: upcomingShows,
      grouped,
      total: upcomingShows.length,
    })
  } catch (error) {
    console.error("Error fetching upcoming releases:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming releases", upcoming: [], grouped: {}, total: 0 },
      { status: 500 }
    )
  }
}

/**
 * POST /api/upcoming/refresh - Force refresh all upcoming data
 */
export async function POST() {
  try {
    const { env } = getRequestContext()

    const refreshedCount = await refreshUpcomingData(env.DB)

    return NextResponse.json({
      success: true,
      refreshed: refreshedCount,
    })
  } catch (error) {
    console.error("Error refreshing upcoming data:", error)
    return NextResponse.json(
      { error: "Failed to refresh upcoming data" },
      { status: 500 }
    )
  }
}

/**
 * Refresh upcoming data for all active shows
 */
async function refreshUpcomingData(db: D1Database): Promise<number> {
  const activeShows = await getActiveShows(db)

  // Only refresh shows that are "Returning Series" or have unknown status
  const showsToRefresh = activeShows
    .filter((s) => !s.tmdb_status || s.tmdb_status === "Returning Series")
    .map((s) => s.show_id)

  await refreshShowsData(db, showsToRefresh)

  return showsToRefresh.length
}

/**
 * Refresh TMDB data for specific shows
 */
async function refreshShowsData(db: D1Database, showIds: string[]): Promise<void> {
  // Fetch TMDB data in parallel (max 5 at a time to avoid rate limits)
  const batchSize = 5
  for (let i = 0; i < showIds.length; i += batchSize) {
    const batch = showIds.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (showId) => {
        try {
          const tmdbShow = await getShow(showId)

          const nextEpisode: NextEpisodeInfo | null = tmdbShow.next_episode_to_air
            ? {
                air_date: tmdbShow.next_episode_to_air.air_date,
                episode_number: tmdbShow.next_episode_to_air.episode_number,
                season_number: tmdbShow.next_episode_to_air.season_number,
                name: tmdbShow.next_episode_to_air.name,
              }
            : null

          await updateShowNextEpisode(db, showId, nextEpisode)
        } catch (error) {
          console.error(`Error refreshing show ${showId}:`, error)
        }
      })
    )
  }
}

/**
 * Group releases by month
 */
function groupByMonth(
  releases: UpcomingRelease[]
): Record<string, UpcomingRelease[]> {
  const grouped: Record<string, UpcomingRelease[]> = {}

  for (const release of releases) {
    const date = new Date(release.release_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    grouped[monthKey].push(release)
  }

  return grouped
}

// Type import for D1Database
type D1Database = import("@cloudflare/workers-types").D1Database
