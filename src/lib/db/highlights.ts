/**
 * Database helpers pour les highlights (passages favoris)
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Highlight } from '@/types'

// Récupérer tous les highlights avec infos du livre
export async function getAllHighlights(
  db: D1Database,
  options?: { bookId?: string; limit?: number; offset?: number }
): Promise<{ highlights: Highlight[]; total: number }> {
  const { bookId, limit = 50, offset = 0 } = options || {}

  let countQuery = 'SELECT COUNT(*) as count FROM highlights'
  let query = `
    SELECT
      h.*,
      b.title as book_title,
      b.author as book_author,
      b.cover_url as book_cover_url
    FROM highlights h
    LEFT JOIN books b ON h.book_id = b.id
  `

  if (bookId) {
    countQuery += ' WHERE book_id = ?'
    query += ' WHERE h.book_id = ?'
  }

  query += ' ORDER BY h.created_at DESC LIMIT ? OFFSET ?'

  const countStmt = bookId
    ? db.prepare(countQuery).bind(bookId)
    : db.prepare(countQuery)

  const countResult = await countStmt.first<{ count: number }>()
  const total = countResult?.count || 0

  const stmt = bookId
    ? db.prepare(query).bind(bookId, limit, offset)
    : db.prepare(query).bind(limit, offset)

  const result = await stmt.all()

  const highlights = result.results.map((row) => ({
    id: row.id as number,
    book_id: row.book_id as string,
    content: row.content as string,
    page_number: row.page_number as number | undefined,
    chapter: row.chapter as string | undefined,
    personal_note: row.personal_note as string | undefined,
    created_at: row.created_at as string | undefined,
    book: {
      id: row.book_id as string,
      title: row.book_title as string,
      author: row.book_author as string | undefined,
      cover_url: row.book_cover_url as string | undefined,
    },
  })) as Highlight[]

  return { highlights, total }
}

// Récupérer un highlight par ID
export async function getHighlightById(
  db: D1Database,
  highlightId: number
): Promise<Highlight | null> {
  const result = await db
    .prepare(`
      SELECT
        h.*,
        b.title as book_title,
        b.author as book_author,
        b.cover_url as book_cover_url
      FROM highlights h
      LEFT JOIN books b ON h.book_id = b.id
      WHERE h.id = ?
    `)
    .bind(highlightId)
    .first()

  if (!result) return null

  return {
    id: result.id as number,
    book_id: result.book_id as string,
    content: result.content as string,
    page_number: result.page_number as number | undefined,
    chapter: result.chapter as string | undefined,
    personal_note: result.personal_note as string | undefined,
    created_at: result.created_at as string | undefined,
    book: {
      id: result.book_id as string,
      title: result.book_title as string,
      author: result.book_author as string | undefined,
      cover_url: result.book_cover_url as string | undefined,
    },
  } as Highlight
}

// Récupérer les highlights d'un livre
export async function getHighlightsByBook(
  db: D1Database,
  bookId: string
): Promise<Highlight[]> {
  const { highlights } = await getAllHighlights(db, { bookId, limit: 1000 })
  return highlights
}

// Créer un nouveau highlight
export async function createHighlight(
  db: D1Database,
  highlight: {
    bookId: string
    content: string
    pageNumber?: number
    chapter?: string
    personalNote?: string
  }
): Promise<Highlight> {
  const result = await db
    .prepare(`
      INSERT INTO highlights (book_id, content, page_number, chapter, personal_note)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `)
    .bind(
      highlight.bookId,
      highlight.content,
      highlight.pageNumber || null,
      highlight.chapter || null,
      highlight.personalNote || null
    )
    .first()

  if (!result) {
    throw new Error('Failed to create highlight')
  }

  // Récupérer avec les infos du livre
  return (await getHighlightById(db, result.id as number))!
}

// Mettre à jour un highlight
export async function updateHighlight(
  db: D1Database,
  highlightId: number,
  updates: {
    content?: string
    pageNumber?: number
    chapter?: string
    personalNote?: string
  }
): Promise<Highlight | null> {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (updates.content !== undefined) {
    fields.push('content = ?')
    values.push(updates.content)
  }
  if (updates.pageNumber !== undefined) {
    fields.push('page_number = ?')
    values.push(updates.pageNumber)
  }
  if (updates.chapter !== undefined) {
    fields.push('chapter = ?')
    values.push(updates.chapter || null)
  }
  if (updates.personalNote !== undefined) {
    fields.push('personal_note = ?')
    values.push(updates.personalNote || null)
  }

  if (fields.length === 0) {
    return getHighlightById(db, highlightId)
  }

  values.push(highlightId)

  await db
    .prepare(`UPDATE highlights SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  return getHighlightById(db, highlightId)
}

// Supprimer un highlight
export async function deleteHighlight(
  db: D1Database,
  highlightId: number
): Promise<void> {
  await db
    .prepare('DELETE FROM highlights WHERE id = ?')
    .bind(highlightId)
    .run()
}

// Compter les highlights par livre
export async function getHighlightsCountByBook(
  db: D1Database
): Promise<{ bookId: string; count: number }[]> {
  const result = await db
    .prepare(`
      SELECT book_id, COUNT(*) as count
      FROM highlights
      GROUP BY book_id
      ORDER BY count DESC
    `)
    .all()

  return result.results.map((row) => ({
    bookId: row.book_id as string,
    count: row.count as number,
  }))
}

// Rechercher dans les highlights
export async function searchHighlights(
  db: D1Database,
  query: string,
  limit = 20
): Promise<Highlight[]> {
  const searchTerm = `%${query}%`

  const result = await db
    .prepare(`
      SELECT
        h.*,
        b.title as book_title,
        b.author as book_author,
        b.cover_url as book_cover_url
      FROM highlights h
      LEFT JOIN books b ON h.book_id = b.id
      WHERE h.content LIKE ? OR h.personal_note LIKE ?
      ORDER BY h.created_at DESC
      LIMIT ?
    `)
    .bind(searchTerm, searchTerm, limit)
    .all()

  return result.results.map((row) => ({
    id: row.id as number,
    book_id: row.book_id as string,
    content: row.content as string,
    page_number: row.page_number as number | undefined,
    chapter: row.chapter as string | undefined,
    personal_note: row.personal_note as string | undefined,
    created_at: row.created_at as string | undefined,
    book: {
      id: row.book_id as string,
      title: row.book_title as string,
      author: row.book_author as string | undefined,
      cover_url: row.book_cover_url as string | undefined,
    },
  })) as Highlight[]
}
