"use client"

import { useState, useEffect, useCallback } from "react"
import type { Trope, TropePreference } from "@/types"

interface TropeWithPreference extends Trope {
  preference: TropePreference
}

interface UseTropes {
  tropes: TropeWithPreference[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  updatePreference: (tropeId: number, preference: TropePreference) => Promise<boolean>
  getCounts: () => Record<TropePreference, number>
}

export function useTropes(): UseTropes {
  const [tropes, setTropes] = useState<TropeWithPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTropes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tropes")
      if (!response.ok) throw new Error("Failed to fetch tropes")

      const data = await response.json() as {
        tropes?: Trope[]
        preferences?: Array<{ trope_id: number; preference: TropePreference }>
      }

      // Merge tropes with preferences
      const tropesWithPrefs: TropeWithPreference[] = (data.tropes || []).map((trope: Trope) => {
        const pref = data.preferences?.find((p) => p.trope_id === trope.id)
        return {
          ...trope,
          preference: pref?.preference || "neutral",
        }
      })

      setTropes(tropesWithPrefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setTropes([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTropes()
  }, [fetchTropes])

  const updatePreference = useCallback(async (
    tropeId: number,
    preference: TropePreference
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/tropes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tropeId, preference }),
      })

      if (!response.ok) throw new Error("Failed to update preference")

      // Update local state optimistically
      setTropes(prev => prev.map(trope =>
        trope.id === tropeId
          ? { ...trope, preference }
          : trope
      ))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preference")
      return false
    }
  }, [])

  const getCounts = useCallback((): Record<TropePreference, number> => {
    const counts: Record<TropePreference, number> = {
      love: 0,
      like: 0,
      neutral: 0,
      dislike: 0,
      blacklist: 0,
    }

    tropes.forEach(trope => {
      counts[trope.preference]++
    })

    return counts
  }, [tropes])

  return {
    tropes,
    isLoading,
    error,
    refetch: fetchTropes,
    updatePreference,
    getCounts,
  }
}
