"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, MessageCircle, RefreshCw, Loader2, Book, Film, Tv, Heart, Shuffle } from "lucide-react"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DismissDialog, RecommendationCard } from "@/components/media"
import { cn } from "@/lib/utils"

type MediaTypeFilter = "all" | "book" | "movie" | "show"

interface RecommendationItem {
  id: string
  type: "book" | "movie" | "show"
  title: string
  subtitle?: string
  reason: string
  added?: boolean
}

const typeFilters: { value: MediaTypeFilter; label: string; icon: typeof Book }[] = [
  { value: "all", label: "Tous", icon: Sparkles },
  { value: "book", label: "Livres", icon: Book },
  { value: "movie", label: "Films", icon: Film },
  { value: "show", label: "Séries", icon: Tv },
]

// Mood options for quick recommendations
const moods = [
  { id: "cry", emoji: "😭", label: "Envie de pleurer", prompt: "Je veux quelque chose qui va me faire pleurer, une histoire émouvante et touchante" },
  { id: "feelgood", emoji: "🥰", label: "Feel-good", prompt: "Je cherche quelque chose de feel-good, léger et qui fait du bien" },
  { id: "intense", emoji: "🔥", label: "Romance intense", prompt: "Je veux une romance intense et passionnée" },
  { id: "twist", emoji: "🤯", label: "Plot twist", prompt: "Je cherche quelque chose avec des plot twists incroyables et des retournements de situation" },
  { id: "light", emoji: "😴", label: "Lecture légère", prompt: "Je veux quelque chose de léger et facile à lire/regarder, sans prise de tête" },
  { id: "cosy", emoji: "🌙", label: "Cosy", prompt: "Je cherche quelque chose de cosy et réconfortant, parfait pour une soirée au calme" },
]

