import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getGoals, updateGoals } from "@/lib/db"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/goals - Get goals for a year
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get("year")
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    const goals = await getGoals(env.DB, year)

    return NextResponse.json({
      year,
      goals,
    })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({
      year: new Date().getFullYear(),
      goals: { books: 0, movies: 0, shows: 0 },
    })
  }
}

// POST /api/goals - Update goals for a year
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { year, books, movies, shows } = body as {
      year?: number
      books?: number
      movies?: number
      shows?: number
    }

    const targetYear = year || new Date().getFullYear()

    await updateGoals(env.DB, targetYear, { books, movies, shows })

    const updatedGoals = await getGoals(env.DB, targetYear)

    return NextResponse.json({
      success: true,
      year: targetYear,
      goals: updatedGoals,
    })
  } catch (error) {
    console.error("Error updating goals:", error)
    return NextResponse.json(
      { error: "Failed to update goals" },
      { status: 500 }
    )
  }
}
