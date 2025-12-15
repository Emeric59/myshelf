"use client"

import { useState, useEffect, useCallback } from "react"
import type { Movie, UserMovie, MovieStatus } from "@/types"

interface MoviesData {
  movies: (UserMovie & Movie)[]
  total: number
  counts: Record<MovieStatus | "all", number>
}

interface UseMovies {
  movies: (UserMovie & Movie)[]
  counts: Record<MovieStatus | "all", number>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addMovie: (movieId: string, status?: MovieStatus) => Promise<boolean>
  updateStatus: (movieId: string, status: MovieStatus) => Promise<boolean>
  removeMovie: (movieId: string) => Promise<boolean>
}

export function useMovies(statusFilter?: MovieStatus): UseMovies {
  const [movies, setMovies] = useState<(UserMovie & Movie)[]>([])
  const [counts, setCounts] = useState<Record<MovieStatus | "all", number>>({
    all: 0,
    to_watch: 0,
    watched: 0,
    blacklist: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMovies = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (statusFilter) {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/movies?${params}`)
      if (!response.ok) throw new Error("Failed to fetch movies")

      const data = (await response.json()) as MoviesData
      setMovies(data.movies || [])
      setCounts(data.counts || {
        all: 0,
        to_watch: 0,
        watched: 0,
        blacklist: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setMovies([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  const addMovie = useCallback(async (movieId: string, status: MovieStatus = "to_watch"): Promise<boolean> => {
    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: movieId, status }),
      })

      if (!response.ok) throw new Error("Failed to add movie")

      await fetchMovies()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add movie")
      return false
    }
  }, [fetchMovies])

  const updateStatus = useCallback(async (movieId: string, status: MovieStatus): Promise<boolean> => {
    try {
      const response = await fetch("/api/movies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: movieId, status }),
      })

      if (!response.ok) throw new Error("Failed to update movie")

      await fetchMovies()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie")
      return false
    }
  }, [fetchMovies])

  const removeMovie = useCallback(async (movieId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/movies?id=${movieId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove movie")

      await fetchMovies()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove movie")
      return false
    }
  }, [fetchMovies])

  return {
    movies,
    counts,
    isLoading,
    error,
    refetch: fetchMovies,
    addMovie,
    updateStatus,
    removeMovie,
  }
}
