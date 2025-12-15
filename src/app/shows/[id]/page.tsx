"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Tv,
  Calendar,
  Trash2,
  MessageSquare,
  Loader2,
  Play,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RatingStars } from "@/components/media"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Show, UserShow, ShowStatus } from "@/types"

const statusOptions: { value: ShowStatus; label: string }[] = [
  { value: "to_watch", label: "À voir" },
  { value: "watching", label: "En cours" },
  { value: "watched", label: "Terminée" },
  { value: "paused", label: "En pause" },
  { value: "abandoned", label: "Abandonnée" },
]

const likedAspects = [
  "L'histoire",
  "Les personnages",
  "Les acteurs",
  "Les rebondissements",
  "La tension",
  "L'humour",
  "Les émotions",
  "Le rythme",
  "Les cliffhangers",
  "Le casting",
  "La fin",
]

const emotionOptions = [
  { id: "made_me_cry", label: "M'a fait pleurer", emoji: "😭" },
  { id: "favorite", label: "Coup de coeur", emoji: "❤️" },
  { id: "addictive", label: "Addictive", emoji: "🔥" },
  { id: "plot_twist", label: "Plot twists de fou", emoji: "🤯" },
  { id: "slow_start", label: "Début un peu lent", emoji: "🐢" },
  { id: "feel_good", label: "Feel-good", emoji: "🥰" },
  { id: "stressful", label: "Stressante", emoji: "😰" },
  { id: "funny", label: "M'a fait rire", emoji: "😂" },
  { id: "masterpiece", label: "Chef d'oeuvre", emoji: "🏆" },
  { id: "bingeworthy", label: "Impossible à arrêter", emoji: "📺" },
]

export default function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [show, setShow] = useState<(UserShow & Show) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [review, setReview] = useState<{
    comment: string
    liked: string[]
    emotions: string[]
  }>({ comment: "", liked: [], emotions: [] })

  useEffect(() => {
    fetchShow()
    fetchReview()
  }, [id])

  const fetchShow = async () => {
    try {
      const res = await fetch(`/api/shows?id=${id}`)
      if (res.ok) {
        const data = await res.json() as (UserShow & Show) | null
        setShow(data)
      }
    } catch (error) {
      console.error("Error fetching show:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReview = async () => {
    try {
      const res = await fetch(`/api/reviews?mediaType=show&mediaId=${id}`)
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

  const handleStatusChange = async (status: ShowStatus) => {
    if (!show) return
    setSaving(true)
    try {
      await fetch("/api/shows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      setShow({ ...show, status })
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleRatingChange = async (rating: number) => {
    if (!show) return
    setSaving(true)
    try {
      await fetch("/api/shows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rating }),
      })
      setShow({ ...show, rating })
    } catch (error) {
      console.error("Error updating rating:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleProgressChange = async (season: number, episode: number) => {
    if (!show) return
    setSaving(true)
    try {
      await fetch("/api/shows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, current_season: season, current_episode: episode }),
      })
      setShow({ ...show, current_season: season, current_episode: episode })
    } catch (error) {
      console.error("Error updating progress:", error)
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
          mediaType: "show",
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

  const handleDeleteShow = async () => {
    if (!confirm("Supprimer cette série de ta bibliothèque ?")) return
    try {
      await fetch(`/api/shows?id=${id}`, { method: "DELETE" })
      window.location.href = "/shows"
    } catch (error) {
      console.error("Error deleting show:", error)
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

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Tv className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-xl font-semibold mb-2">Série non trouvée</h1>
        <p className="text-muted-foreground mb-4">Cette série n'est pas dans ta bibliothèque</p>
        <Button asChild>
          <Link href="/shows">Retour aux séries</Link>
        </Button>
      </div>
    )
  }

  const genres = show.genres ? (typeof show.genres === 'string' ? JSON.parse(show.genres) : show.genres) : []
  const totalSeasons = show.total_seasons || 0
  const totalEpisodes = show.total_episodes || 0

  // Calculate progress
  const progress = totalEpisodes > 0 && show.current_episode
    ? Math.round(((show.current_season - 1) * (totalEpisodes / totalSeasons) + show.current_episode) / totalEpisodes * 100)
    : 0

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with backdrop */}
      <div className="relative h-56">
        {show.backdrop_url ? (
          <Image
            src={show.backdrop_url}
            alt={show.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button variant="ghost" size="icon" asChild className="bg-background/80 backdrop-blur">
            <Link href="/shows">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur text-destructive"
            onClick={handleDeleteShow}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Show Info */}
      <div className="container px-4 -mt-28 relative z-10">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-28 h-40 rounded-lg overflow-hidden shadow-lg flex-shrink-0 bg-muted">
            {show.poster_url ? (
              <Image
                src={show.poster_url}
                alt={show.title}
                width={112}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tv className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 pt-20">
            <h1 className="font-display text-xl font-semibold line-clamp-2">{show.title}</h1>
            <p className="text-muted-foreground">{show.creator || "Créateur inconnu"}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {totalSeasons > 0 && (
                <span>{totalSeasons} saison{totalSeasons > 1 ? 's' : ''}</span>
              )}
              {totalEpisodes > 0 && (
                <span>{totalEpisodes} épisodes</span>
              )}
            </div>
            {show.first_air_date && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {show.first_air_date.split("-")[0]}
              </div>
            )}
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
                  variant={show.status === option.value ? "default" : "outline"}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={saving}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress (for watching status) */}
        {show.status === "watching" && totalSeasons > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Progression</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="mb-3" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Saison</Label>
                  <Input
                    type="number"
                    min={1}
                    max={totalSeasons}
                    value={show.current_season || 1}
                    onChange={(e) => handleProgressChange(parseInt(e.target.value) || 1, show.current_episode || 0)}
                    className="w-16"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Épisode</Label>
                  <Input
                    type="number"
                    min={0}
                    value={show.current_episode || 0}
                    onChange={(e) => handleProgressChange(show.current_season || 1, parseInt(e.target.value) || 0)}
                    className="w-16"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Note</Label>
            <RatingStars
              rating={show.rating || 0}
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

            {/* Comment */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Commentaire personnel</Label>
              <Textarea
                placeholder="Mes pensées sur cette série..."
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

        {/* Description */}
        {show.description && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{show.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
