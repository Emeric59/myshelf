/**
 * Database helpers pour la wishlist (liste d'envies)
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { WishlistItem, MediaType } from '@/types'

// Récupérer tous les items de la wishlist
export async function getAllWishlistItems(
  db: D1Database,
  options?: { mediaType?: MediaType; limit?: number; offset?: number }
): Promise<{ items: WishlistItem[]; total: number }> {
  const { mediaType, limit = 50, offset = 0 } = options || {}

  let countQuery = 'SELECT COUNT(*) as count FROM wishlist'
  let query = 'SELECT * FROM wishlist'

  if (mediaType) {
    countQuery += ' WHERE media_type = ?'
    query += ' WHERE media_type = ?'
  }

  query += ' ORDER BY added_at DESC LIMIT ? OFFSET ?'

  const countStmt = mediaType
    ? db.prepare(countQuery).bind(mediaType)
    : db.prepare(countQuery)

  const countResult = await countStmt.first<{ count: number }>()
  const total = countResult?.count || 0

  const stmt = mediaType
    ? db.prepare(query).bind(mediaType, limit, offset)
    : db.prepare(query).bind(limit, offset)

  const result = await stmt.all()

  const items = result.results.map((row) => ({
    id: row.id as number,
    media_type: row.media_type as MediaType,
    external_id: row.external_id as string | undefined,
    title: row.title as string,
    subtitle: row.subtitle as string | undefined,
    image_url: row.image_url as string | undefined,
    description: row.description as string | undefined,
    genres: row.genres ? JSON.parse(row.genres as string) : undefined,
    reason: row.reason as string | undefined,
    added_at: row.added_at as string | undefined,
  })) as WishlistItem[]

  return { items, total }
}

// Récupérer un item par ID
export async function getWishlistItemById(
  db: D1Database,
  itemId: number
): Promise<WishlistItem | null> {
  const result = await db
    .prepare('SELECT * FROM wishlist WHERE id = ?')
    .bind(itemId)
    .first()

  if (!result) return null

  return {
    id: result.id as number,
    media_type: result.media_type as MediaType,
    external_id: result.external_id as string | undefined,
    title: result.title as string,
    subtitle: result.subtitle as string | undefined,
    image_url: result.image_url as string | undefined,
    description: result.description as string | undefined,
    genres: result.genres ? JSON.parse(result.genres as string) : undefined,
    reason: result.reason as string | undefined,
    added_at: result.added_at as string | undefined,
  } as WishlistItem
}

// Vérifier si un item existe déjà dans la wishlist
export async function isInWishlist(
  db: D1Database,
  mediaType: MediaType,
  title: string
): Promise<boolean> {
  const result = await db
    .prepare('SELECT id FROM wishlist WHERE media_type = ? AND title = ?')
    .bind(mediaType, title)
    .first()

  return result !== null
}

// Ajouter un item à la wishlist
export async function addToWishlist(
  db: D1Database,
  item: {
    mediaType: MediaType
    externalId?: string
    title: string
    subtitle?: string
    imageUrl?: string
    description?: string
    genres?: string[]
    reason?: string
  }
): Promise<WishlistItem> {
  const result = await db
    .prepare(`
      INSERT INTO wishlist (media_type, external_id, title, subtitle, image_url, description, genres, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    .bind(
      item.mediaType,
      item.externalId || null,
      item.title,
      item.subtitle || null,
      item.imageUrl || null,
      item.description || null,
      item.genres ? JSON.stringify(item.genres) : null,
      item.reason || null
    )
    .first()

  if (!result) {
    throw new Error('Failed to add to wishlist')
  }

  return (await getWishlistItemById(db, result.id as number))!
}

// Supprimer un item de la wishlist
export async function removeFromWishlist(
  db: D1Database,
  itemId: number
): Promise<void> {
  await db
    .prepare('DELETE FROM wishlist WHERE id = ?')
    .bind(itemId)
    .run()
}

// Supprimer un item par titre et type (utile pour éviter les doublons)
export async function removeFromWishlistByTitle(
  db: D1Database,
  mediaType: MediaType,
  title: string
): Promise<void> {
  await db
    .prepare('DELETE FROM wishlist WHERE media_type = ? AND title = ?')
    .bind(mediaType, title)
    .run()
}

// Compter les items par type de média
export async function getWishlistCountByType(
  db: D1Database
): Promise<{ mediaType: MediaType; count: number }[]> {
  const result = await db
    .prepare(`
      SELECT media_type, COUNT(*) as count
      FROM wishlist
      GROUP BY media_type
      ORDER BY count DESC
    `)
    .all()

  return result.results.map((row) => ({
    mediaType: row.media_type as MediaType,
    count: row.count as number,
  }))
}
