"use client"

import { useState, useMemo } from "react"
import { Film, Search, Plus, Grid, List, Loader2 } from "lucide-react"
import Link from "next/link"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { MediaCard } from "@/components/media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { sortMovies, sortOptions, type SortOption } from "@/lib/utils/sorting"
import { useMovies } from "@/lib/hooks"
import type { MovieStatus } from "@/types"

const statusFilters: { value: MovieStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "to_watch", label: "À voir" },
  { value: "watched", label: "Vus" },
]

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MovieStatus | "all">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("in_progress")

  const { movies, counts, isLoading } = useMovies()

  const filteredMovies = useMemo(() => {
    const filtered = movies.filter((movie) => {
      const matchesSearch =
        searchQuery === "" ||
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || movie.status === statusFilter
      return matchesSearch && matchesStatus
    })
    return sortMovies(filtered, sortBy)
  }, [movies, searchQuery, statusFilter, sortBy])

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Ma filmothèque" showBack />

      <main className="container px-4 py-6">
        <PageHeader
          title="Films"
          description={`${counts.all} film${counts.all > 1 ? "s" : ""} dans ta collection`}
          action={
            <Button asChild>
              <Link href="/search?type=movie">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Link>
            </Button>
          }
        />

        {/* Search and filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans tes films..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {statusFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap",
                  statusFilter === filter.value && "bg-primary"
                )}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-70">
                  ({counts[filter.value]})
                </span>
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {filteredMovies.length} résultat{filteredMovies.length > 1 ? "s" : ""}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border rounded-md px-2 py-1 bg-background"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMovies.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                : "space-y-3"
            )}
          >
            {filteredMovies.map((movie) => (
              <MediaCard
                key={movie.movie_id}
                id={movie.movie_id}
                type="movie"
                title={movie.title}
                subtitle={movie.director}
                imageUrl={movie.poster_url}
                status={movie.status}
                userRating={movie.rating}
                year={movie.release_date?.slice(0, 4)}
                variant={viewMode === "list" ? "compact" : "default"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Aucun film trouvé"
                : "Ta filmothèque est vide"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Essaie de modifier tes filtres"
                : "Commence par ajouter des films à ta collection"}
            </p>
            <Button asChild>
              <Link href="/search?type=movie">
                <Search className="h-4 w-4 mr-2" />
                Rechercher un film
              </Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
