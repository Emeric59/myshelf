"use client"

export const runtime = 'edge'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Film,
  Star,
  Calendar,
  Clock,
  Trash2,
  MessageSquare,
  Loader2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RatingStars } from "@/components/media"
import { Label } from "@/components/ui/label"
import { stripHtml } from "@/lib/utils"
import type { Movie, UserMovie, MovieStatus } from "@/types"

const statusOptions: { value: MovieStatus; label: string }[] = [
  { value: "to_watch", label: "À voir" },
  { value: "watched", label: "Vu" },
]

const likedAspects = [
  "L'histoire",
  "Les acteurs",
  "La réalisation",
  "La musique",
  "Les effets visuels",
  "Les dialogues",
  "Les rebondissements",
  "L'humour",
  "Les émotions",
  "Le rythme",
  "La fin",
]

const emotionOptions = [
  { id: "made_me_cry", label: "M'a fait pleurer", emoji: "😭" },
  { id: "favorite", label: "Coup de coeur", emoji: "❤️" },
  { id: "tension", label: "Très intense", emoji: "🔥" },
  { id: "plot_twist", label: "Plot twist de fou", emoji: "🤯" },
  { id: "boring", label: "Un peu ennuyeux", emoji: "😴" },
  { id: "feel_good", label: "Feel-good", emoji: "🥰" },
  { id: "scary", label: "Flippant", emoji: "😱" },
  { id: "funny", label: "M'a fait rire", emoji: "😂" },
  { id: "masterpiece", label: "Chef d'oeuvre", emoji: "🏆" },
]

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [movie, setMovie] = useState<(UserMovie & Movie) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [review, setReview] = useState<{
    comment: string
    liked: string[]
    emotions: string[]
  }>({ comment: "", liked: [], emotions: [] })

  useEffect(() => {
    fetchMovie()
    fetchReview()
  }, [id])

  const fetchMovie = async () => {
    try {
      const res = await fetch(`/api/movies?id=${id}`)
      if (res.ok) {
        const data = await res.json() as (UserMovie & Movie) | null
        setMovie(data)
      }
    } catch (error) {
      console.error("Error fetching movie:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReview = async () => {
    try {
      const res = await fetch(`/api/reviews?mediaType=movie&mediaId=${id}`)
      if (res.ok) {
        const data = await res.json() as { comment?: string; liked_aspects?: string; emotions?: string } | null
        if (data) {
          setReview({
            comment: data.comment || "",
            liked: data.liked_aspects ? JSON.parse(data.liked_aspects) : [],
            emotions: data.emotions ? JSON.parse(data.emotions) : [],
          })
        }
      }
    } catch (error) {
      console.error("Error fetching review:", error)
    }
  }

  const handleStatusChange = async (status: MovieStatus) => {
    if (!movie) return
    setSaving(true)
    try {
      await fetch("/api/movies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      setMovie({ ...movie, status })
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleRatingChange = async (rating: number) => {
    if (!movie) return
    setSaving(true)
    try {
      await fetch("/api/movies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rating }),
      })
      setMovie({ ...movie, rating })
    } catch (error) {
      console.error("Error updating rating:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleReviewSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: "movie",
          mediaId: id,
          comment: review.comment,
          liked_aspects: review.liked,
          emotions: review.emotions,
        }),
      })
    } catch (error) {
      console.error("Error saving review:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMovie = async () => {
    if (!confirm("Supprimer ce film de ta bibliothèque ?")) return
    try {
      await fetch(`/api/movies?id=${id}`, { method: "DELETE" })
      window.location.href = "/movies"
    } catch (error) {
      console.error("Error deleting movie:", error)
    }
  }

  const toggleLiked = (aspect: string) => {
    setReview(prev => ({
      ...prev,
      liked: prev.liked.includes(aspect)
        ? prev.liked.filter(a => a !== aspect)
        : [...prev.liked, aspect],
    }))
  }

  const toggleEmotion = (emotion: string) => {
    setReview(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion],
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Film className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-xl font-semibold mb-2">Film non trouvé</h1>
        <p className="text-muted-foreground mb-4">Ce film n'est pas dans ta bibliothèque</p>
        <Button asChild>
          <Link href="/movies">Retour à la filmothèque</Link>
        </Button>
      </div>
    )
  }

  const genres = movie.genres ? (typeof movie.genres === 'string' ? JSON.parse(movie.genres) : movie.genres) : []

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with backdrop */}
      <div className="relative h-56">
        {movie.backdrop_url ? (
          <Image
            src={movie.backdrop_url}
            alt={movie.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button variant="ghost" size="icon" asChild className="bg-background/80 backdrop-blur">
            <Link href="/movies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur text-destructive"
            onClick={handleDeleteMovie}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="container px-4 -mt-28 relative z-10">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-28 h-40 rounded-lg overflow-hidden shadow-lg flex-shrink-0 bg-muted">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title}
                width={112}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 pt-20">
            <h1 className="font-display text-xl font-semibold line-clamp-2">{movie.title}</h1>
            <p className="text-muted-foreground">{movie.director || "Réalisateur inconnu"}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {movie.runtime} min
                </span>
              )}
              {movie.release_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {movie.release_date.split("-")[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {genres.map((genre: string) => (
              <Badge key={genre} variant="secondary">{genre}</Badge>
            ))}
          </div>
        )}

        {/* Status */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Statut</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={movie.status === option.value ? "default" : "outline"}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={saving}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Synopsis */}
        {movie.description && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Synopsis</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{stripHtml(movie.description)}</p>
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Note</Label>
            <RatingStars
              rating={movie.rating || 0}
              interactive
              size="lg"
              onChange={handleRatingChange}
            />
          </CardContent>
        </Card>

        {/* Review/Feedback */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Mon avis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* What I liked */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Ce qui m'a plu</Label>
              <div className="flex flex-wrap gap-2">
                {likedAspects.map((aspect) => (
                  <Badge
                    key={aspect}
                    variant={review.liked.includes(aspect) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLiked(aspect)}
                  >
                    {aspect}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Emotions */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Émotions ressenties</Label>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map((emotion) => (
                  <Badge
                    key={emotion.id}
                    variant={review.emotions.includes(emotion.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleEmotion(emotion.id)}
                  >
                    {emotion.emoji} {emotion.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comment - Private note (not used by AI) */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Notes personnelles
                <span className="text-xs text-muted-foreground ml-2 font-normal">(privé)</span>
              </Label>
              <Textarea
                placeholder="Mes pensées, le contexte du visionnage..."
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
              />
            </div>

            <Button onClick={handleReviewSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sauvegarder mon avis
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
