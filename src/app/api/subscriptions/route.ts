/**
 * API Route: /api/subscriptions
 * Manage user streaming subscriptions
 */

import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

// GET - Retrieve all active subscriptions
export async function GET() {
  try {
    const { env } = getRequestContext()
    const db = env.DB

    const result = await db
      .prepare(
        `SELECT provider_id, provider_name, provider_logo, provider_type
         FROM streaming_subscriptions
         WHERE is_active = 1`
      )
      .all()

    return NextResponse.json(result.results || [])
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}

// POST - Add or update subscriptions
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const db = env.DB

    const body = await request.json() as {
      subscriptions: Array<{
        provider_id: string
        provider_name: string
        provider_logo?: string
        provider_type: "video" | "reading"
      }>
    }

    // First, deactivate all existing subscriptions
    await db
      .prepare(`UPDATE streaming_subscriptions SET is_active = 0`)
      .run()

    // Then, add/activate the new ones
    for (const sub of body.subscriptions) {
      await db
        .prepare(
          `INSERT INTO streaming_subscriptions (provider_id, provider_name, provider_logo, provider_type, is_active)
           VALUES (?, ?, ?, ?, 1)
           ON CONFLICT(provider_id) DO UPDATE SET
             provider_name = excluded.provider_name,
             provider_logo = excluded.provider_logo,
             provider_type = excluded.provider_type,
             is_active = 1`
        )
        .bind(
          sub.provider_id,
          sub.provider_name,
          sub.provider_logo || null,
          sub.provider_type
        )
        .run()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to save subscriptions" },
      { status: 500 }
    )
  }
}
