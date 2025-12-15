"use client"

export const runtime = 'edge'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  BookOpen,
  Star,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  MessageSquare,
  Quote,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RatingStars } from "@/components/media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Book, UserBook, BookStatus } from "@/types"

const statusOptions: { value: BookStatus; label: string; color: string }[] = [
  { value: "to_read", label: "À lire", color: "bg-blue-500" },
  { value: "reading", label: "En cours", color: "bg-yellow-500" },
  { value: "read", label: "Lu", color: "bg-green-500" },
  { value: "abandoned", label: "Abandonné", color: "bg-gray-500" },
]

const likedAspects = [
  "Les personnages",
  "La romance",
  "Le worldbuilding",
  "L'intrigue",
  "La plume",
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
  { id: "tension", label: "Tension incroyable", emoji: "🔥" },
  { id: "plot_twist", label: "Plot twist de fou", emoji: "🤯" },
  { id: "slow", label: "Un peu lent", emoji: "🐢" },
  { id: "frustrating_end", label: "Fin frustrante", emoji: "😤" },
  { id: "feel_good", label: "Feel-good", emoji: "🥰" },
  { id: "heartbreaking", label: "Déchirant", emoji: "💔" },
  { id: "funny", label: "M'a fait rire", emoji: "😂" },
]

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [book, setBook] = useState<(UserBook & Book) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [review, setReview] = useState<{
    comment: string
    liked: string[]
    emotions: string[]
  }>({ comment: "", liked: [], emotions: [] })
  const [highlights, setHighlights] = useState<Array<{
    id: number
    content: string
    page_number?: number
    chapter?: string
    personal_note?: string
  }>>([])
  const [newHighlight, setNewHighlight] = useState({
    content: "",
    page_number: "",
    chapter: "",
    personal_note: "",
  })
  const [highlightDialogOpen, setHighlightDialogOpen] = useState(false)

  useEffect(() => {
    fetchBook()
    fetchReview()
    fetchHighlights()
  }, [id])

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books?id=${id}`)
      if (res.ok) {
        const data = await res.json() as (UserBook & Book) | null
        setBook(data)
      }
    } catch (error) {
      console.error("Error fetching book:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReview = async () => {
    try {
      const res = await fetch(`/api/reviews?mediaType=book&mediaId=${id}`)
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

  const fetchHighlights = async () => {
    try {
      const res = await fetch(`/api/highlights?bookId=${id}`)
      if (res.ok) {
        const data = await res.json() as Array<{ id: number; content: string; page_number?: number; chapter?: string; personal_note?: string }>
        setHighlights(data || [])
      }
    } catch (error) {
      console.error("Error fetching highlights:", error)
    }
  }

  const handleStatusChange = async (status: BookStatus) => {
    if (!book) return
    setSaving(true)
    try {
      await fetch("/api/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      setBook({ ...book, status })
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleRatingChange = async (rating: number) => {
    if (!book) return
    setSaving(true)
    try {
      await fetch("/api/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rating }),
      })
      setBook({ ...book, rating })
    } catch (error) {
      console.error("Error updating rating:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleProgressChange = async (currentPage: number) => {
    if (!book) return
    setSaving(true)
    try {
      await fetch("/api/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, current_page: currentPage }),
      })
      setBook({ ...book, current_page: currentPage })
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
          mediaType: "book",
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

  const handleAddHighlight = async () => {
    if (!newHighlight.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: id,
          content: newHighlight.content,
          page_number: newHighlight.page_number ? parseInt(newHighlight.page_number) : undefined,
          chapter: newHighlight.chapter || undefined,
          personal_note: newHighlight.personal_note || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json() as { id: number; content: string; page_number?: number; chapter?: string; personal_note?: string }
        setHighlights([data, ...highlights])
        setNewHighlight({ content: "", page_number: "", chapter: "", personal_note: "" })
        setHighlightDialogOpen(false)
      }
    } catch (error) {
      console.error("Error adding highlight:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBook = async () => {
    if (!confirm("Supprimer ce livre de ta bibliothèque ?")) return
    try {
      await fetch(`/api/books?id=${id}`, { method: "DELETE" })
      window.location.href = "/books"
    } catch (error) {
      console.error("Error deleting book:", error)
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

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-xl font-semibold mb-2">Livre non trouvé</h1>
        <p className="text-muted-foreground mb-4">Ce livre n'est pas dans ta bibliothèque</p>
        <Button asChild>
          <Link href="/books">Retour à la bibliothèque</Link>
        </Button>
      </div>
    )
  }

  const progress = book.page_count && book.current_page
    ? Math.round((book.current_page / book.page_count) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with backdrop */}
      <div className="relative h-48 bg-gradient-to-b from-primary/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <Button variant="ghost" size="icon" asChild className="bg-background/80 backdrop-blur">
            <Link href="/books">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur text-destructive"
            onClick={handleDeleteBook}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Book Info */}
      <div className="container px-4 -mt-24 relative z-10">
        <div className="flex gap-4">
          {/* Cover */}
          <div className="w-28 h-40 rounded-lg overflow-hidden shadow-lg flex-shrink-0 bg-muted">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                width={112}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 pt-16">
            <h1 className="font-display text-xl font-semibold line-clamp-2">{book.title}</h1>
            <p className="text-muted-foreground">{book.author || "Auteur inconnu"}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              {book.page_count && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {book.page_count} pages
                </span>
              )}
              {book.published_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {book.published_date.split("-")[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Genres, Tropes, Moods */}
        {(book.genres?.length || book.tropes?.length || book.moods?.length) && (
          <Card className="mt-6">
            <CardContent className="p-4 space-y-4">
              {/* Genres */}
              {book.genres && book.genres.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {book.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tropes */}
              {book.tropes && book.tropes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tropes</Label>
                  <div className="flex flex-wrap gap-2">
                    {book.tropes.map((trope) => (
                      <Badge key={trope} variant="outline" className="border-primary/50 text-primary">
                        {trope}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Moods */}
              {book.moods && book.moods.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Ambiance</Label>
                  <div className="flex flex-wrap gap-2">
                    {book.moods.map((mood) => (
                      <Badge key={mood} variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400">
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Warnings */}
              {book.content_warnings && book.content_warnings.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Avertissements</Label>
                  <div className="flex flex-wrap gap-2">
                    {book.content_warnings.map((warning) => (
                      <Badge key={warning} variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400">
                        ⚠️ {warning}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Statut</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={book.status === option.value ? "default" : "outline"}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={saving}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress (for reading status) */}
        {book.status === "reading" && book.page_count && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Progression</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="mb-3" />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={book.page_count}
                  value={book.current_page || 0}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">/ {book.page_count} pages</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Note</Label>
            <RatingStars
              rating={book.rating || 0}
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
                placeholder="Mes pensées, souvenirs liés à cette lecture..."
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

        {/* Highlights */}
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Quote className="h-5 w-5 text-primary" />
              Passages favoris
            </CardTitle>
            <Dialog open={highlightDialogOpen} onOpenChange={setHighlightDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau passage favori</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Citation</Label>
                    <Textarea
                      placeholder="Le passage qui t'a marqué..."
                      value={newHighlight.content}
                      onChange={(e) => setNewHighlight(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Page (optionnel)</Label>
                      <Input
                        type="number"
                        placeholder="42"
                        value={newHighlight.page_number}
                        onChange={(e) => setNewHighlight(prev => ({ ...prev, page_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Chapitre (optionnel)</Label>
                      <Input
                        placeholder="Chapitre 3"
                        value={newHighlight.chapter}
                        onChange={(e) => setNewHighlight(prev => ({ ...prev, chapter: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Note personnelle (optionnel)</Label>
                    <Textarea
                      placeholder="Pourquoi ce passage m'a touché..."
                      value={newHighlight.personal_note}
                      onChange={(e) => setNewHighlight(prev => ({ ...prev, personal_note: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleAddHighlight} disabled={saving || !newHighlight.content.trim()} className="w-full">
                    Ajouter le passage
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {highlights.length > 0 ? (
              <div className="space-y-3">
                {highlights.map((highlight) => (
                  <div key={highlight.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm italic">"{highlight.content}"</p>
                    {(highlight.page_number || highlight.chapter) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {highlight.chapter && highlight.chapter}
                        {highlight.chapter && highlight.page_number && " • "}
                        {highlight.page_number && `Page ${highlight.page_number}`}
                      </p>
                    )}
                    {highlight.personal_note && (
                      <p className="text-xs text-primary mt-1">💭 {highlight.personal_note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun passage favori pour l'instant
              </p>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {book.description && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{book.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
