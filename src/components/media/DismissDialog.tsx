"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BookOpen, Check, ArrowLeft } from "lucide-react"

type DismissReason = "already_consumed" | "not_interested" | "other"

const DISMISS_REASONS: { id: DismissReason; label: string }[] = [
  { id: "already_consumed", label: "Déjà vu/lu" },
  { id: "not_interested", label: "Pas intéressé" },
  { id: "other", label: "Autre" },
]

interface DismissDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  mediaType: "book" | "movie" | "show"
  onDismiss: (reason: DismissReason, detail?: string) => void
  onAddToLibrary?: () => void
  isLoading?: boolean
  isAddingToLibrary?: boolean
}

export function DismissDialog({
  open,
  onOpenChange,
  title,
  mediaType,
  onDismiss,
  onAddToLibrary,
  isLoading,
  isAddingToLibrary,
}: DismissDialogProps) {
  const [selectedReason, setSelectedReason] = useState<DismissReason | null>(null)
  const [otherDetail, setOtherDetail] = useState("")
  const [showAddPrompt, setShowAddPrompt] = useState(false)

  // Reset state quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setSelectedReason(null)
      setOtherDetail("")
      setShowAddPrompt(false)
    }
  }, [open])

  const handleReasonSelect = (reason: DismissReason) => {
    setSelectedReason(reason)
    // Si "déjà vu/lu" et callback disponible, montrer le prompt d'ajout
    if (reason === "already_consumed" && onAddToLibrary) {
      setShowAddPrompt(true)
    }
  }

  const handleSubmit = () => {
    if (!selectedReason) return
    onDismiss(selectedReason, selectedReason === "other" ? otherDetail : undefined)
  }

  const handleAddToLibrary = () => {
    if (onAddToLibrary) {
      onAddToLibrary()
    }
  }

  const handleJustDismiss = () => {
    // Dismiss avec la raison "already_consumed" mais sans ajouter
    onDismiss("already_consumed")
  }

  const handleBack = () => {
    setShowAddPrompt(false)
    setSelectedReason(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setSelectedReason(null)
      setOtherDetail("")
      setShowAddPrompt(false)
    }
    onOpenChange(open)
  }

  const mediaLabel = mediaType === "book" ? "ce livre" : mediaType === "movie" ? "ce film" : "cette série"
  const actionLabel = mediaType === "book" ? "lu" : "vu"
  const statusLabel = mediaType === "book" ? "comme lu" : "comme vu"

  const anyLoading = isLoading || isAddingToLibrary

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showAddPrompt ? (
          // Écran de confirmation pour "déjà vu/lu"
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Déjà {actionLabel} ?
              </DialogTitle>
              <DialogDescription>
                Tu as déjà {actionLabel} &quot;{title}&quot;. Veux-tu l&apos;ajouter à ta bibliothèque ?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Button
                className="w-full"
                onClick={handleAddToLibrary}
                disabled={anyLoading}
              >
                {isAddingToLibrary ? (
                  "Ajout en cours..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Oui, l&apos;ajouter {statusLabel}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleJustDismiss}
                disabled={anyLoading}
              >
                {isLoading ? "..." : "Non, juste l'ignorer"}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={handleBack}
              disabled={anyLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </>
        ) : (
          // Écran principal de choix de raison
          <>
            <DialogHeader>
              <DialogTitle>Ignorer cette suggestion</DialogTitle>
              <DialogDescription>
                &quot;{title}&quot; ne sera plus suggéré. Pourquoi ?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {DISMISS_REASONS.map((reason) => (
                <Button
                  key={reason.id}
                  variant={selectedReason === reason.id ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start",
                    selectedReason === reason.id && "bg-primary"
                  )}
                  onClick={() => handleReasonSelect(reason.id)}
                  disabled={isLoading}
                >
                  {reason.label}
                </Button>
              ))}
              {selectedReason === "other" && (
                <Input
                  placeholder="Raison (optionnel)"
                  value={otherDetail}
                  onChange={(e) => setOtherDetail(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              )}
            </div>
            {/* Boutons de confirmation pour "pas intéressé" et "autre" */}
            {selectedReason && selectedReason !== "already_consumed" && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedReason || isLoading}
                >
                  {isLoading ? "..." : "Confirmer"}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
