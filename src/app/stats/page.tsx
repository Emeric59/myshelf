"use client"

import Link from "next/link"
import { BarChart3, Target, Trophy, Book, Film, Tv, TrendingUp, Loader2, Clock } from "lucide-react"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/media"
import { useStats } from "@/lib/hooks"
import { formatDuration, formatLongDuration } from "@/lib/utils"

export default function StatsPage() {
  const { stats, isLoading, error } = useStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="Statistiques" showBack />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    )
  }

  const currentYear = new Date().getFullYear()

  // Extract data from stats
  const booksRead = stats?.books?.read || 0
  const pagesRead = stats?.books?.pagesRead || 0
  const moviesWatched = stats?.movies?.watched || 0
  const showsCompleted = stats?.shows?.watched || 0

  // Current year progress
  const booksThisYear = stats?.currentYear?.booksRead || 0
  const moviesThisYear = stats?.currentYear?.moviesWatched || 0
  const showsThisYear = stats?.currentYear?.showsWatched || 0

  // Goals
  const booksGoal = stats?.goals?.books || 50
  const moviesGoal = stats?.goals?.movies || 52
  const showsGoal = stats?.goals?.shows || 12

  // Average ratings
  const booksAvgRating = stats?.books?.avgRating
  const moviesAvgRating = stats?.movies?.avgRating
  const showsAvgRating = stats?.shows?.avgRating

  // Time stats
  const bookReadingMinutes = stats?.books?.totalReadingMinutes || 0
  const movieWatchMinutes = stats?.movies?.totalWatchMinutes || 0
  const showWatchMinutes = stats?.shows?.totalWatchMinutes || 0
  const episodesWatched = stats?.shows?.episodesWatched || 0
  const totalTimeMinutes = stats?.totalTimeMinutes || 0

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Statistiques" showBack />

      <main className="container px-4 py-6">
        <PageHeader
          title="Tes stats"
          description="Vue d'ensemble de ta consommation de médias"
        />

        {error && (
          <Card className="mb-6 border-amber-500/50">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-500">
                Les données peuvent être incomplètes. Lance l'app avec D1 pour des stats complètes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Book className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{booksRead}</p>
              <p className="text-xs text-muted-foreground">Livres lus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Film className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{moviesWatched}</p>
              <p className="text-xs text-muted-foreground">Films vus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Tv className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{showsCompleted}</p>
              <p className="text-xs text-muted-foreground">Séries finies</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Stats */}
        <section className="mb-6">
          <h3 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Temps total
          </h3>

          {/* Total global */}
          <Card className="mb-4 bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total tous médias</span>
                <span className="text-2xl font-bold text-primary">
                  {formatLongDuration(totalTimeMinutes)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-primary" />
                    <span className="font-medium">Lecture</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatLongDuration(bookReadingMinutes)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pagesRead.toLocaleString()} pages × 2 min/page
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary" />
                    <span className="font-medium">Films</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatLongDuration(movieWatchMinutes)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {moviesWatched} films vus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-primary" />
                    <span className="font-medium">Séries</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {formatLongDuration(showWatchMinutes)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {episodesWatched} épisodes vus
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Goals Progress */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Objectifs {currentYear}
            </h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/stats/goals">Modifier</Link>
            </Button>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-primary" />
                    <span className="font-medium">Livres</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {booksThisYear} / {booksGoal}
                  </span>
                </div>
                <ProgressBar
                  current={booksThisYear}
                  total={booksGoal}
                  showPercentage
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary" />
                    <span className="font-medium">Films</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {moviesThisYear} / {moviesGoal}
                  </span>
                </div>
                <ProgressBar
                  current={moviesThisYear}
                  total={moviesGoal}
                  showPercentage
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-primary" />
                    <span className="font-medium">Séries</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {showsThisYear} / {showsGoal}
                  </span>
                </div>
                <ProgressBar
                  current={showsThisYear}
                  total={showsGoal}
                  showPercentage
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rankings Link */}
        <section className="mb-6">
          <Link href="/stats/rankings">
            <Card className="hover:border-primary transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Mes classements</h4>
                    <p className="text-sm text-muted-foreground">
                      Top 10 livres, films et séries
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Detailed Stats */}
        <section>
          <h3 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Détails
          </h3>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Lecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pages lues</p>
                    <p className="text-lg font-semibold">{pagesRead.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Note moyenne</p>
                    <p className="text-lg font-semibold">
                      {booksAvgRating ? booksAvgRating.toFixed(1) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  Films
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">À regarder</p>
                    <p className="text-lg font-semibold">{stats?.movies?.toWatch || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Note moyenne</p>
                    <p className="text-lg font-semibold">
                      {moviesAvgRating ? moviesAvgRating.toFixed(1) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  Séries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">En cours</p>
                    <p className="text-lg font-semibold">{stats?.shows?.watching || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Note moyenne</p>
                    <p className="text-lg font-semibold">
                      {showsAvgRating ? showsAvgRating.toFixed(1) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
