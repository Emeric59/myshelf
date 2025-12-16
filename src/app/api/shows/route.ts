import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getShow, normalizeShow } from "@/lib/api"
import {
  getUserShows,
  getUserShow,
  cacheShow,
  addShowToLibrary,
  updateShowStatus,
  updateShowProgress,
  updateShowRating,
  removeShowFromLibrary,
  countShowsByStatus,
} from "@/lib/db"
import type { ShowStatus, Show } from "@/types"

// GET /api/shows - List user's shows or get single show
export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const status = searchParams.get("status") as ShowStatus | null

    // If ID is provided, return single show
    if (id) {
      const show = await getUserShow(env.DB, id)
      return NextResponse.json(show)
    }

    const [shows, counts] = await Promise.all([
      getUserShows(env.DB),
      countShowsByStatus(env.DB),
    ])

    // Filter by status if provided
    const filteredShows = status
      ? shows.filter((s) => s.status === status)
      : shows

    return NextResponse.json({
      shows: filteredShows,
      total: filteredShows.length,
      counts,
    })
  } catch (error) {
    console.error("Error fetching shows:", error)
    return NextResponse.json({
      shows: [],
      total: 0,
      counts: {
        all: 0,
        to_watch: 0,
        watching: 0,
        watched: 0,
        paused: 0,
        abandoned: 0,
        blacklist: 0,
      },
    })
  }
}

// POST /api/shows - Add a show to library
export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const body = await request.json()
    const { id, status = "to_watch" } = body as {
      id: string
      status?: ShowStatus
    }

    if (!id) {
      return NextResponse.json(
        { error: "Show ID is required" },
        { status: 400 }
      )
    }

    // Fetch show details from TMDB
    const tmdbShow = await getShow(id)
    const normalized = normalizeShow(tmdbShow)

    // Build show object
    const show: Show = {
      id,
      tmdb_id: id,
      title: normalized.title,
      original_title: normalized.original_title,
      creator: normalized.creators?.[0],
      cast_members: normalized.cast_members,
      poster_url: normalized.poster_url,
      backdrop_url: normalized.backdrop_url,
      description: normalized.description,
      first_air_date: normalized.first_air_date,
      last_air_date: normalized.last_air_date,
      status: normalized.status,
      total_seasons: normalized.seasons_count,
      total_episodes: normalized.episodes_count,
      episode_runtime: normalized.episode_runtime,
      genres: normalized.genres,
      language: normalized.language,
      average_rating: normalized.average_rating,
      ratings_count: normalized.ratings_count,
    }

    // Save to D1 database
    await cacheShow(env.DB, show)
    await addShowToLibrary(env.DB, id, status)

    return NextResponse.json({
      success: true,
      show,
      status,
    })
  } catch (error) {
    console.error("Error adding show:", error)
    return NextResponse.json(
      { error: "Failed to add show" },
      { status: 500 }
    )
  }
}

// PATCH /api/shows - Update show status, progress, or rating
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const body = await request.json()
    const { id, status, rating, current_season, current_episode } = body as {
      id: string
      status?: ShowStatus
      rating?: number
      current_season?: number
      current_episode?: number
    }

    if (!id) {
      return NextResponse.json(
        { error: "Show ID is required" },
        { status: 400 }
      )
    }

    // Update status if provided
    if (status) {
      await updateShowStatus(env.DB, id, status)
    }

    // Update rating if provided
    if (rating !== undefined) {
      await updateShowRating(env.DB, id, rating)
    }

    // Update progress if provided
    if (current_season !== undefined && current_episode !== undefined) {
      await updateShowProgress(env.DB, id, current_season, current_episode)
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      rating,
      current_season,
      current_episode,
    })
  } catch (error) {
    console.error("Error updating show:", error)
    return NextResponse.json(
      { error: "Failed to update show" },
      { status: 500 }
    )
  }
}

// DELETE /api/shows - Remove show from library
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Show ID is required" },
        { status: 400 }
      )
    }

    await removeShowFromLibrary(env.DB, id)

    return NextResponse.json({
      success: true,
      id,
    })
  } catch (error) {
    console.error("Error removing show:", error)
    return NextResponse.json(
      { error: "Failed to remove show" },
      { status: 500 }
    )
  }
}
