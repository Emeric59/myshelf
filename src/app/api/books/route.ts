import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import {
  getWork,
  getWorkEditions,
  extractDescription,
  getCoverUrl,
  getAuthor,
} from "@/lib/api"
import {
  getUserBooks,
  cacheBook,
  addBookToLibrary,
  updateBookStatus,
  removeBookFromLibrary,
  countBooksByStatus,
} from "@/lib/db"
import type { BookStatus, Book } from "@/types"

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/books - List user's books
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as BookStatus | null

    const [books, counts] = await Promise.all([
      getUserBooks(env.DB),
      countBooksByStatus(env.DB),
    ])

    // Filter by status if provided
    const filteredBooks = status
      ? books.filter((b) => b.status === status)
      : books

    return NextResponse.json({
      books: filteredBooks,
      total: filteredBooks.length,
      counts,
    })
  } catch (error) {
    console.error("Error fetching books:", error)
    // Return empty array if DB not available (dev mode)
    return NextResponse.json({
      books: [],
      total: 0,
      counts: {
        all: 0,
        to_read: 0,
        reading: 0,
        read: 0,
        abandoned: 0,
        blacklist: 0,
      },
    })
  }
}

// POST /api/books - Add a book to library
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { id, status = "to_read" } = body as {
      id: string
      status?: BookStatus
    }

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    // Fetch book details from Open Library
    const [work, editions] = await Promise.all([
      getWork(id),
      getWorkEditions(id, 1),
    ])

    const edition = editions.entries?.[0]

    // Get author name if available
    let authorName: string | undefined
    if (work.authors?.[0]?.author?.key) {
      try {
        const author = await getAuthor(work.authors[0].author.key.replace("/authors/", ""))
        authorName = author.name
      } catch {
        // Ignore author fetch errors
      }
    }

    // Build book object
    const book: Book = {
      id,
      open_library_id: id,
      title: work.title,
      author: authorName,
      description: extractDescription(work.description),
      cover_url: work.covers?.[0]
        ? getCoverUrl("id", work.covers[0], "M")
        : edition?.covers?.[0]
          ? getCoverUrl("id", edition.covers[0], "M")
          : undefined,
      page_count: edition?.number_of_pages,
      published_date: work.first_publish_date,
      genres: work.subjects?.slice(0, 5),
      language: edition?.languages?.[0]?.key?.replace("/languages/", ""),
    }

    // Save to D1 database
    await cacheBook(env.DB, book)
    await addBookToLibrary(env.DB, id, status)

    return NextResponse.json({
      success: true,
      book,
      status,
    })
  } catch (error) {
    console.error("Error adding book:", error)
    return NextResponse.json(
      { error: "Failed to add book" },
      { status: 500 }
    )
  }
}

// PATCH /api/books - Update book status
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { id, status } = body as { id: string; status: BookStatus }

    if (!id || !status) {
      return NextResponse.json(
        { error: "Book ID and status are required" },
        { status: 400 }
      )
    }

    await updateBookStatus(env.DB, id, status)

    return NextResponse.json({
      success: true,
      id,
      status,
    })
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    )
  }
}

// DELETE /api/books - Remove book from library
export async function DELETE(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    await removeBookFromLibrary(env.DB, id)

    return NextResponse.json({
      success: true,
      id,
    })
  } catch (error) {
    console.error("Error removing book:", error)
    return NextResponse.json(
      { error: "Failed to remove book" },
      { status: 500 }
    )
  }
}
