import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getReview, upsertReview, deleteReview, getRecentReviews } from "@/lib/db"
import type { MediaType } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/reviews - Get review for a specific media or list recent reviews
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const mediaType = searchParams.get("mediaType") as MediaType | null
    const mediaId = searchParams.get("mediaId")
    const recent = searchParams.get("recent")

    // Get recent reviews
    if (recent) {
      const limit = parseInt(recent) || 10
      const reviews = await getRecentReviews(env.DB, limit)
      return NextResponse.json({ reviews })
    }

    // Get specific review
    if (!mediaType || !mediaId) {
      return NextResponse.json(
        { error: "mediaType and mediaId are required" },
        { status: 400 }
      )
    }

    const review = await getReview(env.DB, mediaType, mediaId)

    return NextResponse.json({
      review,
    })
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json({
      review: null,
    })
  }
}

// POST /api/reviews - Create or update a review
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { mediaType, mediaId, rating, reviewText, likedAspects, dislikedAspects } = body as {
      mediaType: MediaType
      mediaId: string
      rating: number
      reviewText?: string
      likedAspects?: string[]
      dislikedAspects?: string[]
    }

    if (!mediaType || !mediaId || rating === undefined) {
      return NextResponse.json(
        { error: "mediaType, mediaId and rating are required" },
        { status: 400 }
      )
    }

    if (rating < 0 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 0 and 5" },
        { status: 400 }
      )
    }

    await upsertReview(env.DB, {
      mediaType,
      mediaId,
      rating,
      reviewText,
      likedAspects,
      dislikedAspects,
    })

    return NextResponse.json({
      success: true,
      mediaType,
      mediaId,
      rating,
    })
  } catch (error) {
    console.error("Error saving review:", error)
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const mediaType = searchParams.get("mediaType") as MediaType | null
    const mediaId = searchParams.get("mediaId")

    if (!mediaType || !mediaId) {
      return NextResponse.json(
        { error: "mediaType and mediaId are required" },
        { status: 400 }
      )
    }

    await deleteReview(env.DB, mediaType, mediaId)

    return NextResponse.json({
      success: true,
      mediaType,
      mediaId,
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
}
