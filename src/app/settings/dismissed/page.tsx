"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, X, Loader2, BookOpen, Film, Tv, Ban } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DismissedMedia {
  id: number
  media_type: "book" | "movie" | "show"
  title: string
  media_id: string | null
  reason: "already_consumed" | "not_interested" | "other"
  reason_detail: string | null
  dismissed_at: string
}

const REASON_LABELS: Record<string, string> = {
  already_consumed: "Déjà vu/lu",
  not_interested: "Pas intéressé",
  other: "Autre",
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  book: "Livre",
  movie: "Film",
  show: "Série",
}

const MediaIcon = ({ type }: { type: "book" | "movie" | "show" }) => {
  switch (type) {
    case "book":
      return <BookOpen className="h-4 w-4" />
    case "movie":
      return <Film className="h-4 w-4" />
    case "show":
      return <Tv className="h-4 w-4" />
  }
}

export default function DismissedPage() {
  const [dismissed, setDismissed] = useState<DismissedMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<DismissedMedia | null>(null)

  useEffect(() => {
    fetchDismissed()
  }, [])

  const fetchDismissed = async () => {
    try {
      const res = await fetch("/api/dismissed")
      if (res.ok) {
        const data = (await res.json()) as { dismissed: DismissedMedia[] }
        setDismissed(data.dismissed)
      }
    } catch (error) {
      console.error("Error loading dismissed media:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (item: DismissedMedia) => {
    setRemoving(item.id)
    try {
      const res = await fetch(`/api/dismissed?id=${item.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDismissed((prev) => prev.filter((d) => d.id !== item.id))
      }
    } catch (error) {
      console.error("Error removing dismissed media:", error)
    } finally {
      setRemoving(null)
      setConfirmRemove(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display font-semibold ml-2">Suggestions refusées</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <p className="text-muted-foreground mb-6">
          Les médias que tu as refusés dans les recommandations IA. Ils ne te
          seront plus proposés.
        </p>

        {dismissed.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Aucune suggestion refusée pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Quand tu refuses une recommandation, elle apparaîtra ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dismissed.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted shrink-0">
                      <MediaIcon type={item.media_type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {MEDIA_TYPE_LABELS[item.media_type]}
                        </Badge>
                        <Badge
                          variant={
                            item.reason === "already_consumed"
                              ? "default"
                              : item.reason === "not_interested"
                                ? "outline"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {REASON_LABELS[item.reason]}
                        </Badge>
                      </div>
                      {item.reason === "other" && item.reason_detail && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          &quot;{item.reason_detail}&quot;
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Refusé le {formatDate(item.dismissed_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmRemove(item)}
                      disabled={removing === item.id}
                    >
                      {removing === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {dismissed.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Retire un média de cette liste pour qu&apos;il puisse à nouveau être
            recommandé.
          </p>
        )}
      </main>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer de la liste ?</DialogTitle>
            <DialogDescription>
              &quot;{confirmRemove?.title}&quot; pourra à nouveau apparaître dans tes
              recommandations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Annuler
            </Button>
            <Button onClick={() => confirmRemove && handleRemove(confirmRemove)}>
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
