import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import {
  getAllTropes,
  getTropesByCategory,
  getUserTropePreferences,
  getBlacklistedTropes,
  getLovedTropes,
  updateTropePreference,
  countTropesByPreference,
} from "@/lib/db"
import type { TropePreference } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/tropes - Get tropes and user preferences
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const preferencesOnly = searchParams.get("preferences") === "true"
    const blacklisted = searchParams.get("blacklisted") === "true"
    const loved = searchParams.get("loved") === "true"

    // Get blacklisted tropes only
    if (blacklisted) {
      const tropes = await getBlacklistedTropes(env.DB)
      return NextResponse.json({ tropes })
    }

    // Get loved tropes only
    if (loved) {
      const tropes = await getLovedTropes(env.DB)
      return NextResponse.json({ tropes })
    }

    // Get user preferences only
    if (preferencesOnly) {
      const preferences = await getUserTropePreferences(env.DB)
      const counts = await countTropesByPreference(env.DB)
      return NextResponse.json({ preferences, counts })
    }

    // Get all tropes (optionally filtered by category)
    const [tropes, preferences, counts] = await Promise.all([
      category ? getTropesByCategory(env.DB, category) : getAllTropes(env.DB),
      getUserTropePreferences(env.DB),
      countTropesByPreference(env.DB),
    ])

    // Create a map of preferences for easy lookup
    const preferencesMap = new Map(
      preferences.map((p) => [p.trope_id, p.preference])
    )

    // Add preference to each trope
    const tropesWithPreferences = tropes.map((trope) => ({
      ...trope,
      preference: preferencesMap.get(trope.id) || "neutral",
    }))

    return NextResponse.json({
      tropes: tropesWithPreferences,
      counts,
    })
  } catch (error) {
    console.error("Error fetching tropes:", error)
    return NextResponse.json({
      tropes: [],
      counts: {
        love: 0,
        like: 0,
        neutral: 0,
        dislike: 0,
        blacklist: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// PATCH /api/tropes - Update trope preference
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { tropeId, preference } = body as {
      tropeId: number
      preference: TropePreference
    }

    if (!tropeId || !preference) {
      return NextResponse.json(
        { error: "tropeId and preference are required" },
        { status: 400 }
      )
    }

    const validPreferences: TropePreference[] = ["love", "like", "neutral", "dislike", "blacklist"]
    if (!validPreferences.includes(preference)) {
      return NextResponse.json(
        { error: "Invalid preference value" },
        { status: 400 }
      )
    }

    await updateTropePreference(env.DB, tropeId, preference)

    return NextResponse.json({
      success: true,
      tropeId,
      preference,
    })
  } catch (error) {
    console.error("Error updating trope preference:", error)
    return NextResponse.json(
      { error: "Failed to update preference" },
      { status: 500 }
    )
  }
}
