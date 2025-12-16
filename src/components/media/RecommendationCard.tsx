"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Book, Film, Tv, Check, X, Loader2, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { stripHtml } from "@/lib/utils"
import type { SearchResult } from "@/types"

// Helper to capitalize first letter
function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Helper to ensure tag is a string
function getTagString(tag: unknown): string {
  let result: string
  if (typeof tag === "string") {
    result = tag
  } else if (tag && typeof tag === "object" && "tag" in tag) {
    result = (tag as { tag: string }).tag
  } else {
    result = String(tag)
  }
  return capitalize(result)
}

interface RecommendationCardProps {
  type: "book" | "movie" | "show"
  title: string
  subtitle?: string
  reason: string
  added?: boolean
  onAdd: () => Promise<void>
  onDismiss: () => void
}

const typeIcons = {
  book: Book,
  movie: Film,
  show: Tv,
}

const typeLabels = {
  book: "Livre",
  movie: "Film",
  show: "Série",
}

export function RecommendationCard({
  type,
  title,
  subtitle,
  reason,
  added = false,
  onAdd,
  onDismiss,
}: RecommendationCardProps) {
  const [enrichedData, setEnrichedData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSavingWishlist, setIsSavingWishlist] = useState(false)
  const [savedToWishlist, setSavedToWishlist] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const Icon = typeIcons[type]
  const typeLabel = typeLabels[type]

  // Fetch enriched data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(title)}&type=${type}`
        )
        const data = await res.json() as { results?: SearchResult[] }
        if (data.results && data.results.length > 0) {
          setEnrichedData(data.results[0])
        }
      } catch (error) {
        console.error("Error fetching recommendation data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [title, type])

  const handleAdd = async () => {
    setIsAdding(true)
    try {
      await onAdd()
      setModalOpen(false)
    } finally {
      setIsAdding(false)
    }
  }

  const handleCardClick = () => {
    if (!added && !savedToWishlist) {
      setModalOpen(true)
    }
  }

  const imageUrl = enrichedData?.image_url
  const displayTitle = enrichedData?.title || title
  const displaySubtitle = enrichedData?.subtitle || subtitle

  const handleSaveToWishlist = async () => {
    setIsSavingWishlist(true)
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: type,
          externalId: enrichedData?.id,
          title: displayTitle,
          subtitle: displaySubtitle,
          imageUrl: enrichedData?.image_url,
          description: enrichedData?.description,
          genres: enrichedData?.genres,
          reason,
        }),
      })
      if (res.ok) {
        setSavedToWishlist(true)
        setModalOpen(false)
      } else if (res.status === 409) {
        // Already in wishlist
        setSavedToWishlist(true)
        setModalOpen(false)
      } else {
        // Log error for debugging
        const errorData = await res.json().catch(() => ({}))
        console.error("Wishlist API error:", res.status, errorData)
        alert("Erreur lors de la sauvegarde. La fonctionnalité est peut-être en cours de déploiement.")
      }
    } catch (error) {
      console.error("Error saving to wishlist:", error)
      alert("Erreur de connexion. Réessaie plus tard.")
    } finally {
      setIsSavingWishlist(false)
    }
  }
  const description = enrichedData?.description ? stripHtml(enrichedData.description) : undefined
  const genres = enrichedData?.genres
  const tropes = enrichedData?.tropes
  const moods = enrichedData?.moods
  const contentWarnings = enrichedData?.contentWarnings

  return (
    <>
      <Card className="bg-background overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            {/* Image / Icon */}
            <button
              onClick={handleCardClick}
              className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted hover:opacity-80 transition-opacity"
              disabled={added}
            >
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </button>

            {/* Content */}
            <button
              onClick={handleCardClick}
              className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
              disabled={added}
            >
              <h4 className="font-medium text-sm line-clamp-2">
                {displayTitle}
              </h4>
              {displaySubtitle && (
                <p className="text-xs text-muted-foreground">
                  {displaySubtitle}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                "{reason}"
              </p>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {savedToWishlist ? (
                <Button size="sm" variant="default" disabled>
                  <Heart className="h-4 w-4 mr-1 fill-current" />
                  Sauvé
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={added ? "default" : "secondary"}
                    disabled={isAdding || added}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAdd()
                    }}
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : added ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Ajouté
                      </>
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                  {!added && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-pink-500"
                        disabled={isSavingWishlist}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveToWishlist()
                        }}
                      >
                        {isSavingWishlist ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDismiss()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {typeLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6 max-h-[60vh]">
            <div className="space-y-4 pb-4">
              {/* Cover + Basic info */}
              <div className="flex gap-4">
                {/* Cover */}
                <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={displayTitle}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight">
                    {displayTitle}
                  </h3>
                  {displaySubtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {displaySubtitle}
                    </p>
                  )}
                  {/* Only show year if subtitle doesn't already contain it (for movies/shows) */}
                  {enrichedData?.year && displaySubtitle !== String(enrichedData.year) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {enrichedData.year}
                    </p>
                  )}
                  {enrichedData?.pageCount && (
                    <p className="text-sm text-muted-foreground">
                      {enrichedData.pageCount} pages
                    </p>
                  )}
                  {enrichedData?.seriesName && (
                    <p className="text-sm text-primary font-medium mt-2">
                      {enrichedData.seriesName}
                      {enrichedData.seriesPosition && ` #${enrichedData.seriesPosition}`}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Reason */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm italic text-primary">
                  "{reason}"
                </p>
              </div>

              {/* Description */}
              {description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Synopsis</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {description}
                  </p>
                </div>
              )}

              {/* Genres */}
              {genres && genres.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Genres</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.slice(0, 5).map((genre, i) => (
                      <Badge key={`genre-${i}`} variant="secondary">
                        {getTagString(genre)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tropes */}
              {tropes && tropes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tropes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tropes.slice(0, 6).map((trope, i) => (
                      <Badge
                        key={`trope-${i}`}
                        variant="outline"
                        className="border-primary/50 text-primary"
                      >
                        {getTagString(trope)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Moods */}
              {moods && moods.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Ambiance</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {moods.slice(0, 5).map((mood, i) => (
                      <Badge
                        key={`mood-${i}`}
                        variant="outline"
                        className="border-green-500/50 text-green-600 dark:text-green-400"
                      >
                        {getTagString(mood)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Warnings */}
              {contentWarnings && contentWarnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-orange-600 dark:text-orange-400">
                    Avertissements
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {contentWarnings.slice(0, 6).map((warning, i) => (
                      <Badge
                        key={`warning-${i}`}
                        variant="outline"
                        className="border-orange-500/50 text-orange-600 dark:text-orange-400"
                      >
                        {getTagString(warning)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setModalOpen(false)
                onDismiss()
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Ne plus suggérer
            </Button>
            <Button
              variant="outline"
              className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              onClick={handleSaveToWishlist}
              disabled={isSavingWishlist}
            >
              {isSavingWishlist ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              Plus tard
            </Button>
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
