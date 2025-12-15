"use client"

import Image from "next/image"
import Link from "next/link"
import { Book, Film, Tv, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RatingStars } from "./RatingStars"
import { StatusBadge } from "./StatusBadge"
import { ProgressBar } from "./ProgressBar"
import type { MediaType, BookStatus, MovieStatus, ShowStatus } from "@/types"

interface MediaCardProps {
  id: string
  type: MediaType
  title: string
  subtitle?: string // author, director, etc.
  imageUrl?: string
  rating?: number
  userRating?: number
  status?: BookStatus | MovieStatus | ShowStatus
  progress?: {
    current: number
    total: number
  }
  year?: string
  genres?: string[]
  tropes?: string[]
  moods?: string[]
  seriesName?: string
  sources?: string[]
  inLibrary?: boolean
  onAdd?: () => void
  onClick?: () => void
  onStatusChange?: (status: string) => void
  variant?: "default" | "compact" | "search"
  className?: string
}

const typeIcons = {
  book: Book,
  movie: Film,
  show: Tv,
}

const typeLinks = {
  book: "/books",
  movie: "/movies",
  show: "/shows",
}

export function MediaCard({
  id,
  type,
  title,
  subtitle,
  imageUrl,
  rating,
  userRating,
  status,
  progress,
  year,
  genres,
  tropes,
  moods,
  seriesName,
  sources,
  inLibrary,
  onAdd,
  onClick,
  variant = "default",
  className,
}: MediaCardProps) {
  const Icon = typeIcons[type]
  const linkBase = typeLinks[type]

  if (variant === "compact") {
    return (
      <Link href={`${linkBase}/${id}`}>
        <Card
          className={cn(
            "overflow-hidden hover:border-primary transition-colors",
            className
          )}
        >
          <CardContent className="p-3 flex gap-3">
            {/* Cover */}
            <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{title}</h4>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
              {progress && (
                <ProgressBar
                  current={progress.current}
                  total={progress.total}
                  size="sm"
                  showPercentage
                  className="mt-2"
                />
              )}
            </div>

            {/* Status */}
            {status && (
              <div className="flex-shrink-0">
                <StatusBadge status={status} />
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (variant === "search") {
    // Combine tropes and moods for display (limit to 4 total)
    const tags = [...(tropes || []), ...(moods || [])].slice(0, 4)
    const hasEnrichment = tags.length > 0

    return (
      <Card
        className={cn(
          "overflow-hidden hover:border-primary transition-colors cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 flex gap-4">
          {/* Cover */}
          <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium line-clamp-2 leading-tight">{title}</h4>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>

            <div className="flex items-center gap-2 mt-1">
              {year && (
                <span className="text-xs text-muted-foreground">{year}</span>
              )}
              {seriesName && (
                <span className="text-xs text-primary font-medium truncate">
                  {seriesName}
                </span>
              )}
              {rating && <RatingStars rating={rating / 2} size="sm" />}
            </div>

            {/* Tropes & Moods tags */}
            {hasEnrichment && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Genres fallback if no tropes/moods */}
            {!hasEnrichment && genres && genres.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {genres.slice(0, 3).join(" • ")}
              </p>
            )}

            {/* Sources indicator */}
            {sources && sources.length > 1 && (
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {sources.length} sources
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0">
            {inLibrary ? (
              <Button variant="secondary" size="sm" disabled>
                <Check className="w-4 h-4 mr-1" />
                Ajouté
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant - grid card
  return (
    <Link href={`${linkBase}/${id}`}>
      <Card
        className={cn(
          "overflow-hidden hover:border-primary transition-colors group",
          className
        )}
      >
        {/* Cover */}
        <div className="relative aspect-[2/3] bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Status overlay */}
          {status && (
            <div className="absolute top-2 left-2">
              <StatusBadge status={status} />
            </div>
          )}

          {/* Progress overlay */}
          {progress && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <ProgressBar
                current={progress.current}
                total={progress.total}
                size="sm"
                showPercentage
              />
            </div>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-3">
          <h4 className="font-medium text-sm truncate">{title}</h4>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between mt-2">
            {userRating ? (
              <RatingStars rating={userRating} size="sm" />
            ) : rating ? (
              <RatingStars rating={rating / 2} size="sm" />
            ) : (
              <span className="text-xs text-muted-foreground">Non noté</span>
            )}
            {year && (
              <span className="text-xs text-muted-foreground">{year}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
