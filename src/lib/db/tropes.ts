/**
 * Database helpers pour les tropes
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Trope, TropePreference } from '@/types'

// Récupérer tous les tropes
export async function getAllTropes(db: D1Database): Promise<Trope[]> {
  const result = await db
    .prepare(`
      SELECT * FROM tropes
      ORDER BY category, name
    `)
    .all()

  return result.results as unknown as Trope[]
}

// Récupérer les tropes par catégorie
export async function getTropesByCategory(
  db: D1Database,
  category: string
): Promise<Trope[]> {
  const result = await db
    .prepare(`
      SELECT * FROM tropes
      WHERE category = ?
      ORDER BY name
    `)
    .bind(category)
    .all()

  return result.results as unknown as Trope[]
}

// Récupérer les préférences de tropes de l'utilisateur
export async function getUserTropePreferences(
  db: D1Database
): Promise<{ trope_id: number; preference: TropePreference; trope?: Trope }[]> {
  const result = await db
    .prepare(`
      SELECT
        utp.trope_id,
        utp.preference,
        t.id,
        t.name,
        t.name_fr,
        t.category,
        t.description
      FROM user_trope_preferences utp
      JOIN tropes t ON utp.trope_id = t.id
      ORDER BY t.category, t.name
    `)
    .all()

  return result.results.map((row) => ({
    trope_id: row.trope_id as number,
    preference: row.preference as TropePreference,
    trope: row as unknown as Trope,
  }))
}

// Récupérer les tropes blacklistés
export async function getBlacklistedTropes(db: D1Database): Promise<Trope[]> {
  const result = await db
    .prepare(`
      SELECT t.*
      FROM tropes t
      JOIN user_trope_preferences utp ON t.id = utp.trope_id
      WHERE utp.preference = 'blacklist'
    `)
    .all()

  return result.results as unknown as Trope[]
}

// Récupérer les tropes adorés
export async function getLovedTropes(db: D1Database): Promise<Trope[]> {
  const result = await db
    .prepare(`
      SELECT t.*
      FROM tropes t
      JOIN user_trope_preferences utp ON t.id = utp.trope_id
      WHERE utp.preference = 'love'
    `)
    .all()

  return result.results as unknown as Trope[]
}

// Mettre à jour une préférence de trope
export async function updateTropePreference(
  db: D1Database,
  tropeId: number,
  preference: TropePreference
): Promise<void> {
  const now = new Date().toISOString()

  // Si neutral, supprimer la préférence
  if (preference === 'neutral') {
    await db
      .prepare('DELETE FROM user_trope_preferences WHERE trope_id = ?')
      .bind(tropeId)
      .run()
    return
  }

  await db
    .prepare(`
      INSERT INTO user_trope_preferences (trope_id, preference, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(trope_id) DO UPDATE SET
        preference = excluded.preference,
        updated_at = excluded.updated_at
    `)
    .bind(tropeId, preference, now, now)
    .run()
}

// Compter les tropes par préférence
export async function countTropesByPreference(
  db: D1Database
): Promise<Record<TropePreference, number>> {
  const result = await db
    .prepare(`
      SELECT preference, COUNT(*) as count
      FROM user_trope_preferences
      GROUP BY preference
    `)
    .all()

  const counts: Record<TropePreference, number> = {
    love: 0,
    like: 0,
    neutral: 0,
    dislike: 0,
    blacklist: 0,
  }

  for (const row of result.results as { preference: TropePreference; count: number }[]) {
    counts[row.preference] = row.count
  }

  return counts
}
