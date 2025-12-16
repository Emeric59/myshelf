import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import {
  getAllWishlistItems,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/lib/db/wishlist"
import type { MediaType } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/wishlist - List all wishlist items
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const mediaType = searchParams.get("type") as MediaType | null

    const { items, total } = await getAllWishlistItems(env.DB, {
      mediaType: mediaType || undefined,
    })

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const {
      mediaType,
      externalId,
      title,
      subtitle,
      imageUrl,
      description,
      genres,
      reason,
    } = body as {
      mediaType: MediaType
      externalId?: string
      title: string
      subtitle?: string
      imageUrl?: string
      description?: string
      genres?: string[]
      reason?: string
    }

    if (!mediaType || !title) {
      return NextResponse.json(
        { error: "mediaType and title are required" },
        { status: 400 }
      )
    }

    // Check if already in wishlist
    const exists = await isInWishlist(env.DB, mediaType, title)
    if (exists) {
      return NextResponse.json(
        { error: "Already in wishlist" },
        { status: 409 }
      )
    }

    const item = await addToWishlist(env.DB, {
      mediaType,
      externalId,
      title,
      subtitle,
      imageUrl,
      description,
      genres,
      reason,
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist?id=X - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await removeFromWishlist(env.DB, parseInt(id, 10))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}
