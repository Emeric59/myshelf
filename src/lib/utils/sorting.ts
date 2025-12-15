import type { BookStatus, MovieStatus, ShowStatus } from "@/types"

export type SortOption = "in_progress" | "recent" | "rating"

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "in_progress", label: "En cours d'abord" },
  { value: "recent", label: "Récent" },
  { value: "rating", label: "Note" },
]

// Status priority for "In Progress first" sort
const BOOK_STATUS_PRIORITY: Record<BookStatus, number> = {
  reading: 0,
  to_read: 1,
  read: 2,
  abandoned: 3,
  blacklist: 4,
}

const MOVIE_STATUS_PRIORITY: Record<MovieStatus, number> = {
  to_watch: 0,
  watched: 1,
  blacklist: 2,
}

const SHOW_STATUS_PRIORITY: Record<ShowStatus, number> = {
  watching: 0,
  paused: 1,
  to_watch: 2,
  watched: 3,
  abandoned: 4,
  blacklist: 5,
}

export function sortBooks<T extends { status: BookStatus; rating?: number; updated_at?: string }>(
  items: T[],
  sortBy: SortOption
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "in_progress": {
        const priorityDiff = BOOK_STATUS_PRIORITY[a.status] - BOOK_STATUS_PRIORITY[b.status]
        if (priorityDiff !== 0) return priorityDiff
        // Secondary sort by updated_at within same status
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
      case "rating": {
        const ratingDiff = (b.rating || 0) - (a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
      case "recent":
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      default:
        return 0
    }
  })
}

export function sortMovies<T extends { status: MovieStatus; rating?: number; updated_at?: string }>(
  items: T[],
  sortBy: SortOption
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "in_progress": {
        const priorityDiff = MOVIE_STATUS_PRIORITY[a.status] - MOVIE_STATUS_PRIORITY[b.status]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
      case "rating": {
        const ratingDiff = (b.rating || 0) - (a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
      case "recent":
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      default:
        return 0
    }
  })
}

export function sortShows<T extends { status: ShowStatus; rating?: number; updated_at?: string }>(
  items: T[],
  sortBy: SortOption
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "in_progress": {
        const priorityDiff = SHOW_STATUS_PRIORITY[a.status] - SHOW_STATUS_PRIORITY[b.status]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
      case "rating": {
        const ratingDiff = (b.rating || 0) - (a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      }
      case "recent":
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      default:
        return 0
    }
  })
}
