import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getStats } from "@/lib/db"

// GET /api/stats - Get all statistics
export async function GET() {
  try {
    const { env } = getCloudflareContext()
    const stats = await getStats(env.DB)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({
      books: {
        total: 0,
        read: 0,
        reading: 0,
        toRead: 0,
        pagesRead: 0,
        avgRating: null,
        totalReadingMinutes: 0,
      },
      movies: {
        total: 0,
        watched: 0,
        toWatch: 0,
        avgRating: null,
        totalWatchMinutes: 0,
      },
      shows: {
        total: 0,
        watched: 0,
        watching: 0,
        toWatch: 0,
        avgRating: null,
        totalWatchMinutes: 0,
        episodesWatched: 0,
      },
      currentYear: {
        booksRead: 0,
        moviesWatched: 0,
        showsWatched: 0,
      },
      goals: null,
      totalTimeMinutes: 0,
    })
  }
}
