"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Book, Film, Tv, Loader2, Star, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout"
import { cn } from "@/lib/utils"

type Category = "books" | "movies" | "shows"

interface RatedMedia {
  id: string
  title: string
  subtitle: string
  rating: number
  posterUrl?: string
  type: Category
}

interface RatingGroup {
  rating: number
  items: RatedMedia[]
  expanded: boolean
}

export default function RankingsPage() {
  const [category, setCategory] = useState<Category>("books")
  const [ratingGroups, setRatingGroups] = useState<RatingGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRankings(category)
  }, [category])

  const fetchRankings = async (cat: Category) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/${cat}`)
      if (!response.ok) throw new Error("Failed to fetch")

      interface MediaItem {
        id?: string
        book_id?: string
        movie_id?: string
        show_id?: string
        title: string
        author?: string
        director?: string
        creator?: string
        cover_url?: string
        poster_url?: string
        rating?: number
      }

      const data = await response.json() as Record<string, MediaItem[]>
      const items = data[cat] || data.books || data.movies || data.shows || []

      // Group items by rating (5, 4, 3, 2, 1)
      const groups: RatingGroup[] = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        items: items
          .filter((item) => item.rating === rating)
          .map((item) => ({
            id: item.book_id || item.movie_id || item.show_id || item.id || "",
            title: item.title,
            subtitle: item.author || item.director || item.creator || "",
            rating: item.rating || 0,
            posterUrl: item.cover_url || item.poster_url,
            type: cat,
          })),
        expanded: rating >= 4, // Expand 5 and 4 stars by default
      }))

      // Show all groups (even empty ones) so users can see all rating levels
      setRatingGroups(groups)
    } catch (error) {
      console.error("Error fetching rankings:", error)
      setRatingGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGroup = (rating: number) => {
    setRatingGroups(prev =>
      prev.map(g =>
        g.rating === rating ? { ...g, expanded: !g.expanded } : g
      )
    )
  }

  const categories: { value: Category; label: string; icon: typeof Book }[] = [
    { value: "books", label: "Livres", icon: Book },
    { value: "movies", label: "Films", icon: Film },
    { value: "shows", label: "Séries", icon: Tv },
  ]

  const getDetailUrl = (item: RatedMedia) => {
    const type = item.type === "books" ? "books" : item.type === "movies" ? "movies" : "shows"
    return `/${type}/${item.id}`
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return "Coups de coeur"
      case 4: return "Excellents"
      case 3: return "Bien"
      case 2: return "Moyens"
      case 1: return "Pas aimés"
      default: return `${rating} étoiles`
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5: return "text-yellow-500"
      case 4: return "text-emerald-500"
      case 3: return "text-blue-500"
      case 2: return "text-orange-500"
      case 1: return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  const totalRated = ratingGroups.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/stats">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display font-semibold ml-2">Mes favoris</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat.value)}
              className="flex-1"
            >
              <cat.icon className="h-4 w-4 mr-2" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Rating Groups */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : totalRated === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Aucune note pour l'instant</h3>
              <p className="text-sm text-muted-foreground">
                Note tes {category === "books" ? "livres" : category === "movies" ? "films" : "séries"} pour les retrouver ici
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ratingGroups.map((group) => (
              <div key={group.rating}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.rating)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-card border hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex">
                      {Array.from({ length: group.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-4 w-4 fill-current", getRatingColor(group.rating))}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{getRatingLabel(group.rating)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({group.items.length})
                    </span>
                  </div>
                  {group.expanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {/* Group Items */}
                {group.expanded && (
                  group.items.length > 0 ? (
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {group.items.map((item) => (
                        <Link key={item.id} href={getDetailUrl(item)}>
                          <div className="group relative">
                            {/* Poster */}
                            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                              {item.posterUrl ? (
                                <Image
                                  src={item.posterUrl}
                                  alt={item.title}
                                  width={120}
                                  height={180}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {category === "books" ? (
                                    <Book className="h-8 w-8 text-muted-foreground" />
                                  ) : category === "movies" ? (
                                    <Film className="h-8 w-8 text-muted-foreground" />
                                  ) : (
                                    <Tv className="h-8 w-8 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Title */}
                            <p className="mt-1 text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground italic pl-3">
                      Aucun élément dans cette catégorie
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
