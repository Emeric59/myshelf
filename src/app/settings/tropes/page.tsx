"use client"

import { useState } from "react"
import { ArrowLeft, Heart, ThumbsUp, Minus, ThumbsDown, Ban, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTropes } from "@/lib/hooks"
import type { TropePreference } from "@/types"

const preferenceOptions: { value: TropePreference; icon: typeof Heart; label: string; color: string }[] = [
  { value: "love", icon: Heart, label: "Adore", color: "text-rose-500 bg-rose-500/10" },
  { value: "like", icon: ThumbsUp, label: "Aime", color: "text-primary bg-primary/10" },
  { value: "neutral", icon: Minus, label: "Neutre", color: "text-muted-foreground bg-muted" },
  { value: "dislike", icon: ThumbsDown, label: "Aime pas", color: "text-amber-500 bg-amber-500/10" },
  { value: "blacklist", icon: Ban, label: "Blacklist", color: "text-destructive bg-destructive/10" },
]

const categories = [
  { id: "all", label: "Tous" },
  { id: "romance", label: "Romance" },
  { id: "character", label: "Personnages" },
  { id: "plot", label: "Intrigue" },
  { id: "mood", label: "Ambiance" },
  { id: "sensitive", label: "Sensibles" },
]

export default function TropesPage() {
  const { tropes, isLoading, error, updatePreference, getCounts } = useTropes()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredTropes = tropes.filter((trope) => {
    const matchesSearch =
      searchQuery === "" ||
      trope.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || trope.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handlePreferenceChange = async (tropeId: number, preference: TropePreference) => {
    // Toggle to neutral if clicking the same preference
    const currentTrope = tropes.find(t => t.id === tropeId)
    const newPreference = currentTrope?.preference === preference ? "neutral" : preference
    await updatePreference(tropeId, newPreference)
  }

  const counts = getCounts()

  if (isLoading) {
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
          <h1 className="font-display font-semibold ml-2">Mes tropes</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Error message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {counts.love > 0 && (
                <Badge className="bg-rose-500/10 text-rose-500">
                  <Heart className="h-3 w-3 mr-1" />
                  {counts.love} adorés
                </Badge>
              )}
              {counts.like > 0 && (
                <Badge className="bg-primary/10 text-primary">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {counts.like} aimés
                </Badge>
              )}
              {counts.dislike > 0 && (
                <Badge className="bg-amber-500/10 text-amber-500">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  {counts.dislike} évités
                </Badge>
              )}
              {counts.blacklist > 0 && (
                <Badge className="bg-destructive/10 text-destructive">
                  <Ban className="h-3 w-3 mr-1" />
                  {counts.blacklist} blacklistés
                </Badge>
              )}
              {counts.love === 0 && counts.like === 0 && counts.dislike === 0 && counts.blacklist === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucune préférence définie. Commence à personnaliser tes tropes !
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un trope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap",
                selectedCategory === cat.id && "bg-primary"
              )}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        {/* Tropes list */}
        {filteredTropes.length === 0 ? (
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Aucun trope trouvé"
                  : "Aucun trope disponible"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTropes.map((trope) => {
              const currentPref = trope.preference

              return (
                <Card key={trope.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{trope.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {trope.category || "général"}
                        </p>
                      </div>
                      {trope.is_sensitive && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                          Sensible
                        </Badge>
                      )}
                    </div>

                    {/* Preference buttons */}
                    <div className="flex gap-1">
                      {preferenceOptions.map((option) => {
                        const isSelected = currentPref === option.value
                        return (
                          <button
                            key={option.value}
                            onClick={() => handlePreferenceChange(trope.id, option.value)}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                              isSelected ? option.color : "hover:bg-muted"
                            )}
                          >
                            <option.icon
                              className={cn(
                                "h-4 w-4",
                                isSelected ? "" : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs",
                                isSelected ? "" : "text-muted-foreground"
                              )}
                            >
                              {option.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
