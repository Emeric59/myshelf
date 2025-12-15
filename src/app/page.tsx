"use client"

import { useState, useEffect } from "react"
import { Book, Film, Tv, Search, Sparkles, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BottomNav } from "@/components/layout"

interface LibraryCounts {
  books: number
  movies: number
  shows: number
}

export default function Home() {
  const [counts, setCounts] = useState<LibraryCounts>({ books: 0, movies: 0, shows: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [booksRes, moviesRes, showsRes] = await Promise.all([
          fetch("/api/books"),
          fetch("/api/movies"),
          fetch("/api/shows"),
        ])

        const [booksData, moviesData, showsData] = await Promise.all([
          booksRes.json() as Promise<{ total: number }>,
          moviesRes.json() as Promise<{ total: number }>,
          showsRes.json() as Promise<{ total: number }>,
        ])

        setCounts({
          books: booksData.total || 0,
          movies: moviesData.total || 0,
          shows: showsData.total || 0,
        })
      } catch (error) {
        console.error("Error fetching counts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
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

        {/* Library Sections */}
        <section className="mb-8">
          <h3 className="font-display text-lg font-medium mb-4">
            Ma bibliothèque
          </h3>
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
