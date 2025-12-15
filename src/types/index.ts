// Media Types
export type MediaType = 'book' | 'movie' | 'show'

// Book Status
export type BookStatus = 'to_read' | 'reading' | 'read' | 'abandoned' | 'blacklist'

// Movie Status
export type MovieStatus = 'to_watch' | 'watched' | 'blacklist'

// Show Status
export type ShowStatus = 'to_watch' | 'watching' | 'watched' | 'abandoned' | 'paused' | 'blacklist'

// Trope Preference
export type TropePreference = 'love' | 'like' | 'neutral' | 'dislike' | 'blacklist'

// Recommendation Status
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed' | 'already_consumed'

// Recommendation Source
export type RecommendationSource = 'ai_auto' | 'ai_request' | 'similar' | 'trending'

// Book
export interface Book {
  id: string
  open_library_id?: string
  google_books_id?: string
  hardcover_id?: string
  hardcover_slug?: string
  title: string
  original_title?: string
  author?: string
  author_id?: string
  cover_url?: string
  description?: string
  page_count?: number
  published_date?: string
  publisher?: string
  isbn_10?: string
  isbn_13?: string
  language?: string
  genres?: string[]
  tropes?: string[]
  moods?: string[]
  content_warnings?: string[]
  series_name?: string
  series_position?: number
  external_ids?: Record<string, string>
  average_rating?: number
  ratings_count?: number
  created_at?: string
  updated_at?: string
}

// User Book (library entry)
export interface UserBook {
  id: number
  book_id: string
  book?: Book
  status: BookStatus
  rating?: number
  started_at?: string
  finished_at?: string
  current_page: number
  reread_count: number
  notes?: string
  created_at?: string
  updated_at?: string
}

// Movie
export interface Movie {
  id: string
  tmdb_id?: string
  title: string
  original_title?: string
  poster_url?: string
  backdrop_url?: string
  description?: string
  runtime?: number
  release_date?: string
  director?: string
  cast_members?: string[]
  genres?: string[]
  language?: string
  external_ids?: Record<string, string>
  average_rating?: number
  ratings_count?: number
  streaming_providers?: StreamingProviders
  providers_updated_at?: string
  created_at?: string
  updated_at?: string
}

// User Movie (library entry)
export interface UserMovie {
  id: number
  movie_id: string
  movie?: Movie
  status: MovieStatus
  rating?: number
  watched_at?: string
  rewatch_count: number
  watched_on?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// Show
export interface Show {
  id: string
  tmdb_id?: string
  title: string
  original_title?: string
  poster_url?: string
  backdrop_url?: string
  description?: string
  first_air_date?: string
  last_air_date?: string
  status?: string
  total_seasons?: number
  total_episodes?: number
  episode_runtime?: number
  creator?: string
  cast_members?: string[]
  genres?: string[]
  language?: string
  external_ids?: Record<string, string>
  average_rating?: number
  ratings_count?: number
  streaming_providers?: StreamingProviders
  providers_updated_at?: string
  created_at?: string
  updated_at?: string
}

// User Show (library entry)
export interface UserShow {
  id: number
  show_id: string
  show?: Show
  status: ShowStatus
  rating?: number
  started_at?: string
  finished_at?: string
  current_season: number
  current_episode: number
  watched_on?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// Streaming Providers
export interface StreamingProviders {
  flatrate?: string[]
  rent?: string[]
  buy?: string[]
}

// Review
export interface Review {
  id: number
  media_type: MediaType
  media_id: string
  comment?: string
  liked_aspects?: string[]
  disliked_aspects?: string[]
  emotions?: string[]
  created_at?: string
  updated_at?: string
}

// Highlight
export interface Highlight {
  id: number
  book_id: string
  book?: Book
  content: string
  page_number?: number
  chapter?: string
  personal_note?: string
  created_at?: string
}

// Trope
export interface Trope {
  id: number
  name: string
  slug: string
  category?: 'romance' | 'character' | 'plot' | 'mood' | 'sensitive'
  description?: string
  is_sensitive: boolean
  created_at?: string
}

// User Trope Preference
export interface UserTropePreference {
  id: number
  trope_id: number
  trope?: Trope
  preference: TropePreference
  weight: number
  created_at?: string
  updated_at?: string
}

// Recommendation
export interface Recommendation {
  id: number
  media_type: MediaType
  media_id: string
  media?: Book | Movie | Show
  source: RecommendationSource
  query?: string
  reason?: string
  score?: number
  status: RecommendationStatus
  created_at?: string
  updated_at?: string
}

// Goal
export interface Goal {
  id: number
  year: number
  media_type: MediaType
  target: number
  current?: number
  created_at?: string
}

// Streaming Subscription
export interface StreamingSubscription {
  id: number
  provider_id: string
  provider_name: string
  provider_logo?: string
  provider_type: 'video' | 'reading'
  is_active: boolean
  created_at?: string
}

// Search Result
export interface SearchResult {
  type: MediaType
  id: string
  title: string
  subtitle?: string
  image_url?: string
  year?: string
  rating?: number
  in_library?: boolean
  library_status?: BookStatus | MovieStatus | ShowStatus
  // Book-specific enrichment data
  genres?: string[]
  tropes?: string[]
  moods?: string[]
  contentWarnings?: string[]
  seriesName?: string
  sources?: string[]
}

// Stats
export interface Stats {
  books_read: number
  pages_read: number
  movies_watched: number
  shows_completed: number
  episodes_watched: number
  average_rating: number
  favorite_genres: { genre: string; count: number }[]
  favorite_authors: { author: string; count: number }[]
}
