/**
 * Database helpers pour les livres
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Book, UserBook, BookStatus } from '@/types'

// Récupérer tous les livres de l'utilisateur
export async function getUserBooks(db: D1Database): Promise<(UserBook & Book)[]> {
  const result = await db
    .prepare(`
      SELECT
        ub.*,
        b.title,
        b.author,
        b.cover_url,
        b.description,
        b.page_count,
        b.published_date,
        b.genres,
        b.language,
        b.series_name,
        b.tropes,
        b.moods,
        b.content_warnings
      FROM user_books ub
      JOIN books b ON ub.book_id = b.id
      ORDER BY ub.updated_at DESC
    `)
    .all()

  return result.results as unknown as (UserBook & Book)[]
}

// Récupérer un livre par ID
export async function getUserBook(
  db: D1Database,
  bookId: string
): Promise<(UserBook & Book) | null> {
  const result = await db
    .prepare(`
      SELECT
        ub.*,
        b.title,
        b.author,
        b.cover_url,
        b.description,
        b.page_count,
        b.published_date,
        b.genres,
        b.language,
        b.series_name,
        b.tropes,
        b.moods,
        b.content_warnings
      FROM user_books ub
      JOIN books b ON ub.book_id = b.id
      WHERE ub.book_id = ?
    `)
    .bind(bookId)
    .first()

  return result as (UserBook & Book) | null
}

// Vérifier si un livre existe dans le cache
export async function getBookFromCache(
  db: D1Database,
  bookId: string
): Promise<Book | null> {
  const result = await db
    .prepare('SELECT * FROM books WHERE id = ?')
    .bind(bookId)
    .first()

  return result as Book | null
}

// Ajouter un livre au cache
export async function cacheBook(db: D1Database, book: Book): Promise<void> {
  await db
    .prepare(`
      INSERT OR REPLACE INTO books
        (id, title, author, cover_url, description, page_count, published_date,
         genres, language, series_name, isbn_13,
         google_books_id, hardcover_slug, tropes, moods, content_warnings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      book.id,
      book.title,
      book.author || null,
      book.cover_url || null,
      book.description || null,
      book.page_count || null,
      book.published_date || null,
      book.genres ? JSON.stringify(book.genres) : null,
      book.language || null,
      book.series_name || null,
      book.isbn_13 || null,
      book.google_books_id || null,
      book.hardcover_slug || null,
      book.tropes ? JSON.stringify(book.tropes) : null,
      book.moods ? JSON.stringify(book.moods) : null,
      book.content_warnings ? JSON.stringify(book.content_warnings) : null
    )
    .run()
}

// Ajouter un livre à la bibliothèque utilisateur
export async function addBookToLibrary(
  db: D1Database,
  bookId: string,
  status: BookStatus = 'to_read'
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      INSERT INTO user_books (book_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(book_id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at
    `)
    .bind(bookId, status, now, now)
    .run()
}

// Mettre à jour le statut d'un livre
export async function updateBookStatus(
  db: D1Database,
  bookId: string,
  status: BookStatus
): Promise<void> {
  const now = new Date().toISOString()
  const startedAt = status === 'reading' ? now : null
  const finishedAt = status === 'read' ? now : null

  await db
    .prepare(`
      UPDATE user_books
      SET status = ?,
          started_at = COALESCE(?, started_at),
          finished_at = COALESCE(?, finished_at),
          updated_at = ?
      WHERE book_id = ?
    `)
    .bind(status, startedAt, finishedAt, now, bookId)
    .run()
}

// Mettre à jour la progression
export async function updateBookProgress(
  db: D1Database,
  bookId: string,
  currentPage: number
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      UPDATE user_books
      SET current_page = ?, updated_at = ?
      WHERE book_id = ?
    `)
    .bind(currentPage, now, bookId)
    .run()
}

// Supprimer un livre de la bibliothèque
export async function removeBookFromLibrary(
  db: D1Database,
  bookId: string
): Promise<void> {
  await db
    .prepare('DELETE FROM user_books WHERE book_id = ?')
    .bind(bookId)
    .run()
}

// Compter les livres par statut
export async function countBooksByStatus(
  db: D1Database
): Promise<Record<BookStatus | 'all', number>> {
  const result = await db
    .prepare(`
      SELECT status, COUNT(*) as count
      FROM user_books
      GROUP BY status
    `)
    .all()

  const counts: Record<BookStatus | 'all', number> = {
    all: 0,
    to_read: 0,
    reading: 0,
    read: 0,
    abandoned: 0,
    blacklist: 0,
  }

  for (const row of result.results as { status: BookStatus; count: number }[]) {
    counts[row.status] = row.count
    counts.all += row.count
  }

  return counts
}
