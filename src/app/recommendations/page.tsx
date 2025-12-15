"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, MessageCircle, RefreshCw, Heart, X, Check } from "lucide-react"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { MediaCard } from "@/components/media"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Recommendation } from "@/types"

// Mood options for quick recommendations
const moods = [
  { id: "cry", emoji: "😭", label: "Envie de pleurer" },
  { id: "feelgood", emoji: "🥰", label: "Feel-good" },
  { id: "intense", emoji: "🔥", label: "Romance intense" },
  { id: "twist", emoji: "🤯", label: "Plot twist" },
  { id: "light", emoji: "😴", label: "Lecture légère" },
  { id: "cosy", emoji: "🌙", label: "Cosy" },
]

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId)
    setIsLoading(true)

    // TODO: Fetch recommendations based on mood
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // TODO: Refresh recommendations
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
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
            Suggestions du jour
          </h3>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((reco) => (
                <Card key={reco.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Media info will go here */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground italic">
                        "{reco.reason}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <Check className="h-4 w-4 mr-1" />
                        À lire
                      </Button>
                      <Button size="sm" variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-medium mb-2">
                Pas encore de recommandations
              </h3>
              <p className="text-muted-foreground mb-4">
                Ajoute des livres et note-les pour obtenir des suggestions personnalisées
              </p>
              <Button asChild variant="outline">
                <Link href="/search">
                  Commencer à ajouter des médias
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
