/**
 * Client Gemini pour les recommandations IA
 * Utilise Gemini 2.5 Flash avec mode thinking
 */

import { GoogleGenAI } from "@google/genai"

// Types pour les recommandations
export interface UserContext {
  // Médias consommés
  readBooks: Array<{
    title: string
    author?: string
    rating?: number
    genres?: string[]
  }>
  watchedMovies: Array<{
    title: string
    rating?: number
    genres?: string[]
  }>
  watchedShows: Array<{
    title: string
    rating?: number
    genres?: string[]
  }>
  // Tropes
  lovedTropes: string[]
  likedTropes: string[]
  dislikedTropes: string[]
  blacklistedTropes: string[]
  // Médias à éviter (déjà dans la bibliothèque ou blacklistés)
  excludedTitles: string[]
}

export interface RecommendationRequest {
  userQuery: string
  context: UserContext
  mediaTypes?: ("book" | "movie" | "show")[]
  minYear?: number // Année minimum pour les recommandations
}

export interface Recommendation {
  type: "book" | "movie" | "show"
  title: string
  author?: string // Pour les livres
  year?: string
  reason: string
}

export interface RecommendationResponse {
  message: string
  recommendations: Recommendation[]
}

// Créer le client Gemini
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }
  return new GoogleGenAI({ apiKey })
}

// Construire le prompt système
function buildSystemPrompt(context: UserContext, minYear?: number): string {
  const lovedTropesStr = context.lovedTropes.length > 0
    ? `Tropes adorés: ${context.lovedTropes.join(", ")}`
    : ""
  const likedTropesStr = context.likedTropes.length > 0
    ? `Tropes appréciés: ${context.likedTropes.join(", ")}`
    : ""
  const dislikedTropesStr = context.dislikedTropes.length > 0
    ? `Tropes moins aimés: ${context.dislikedTropes.join(", ")}`
    : ""
  const blacklistedTropesStr = context.blacklistedTropes.length > 0
    ? `TROPES INTERDITS (ne jamais recommander): ${context.blacklistedTropes.join(", ")}`
    : ""

  const topBooks = context.readBooks
    .filter(b => b.rating && b.rating >= 4)
    .slice(0, 10)
    .map(b => `- "${b.title}" de ${b.author || "inconnu"} (${b.rating}/5)`)
    .join("\n")

  const topMovies = context.watchedMovies
    .filter(m => m.rating && m.rating >= 4)
    .slice(0, 10)
    .map(m => `- "${m.title}" (${m.rating}/5)`)
    .join("\n")

  const topShows = context.watchedShows
    .filter(s => s.rating && s.rating >= 4)
    .slice(0, 10)
    .map(s => `- "${s.title}" (${s.rating}/5)`)
    .join("\n")

  const yearConstraint = minYear
    ? `7. Ne recommande QUE des médias sortis en ${minYear} ou après`
    : ""

  return `Tu es un assistant de recommandation de médias (livres, films, séries) personnalisé.

RÈGLES ABSOLUES:
1. Ne recommande JAMAIS un média qui contient un trope blacklisté
2. Ne recommande JAMAIS un média déjà dans la bibliothèque de l'utilisateur
3. Recommande uniquement des médias qui EXISTENT RÉELLEMENT
4. Réponds toujours en français
5. Sois enthousiaste mais concis
6. Ne recommande JAMAIS de making-of, documentaires "behind the scenes", ou bonus DVD - uniquement le film/série original
${yearConstraint}

PROFIL DE L'UTILISATEUR:

${lovedTropesStr}
${likedTropesStr}
${dislikedTropesStr}
${blacklistedTropesStr}

${topBooks ? `Livres favoris:\n${topBooks}` : ""}
${topMovies ? `Films favoris:\n${topMovies}` : ""}
${topShows ? `Séries favorites:\n${topShows}` : ""}

MÉDIAS À NE PAS RECOMMANDER (déjà dans la bibliothèque):
${context.excludedTitles.slice(0, 50).join(", ") || "Aucun"}

FORMAT DE RÉPONSE:
Tu dois répondre en JSON valide avec cette structure exacte:
{
  "message": "Ton message conversationnel à l'utilisateur",
  "recommendations": [
    {
      "type": "book" | "movie" | "show",
      "title": "Titre exact du média",
      "author": "Auteur (pour les livres uniquement)",
      "year": "Année de sortie",
      "reason": "Pourquoi ce média correspond à la demande (1-2 phrases)"
    }
  ]
}

Donne entre 2 et 5 recommandations pertinentes.`
}

