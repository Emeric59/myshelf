import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getSurpriseRecommendations, buildUserContext } from "@/lib/ai/gemini"

// GET /api/recommendations/surprise - Get surprise recommendations (1 book, 1 movie, 1 show)
export async function GET() {
  try {
    const { env } = getCloudflareContext()

    // Récupérer les données utilisateur pour le contexte
    const [booksResult, moviesResult, showsResult, tropesResult, dismissedResult, wishlistResult] = await Promise.all([
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
      // Médias dans la wishlist
      env.DB.prepare(`
        SELECT title FROM wishlist
      `).all(),
    ])

    // Construire le contexte utilisateur (inclure wishlist dans les exclusions)
    const dismissedTitles = [
      ...(dismissedResult.results as Array<{ title: string }>).map(d => d.title),
      ...(wishlistResult.results as Array<{ title: string }>).map(w => w.title),
    ]

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
      dismissedTitles,
    })

    // Appeler Gemini pour les recommandations surprise
    const response = await getSurpriseRecommendations(context)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error getting surprise recommendations:", error)

    // Vérifier si c'est une erreur de clé API
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          error: "API key not configured",
          message: "L'API Gemini n'est pas encore configurée.",
          recommendations: []
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to get surprise recommendations",
        message: "Désolé, une erreur s'est produite. Réessaie !",
        recommendations: []
      },
      { status: 500 }
    )
  }
}
