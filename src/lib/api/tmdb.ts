/**
 * TMDB API Client
 * Documentation: https://developer.themoviedb.org/docs
 */

const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// Types
export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime?: number
  vote_average: number
  vote_count: number
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  original_language: string
}

export interface TMDBShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  last_air_date?: string
  status?: string
  vote_average: number
  vote_count: number
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  number_of_seasons?: number
  number_of_episodes?: number
  episode_run_time?: number[]
  created_by?: { id: number; name: string }[]
  original_language: string
}

export interface TMDBCredits {
  cast: {
    id: number
    name: string
    character: string
    order: number
  }[]
  crew: {
    id: number
    name: string
    job: string
    department: string
  }[]
}

export interface TMDBWatchProviders {
  results?: {
    FR?: {
      flatrate?: { provider_id: number; provider_name: string; logo_path: string }[]
      rent?: { provider_id: number; provider_name: string; logo_path: string }[]
      buy?: { provider_id: number; provider_name: string; logo_path: string }[]
    }
  }
}

export interface TMDBSearchResult<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

// API Key from environment
function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) {
    throw new Error("TMDB_API_KEY environment variable is not set")
  }
  return key
}

// Fetch helper
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)

  // Add default params
  url.searchParams.set("language", "fr-FR")

  // Add custom params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Search for movies
 */
export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBSearchResult<TMDBMovie>> {
  return tmdbFetch("/search/movie", {
    query,
    page: page.toString(),
    region: "FR",
  })
}

/**
 * Search for TV shows
 */
export async function searchShows(
  query: string,
  page = 1
): Promise<TMDBSearchResult<TMDBShow>> {
  return tmdbFetch("/search/tv", {
    query,
    page: page.toString(),
  })
}

/**
 * Get movie details with credits and watch providers
 */
export async function getMovie(
  id: number | string
): Promise<TMDBMovie & { credits: TMDBCredits; "watch/providers": TMDBWatchProviders }> {
  return tmdbFetch(`/movie/${id}`, {
    append_to_response: "credits,watch/providers",
  })
}

/**
 * Get TV show details with credits and watch providers
 */
export async function getShow(
  id: number | string
): Promise<TMDBShow & { credits: TMDBCredits; "watch/providers": TMDBWatchProviders }> {
  return tmdbFetch(`/tv/${id}`, {
    append_to_response: "credits,watch/providers",
  })
}

/**
 * Get image URL
 */
export function getImageUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string | undefined {
  if (!path) return undefined
  return `${IMAGE_BASE_URL}/${size}${path}`
}

/**
 * Get provider logo URL
 */
export function getProviderLogoUrl(path: string): string {
  return `${IMAGE_BASE_URL}/w92${path}`
}

/**
 * Extract director from credits
 */
export function extractDirector(credits: TMDBCredits): string | undefined {
  const director = credits.crew.find((c) => c.job === "Director")
  return director?.name
}

/**
 * Extract main cast (top 5)
 */
export function extractCast(credits: TMDBCredits, limit = 5): string[] {
  return credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
    .map((c) => c.name)
}

/**
 * Extract streaming providers for France
 */
export function extractFrenchProviders(providers: TMDBWatchProviders) {
  const fr = providers.results?.FR
  if (!fr) return undefined

  return {
    flatrate: fr.flatrate?.map((p) => p.provider_name),
    rent: fr.rent?.map((p) => p.provider_name),
    buy: fr.buy?.map((p) => p.provider_name),
  }
}

/**
 * Normalize movie to our Movie type
 */
export function normalizeMovie(movie: TMDBMovie & { credits?: TMDBCredits; "watch/providers"?: TMDBWatchProviders }) {
  return {
    id: movie.id.toString(),
    title: movie.title,
    original_title: movie.original_title !== movie.title ? movie.original_title : undefined,
    poster_url: getImageUrl(movie.poster_path),
    backdrop_url: getImageUrl(movie.backdrop_path, "w780"),
    description: movie.overview,
    runtime: movie.runtime,
    release_date: movie.release_date,
    director: movie.credits ? extractDirector(movie.credits) : undefined,
    cast_members: movie.credits ? extractCast(movie.credits) : undefined,
    genres: movie.genres?.map((g) => g.name) || [],
    language: movie.original_language,
    average_rating: movie.vote_average,
    ratings_count: movie.vote_count,
    streaming_providers: movie["watch/providers"]
      ? extractFrenchProviders(movie["watch/providers"])
      : undefined,
  }
}

/**
 * Normalize show to our Show type
 */
export function normalizeShow(show: TMDBShow & { credits?: TMDBCredits; "watch/providers"?: TMDBWatchProviders }) {
  return {
    id: show.id.toString(),
    title: show.name,
    original_title: show.original_name !== show.name ? show.original_name : undefined,
    poster_url: getImageUrl(show.poster_path),
    backdrop_url: getImageUrl(show.backdrop_path, "w780"),
    description: show.overview,
    first_air_date: show.first_air_date,
    last_air_date: show.last_air_date,
    status: show.status,
    seasons_count: show.number_of_seasons,
    episodes_count: show.number_of_episodes,
    episode_runtime: show.episode_run_time?.[0],
    creators: show.created_by?.map((c) => c.name),
    cast_members: show.credits ? extractCast(show.credits) : undefined,
    genres: show.genres?.map((g) => g.name) || [],
    language: show.original_language,
    average_rating: show.vote_average,
    ratings_count: show.vote_count,
    streaming_providers: show["watch/providers"]
      ? extractFrenchProviders(show["watch/providers"])
      : undefined,
  }
}
