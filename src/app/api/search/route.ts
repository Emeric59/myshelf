import { NextRequest, NextResponse } from "next/server"
import {
  searchBooks,
  normalizeSearchResult,
  searchMovies,
  searchShows,
  getImageUrl,
} from "@/lib/api"
import type { SearchResult, MediaType } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const type = searchParams.get("type") as MediaType | null

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    )
  }

  const results: SearchResult[] = []

  try {
    // Search based on type filter
    const searchPromises: Promise<void>[] = []

    // Books
    if (!type || type === "book") {
      searchPromises.push(
        searchBooks(query, { limit: 10 })
          .then((data) => {
            const bookResults: SearchResult[] = data.docs.map((doc) => {
              const normalized = normalizeSearchResult(doc)
              return {
                type: "book" as const,
                id: normalized.id,
                title: normalized.title,
                subtitle: normalized.author,
                image_url: normalized.cover_url,
                year: normalized.published_date,
                rating: undefined, // Open Library doesn't provide ratings in search
              }
            })
            results.push(...bookResults)
          })
          .catch((err) => {
            console.error("Book search error:", err)
          })
      )
    }

    // Movies
    if (!type || type === "movie") {
      searchPromises.push(
        searchMovies(query)
          .then((data) => {
            const movieResults: SearchResult[] = data.results.slice(0, 10).map((movie) => ({
              type: "movie" as const,
              id: movie.id.toString(),
              title: movie.title,
              subtitle: movie.release_date?.slice(0, 4),
              image_url: getImageUrl(movie.poster_path, "w185"),
              year: movie.release_date?.slice(0, 4),
              rating: movie.vote_average,
            }))
            results.push(...movieResults)
          })
          .catch((err) => {
            console.error("Movie search error:", err)
          })
      )
    }

    // Shows
    if (!type || type === "show") {
      searchPromises.push(
        searchShows(query)
          .then((data) => {
            const showResults: SearchResult[] = data.results.slice(0, 10).map((show) => ({
              type: "show" as const,
              id: show.id.toString(),
              title: show.name,
              subtitle: show.first_air_date?.slice(0, 4),
              image_url: getImageUrl(show.poster_path, "w185"),
              year: show.first_air_date?.slice(0, 4),
              rating: show.vote_average,
            }))
            results.push(...showResults)
          })
          .catch((err) => {
            console.error("Show search error:", err)
          })
      )
    }

    await Promise.all(searchPromises)

    return NextResponse.json({
      results,
      query,
      type,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
