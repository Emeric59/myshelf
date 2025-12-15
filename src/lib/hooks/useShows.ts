"use client"

import { useState, useEffect, useCallback } from "react"
import type { Show, UserShow, ShowStatus } from "@/types"

interface ShowsData {
  shows: (UserShow & Show)[]
  total: number
  counts: Record<ShowStatus | "all", number>
}

interface UseShows {
  shows: (UserShow & Show)[]
  counts: Record<ShowStatus | "all", number>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addShow: (showId: string, status?: ShowStatus) => Promise<boolean>
  updateStatus: (showId: string, status: ShowStatus) => Promise<boolean>
  updateProgress: (showId: string, season: number, episode: number) => Promise<boolean>
  removeShow: (showId: string) => Promise<boolean>
}

export function useShows(statusFilter?: ShowStatus): UseShows {
  const [shows, setShows] = useState<(UserShow & Show)[]>([])
  const [counts, setCounts] = useState<Record<ShowStatus | "all", number>>({
    all: 0,
    to_watch: 0,
    watching: 0,
    watched: 0,
    paused: 0,
    abandoned: 0,
    blacklist: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShows = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (statusFilter) {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/shows?${params}`)
      if (!response.ok) throw new Error("Failed to fetch shows")

      const data = (await response.json()) as ShowsData
      setShows(data.shows || [])
      setCounts(data.counts || {
        all: 0,
        to_watch: 0,
        watching: 0,
        watched: 0,
        paused: 0,
        abandoned: 0,
        blacklist: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setShows([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchShows()
  }, [fetchShows])

  const addShow = useCallback(async (showId: string, status: ShowStatus = "to_watch"): Promise<boolean> => {
    try {
      const response = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showId, status }),
      })

      if (!response.ok) throw new Error("Failed to add show")

      await fetchShows()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add show")
      return false
    }
  }, [fetchShows])

  const updateStatus = useCallback(async (showId: string, status: ShowStatus): Promise<boolean> => {
    try {
      const response = await fetch("/api/shows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showId, status }),
      })

      if (!response.ok) throw new Error("Failed to update show")

      await fetchShows()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update show")
      return false
    }
  }, [fetchShows])

  const updateProgress = useCallback(async (showId: string, currentSeason: number, currentEpisode: number): Promise<boolean> => {
    try {
      const response = await fetch("/api/shows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showId, currentSeason, currentEpisode }),
      })

      if (!response.ok) throw new Error("Failed to update progress")

      await fetchShows()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update progress")
      return false
    }
  }, [fetchShows])

  const removeShow = useCallback(async (showId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/shows?id=${showId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove show")

      await fetchShows()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove show")
      return false
    }
  }, [fetchShows])

  return {
    shows,
    counts,
    isLoading,
    error,
    refetch: fetchShows,
    addShow,
    updateStatus,
    updateProgress,
    removeShow,
  }
}
