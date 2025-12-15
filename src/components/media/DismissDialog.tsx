"use client"

import { useState } from "react"
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

type DismissReason = "already_consumed" | "not_interested" | "other"

const DISMISS_REASONS: { id: DismissReason; label: string }[] = [
  { id: "already_consumed", label: "Deja vu/lu" },
  { id: "not_interested", label: "Pas interesse" },
  { id: "other", label: "Autre" },
]

interface DismissDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  mediaType: "book" | "movie" | "show"
  onDismiss: (reason: DismissReason, detail?: string) => void
  isLoading?: boolean
}

export function DismissDialog({
  open,
  onOpenChange,
  title,
  mediaType,
  onDismiss,
  isLoading,
}: DismissDialogProps) {
  const [selectedReason, setSelectedReason] = useState<DismissReason | null>(null)
  const [otherDetail, setOtherDetail] = useState("")

  const handleSubmit = () => {
    if (!selectedReason) return
    onDismiss(selectedReason, selectedReason === "other" ? otherDetail : undefined)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setSelectedReason(null)
      setOtherDetail("")
    }
    onOpenChange(open)
  }

  const mediaLabel = mediaType === "book" ? "ce livre" : mediaType === "movie" ? "ce film" : "cette serie"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ignorer cette suggestion</DialogTitle>
          <DialogDescription>
            "{title}" ne sera plus suggere. Pourquoi ?
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
              onClick={() => setSelectedReason(reason.id)}
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
      </DialogContent>
    </Dialog>
  )
}
