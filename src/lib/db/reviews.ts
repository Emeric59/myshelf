/**
 * Database helpers pour les avis/reviews
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Review, MediaType } from '@/types'

// Récupérer l'avis d'un média
export async function getReview(
  db: D1Database,
  mediaType: MediaType,
  mediaId: string
): Promise<Review | null> {
  const result = await db
    .prepare(`
      SELECT * FROM reviews
      WHERE media_type = ? AND media_id = ?
    `)
    .bind(mediaType, mediaId)
    .first()

  if (!result) return null

  return {
    ...result,
    liked_aspects: result.liked_aspects ? JSON.parse(result.liked_aspects as string) : [],
    disliked_aspects: result.disliked_aspects ? JSON.parse(result.disliked_aspects as string) : [],
  } as Review
}

// Créer ou mettre à jour un avis
export async function upsertReview(
  db: D1Database,
  review: {
    mediaType: MediaType
    mediaId: string
    rating: number
    reviewText?: string
    likedAspects?: string[]
    dislikedAspects?: string[]
  }
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(`
      INSERT INTO reviews (media_type, media_id, rating, review_text, liked_aspects, disliked_aspects, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(media_type, media_id) DO UPDATE SET
        rating = excluded.rating,
        review_text = excluded.review_text,
        liked_aspects = excluded.liked_aspects,
        disliked_aspects = excluded.disliked_aspects,
        updated_at = excluded.updated_at
    `)
    .bind(
      review.mediaType,
      review.mediaId,
      review.rating,
      review.reviewText || null,
      review.likedAspects ? JSON.stringify(review.likedAspects) : null,
      review.dislikedAspects ? JSON.stringify(review.dislikedAspects) : null,
      now,
      now
    )
    .run()

  // Mettre à jour le rating dans la table user_*
  const table = `user_${review.mediaType}s`
  const idColumn = `${review.mediaType}_id`

  await db
    .prepare(`UPDATE ${table} SET rating = ? WHERE ${idColumn} = ?`)
    .bind(review.rating, review.mediaId)
    .run()
}

// Supprimer un avis
export async function deleteReview(
  db: D1Database,
  mediaType: MediaType,
  mediaId: string
): Promise<void> {
  await db
    .prepare('DELETE FROM reviews WHERE media_type = ? AND media_id = ?')
    .bind(mediaType, mediaId)
    .run()

  // Retirer le rating de la table user_*
  const table = `user_${mediaType}s`
  const idColumn = `${mediaType}_id`

  await db
    .prepare(`UPDATE ${table} SET rating = NULL WHERE ${idColumn} = ?`)
    .bind(mediaId)
    .run()
}

// Récupérer les avis récents
export async function getRecentReviews(
  db: D1Database,
  limit = 10
): Promise<Review[]> {
  const result = await db
    .prepare(`
      SELECT * FROM reviews
      ORDER BY updated_at DESC
      LIMIT ?
    `)
    .bind(limit)
    .all()

  return result.results.map((row) => ({
    ...row,
    liked_aspects: row.liked_aspects ? JSON.parse(row.liked_aspects as string) : [],
    disliked_aspects: row.disliked_aspects ? JSON.parse(row.disliked_aspects as string) : [],
  })) as Review[]
}

// Récupérer les médias avec une note >= X
export async function getHighRatedMedia(
  db: D1Database,
  minRating = 4,
  mediaType?: MediaType
): Promise<Review[]> {
  let query = `
    SELECT * FROM reviews
    WHERE rating >= ?
  `

  if (mediaType) {
    query += ` AND media_type = ?`
  }

  query += ` ORDER BY rating DESC, updated_at DESC`

  const stmt = mediaType
    ? db.prepare(query).bind(minRating, mediaType)
    : db.prepare(query).bind(minRating)

  const result = await stmt.all()

  return result.results.map((row) => ({
    ...row,
    liked_aspects: row.liked_aspects ? JSON.parse(row.liked_aspects as string) : [],
    disliked_aspects: row.disliked_aspects ? JSON.parse(row.disliked_aspects as string) : [],
  })) as Review[]
}
