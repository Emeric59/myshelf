"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  ArrowLeft,
  Trash2,
  Loader2,
  BookOpen,
  Film,
  Tv,
  Plus,
  Sparkles,
} from "lucide-react"
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
import { BottomNav } from "@/components/layout"
import { cn } from "@/lib/utils"
import type { WishlistItem, MediaType } from "@/types"

type FilterType = "all" | MediaType

const MEDIA_TYPE_LABELS: Record<string, string> = {
  book: "Livre",
  movie: "Film",
  show: "Série",
}

const MediaIcon = ({ type }: { type: MediaType }) => {
  switch (type) {
    case "book":
      return <BookOpen className="h-4 w-4" />
    case "movie":
      return <Film className="h-4 w-4" />
    case "show":
      return <Tv className="h-4 w-4" />
  }
}

const filterOptions: { value: FilterType; label: string; icon: typeof Heart }[] = [
  { value: "all", label: "Tous", icon: Heart },
  { value: "book", label: "Livres", icon: BookOpen },
  { value: "movie", label: "Films", icon: Film },
  { value: "show", label: "Séries", icon: Tv },
]

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [removing, setRemoving] = useState<number | null>(null)
  const [adding, setAdding] = useState<number | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<WishlistItem | null>(null)
  const [confirmAdd, setConfirmAdd] = useState<WishlistItem | null>(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist")
      if (res.ok) {
        const data = (await res.json()) as { items: WishlistItem[] }
        setItems(data.items)
      }
    } catch (error) {
      console.error("Error loading wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (item: WishlistItem) => {
    setRemoving(item.id)
    try {
      const res = await fetch(`/api/wishlist?id=${item.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    } finally {
      setRemoving(null)
      setConfirmRemove(null)
    }
  }

  const handleAddToLibrary = async (item: WishlistItem) => {
    setAdding(item.id)
    try {
      // Search for the media to get its external ID
      const searchRes = await fetch(
        `/api/search?q=${encodeURIComponent(item.title)}&type=${item.media_type}`
      )
      const searchData = (await searchRes.json()) as {
        results?: Array<{ id: string }>
      }

      if (!searchData.results || searchData.results.length === 0) {
        alert("Impossible de trouver ce média. Essaie de le chercher manuellement.")
        return
      }

      const media = searchData.results[0]
      const endpoint =
        item.media_type === "book"
          ? "/api/books"
          : item.media_type === "movie"
            ? "/api/movies"
            : "/api/shows"
      const status = item.media_type === "book" ? "to_read" : "to_watch"

      const addRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: media.id, status }),
      })

      if (addRes.ok) {
        // Remove from wishlist after adding to library
        await fetch(`/api/wishlist?id=${item.id}`, { method: "DELETE" })
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    } catch (error) {
      console.error("Error adding to library:", error)
      alert("Erreur lors de l'ajout à la bibliothèque.")
    } finally {
      setAdding(null)
      setConfirmAdd(null)
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

  const filteredItems =
    filter === "all" ? items : items.filter((i) => i.media_type === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recommendations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h1 className="font-display font-semibold">Mes envies</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <p className="text-muted-foreground mb-6">
          Les médias que tu as envie de découvrir plus tard.
        </p>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-4">
          {filterOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all whitespace-nowrap flex-shrink-0",
                  filter === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            )
          })}
        </div>

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "Aucune envie pour le moment."
                  : `Aucun ${MEDIA_TYPE_LABELS[filter].toLowerCase()} dans tes envies.`}
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Sauvegarde des recommandations pour plus tard !
              </p>
              <Button asChild variant="outline">
                <Link href="/recommendations">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Découvrir des recommandations
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="relative w-16 h-24 rounded overflow-hidden bg-muted flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MediaIcon type={item.media_type} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground">
                          {item.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {MEDIA_TYPE_LABELS[item.media_type]}
                        </Badge>
                        {item.genres?.slice(0, 2).map((genre, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      {item.reason && (
                        <p className="text-xs text-muted-foreground mt-2 italic line-clamp-1">
                          &quot;{item.reason}&quot;
                        </p>
                      )}
                      {item.added_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ajouté le {formatDate(item.added_at)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setConfirmAdd(item)}
                        disabled={adding === item.id}
                      >
                        {adding === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmRemove(item)}
                        disabled={removing === item.id}
                      >
                        {removing === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredItems.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            {items.length} {items.length === 1 ? "envie" : "envies"} au total
          </p>
        )}
      </main>

      <BottomNav />

      {/* Confirmation Remove Dialog */}
      <Dialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer de la liste ?</DialogTitle>
            <DialogDescription>
              &quot;{confirmRemove?.title}&quot; sera retiré de tes envies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmRemove && handleRemove(confirmRemove)}
            >
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Add Dialog */}
      <Dialog
        open={!!confirmAdd}
        onOpenChange={(open) => !open && setConfirmAdd(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter à la bibliothèque ?</DialogTitle>
            <DialogDescription>
              &quot;{confirmAdd?.title}&quot; sera ajouté à ta bibliothèque avec
              le statut &quot;
              {confirmAdd?.media_type === "book" ? "À lire" : "À voir"}&quot; et
              retiré de tes envies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAdd(null)}>
              Annuler
            </Button>
            <Button onClick={() => confirmAdd && handleAddToLibrary(confirmAdd)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
