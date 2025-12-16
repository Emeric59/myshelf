"use client"

import { useState, useEffect } from "react"
import { Book, Film, Tv, Search, Sparkles, BarChart3, Loader2, ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BottomNav } from "@/components/layout"

interface LibraryCounts {
  books: number
  movies: number
  shows: number
}

interface CurrentMedia {
  id: string
  title: string
  subtitle?: string
  coverUrl?: string
  type: "book" | "show"
  progress?: number
  current?: string
}

export default function Home() {
  const [counts, setCounts] = useState<LibraryCounts>({ books: 0, movies: 0, shows: 0 })
  const [currentMedia, setCurrentMedia] = useState<CurrentMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, moviesRes, showsRes] = await Promise.all([
          fetch("/api/books"),
          fetch("/api/movies"),
          fetch("/api/shows"),
        ])

        interface BookItem {
          book_id?: string
          id?: string
          title: string
          author?: string
          cover_url?: string
          status: string
          current_page?: number
          page_count?: number
        }

        interface ShowItem {
          show_id?: string
          id?: string
          title: string
          creator?: string
          poster_url?: string
          status: string
          current_season?: number
          current_episode?: number
          total_seasons?: number
          total_episodes?: number
        }

        const [booksData, moviesData, showsData] = await Promise.all([
          booksRes.json() as Promise<{ total: number; books: BookItem[] }>,
          moviesRes.json() as Promise<{ total: number }>,
          showsRes.json() as Promise<{ total: number; shows: ShowItem[] }>,
        ])

        setCounts({
          books: booksData.total || 0,
          movies: moviesData.total || 0,
          shows: showsData.total || 0,
        })

        // Extract currently reading/watching items
        const current: CurrentMedia[] = []

        // Books in reading status
        const readingBooks = (booksData.books || []).filter((b) => b.status === "reading")
        readingBooks.slice(0, 2).forEach((book) => {
          const progress = book.current_page && book.page_count
            ? Math.round((book.current_page / book.page_count) * 100)
            : undefined
          current.push({
            id: book.book_id || book.id || "",
            title: book.title,
            subtitle: book.author,
            coverUrl: book.cover_url,
            type: "book",
            progress,
            current: book.current_page ? `Page ${book.current_page}` : undefined,
          })
        })

        // Shows in watching status
        const watchingShows = (showsData.shows || []).filter((s) => s.status === "watching")
        watchingShows.slice(0, 2).forEach((show) => {
          const totalEp = show.total_episodes || 0
          const currentEp = show.current_episode || 0
          const progress = totalEp > 0 ? Math.round((currentEp / totalEp) * 100) : undefined
          current.push({
            id: show.show_id || show.id || "",
            title: show.title,
            subtitle: show.creator,
            coverUrl: show.poster_url,
            type: "show",
            progress,
            current: show.current_season ? `S${show.current_season}E${show.current_episode || 0}` : undefined,
          })
        })

        setCurrentMedia(current)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="font-display text-xl font-semibold text-primary">
            MyShelf
          </h1>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-24">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Bienvenue sur MyShelf
          </h2>
          <p className="text-muted-foreground">
            Ta bibliothèque personnelle de livres, films et séries.
          </p>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="font-display text-lg font-medium mb-4">
            Commencer
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/search">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <Search className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Rechercher</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Trouver un livre, film ou série
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recommendations/ask">
              <Card className="hover:border-secondary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <Sparkles className="h-8 w-8 text-secondary mb-2" />
                  <CardTitle className="text-base">Recommandations</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Suggestions personnalisées
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Currently Reading/Watching */}
        {currentMedia.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-medium flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                En cours
              </h3>
            </div>
            <div className="space-y-3">
              {currentMedia.map((media) => (
                <Link key={`${media.type}-${media.id}`} href={`/${media.type}s/${media.id}`} prefetch={false}>
                  <Card className="hover:border-primary transition-colors">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                          {media.coverUrl ? (
                            <Image
                              src={media.coverUrl}
                              alt={media.title}
                              width={48}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {media.type === "book" ? (
                                <Book className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Tv className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{media.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {media.subtitle || (media.type === "book" ? "Auteur inconnu" : "Créateur inconnu")}
                          </p>
                          {media.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{media.current}</span>
                                <span>{media.progress}%</span>
                              </div>
                              <Progress value={media.progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Library Sections */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium">
              Ma bibliothèque
            </h3>
            <Link href="/library">
              <Button variant="ghost" size="sm">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/books">
              <Card className="hover:border-primary transition-colors cursor-pointer text-center">
                <CardContent className="pt-6">
                  <Book className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="font-medium">Livres</p>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mt-1 text-primary" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{counts.books}</p>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/movies">
              <Card className="hover:border-primary transition-colors cursor-pointer text-center">
                <CardContent className="pt-6">
                  <Film className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="font-medium">Films</p>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mt-1 text-primary" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{counts.movies}</p>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/shows">
              <Card className="hover:border-primary transition-colors cursor-pointer text-center">
                <CardContent className="pt-6">
                  <Tv className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="font-medium">Séries</p>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mt-1 text-primary" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{counts.shows}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Stats Preview */}
        <section>
          <h3 className="font-display text-lg font-medium mb-4">
            Statistiques
          </h3>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {counts.books + counts.movies + counts.shows > 0
                        ? `${counts.books + counts.movies + counts.shows} médias dans ta bibliothèque`
                        : "Commence à tracker tes médias pour voir tes stats !"}
                    </p>
                  </div>
                </div>
                <Link href="/stats">
                  <Button variant="outline" size="sm">
                    Voir les stats
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
