"use client"

import { useState, useEffect, useCallback } from "react"
import type { StatsData } from "@/lib/db/stats"

interface UseStats {
  stats: StatsData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useStats(): UseStats {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")

      const data = await response.json() as StatsData
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