// Fonction principale de recommandation
export async function getRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const genAI = getGeminiClient()

  const systemPrompt = buildSystemPrompt(request.context, request.minYear)

  let userPrompt = request.userQuery
  if (request.mediaTypes && request.mediaTypes.length > 0) {
    const typeLabels = {
      book: "livres",
      movie: "films",
      show: "séries"
    }
    const types = request.mediaTypes.map(t => typeLabels[t]).join(" et ")
    userPrompt += `\n\n(Recherche limitée aux: ${types})`
  }

  try {
    // Utiliser Gemini 2.5 Flash avec mode thinking
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\n---\n\nDemande de l'utilisateur: ${userPrompt}`,
      config: {
        thinkingConfig: {
          thinkingBudget: 8192, // Budget de réflexion élevé pour des recommandations pertinentes
        },
      },
    })

    // Extraire le texte de la réponse
    const responseText = result.candidates?.[0]?.content?.parts
      ?.filter((part: { thought?: boolean }) => !part.thought)
      ?.map((part: { text?: string }) => part.text)
      ?.join("") || ""

    // Extraire le JSON de la réponse
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        message: "Je n'ai pas pu générer de recommandations. Peux-tu reformuler ta demande ?",
        recommendations: []
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as RecommendationResponse

    // Valider et nettoyer les recommandations
    const validRecommendations = parsed.recommendations
      .filter(r => r.title && r.type && r.reason)
      .filter(r => !request.context.excludedTitles.some(
        excluded => excluded.toLowerCase() === r.title.toLowerCase()
      ))
      .slice(0, 5)

    return {
      message: parsed.message || "Voici mes suggestions !",
      recommendations: validRecommendations
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      message: "Désolé, j'ai rencontré un problème. Réessaie dans quelques instants !",
      recommendations: []
    }
  }
}

// Fonction pour les recommandations "surprise" (classiques modernes)
export async function getSurpriseRecommendations(
  context: UserContext
): Promise<RecommendationResponse> {
  const genAI = getGeminiClient()

  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 15 // Maximum 15 ans

  const lovedTropesStr = context.lovedTropes.length > 0
    ? `Tropes adorés: ${context.lovedTropes.join(", ")}`
    : ""
  const likedTropesStr = context.likedTropes.length > 0
    ? `Tropes appréciés: ${context.likedTropes.join(", ")}`
    : ""
  const blacklistedTropesStr = context.blacklistedTropes.length > 0
    ? `TROPES INTERDITS (ne jamais recommander): ${context.blacklistedTropes.join(", ")}`
    : ""

  const topBooks = context.readBooks
    .filter(b => b.rating && b.rating >= 4)
    .slice(0, 5)
    .map(b => `"${b.title}"`)
    .join(", ")

  const topMovies = context.watchedMovies
    .filter(m => m.rating && m.rating >= 4)
    .slice(0, 5)
    .map(m => `"${m.title}"`)
    .join(", ")

  const topShows = context.watchedShows
    .filter(s => s.rating && s.rating >= 4)
    .slice(0, 5)
    .map(s => `"${s.title}"`)
    .join(", ")

  // Extraire les genres préférés
  const allGenres = [
    ...context.readBooks.flatMap(b => b.genres || []),
    ...context.watchedMovies.flatMap(m => m.genres || []),
    ...context.watchedShows.flatMap(s => s.genres || [])
  ]
  const genreCounts = allGenres.reduce((acc, g) => {
    acc[g] = (acc[g] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre)
    .join(", ")

  const systemPrompt = `Tu es un expert en recommandation de médias. Ta mission : trouver LE livre, LE film et LA série parfaits pour l'utilisateur.

MISSION SPÉCIALE - MODE SURPRISE:
Tu dois recommander exactement 3 médias: 1 livre, 1 film, 1 série.

CRITÈRES OBLIGATOIRES:
1. CLASSIQUES MODERNES: Des œuvres unanimement saluées, bestsellers, blockbusters, succès critiques
2. SUCCÈS GARANTI: Note moyenne élevée (>4/5 ou >8/10), très populaires, recommandés par tous
3. RÉCENT: Sortis entre ${minYear} et ${currentYear} (pas plus de 15 ans)
4. PAS DE RISQUE: Des valeurs sûres qui plairont à coup sûr
5. DIVERSITÉ: 3 types différents (livre, film, série)

PROFIL UTILISATEUR:
${topGenres ? `Genres préférés: ${topGenres}` : ""}
${lovedTropesStr}
${likedTropesStr}
${blacklistedTropesStr}
${topBooks ? `Livres aimés: ${topBooks}` : ""}
${topMovies ? `Films aimés: ${topMovies}` : ""}
${topShows ? `Séries aimées: ${topShows}` : ""}

RÈGLES ABSOLUES:
- Ne recommande JAMAIS un média avec un trope blacklisté
- Ne recommande JAMAIS un média déjà vu/lu
- UNIQUEMENT des médias qui existent RÉELLEMENT
- Réponds en français
- Ne recommande JAMAIS de making-of ou documentaires

MÉDIAS À EXCLURE:
${context.excludedTitles.slice(0, 50).join(", ") || "Aucun"}

FORMAT JSON OBLIGATOIRE:
{
  "message": "Message enthousiaste présentant tes 3 coups de cœur surprise",
  "recommendations": [
    {"type": "book", "title": "Titre exact", "author": "Auteur", "year": "20XX", "reason": "Pourquoi c'est un classique moderne à découvrir"},
    {"type": "movie", "title": "Titre exact", "year": "20XX", "reason": "Pourquoi c'est un incontournable"},
    {"type": "show", "title": "Titre exact", "year": "20XX", "reason": "Pourquoi cette série est culte"}
  ]
}

IMPORTANT: Exactement 3 recommandations, une de chaque type!`

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\n---\n\nGénère 3 recommandations surprise (1 livre, 1 film, 1 série) - des classiques modernes qui correspondent au profil de l'utilisateur.`,
      config: {
        thinkingConfig: {
          thinkingBudget: 8192,
        },
      },
    })

    const responseText = result.candidates?.[0]?.content?.parts
      ?.filter((part: { thought?: boolean }) => !part.thought)
      ?.map((part: { text?: string }) => part.text)
      ?.join("") || ""

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        message: "Je n'ai pas pu générer de recommandations surprise. Réessaie !",
        recommendations: []
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as RecommendationResponse

    // Valider: exactement 1 de chaque type
    const validRecommendations = parsed.recommendations
      .filter(r => r.title && r.type && r.reason)
      .filter(r => !context.excludedTitles.some(
        excluded => excluded.toLowerCase() === r.title.toLowerCase()
      ))

    // S'assurer d'avoir 1 de chaque type
    const book = validRecommendations.find(r => r.type === "book")
    const movie = validRecommendations.find(r => r.type === "movie")
    const show = validRecommendations.find(r => r.type === "show")

    const finalRecommendations = [book, movie, show].filter(Boolean) as Recommendation[]

    return {
      message: parsed.message || "Voici mes 3 coups de cœur surprise pour toi !",
      recommendations: finalRecommendations
    }
  } catch (error) {
    console.error("Gemini API error (surprise):", error)
    return {
      message: "Désolé, j'ai rencontré un problème. Réessaie dans quelques instants !",
      recommendations: []
    }
  }
}

