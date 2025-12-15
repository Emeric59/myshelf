"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Trophy, Book, Film, Tv, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout"
import { cn } from "@/lib/utils"

type Category = "books" | "movies" | "shows"

interface RankedMedia {
  id: string
  title: string
  subtitle: string
  rating: number
  posterUrl?: string
  type: Category
}

export default function RankingsPage() {
  const [category, setCategory] = useState<Category>("books")
  const [rankings, setRankings] = useState<RankedMedia[]>([])
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

      // Filter items with ratings and sort by rating
      const ranked: RankedMedia[] = items
        .filter((item) => item.rating && item.rating > 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10)
        .map((item) => ({
          id: item.id || item.book_id || item.movie_id || item.show_id || "",
          title: item.title,
          subtitle: item.author || item.director || item.creator || "",
          rating: item.rating || 0,
          posterUrl: item.cover_url || item.poster_url,
          type: cat,
        }))

      setRankings(ranked)
    } catch (error) {
      console.error("Error fetching rankings:", error)
      setRankings([])
    } finally {
      setIsLoading(false)
    }
  }

  const categories: { value: Category; label: string; icon: typeof Book }[] = [
    { value: "books", label: "Livres", icon: Book },
    { value: "movies", label: "Films", icon: Film },
    { value: "shows", label: "Séries", icon: Tv },
  ]

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500 text-yellow-950"
      case 1:
        return "bg-gray-300 text-gray-800"
      case 2:
        return "bg-amber-600 text-amber-950"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getDetailUrl = (item: RankedMedia) => {
    const type = item.type === "books" ? "books" : item.type === "movies" ? "movies" : "shows"
    return `/${type}/${item.id}`
  }

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
          <h1 className="font-display font-semibold ml-2">Mes classements</h1>
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

        {/* Rankings List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rankings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Pas encore de classement</h3>
              <p className="text-sm text-muted-foreground">
                Note tes {category === "books" ? "livres" : category === "movies" ? "films" : "séries"} pour voir ton top 10
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rankings.map((item, index) => (
              <Link key={item.id} href={getDetailUrl(item)}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                          getMedalColor(index)
                        )}
                      >
                        {index + 1}
                      </div>

                      {/* Poster */}
                      <div className="w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        {item.posterUrl ? (
                          <Image
                            src={item.posterUrl}
                            alt={item.title}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {category === "books" ? (
                              <Book className="h-5 w-5 text-muted-foreground" />
                            ) : category === "movies" ? (
                              <Film className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Tv className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.subtitle || "Inconnu"}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">{item.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