// Genre options for filtering recommendations
const genreOptions = [
  { value: "", label: "Tous les genres" },
  { value: "romance", label: "Romance" },
  { value: "fantasy", label: "Fantasy" },
  { value: "science-fiction", label: "Science-Fiction" },
  { value: "thriller", label: "Thriller" },
  { value: "horror", label: "Horreur" },
  { value: "comedy", label: "Comédie" },
  { value: "drama", label: "Drame" },
  { value: "action", label: "Action" },
  { value: "mystery", label: "Mystère" },
  { value: "historical", label: "Historique" },
]

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<MediaTypeFilter>("all")
  const [selectedGenre, setSelectedGenre] = useState<string>("")

  // Surprise mode state
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false)
  const [surpriseMessage, setSurpriseMessage] = useState<string | null>(null)

  // Dismiss dialog state
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
  const [selectedForDismiss, setSelectedForDismiss] = useState<RecommendationItem | null>(null)
  const [isDismissing, setIsDismissing] = useState(false)
  const [isAddingFromDismiss, setIsAddingFromDismiss] = useState(false)

  const handleMoodSelect = async (moodId: string) => {
    const mood = moods.find(m => m.id === moodId)
    if (!mood) return

    setSelectedMood(moodId)
    setIsLoading(true)
    setRecommendations([])

    // Construire le prompt avec le type et genre si sélectionnés
    let prompt = mood.prompt
    const mediaTypes = selectedType !== "all" ? [selectedType] : undefined

    if (selectedType === "book") {
      prompt += " (uniquement des livres)"
    } else if (selectedType === "movie") {
      prompt += " (uniquement des films)"
    } else if (selectedType === "show") {
      prompt += " (uniquement des séries)"
    }

    if (selectedGenre) {
      const genreLabel = genreOptions.find(g => g.value === selectedGenre)?.label || selectedGenre
      prompt += ` dans le genre ${genreLabel}`
    }

    try {
      const response = await fetch("/api/recommendations/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt, mediaTypes }),
      })

      if (!response.ok) throw new Error("Failed to get recommendations")

      const data = await response.json() as {
        recommendations?: Array<{
          type: "book" | "movie" | "show"
          title: string
          author?: string
          year?: number
          reason: string
        }>
      }

      // Adapter le format de réponse de l'API au format attendu
      const formattedRecos: RecommendationItem[] = (data.recommendations || []).map((reco, index) => ({
        id: `reco-${index}`,
        type: reco.type,
        title: reco.title,
        subtitle: reco.author || (reco.year ? String(reco.year) : undefined),
        reason: reco.reason,
      }))

      setRecommendations(formattedRecos)
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (selectedMood) {
      await handleMoodSelect(selectedMood)
    }
  }

  // Handle surprise recommendations
  const handleSurprise = async () => {
    setIsSurpriseLoading(true)
    setSelectedMood(null)
    setSurpriseMessage(null)
    setRecommendations([])

    try {
      const response = await fetch("/api/recommendations/surprise")
      if (!response.ok) throw new Error("Failed to get surprise recommendations")

      const data = await response.json() as {
        message?: string
        recommendations?: Array<{
          type: "book" | "movie" | "show"
          title: string
          author?: string
          year?: string
          reason: string
        }>
      }

      // Adapter le format de réponse
      const formattedRecos: RecommendationItem[] = (data.recommendations || []).map((reco, index) => ({
        id: `surprise-${index}`,
        type: reco.type,
        title: reco.title,
        subtitle: reco.author || reco.year,
        reason: reco.reason,
      }))

      setRecommendations(formattedRecos)
      setSurpriseMessage(data.message || null)
    } catch (error) {
      console.error("Error getting surprise recommendations:", error)
    } finally {
      setIsSurpriseLoading(false)
    }
  }

  // Add to library helper
  const addToLibrary = async (reco: RecommendationItem, status?: string) => {
    const searchResponse = await fetch(
      `/api/search?q=${encodeURIComponent(reco.title)}&type=${reco.type}`
    )
    const searchData = await searchResponse.json() as { results?: Array<{ id: string }> }

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error("Media not found")
    }

    const media = searchData.results[0]
    const endpoint = reco.type === "book" ? "/api/books" : reco.type === "movie" ? "/api/movies" : "/api/shows"
    const defaultStatus = reco.type === "book" ? "to_read" : "to_watch"

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: media.id, status: status || defaultStatus }),
    })
  }

  // Handle add from RecommendationCard
  const handleAddFromCard = async (recoId: string, reco: RecommendationItem) => {
    try {
      await addToLibrary(reco)
      setRecommendations(prev => prev.map(r =>
        r.id === recoId ? { ...r, added: true } : r
      ))
    } catch (error) {
      console.error("Error adding to library:", error)
      alert("Impossible de trouver ce média. Essaie de le chercher manuellement.")
    }
  }

  // Handle dismiss
  const openDismissDialog = (reco: RecommendationItem) => {
    setSelectedForDismiss(reco)
    setDismissDialogOpen(true)
  }

  const handleDismiss = async (reason: "already_consumed" | "not_interested" | "other", detail?: string) => {
    if (!selectedForDismiss) return

    setIsDismissing(true)
    try {
      await fetch("/api/dismissed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: selectedForDismiss.type,
          title: selectedForDismiss.title,
          reason,
          reasonDetail: detail,
        }),
      })

      // Remove from UI
      setRecommendations(prev => prev.filter(r => r.id !== selectedForDismiss.id))
      setDismissDialogOpen(false)
      setSelectedForDismiss(null)
    } catch (error) {
      console.error("Error dismissing:", error)
    } finally {
      setIsDismissing(false)
    }
  }

  // Handle "already consumed" -> add to library with completed status
  const handleAddFromDismiss = async () => {
    if (!selectedForDismiss) return

    setIsAddingFromDismiss(true)
    try {
      const status = selectedForDismiss.type === "book" ? "read" : "watched"
      await addToLibrary(selectedForDismiss, status)

      // Mark as added in UI
      setRecommendations(prev => prev.map(r =>
        r.id === selectedForDismiss.id ? { ...r, added: true } : r
      ))
      setDismissDialogOpen(false)
      setSelectedForDismiss(null)
    } catch (error) {
      console.error("Error adding to library:", error)
      alert("Impossible de trouver ce média. Essaie de le chercher manuellement.")
    } finally {
      setIsAddingFromDismiss(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <Header title="Recommandations" showBack />

      <main className="container px-4 py-6 overflow-x-hidden">
        <PageHeader
          title="Pour toi"
          description="Des suggestions personnalisées basées sur tes goûts"
          action={
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          }
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Ask AI Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-xs">Demander</h3>
                <Button asChild size="sm" className="w-full text-xs px-2">
                  <Link href="/recommendations/ask">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Surprise Card */}
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Shuffle className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-medium text-xs">Surprise</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs px-2 border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/30"
                  onClick={handleSurprise}
                  disabled={isSurpriseLoading}
                >
                  {isSurpriseLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Shuffle className="h-3 w-3 mr-1 text-amber-600" />
                      Go
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Card */}
          <Card className="border-pink-200 bg-pink-50/50 dark:border-pink-900 dark:bg-pink-950/20">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <h3 className="font-medium text-xs">Envies</h3>
                <Button asChild size="sm" variant="outline" className="w-full text-xs px-2 border-pink-200 hover:bg-pink-100 dark:border-pink-800 dark:hover:bg-pink-900/30">
                  <Link href="/wishlist">
                    <Heart className="h-3 w-3 mr-1 text-pink-500" />
                    Voir
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <section className="mb-6">
          <h3 className="font-display text-lg font-medium mb-3">
            Quel type de média ?
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {typeFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedType(filter.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all whitespace-nowrap flex-shrink-0",
                    selectedType === filter.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* Genre Filter */}
          <div className="mt-4">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {genreOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Mood Selection */}
        <section className="mb-8">
          <h3 className="font-display text-lg font-medium mb-4">
            Comment tu te sens ?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all",
                  selectedMood === mood.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl block mb-1">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Recommendations List */}
        <section>
          <h3 className="font-display text-lg font-medium mb-4">
            {surpriseMessage ? "Surprise !" : selectedMood ? "Suggestions" : "Suggestions du jour"}
          </h3>

          {/* Surprise message */}
          {surpriseMessage && (
            <Card className="mb-4 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shuffle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{surpriseMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading || isSurpriseLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {isSurpriseLoading
                  ? "L'IA prépare une surprise..."
                  : "L'IA cherche des recommandations..."}
              </p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((reco) => (
                <RecommendationCard
                  key={reco.id}
                  type={reco.type}
                  title={reco.title}
                  subtitle={reco.subtitle}
                  reason={reco.reason}
                  added={reco.added}
                  onAdd={() => handleAddFromCard(reco.id, reco)}
                  onDismiss={() => openDismissDialog(reco)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-medium mb-2">
                {selectedMood ? "Sélectionne un mood" : "Comment tu te sens ?"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Choisis une ambiance ci-dessus ou demande directement à l'IA
              </p>
              <Button asChild variant="outline">
                <Link href="/recommendations/ask">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Demander à l'IA
                </Link>
              </Button>
            </div>
          )}
        </section>
      </main>

      <BottomNav />

      {/* Dismiss Dialog */}
      <DismissDialog
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        title={selectedForDismiss?.title || ""}
        mediaType={selectedForDismiss?.type || "book"}
        onDismiss={handleDismiss}
        onAddToLibrary={handleAddFromDismiss}
        isLoading={isDismissing}
        isAddingToLibrary={isAddingFromDismiss}
      />
    </div>
  )
}
