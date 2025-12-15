import { NextRequest, NextResponse } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { getRecommendations, buildUserContext } from "@/lib/ai/gemini"

// Runtime edge for Cloudflare
export const runtime = "edge"

// POST /api/recommendations/ask - Get AI recommendations
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const body = await request.json()
    const { query, mediaTypes, minYear } = body as {
      query: string
      mediaTypes?: ("book" | "movie" | "show")[]
      minYear?: number
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    // Récupérer les données utilisateur pour le contexte
    const [booksResult, moviesResult, showsResult, tropesResult, dismissedResult] = await Promise.all([
      // Livres avec métadonnées
      env.DB.prepare(`
        SELECT b.title, b.author, b.genres, ub.rating, ub.status
        FROM user_books ub
        JOIN books b ON ub.book_id = b.id
      `).all(),
      // Films avec métadonnées
      env.DB.prepare(`
        SELECT m.title, m.genres, um.rating, um.status
        FROM user_movies um
        JOIN movies m ON um.movie_id = m.id
      `).all(),
      // Séries avec métadonnées
      env.DB.prepare(`
        SELECT s.title, s.genres, us.rating, us.status
        FROM user_shows us
        JOIN shows s ON us.show_id = s.id
      `).all(),
      // Préférences de tropes
      env.DB.prepare(`
        SELECT t.name, utp.preference
        FROM user_trope_preferences utp
        JOIN tropes t ON utp.trope_id = t.id
      `).all(),
      // Médias refusés
      env.DB.prepare(`
        SELECT title FROM dismissed_media
      `).all(),
    ])

    // Construire le contexte utilisateur
    const context = buildUserContext({
      books: booksResult.results as Array<{
        title: string
        author?: string
        rating?: number
        genres?: string
        status: string
      }>,
      movies: moviesResult.results as Array<{
        title: string
        rating?: number
        genres?: string
        status: string
      }>,
      shows: showsResult.results as Array<{
        title: string
        rating?: number
        genres?: string
        status: string
      }>,
      tropePreferences: tropesResult.results as Array<{
        name: string
        preference: string
      }>,
      dismissedTitles: (dismissedResult.results as Array<{ title: string }>).map(d => d.title),
    })

    // Appeler Gemini
    const response = await getRecommendations({
      userQuery: query,
      context,
      mediaTypes,
      minYear,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error getting recommendations:", error)

    // Vérifier si c'est une erreur de clé API
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          error: "API key not configured",
          message: "L'API Gemini n'est pas encore configurée. Ajoute GEMINI_API_KEY dans les variables d'environnement.",
          recommendations: []
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to get recommendations",
        message: "Désolé, une erreur s'est produite. Réessaie !",
        recommendations: []
      },
      { status: 500 }
    )
  }
}
