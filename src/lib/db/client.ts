/**
 * Client D1 pour Cloudflare
 *
 * En local: utilise wrangler dev avec D1 local
 * En prod: utilise le binding D1 de Cloudflare Pages
 */

import type { D1Database } from '@cloudflare/workers-types'

// Type pour le contexte Cloudflare dans Next.js
export interface CloudflareEnv {
  DB: D1Database
}

// Helper pour obtenir la DB depuis le contexte de requête
export function getDB(env: CloudflareEnv): D1Database {
  return env.DB
}

// Type helper pour les résultats de requête
export type DBResult<T> = {
  results: T[]
  success: boolean
  meta: {
    duration: number
    changes?: number
    last_row_id?: number
  }
}
