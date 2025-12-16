"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Tv,
  Film,
  BookOpen,
  RefreshCw,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout"
import type { UpcomingRelease } from "@/types"

// Media type icons
const MediaIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "book":
      return <BookOpen className="h-4 w-4" />
    case "movie":
      return <Film className="h-4 w-4" />
    case "show":
      return <Tv className="h-4 w-4" />
    default:
      return null
  }
}

// Status labels in French
const STATUS_LABELS: Record<string, string> = {
  watching: "En cours",
  to_watch: "À voir",
  paused: "En pause",
}

// Month names in French
const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

export default function UpcomingPage() {
  const [releases, setReleases] = useState<UpcomingRelease[]>([])
  const [grouped, setGrouped] = useState<Record<string, UpcomingRelease[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchUpcoming()
  }, [])

  const fetchUpcoming = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    try {
      const url = refresh ? "/api/upcoming?refresh=true" : "/api/upcoming"
      const res = await fetch(url)
      if (res.ok) {
        const data = (await res.json()) as {
          upcoming: UpcomingRelease[]
          grouped: Record<string, UpcomingRelease[]>
        }
        setReleases(data.upcoming)
        setGrouped(data.grouped)
      }
    } catch (error) {
      console.error("Error loading upcoming:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchUpcoming(true)
  }

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const monthIndex = parseInt(month, 10) - 1
    const currentYear = new Date().getFullYear()

    if (parseInt(year, 10) === currentYear) {
      return MONTH_NAMES[monthIndex]
    }
    return `${MONTH_NAMES[monthIndex]} ${year}`
  }

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const releaseDate = new Date(date)
    releaseDate.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil(
      (releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Demain"
    if (diffDays <= 7) return `Dans ${diffDays} jours`

    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const sortedMonths = Object.keys(grouped).sort()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h1 className="font-display font-semibold">Prochaines sorties</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6">
        <p className="text-muted-foreground mb-6">
          Les prochains épisodes et sorties des séries que tu suis.
        </p>

        {releases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Aucune sortie à venir pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Les séries que tu regardes apparaîtront ici quand de nouveaux
                épisodes seront annoncés.
              </p>
              <Button asChild variant="outline">
                <Link href="/shows">
                  <Tv className="h-4 w-4 mr-2" />
                  Voir mes séries
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey) => (
              <div key={monthKey}>
                <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  {formatMonthHeader(monthKey)}
                </h2>
                <div className="space-y-3">
                  {grouped[monthKey].map((release, index) => {
                    const daysUntil = getDaysUntil(release.release_date)
                    const isImminent = daysUntil <= 3
                    const isToday = daysUntil === 0

                    return (
                      <Link
                        key={`${release.media_id}-${index}`}
                        href={`/${release.media_type}s/${release.media_id}`}
                        prefetch={false}
                      >
                        <Card
                          className={`overflow-hidden transition-colors hover:border-primary ${
                            isToday
                              ? "border-green-500 bg-green-500/5"
                              : isImminent
                                ? "border-orange-500/50"
                                : ""
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              {/* Poster */}
                              <div className="relative w-12 h-18 rounded overflow-hidden bg-muted flex-shrink-0">
                                {release.poster_url ? (
                                  <Image
                                    src={release.poster_url}
                                    alt={release.title}
                                    width={48}
                                    height={72}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <MediaIcon type={release.media_type} />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">
                                      {release.title}
                                    </h3>
                                    <p className="text-sm text-primary font-medium">
                                      {release.release_info}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p
                                      className={`text-sm font-medium ${
                                        isToday
                                          ? "text-green-600"
                                          : isImminent
                                            ? "text-orange-600"
                                            : "text-muted-foreground"
                                      }`}
                                    >
                                      {formatReleaseDate(release.release_date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    <MediaIcon type={release.media_type} />
                                    <span className="ml-1">
                                      {release.media_type === "show"
                                        ? "Série"
                                        : release.media_type === "movie"
                                          ? "Film"
                                          : "Livre"}
                                    </span>
                                  </Badge>
                                  {release.status && (
                                    <Badge variant="outline" className="text-xs">
                                      {STATUS_LABELS[release.status] ||
                                        release.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {releases.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            {releases.length} sortie{releases.length > 1 ? "s" : ""} à venir
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
