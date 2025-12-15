import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/dismissed - List all dismissed media
export async function GET() {
  try {
    const { env } = getRequestContext()
    const result = await env.DB.prepare(
      "SELECT * FROM dismissed_media ORDER BY dismissed_at DESC"
    ).all()

    return NextResponse.json({
      dismissed: result.results,
    })
  } catch (error) {
    console.error("Error fetching dismissed media:", error)
    return NextResponse.json(
      { error: "Failed to fetch dismissed media" },
      { status: 500 }
    )
  }
}

// POST /api/dismissed - Dismiss a media
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { mediaType, title, mediaId, reason, reasonDetail } = body as {
      mediaType: "book" | "movie" | "show"
      title: string
      mediaId?: string
      reason: "already_consumed" | "not_interested" | "other"
      reasonDetail?: string
    }

    if (!mediaType || !title || !reason) {
      return NextResponse.json(
        { error: "mediaType, title, and reason are required" },
        { status: 400 }
      )
    }

    await env.DB.prepare(`
      INSERT OR REPLACE INTO dismissed_media (media_type, title, media_id, reason, reason_detail)
      VALUES (?, ?, ?, ?, ?)
    `)
      .bind(mediaType, title, mediaId || null, reason, reasonDetail || null)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error dismissing media:", error)
    return NextResponse.json(
      { error: "Failed to dismiss media" },
      { status: 500 }
    )
  }
}

// DELETE /api/dismissed?id=X - Un-dismiss a media
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      )
    }

    await env.DB.prepare("DELETE FROM dismissed_media WHERE id = ?")
      .bind(id)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error un-dismissing media:", error)
    return NextResponse.json(
      { error: "Failed to un-dismiss media" },
      { status: 500 }
    )
  }
}
