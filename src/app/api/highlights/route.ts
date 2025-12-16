import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import {
  getAllHighlights,
  getHighlightById,
  getHighlightsByBook,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  searchHighlights,
} from "@/lib/db"

// GET /api/highlights - Get all highlights or filter by book
export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get("bookId")
    const highlightId = searchParams.get("id")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get specific highlight by ID
    if (highlightId) {
      const highlight = await getHighlightById(env.DB, parseInt(highlightId))
      if (!highlight) {
        return NextResponse.json(
          { error: "Highlight not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({ highlight })
    }

    // Search highlights
    if (search) {
      const highlights = await searchHighlights(env.DB, search, limit)
      return NextResponse.json({ highlights, total: highlights.length })
    }

    // Get highlights for a specific book
    if (bookId) {
      const highlights = await getHighlightsByBook(env.DB, bookId)
      return NextResponse.json({ highlights, total: highlights.length })
    }

    // Get all highlights with pagination
    const { highlights, total } = await getAllHighlights(env.DB, {
      limit,
      offset,
    })

    return NextResponse.json({
      highlights,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching highlights:", error)
    return NextResponse.json(
      { error: "Failed to fetch highlights" },
      { status: 500 }
    )
  }
}

// POST /api/highlights - Create a new highlight
export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const body = await request.json()
    const { bookId, content, pageNumber, chapter, personalNote } = body as {
      bookId: string
      content: string
      pageNumber?: number
      chapter?: string
      personalNote?: string
    }

    if (!bookId || !content) {
      return NextResponse.json(
        { error: "bookId and content are required" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    const highlight = await createHighlight(env.DB, {
      bookId,
      content: content.trim(),
      pageNumber,
      chapter,
      personalNote,
    })

    return NextResponse.json({
      success: true,
      highlight,
    })
  } catch (error) {
    console.error("Error creating highlight:", error)
    return NextResponse.json(
      { error: "Failed to create highlight" },
      { status: 500 }
    )
  }
}

// PATCH /api/highlights - Update a highlight
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const body = await request.json()
    const { id, content, pageNumber, chapter, personalNote } = body as {
      id: number
      content?: string
      pageNumber?: number
      chapter?: string
      personalNote?: string
    }

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      )
    }

    if (content !== undefined && content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    const highlight = await updateHighlight(env.DB, id, {
      content: content?.trim(),
      pageNumber,
      chapter,
      personalNote,
    })

    if (!highlight) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      highlight,
    })
  } catch (error) {
    console.error("Error updating highlight:", error)
    return NextResponse.json(
      { error: "Failed to update highlight" },
      { status: 500 }
    )
  }
}

// DELETE /api/highlights - Delete a highlight
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getCloudflareContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      )
    }

    await deleteHighlight(env.DB, parseInt(id))

    return NextResponse.json({
      success: true,
      id: parseInt(id),
    })
  } catch (error) {
    console.error("Error deleting highlight:", error)
    return NextResponse.json(
      { error: "Failed to delete highlight" },
      { status: 500 }
    )
  }
}
