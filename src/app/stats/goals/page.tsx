"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Book, Film, Tv, Save, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGoals } from "@/lib/hooks"

const currentYear = new Date().getFullYear()

export default function GoalsPage() {
  const { goals, isLoading, isSaving, error, updateGoals } = useGoals()
  const [localGoals, setLocalGoals] = useState({
    books: 50,
    movies: 52,
    shows: 12,
  })
  const [saved, setSaved] = useState(false)

  // Sync local state with fetched goals
  useEffect(() => {
    if (goals.books > 0 || goals.movies > 0 || goals.shows > 0) {
      setLocalGoals(goals)
    }
  }, [goals])

  const handleSave = async () => {
    const success = await updateGoals(localGoals)
    if (success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const hasChanges =
    localGoals.books !== goals.books ||
    localGoals.movies !== goals.movies ||
    localGoals.shows !== goals.shows

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
            <Link href="/stats">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display font-semibold ml-2">
            Objectifs {currentYear}
          </h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <p className="text-muted-foreground mb-6">
          Définis tes objectifs de lecture et visionnage pour l'année.
        </p>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {/* Books Goal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Book className="h-5 w-5 text-primary" />
                Livres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={localGoals.books}
                  onChange={(e) =>
                    setLocalGoals((prev) => ({
                      ...prev,
                      books: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground">livres à lire</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ≈ {Math.round(localGoals.books / 12)} par mois,{" "}
                {Math.round(localGoals.books / 52)} par semaine
              </p>
            </CardContent>
          </Card>

          {/* Movies Goal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Film className="h-5 w-5 text-primary" />
                Films
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={localGoals.movies}
                  onChange={(e) =>
                    setLocalGoals((prev) => ({
                      ...prev,
                      movies: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground">films à voir</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ≈ {Math.round(localGoals.movies / 12)} par mois,{" "}
                {Math.round(localGoals.movies / 52)} par semaine
              </p>
            </CardContent>
          </Card>

          {/* Shows Goal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="h-5 w-5 text-primary" />
                Séries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={localGoals.shows}
                  onChange={(e) =>
                    setLocalGoals((prev) => ({
                      ...prev,
                      shows: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground">séries à terminer</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ≈ {Math.round(localGoals.shows / 12)} par mois
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Sauvegardé !
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les objectifs
              </>
            )}
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2">Conseils</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Commence petit et augmente progressivement</li>
              <li>• 50 livres = environ 1 livre par semaine</li>
              <li>• 52 films = 1 film par semaine</li>
              <li>• N'oublie pas que c'est pour le plaisir !</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
