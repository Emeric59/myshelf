"use client"

import { useState, useEffect, useCallback } from "react"
import type { Highlight } from "@/types"

interface HighlightsData {
  highlights: Highlight[]
  total: number
}

interface UseHighlights {
  highlights: Highlight[]
  total: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addHighlight: (highlight: {
    bookId: string
    content: string
    pageNumber?: number
    chapter?: string
    personalNote?: string
  }) => Promise<Highlight | null>
  updateHighlight: (
    id: number,
    updates: {
      content?: string
      pageNumber?: number
      chapter?: string
      personalNote?: string
    }
  ) => Promise<boolean>
  removeHighlight: (id: number) => Promise<boolean>
  searchHighlights: (query: string) => Promise<Highlight[]>
}

export function useHighlights(bookId?: string): UseHighlights {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHighlights = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (bookId) {
        params.set("bookId", bookId)
      }

      const response = await fetch(`/api/highlights?${params}`)
      if (!response.ok) throw new Error("Failed to fetch highlights")

      const data = (await response.json()) as HighlightsData
      setHighlights(data.highlights || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setHighlights([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    fetchHighlights()
  }, [fetchHighlights])

  const addHighlight = useCallback(
    async (highlight: {
      bookId: string
      content: string
      pageNumber?: number
      chapter?: string
      personalNote?: string
    }): Promise<Highlight | null> => {
      try {
        const response = await fetch("/api/highlights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(highlight),
        })

        if (!response.ok) throw new Error("Failed to add highlight")

        const data = (await response.json()) as { highlight: Highlight }
        await fetchHighlights()
        return data.highlight
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add highlight")
        return null
      }
    },
    [fetchHighlights]
  )

  const updateHighlight = useCallback(
    async (
      id: number,
      updates: {
        content?: string
        pageNumber?: number
        chapter?: string
        personalNote?: string
      }
    ): Promise<boolean> => {
      try {
        const response = await fetch("/api/highlights", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        })

        if (!response.ok) throw new Error("Failed to update highlight")

        await fetchHighlights()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update highlight")
        return false
      }
    },
    [fetchHighlights]
  )

  const removeHighlight = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const response = await fetch(`/api/highlights?id=${id}`, {
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to remove highlight")

        await fetchHighlights()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove highlight")
        return false
      }
    },
    [fetchHighlights]
  )

  const searchHighlightsFunc = useCallback(
    async (query: string): Promise<Highlight[]> => {
      try {
        const params = new URLSearchParams({ search: query })
        const response = await fetch(`/api/highlights?${params}`)

        if (!response.ok) throw new Error("Failed to search highlights")

        const data = (await response.json()) as HighlightsData
        return data.highlights || []
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search highlights")
        return []
      }
    },
    []
  )

  return {
    highlights,
    total,
    isLoading,
    error,
    refetch: fetchHighlights,
    addHighlight,
    updateHighlight,
    removeHighlight,
    searchHighlights: searchHighlightsFunc,
  }
}
