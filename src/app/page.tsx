"use client"

import { useState, useEffect } from "react"
import { Book, Film, Tv, Search, Sparkles, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="container flex h-16 items-center justify-around px-4">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-primary"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium">Accueil</span>
          </Link>

          <Link
            href="/books"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Book className="h-6 w-6" />
            <span className="text-xs">Biblio</span>
          </Link>

          <Link
            href="/recommendations/ask"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-xs">Recos</span>
          </Link>

          <Link
            href="/stats"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs">Stats</span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs">Plus</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