// Fonction utilitaire pour construire le contexte depuis les données DB
export function buildUserContext(data: {
  books: Array<{ title: string; author?: string; rating?: number; genres?: string; status: string }>
  movies: Array<{ title: string; rating?: number; genres?: string; status: string }>
  shows: Array<{ title: string; rating?: number; genres?: string; status: string }>
  tropePreferences: Array<{ name: string; preference: string }>
  dismissedTitles?: string[]
}): UserContext {
  const parseGenres = (genres?: string): string[] => {
    if (!genres) return []
    try {
      return JSON.parse(genres)
    } catch {
      return []
    }
  }

  const readBooks = data.books
    .filter(b => b.status === "read")
    .map(b => ({
      title: b.title,
      author: b.author,
      rating: b.rating,
      genres: parseGenres(b.genres)
    }))

  const watchedMovies = data.movies
    .filter(m => m.status === "watched")
    .map(m => ({
      title: m.title,
      rating: m.rating,
      genres: parseGenres(m.genres)
    }))

  const watchedShows = data.shows
    .filter(s => s.status === "watched")
    .map(s => ({
      title: s.title,
      rating: s.rating,
      genres: parseGenres(s.genres)
    }))

  // Exclure tous les médias de la bibliothèque + les médias refusés
  const excludedTitles = [
    ...data.books.map(b => b.title),
    ...data.movies.map(m => m.title),
    ...data.shows.map(s => s.title),
    ...(data.dismissedTitles || [])
  ]

  // Tropes par préférence
  const lovedTropes = data.tropePreferences
    .filter(t => t.preference === "love")
    .map(t => t.name)
  const likedTropes = data.tropePreferences
    .filter(t => t.preference === "like")
    .map(t => t.name)
  const dislikedTropes = data.tropePreferences
    .filter(t => t.preference === "dislike")
    .map(t => t.name)
  const blacklistedTropes = data.tropePreferences
    .filter(t => t.preference === "blacklist")
    .map(t => t.name)

  return {
    readBooks,
    watchedMovies,
    watchedShows,
    lovedTropes,
    likedTropes,
    dislikedTropes,
    blacklistedTropes,
    excludedTitles
  }
}
