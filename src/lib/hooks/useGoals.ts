"use client"

import { useState, useEffect, useCallback } from "react"

interface Goals {
  books: number
  movies: number
  shows: number
}

interface UseGoals {
  goals: Goals
  year: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
  refetch: () => Promise<void>
  updateGoals: (newGoals: Partial<Goals>) => Promise<boolean>
  setYear: (year: number) => void
}

export function useGoals(initialYear?: number): UseGoals {
  const [year, setYear] = useState(initialYear || new Date().getFullYear())
  const [goals, setGoals] = useState<Goals>({ books: 0, movies: 0, shows: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/goals?year=${year}`)
      if (!response.ok) throw new Error("Failed to fetch goals")

      const data = await response.json() as { goals?: Goals }
      setGoals(data.goals || { books: 0, movies: 0, shows: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setGoals({ books: 0, movies: 0, shows: 0 })
    } finally {
      setIsLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const updateGoals = useCallback(async (newGoals: Partial<Goals>): Promise<boolean> => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, ...newGoals }),
      })

      if (!response.ok) throw new Error("Failed to update goals")

      const data = await response.json() as { goals?: Goals }
      setGoals(data.goals || { books: 0, movies: 0, shows: 0 })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goals")
      return false
    } finally {
      setIsSaving(false)
    }
  }, [year])

  return {
    goals,
    year,
    isLoading,
    isSaving,
    error,
    refetch: fetchGoals,
    updateGoals,
    setYear,
  }
}
