"use client"

import Image from "next/image"
import { Book, Film, Tv, Plus, Check, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { stripHtml } from "@/lib/utils"
import type { SearchResult } from "@/types"

// Helper to capitalize first letter
function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Helper to ensure tag is a string (handles both string and object formats)
// Always capitalizes the first letter for consistency
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

interface SearchDetailModalProps {
  result: SearchResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (result: SearchResult) => Promise<void>
  isAdding?: boolean
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

export function SearchDetailModal({
  result,
  open,
  onOpenChange,
  onAdd,
  isAdding = false,
}: SearchDetailModalProps) {
  if (!result) return null

  const Icon = typeIcons[result.type]
  const typeLabel = typeLabels[result.type]

  const handleAdd = async () => {
    await onAdd(result)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {result.image_url ? (
                  <Image
                    src={result.image_url}
                    alt={result.title}
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
                  {result.title}
                </h3>
                {result.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {result.year && <span>{result.year}</span>}
                  {result.pageCount && <span>{result.pageCount} pages</span>}
                </div>
                {result.seriesName && (
                  <p className="text-sm text-primary font-medium mt-2">
                    {result.seriesName}
                    {result.seriesPosition && ` #${result.seriesPosition}`}
                  </p>
                )}

                {/* Sources */}
                {result.sources && result.sources.length > 0 && (
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Sources: {result.sources.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Synopsis</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {stripHtml(result.description)}
                </p>
              </div>
            )}

            {/* Genres */}
            {result.genres && result.genres.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Genres</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.genres.slice(0, 5).map((genre, i) => (
                    <Badge key={`genre-${i}`} variant="secondary">
                      {getTagString(genre)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tropes */}
            {result.tropes && result.tropes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tropes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.tropes.slice(0, 6).map((trope, i) => (
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
            {result.moods && result.moods.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Ambiance</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.moods.slice(0, 5).map((mood, i) => (
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
            {result.contentWarnings && result.contentWarnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-orange-600 dark:text-orange-400">
                  Avertissements
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.contentWarnings.slice(0, 6).map((warning, i) => (
                    <Badge
                      key={`warning-${i}`}
                      variant="outline"
                      className="border-orange-500/50 text-orange-600 dark:text-orange-400"
                    >
                      ⚠️ {getTagString(warning)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {result.in_library ? (
            <Button disabled variant="secondary">
              <Check className="w-4 h-4 mr-2" />
              Déjà ajouté
            </Button>
          ) : (
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Ajouter à ma bibliothèque
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
