import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import {
  getWork,
  getWorkEditions,
  extractDescription,
  getCoverUrl,
  getAuthor,
  getGoogleBook,
  getHardcoverBookDetails,
} from "@/lib/api"
import {
  getUserBooks,
  getUserBook,
  cacheBook,
  addBookToLibrary,
  updateBookStatus,
  updateBookProgress,
  updateBookRating,
  removeBookFromLibrary,
  countBooksByStatus,
} from "@/lib/db"
import type { BookStatus, Book } from "@/types"

// Extended book data from search results
interface BookPayload {
  id: string
  title?: string
  authors?: string[]
  description?: string
  coverUrl?: string
  pageCount?: number
  publishedDate?: string
  language?: string
  genres?: string[]
  tropes?: string[]
  moods?: string[]
  contentWarnings?: string[]
  seriesName?: string
  googleBooksId?: string
  hardcoverSlug?: string
  isbn13?: string
}

// Runtime edge for Cloudflare
export const runtime = "edge"

// GET /api/books - List user's books or get single book
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const status = searchParams.get("status") as BookStatus | null

    // If ID provided, return single book
    if (id) {
      const book = await getUserBook(env.DB, id)
      return NextResponse.json(book)
    }

    // Otherwise return all books
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
    const { id, status = "to_read", bookData } = body as {
      id: string
      status?: BookStatus
      bookData?: BookPayload
    }

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    let book: Book

    // Check if we have pre-fetched book data from search
    if (bookData && bookData.title) {
      // Use the data passed from search results
      book = {
        id,
        title: bookData.title,
        author: bookData.authors?.join(", "),
        description: bookData.description,
        cover_url: bookData.coverUrl,
        page_count: bookData.pageCount,
        published_date: bookData.publishedDate,
        language: bookData.language,
        genres: bookData.genres,
        series_name: bookData.seriesName,
        isbn_13: bookData.isbn13,
        // Enrichment data
        tropes: bookData.tropes,
        moods: bookData.moods,
        content_warnings: bookData.contentWarnings,
        google_books_id: bookData.googleBooksId,
        hardcover_slug: bookData.hardcoverSlug,
      }
    } else {
      // Fallback: Fetch book details based on ID prefix
      book = await fetchBookDetails(id)
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

// Fetch book details based on ID prefix
async function fetchBookDetails(id: string): Promise<Book> {
  // Google Books ID (g_xxx)
  if (id.startsWith("g_")) {
    const googleId = id.replace("g_", "")
    const googleBook = await getGoogleBook(googleId)

    if (!googleBook) {
      throw new Error(`Book not found: ${id}`)
    }

    // Try to enrich with Hardcover data
    let tropes: string[] = []
    let moods: string[] = []
    let contentWarnings: string[] = []

    try {
      const hardcoverData = await getHardcoverBookDetails(
        googleBook.title.toLowerCase().replace(/\s+/g, "-")
      )
      if (hardcoverData) {
        tropes = hardcoverData.tropes
        moods = hardcoverData.moods
        contentWarnings = hardcoverData.contentWarnings
      }
    } catch {
      // Ignore Hardcover enrichment errors
    }

    return {
      id,
      google_books_id: googleId,
      title: googleBook.title,
      author: googleBook.authors.join(", "),
      description: googleBook.description,
      cover_url: googleBook.thumbnail,
      page_count: googleBook.pageCount,
      published_date: googleBook.publishedDate,
      language: googleBook.language,
      genres: googleBook.categories,
      isbn_13: googleBook.isbn13,
      tropes,
      moods,
      content_warnings: contentWarnings,
    }
  }

  // Hardcover ID (hc_xxx)
  if (id.startsWith("hc_")) {
    throw new Error("Direct Hardcover book add not supported yet")
  }

  // Open Library ID (ol_xxx or plain ID)
  const openLibraryId = id.startsWith("ol_") ? id.replace("ol_", "") : id

  const [work, editions] = await Promise.all([
    getWork(openLibraryId),
    getWorkEditions(openLibraryId, 1),
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

  return {
    id,
    open_library_id: openLibraryId,
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
}

// PATCH /api/books - Update book (status, progress, or rating)
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { id, status, current_page, rating } = body as {
      id: string
      status?: BookStatus
      current_page?: number
      rating?: number
    }

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    // Update status if provided
    if (status !== undefined) {
      await updateBookStatus(env.DB, id, status)
    }

    // Update progress if provided
    if (current_page !== undefined) {
      await updateBookProgress(env.DB, id, current_page)
    }

    // Update rating if provided
    if (rating !== undefined) {
      await updateBookRating(env.DB, id, rating)
    }

    return NextResponse.json({
      success: true,
      id,
      ...(status !== undefined && { status }),
      ...(current_page !== undefined && { current_page }),
      ...(rating !== undefined && { rating }),
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
