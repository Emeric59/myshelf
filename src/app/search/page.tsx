"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Book, Film, Tv, Loader2, X } from "lucide-react"
import { Header } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { MediaCard, SearchDetailModal } from "@/components/media"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MediaType, SearchResult } from "@/types"

type FilterType = MediaType | "all"

const typeFilters: { value: FilterType; label: string; icon: typeof Book }[] = [
  { value: "all", label: "Tous", icon: Search },
  { value: "book", label: "Livres", icon: Book },
  { value: "movie", label: "Films", icon: Film },
  { value: "show", label: "Séries", icon: Tv },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const initialType = (searchParams.get("type") as FilterType) || "all"

  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<FilterType>(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Modal state
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        q: query,
        ...(typeFilter !== "all" && { type: typeFilter }),
      })

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json() as { results: SearchResult[] }
      setResults(data.results || [])
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, typeFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query, typeFilter, performSearch])

  // Open detail modal
  const openDetailModal = (result: SearchResult) => {
    setSelectedResult(result)
    setIsModalOpen(true)
  }

  const handleAddToLibrary = async (result: SearchResult) => {
    setIsAdding(true)
    try {
      // For books, send all consolidated data
      const payload = result.type === "book"
        ? {
            id: result.id,
            status: "to_read",
            bookData: {
              id: result.id,
              title: result.title,
              authors: result.subtitle ? [result.subtitle] : [],
              coverUrl: result.image_url,
              publishedDate: result.year,
              genres: result.genres,
              tropes: result.tropes,
              moods: result.moods,
              contentWarnings: result.contentWarnings,
              seriesName: result.seriesName,
            },
          }
        : {
            id: result.id,
            status: "to_watch",
          }

      const response = await fetch(`/api/${result.type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Update local state to show as added
        setResults((prev) =>
          prev.map((r) =>
            r.id === result.id ? { ...r, in_library: true } : r
          )
        )
        // Also update selected result if it's the same
        if (selectedResult?.id === result.id) {
          setSelectedResult({ ...result, in_library: true })
        }
      } else {
        const error = await response.json()
        console.error("Failed to add:", error)
      }
    } catch (error) {
      console.error("Error adding to library:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const filteredResults =
    typeFilter === "all"
      ? results
      : results.filter((r) => r.type === typeFilter)

  const groupedResults = {
    book: results.filter((r) => r.type === "book"),
    movie: results.filter((r) => r.type === "movie"),
    show: results.filter((r) => r.type === "show"),
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Rechercher" showBack showSearch={false} />

      <main className="container px-4 py-6">
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un livre, film ou série..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 h-12 text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                setResults([])
                setHasSearched(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {typeFilters.map((filter) => (
            <Badge
              key={filter.value}
              variant={typeFilter === filter.value ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap gap-1",
                typeFilter === filter.value && "bg-primary"
              )}
              onClick={() => setTypeFilter(filter.value)}
            >
              <filter.icon className="h-3 w-3" />
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <>
            {filteredResults.length > 0 ? (
              <div className="space-y-6">
                {typeFilter === "all" ? (
                  // Grouped view
                  <>
                    {groupedResults.book.length > 0 && (
                      <section>
                        <h3 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
                          <Book className="h-5 w-5 text-primary" />
                          Livres ({groupedResults.book.length})
                        </h3>
                        <div className="space-y-3">
                          {groupedResults.book.map((result) => (
                            <MediaCard
                              key={`book-${result.id}`}
                              id={result.id}
                              type="book"
                              title={result.title}
                              subtitle={result.subtitle}
                              imageUrl={result.image_url}
                              rating={result.rating}
                              year={result.year}
                              genres={result.genres}
                              tropes={result.tropes}
                              moods={result.moods}
                              seriesName={result.seriesName}
                              sources={result.sources}
                              inLibrary={result.in_library}
                              onClick={() => openDetailModal(result)}
                              onAdd={() => openDetailModal(result)}
                              variant="search"
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {groupedResults.movie.length > 0 && (
                      <section>
                        <h3 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
                          <Film className="h-5 w-5 text-primary" />
                          Films ({groupedResults.movie.length})
                        </h3>
                        <div className="space-y-3">
                          {groupedResults.movie.map((result) => (
                            <MediaCard
                              key={`movie-${result.id}`}
                              id={result.id}
                              type="movie"
                              title={result.title}
                              subtitle={result.subtitle}
                              imageUrl={result.image_url}
                              rating={result.rating}
                              year={result.year}
                              inLibrary={result.in_library}
                              onClick={() => openDetailModal(result)}
                              onAdd={() => openDetailModal(result)}
                              variant="search"
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    {groupedResults.show.length > 0 && (
                      <section>
                        <h3 className="font-display text-lg font-medium mb-3 flex items-center gap-2">
                          <Tv className="h-5 w-5 text-primary" />
                          Séries ({groupedResults.show.length})
                        </h3>
                        <div className="space-y-3">
                          {groupedResults.show.map((result) => (
                            <MediaCard
                              key={`show-${result.id}`}
                              id={result.id}
                              type="show"
                              title={result.title}
                              subtitle={result.subtitle}
                              imageUrl={result.image_url}
                              rating={result.rating}
                              year={result.year}
                              inLibrary={result.in_library}
                              onClick={() => openDetailModal(result)}
                              onAdd={() => openDetailModal(result)}
                              variant="search"
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  // Flat view for single type
                  <div className="space-y-3">
                    {filteredResults.map((result) => (
                      <MediaCard
                        key={`${result.type}-${result.id}`}
                        id={result.id}
                        type={result.type}
                        title={result.title}
                        subtitle={result.subtitle}
                        imageUrl={result.image_url}
                        rating={result.rating}
                        year={result.year}
                        genres={result.genres}
                        tropes={result.tropes}
                        moods={result.moods}
                        seriesName={result.seriesName}
                        sources={result.sources}
                        inLibrary={result.in_library}
                        onClick={() => openDetailModal(result)}
                        onAdd={() => openDetailModal(result)}
                        variant="search"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-medium mb-2">
                  Aucun résultat
                </h3>
                <p className="text-muted-foreground">
                  Aucun média trouvé pour "{query}"
                </p>
              </div>
            )}
          </>
        )}

        {/* Initial state */}
        {!isLoading && !hasSearched && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium mb-2">
              Recherche unifiée
            </h3>
            <p className="text-muted-foreground">
              Tape au moins 2 caractères pour chercher dans les livres, films et
              séries
            </p>
          </div>
        )}
      </main>

      {/* Detail modal */}
      <SearchDetailModal
        result={selectedResult}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={handleAddToLibrary}
        isAdding={isAdding}
      />

      <BottomNav />
    </div>
  )
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Rechercher" showBack showSearch={false} />
      <main className="container px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  )
}
