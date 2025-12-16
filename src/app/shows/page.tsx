"use client"

import { useState, useMemo } from "react"
import { Tv, Search, Plus, Grid, List, Loader2 } from "lucide-react"
import Link from "next/link"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { MediaCard } from "@/components/media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { sortShows, sortOptions, type SortOption } from "@/lib/utils/sorting"
import { genreOptions, filterByGenre } from "@/lib/constants/genres"
import { useShows } from "@/lib/hooks"
import type { ShowStatus } from "@/types"

const statusFilters: { value: ShowStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "watching", label: "En cours" },
  { value: "to_watch", label: "À voir" },
  { value: "watched", label: "Terminées" },
  { value: "paused", label: "En pause" },
  { value: "abandoned", label: "Abandonnées" },
]

export default function ShowsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ShowStatus | "all">("all")
  const [genreFilter, setGenreFilter] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("in_progress")

  const { shows, counts, isLoading } = useShows()

  const filteredShows = useMemo(() => {
    const filtered = shows.filter((show) => {
      const matchesSearch =
        searchQuery === "" ||
        show.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || show.status === statusFilter
      return matchesSearch && matchesStatus
    })
    const withGenreFilter = filterByGenre(filtered, genreFilter)
    return sortShows(withGenreFilter, sortBy)
  }, [shows, searchQuery, statusFilter, genreFilter, sortBy])

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Mes séries" showBack />

      <main className="container px-4 py-6">
        <PageHeader
          title="Séries"
          description={`${counts.all} série${counts.all > 1 ? "s" : ""} dans ta collection`}
          action={
            <Button asChild>
              <Link href="/search?type=show">
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
              placeholder="Rechercher dans tes séries..."
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

          {/* Genre filter and sort */}
          <div className="flex items-center gap-2 mb-2">
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="flex-1 text-sm border rounded-md px-2 py-1.5 bg-background"
            >
              {genreOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border rounded-md px-2 py-1.5 bg-background"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count and view toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredShows.length} résultat{filteredShows.length > 1 ? "s" : ""}
            </p>
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
        ) : filteredShows.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                : "space-y-3"
            )}
          >
            {filteredShows.map((show) => {
              // Only show progress for shows being watched and with actual progress
              const hasProgress =
                show.status === "watching" &&
                show.current_episode &&
                show.current_episode > 0 &&
                show.total_episodes &&
                show.total_episodes > 0

              return (
                <MediaCard
                  key={show.show_id}
                  id={show.show_id}
                  type="show"
                  title={show.title}
                  imageUrl={show.poster_url}
                  status={show.status}
                  userRating={show.rating}
                  year={show.first_air_date?.slice(0, 4)}
                  progress={
                    hasProgress
                      ? {
                          current: show.current_episode!,
                          total: show.total_episodes!,
                        }
                      : undefined
                  }
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium mb-2">
              {searchQuery || statusFilter !== "all" || genreFilter
                ? "Aucune série trouvée"
                : "Ta collection est vide"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || genreFilter
                ? "Essaie de modifier tes filtres"
                : "Commence par ajouter des séries à ta collection"}
            </p>
            <Button asChild>
              <Link href="/search?type=show">
                <Search className="h-4 w-4 mr-2" />
                Rechercher une série
              </Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
