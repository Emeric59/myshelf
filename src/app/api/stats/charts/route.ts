import { NextRequest, NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getChartStats } from "@/lib/db"

// GET /api/stats/charts - Get chart statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Récupérer les paramètres
    const period = searchParams.get("period") || "current_year"
    const granularity = (searchParams.get("granularity") || "month") as "week" | "month"
    const customStart = searchParams.get("startDate")
    const customEnd = searchParams.get("endDate")

    // Calculer les dates de début et fin
    let startDate: string
    let endDate: string
    const now = new Date()

    switch (period) {
      case "last_12_months": {
        // 12 derniers mois glissants
        const start = new Date(now)
        start.setMonth(start.getMonth() - 11)
        start.setDate(1)
        startDate = start.toISOString().split("T")[0]
        endDate = now.toISOString().split("T")[0]
        break
      }
      case "last_year": {
        // Année précédente
        const lastYear = now.getFullYear() - 1
        startDate = `${lastYear}-01-01`
        endDate = `${lastYear}-12-31`
        break
      }
      case "custom": {
        // Période personnalisée
        if (!customStart || !customEnd) {
          return NextResponse.json(
            { error: "startDate and endDate required for custom period" },
            { status: 400 }
          )
        }
        startDate = customStart
        endDate = customEnd
        break
      }
      case "current_year":
      default: {
        // Année en cours
        const currentYear = now.getFullYear()
        startDate = `${currentYear}-01-01`
        endDate = `${currentYear}-12-31`
        break
      }
    }

    const { env } = getCloudflareContext()
    const stats = await getChartStats(env.DB, startDate, endDate, granularity)

    return NextResponse.json({
      ...stats,
      period,
      granularity,
      startDate,
      endDate,
    })
  } catch (error) {
    console.error("Error fetching chart stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch chart statistics" },
      { status: 500 }
    )
  }
}
