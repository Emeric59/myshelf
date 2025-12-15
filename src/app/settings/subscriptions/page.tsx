"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Tv, BookOpen, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const videoProviders = [
  { id: "8", name: "Netflix", logo: "🔴" },
  { id: "119", name: "Amazon Prime Video", logo: "🔵" },
  { id: "337", name: "Disney+", logo: "🏰" },
  { id: "381", name: "Canal+", logo: "📺" },
  { id: "350", name: "Apple TV+", logo: "🍎" },
  { id: "531", name: "Paramount+", logo: "⭐" },
  { id: "56", name: "OCS", logo: "🎬" },
  { id: "283", name: "Crunchyroll", logo: "🍥" },
  { id: "415", name: "ADN", logo: "🎌" },
]

const readingProviders = [
  { id: "kindle", name: "Kindle Unlimited", logo: "📱" },
  { id: "audible", name: "Audible", logo: "🎧" },
  { id: "kobo", name: "Kobo Plus", logo: "📖" },
]

export default function SubscriptionsPage() {
  const [activeVideo, setActiveVideo] = useState<string[]>([])
  const [activeReading, setActiveReading] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load existing subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await fetch("/api/subscriptions")
        if (res.ok) {
          const data = await res.json() as Array<{ provider_id: string; provider_type: string }>
          const videoIds = data.filter(s => s.provider_type === "video").map(s => s.provider_id)
          const readingIds = data.filter(s => s.provider_type === "reading").map(s => s.provider_id)
          setActiveVideo(videoIds)
          setActiveReading(readingIds)
        }
      } catch (error) {
        console.error("Error loading subscriptions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [])

  const toggleVideo = (id: string) => {
    setActiveVideo((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
    setSaved(false)
  }

  const toggleReading = (id: string) => {
    setActiveReading((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const subscriptions = [
        ...activeVideo.map(id => {
          const provider = videoProviders.find(p => p.id === id)
          return {
            provider_id: id,
            provider_name: provider?.name || id,
            provider_type: "video" as const,
          }
        }),
        ...activeReading.map(id => {
          const provider = readingProviders.find(p => p.id === id)
          return {
            provider_id: id,
            provider_name: provider?.name || id,
            provider_type: "reading" as const,
          }
        }),
      ]

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions }),
      })

      if (res.ok) {
        setSaved(true)
      }
    } catch (error) {
      console.error("Error saving subscriptions:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display font-semibold ml-2">Mes abonnements</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <p className="text-muted-foreground mb-6">
          Sélectionne tes abonnements pour voir quels médias sont disponibles
          dans tes services.
        </p>

        {/* Video Streaming */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="h-5 w-5 text-primary" />
                Streaming vidéo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {videoProviders.map((provider) => {
                  const isActive = activeVideo.includes(provider.id)
                  return (
                    <button
                      key={provider.id}
                      onClick={() => toggleVideo(provider.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{provider.logo}</span>
                      <span className="flex-1 text-left text-sm font-medium">
                        {provider.name}
                      </span>
                      {isActive && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Reading */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Lecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {readingProviders.map((provider) => {
                  const isActive = activeReading.includes(provider.id)
                  return (
                    <button
                      key={provider.id}
                      onClick={() => toggleReading(provider.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{provider.logo}</span>
                      <span className="flex-1 text-left text-sm font-medium">
                        {provider.name}
                      </span>
                      {isActive && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Save button */}
        <div className="mt-6">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Sauvegardé !
              </>
            ) : (
              "Sauvegarder"
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
