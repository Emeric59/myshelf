"use client"

import Link from "next/link"
import { Book, Film, Tv, ChevronRight, Loader2 } from "lucide-react"
import { Header } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { useBooks, useMovies, useShows } from "@/lib/hooks"

export default function LibraryPage() {
  const { counts: bookCounts, isLoading: booksLoading } = useBooks()
  const { counts: movieCounts, isLoading: moviesLoading } = useMovies()
  const { counts: showCounts, isLoading: showsLoading } = useShows()

  const isLoading = booksLoading || moviesLoading || showsLoading

  const categories = [
    {
      href: "/books",
      icon: Book,
      label: "Livres",
      count: bookCounts.all,
      color: "text-emerald-500 bg-emerald-500/10",
      description: `${bookCounts.reading || 0} en cours`,
    },
    {
      href: "/movies",
      icon: Film,
      label: "Films",
      count: movieCounts.all,
      color: "text-purple-500 bg-purple-500/10",
      description: `${movieCounts.to_watch || 0} à voir`,
    },
    {
      href: "/shows",
      icon: Tv,
      label: "Séries",
      count: showCounts.all,
      color: "text-blue-500 bg-blue-500/10",
      description: `${showCounts.watching || 0} en cours`,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Ma bibliothèque" showBack={false} showSearch={false} />

      <main className="container px-4 py-6">
        <h1 className="font-display text-2xl font-bold mb-2">Bibliothèque</h1>
        <p className="text-muted-foreground mb-6">
          Tous tes médias au même endroit
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <Link key={category.href} href={category.href}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h2 className="font-display font-semibold text-lg">
                            {category.label}
                          </h2>
                          <span className="text-2xl font-bold text-primary">
                            {category.count}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
