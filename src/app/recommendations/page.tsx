"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, MessageCircle, RefreshCw, Heart, X, Check, Loader2, Book, Film, Tv } from "lucide-react"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RecommendationItem {
  id: string
  type: "book" | "movie" | "show"
  title: string
  subtitle?: string
  image_url?: string
  reason: string
  added?: boolean
  loading?: boolean
}

// Mood options for quick recommendations
const moods = [
  { id: "cry", emoji: "😭", label: "Envie de pleurer", prompt: "Je veux quelque chose qui va me faire pleurer, une histoire émouvante et touchante" },
  { id: "feelgood", emoji: "🥰", label: "Feel-good", prompt: "Je cherche quelque chose de feel-good, léger et qui fait du bien" },
  { id: "intense", emoji: "🔥", label: "Romance intense", prompt: "Je veux une romance intense et passionnée" },
  { id: "twist", emoji: "🤯", label: "Plot twist", prompt: "Je cherche quelque chose avec des plot twists incroyables et des retournements de situation" },
  { id: "light", emoji: "😴", label: "Lecture légère", prompt: "Je veux quelque chose de léger et facile à lire/regarder, sans prise de tête" },
  { id: "cosy", emoji: "🌙", label: "Cosy", prompt: "Je cherche quelque chose de cosy et réconfortant, parfait pour une soirée au calme" },
]

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const handleMoodSelect = async (moodId: string) => {
    const mood = moods.find(m => m.id === moodId)
    if (!mood) return

    setSelectedMood(moodId)
    setIsLoading(true)
    setRecommendations([])

    try {
      const response = await fetch("/api/recommendations/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mood.prompt }),
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

  const handleAddToLibrary = async (recoId: string, reco: RecommendationItem) => {
    // Mark as loading
    setRecommendations(prev => prev.map(r =>
      r.id === recoId ? { ...r, loading: true } : r
    ))

    try {
      // Search for the media first
      const searchResponse = await fetch(
        `/api/search?q=${encodeURIComponent(reco.title)}&type=${reco.type}`
      )
      const searchData = await searchResponse.json() as { results?: Array<{ id: string }> }

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error("Media not found")
      }

      const media = searchData.results[0]
      const endpoint = reco.type === "book" ? "/api/books" : reco.type === "movie" ? "/api/movies" : "/api/shows"
      const status = reco.type === "book" ? "to_read" : "to_watch"

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: media.id, status }),
      })

      // Mark as added
      setRecommendations(prev => prev.map(r =>
        r.id === recoId ? { ...r, loading: false, added: true } : r
      ))
    } catch (error) {
      console.error("Error adding to library:", error)
      setRecommendations(prev => prev.map(r =>
        r.id === recoId ? { ...r, loading: false } : r
      ))
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book": return Book
      case "movie": return Film
      case "show": return Tv
      default: return Book
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Recommandations" showBack />

      <main className="container px-4 py-6">
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

        {/* Ask AI Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Demande personnalisée</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Décris ce que tu cherches et l'IA te trouvera des suggestions parfaites
                </p>
                <Button asChild>
                  <Link href="/recommendations/ask">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Demander à l'IA
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedMood === mood.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
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
            {selectedMood ? "Suggestions" : "Suggestions du jour"}
          </h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">L'IA cherche des recommandations...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((reco) => {
                const TypeIcon = getTypeIcon(reco.type)
                return (
                  <Card key={reco.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Poster placeholder */}
                        <div className="w-16 h-24 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          {reco.image_url ? (
                            <Image
                              src={reco.image_url}
                              alt={reco.title}
                              width={64}
                              height={96}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <TypeIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium line-clamp-1">{reco.title}</h4>
                              {reco.subtitle && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {reco.subtitle}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                              {reco.type === "book" ? "Livre" : reco.type === "movie" ? "Film" : "Série"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
                            "{reco.reason}"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToLibrary(reco.id, reco)}
                          disabled={reco.added || reco.loading}
                        >
                          {reco.loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : reco.added ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Ajouté
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              {reco.type === "book" ? "À lire" : "À voir"}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
    </div>
  )
}
