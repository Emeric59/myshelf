import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getMovie, normalizeMovie } from "@/lib/api"
import {
  getUserMovies,
  getUserMovie,
  cacheMovie,
  addMovieToLibrary,
  updateMovieStatus,
  updateMovieRating,
  removeMovieFromLibrary,
  countMoviesByStatus,
} from "@/lib/db"
import type { MovieStatus, Movie } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/movies - List user's movies or get single movie
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const status = searchParams.get("status") as MovieStatus | null

    // If ID is provided, return single movie
    if (id) {
      const movie = await getUserMovie(env.DB, id)
      return NextResponse.json(movie)
    }

    const [movies, counts] = await Promise.all([
      getUserMovies(env.DB),
      countMoviesByStatus(env.DB),
    ])

    // Filter by status if provided
    const filteredMovies = status
      ? movies.filter((m) => m.status === status)
      : movies

    return NextResponse.json({
      movies: filteredMovies,
      total: filteredMovies.length,
      counts,
    })
  } catch (error) {
    console.error("Error fetching movies:", error)
    return NextResponse.json({
      movies: [],
      total: 0,
      counts: {
        all: 0,
        to_watch: 0,
        watched: 0,
        blacklist: 0,
      },
    })
  }
}

// POST /api/movies - Add a movie to library
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { id, status = "to_watch" } = body as {
      id: string
      status?: MovieStatus
    }

    if (!id) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      )
    }

    // Fetch movie details from TMDB
    const tmdbMovie = await getMovie(id)
    const normalized = normalizeMovie(tmdbMovie)

    // Build movie object
    const movie: Movie = {
      id,
      tmdb_id: id,
      title: normalized.title,
      original_title: normalized.original_title,
      director: normalized.director,
      cast_members: normalized.cast_members,
      poster_url: normalized.poster_url,
      backdrop_url: normalized.backdrop_url,
      description: normalized.description,
      runtime: normalized.runtime,
      release_date: normalized.release_date,
      genres: normalized.genres,
      language: normalized.language,
      average_rating: normalized.average_rating,
      ratings_count: normalized.ratings_count,
    }

    // Save to D1 database
    await cacheMovie(env.DB, movie)
    await addMovieToLibrary(env.DB, id, status)

    return NextResponse.json({
      success: true,
      movie,
      status,
    })
  } catch (error) {
    console.error("Error adding movie:", error)
    return NextResponse.json(
      { error: "Failed to add movie" },
      { status: 500 }
    )
  }
}

// PATCH /api/movies - Update movie status or rating
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { id, status, rating } = body as { id: string; status?: MovieStatus; rating?: number }

    if (!id) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      )
    }

    if (status) {
      await updateMovieStatus(env.DB, id, status)
    }

    if (rating !== undefined) {
      await updateMovieRating(env.DB, id, rating)
    }

    return NextResponse.json({
      success: true,
      id,
      status,
      rating,
    })
  } catch (error) {
    console.error("Error updating movie:", error)
    return NextResponse.json(
      { error: "Failed to update movie" },
      { status: 500 }
    )
  }
}

// DELETE /api/movies - Remove movie from library
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      )
    }

    await removeMovieFromLibrary(env.DB, id)

    return NextResponse.json({
      success: true,
      id,
    })
  } catch (error) {
    console.error("Error removing movie:", error)
    return NextResponse.json(
      { error: "Failed to remove movie" },
      { status: 500 }
    )
  }
}
