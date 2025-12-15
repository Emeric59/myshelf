"use client"

import { useState, useEffect, useCallback } from "react"
import type { Book, UserBook, BookStatus } from "@/types"

interface BooksData {
  books: (UserBook & Book)[]
  total: number
  counts: Record<BookStatus | "all", number>
}

interface UseBooks {
  books: (UserBook & Book)[]
  counts: Record<BookStatus | "all", number>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  addBook: (bookId: string, status?: BookStatus) => Promise<boolean>
  updateStatus: (bookId: string, status: BookStatus) => Promise<boolean>
  removeBook: (bookId: string) => Promise<boolean>
}

export function useBooks(statusFilter?: BookStatus): UseBooks {
  const [books, setBooks] = useState<(UserBook & Book)[]>([])
  const [counts, setCounts] = useState<Record<BookStatus | "all", number>>({
    all: 0,
    to_read: 0,
    reading: 0,
    read: 0,
    abandoned: 0,
    blacklist: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (statusFilter) {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/books?${params}`)
      if (!response.ok) throw new Error("Failed to fetch books")

      const data = (await response.json()) as BooksData
      setBooks(data.books || [])
      setCounts(data.counts || {
        all: 0,
        to_read: 0,
        reading: 0,
        read: 0,
        abandoned: 0,
        blacklist: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setBooks([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const addBook = useCallback(async (bookId: string, status: BookStatus = "to_read"): Promise<boolean> => {
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookId, status }),
      })

      if (!response.ok) throw new Error("Failed to add book")

      await fetchBooks()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add book")
      return false
    }
  }, [fetchBooks])

  const updateStatus = useCallback(async (bookId: string, status: BookStatus): Promise<boolean> => {
    try {
      const response = await fetch("/api/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookId, status }),
      })

      if (!response.ok) throw new Error("Failed to update book")

      await fetchBooks()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update book")
      return false
    }
  }, [fetchBooks])

  const removeBook = useCallback(async (bookId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/books?id=${bookId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove book")

      await fetchBooks()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove book")
      return false
    }
  }, [fetchBooks])

  return {
    books,
    counts,
    isLoading,
    error,
    refetch: fetchBooks,
    addBook,
    updateStatus,
    removeBook,
  }
}
