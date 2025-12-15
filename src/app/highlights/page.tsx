"use client"

import { useState, useMemo } from "react"
import { Quote, Search, Plus, Loader2, Book, Trash2, Edit2, X, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useHighlights } from "@/lib/hooks"
import type { Highlight } from "@/types"

export default function HighlightsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBookFilter, setSelectedBookFilter] = useState<string | null>(null)
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editNote, setEditNote] = useState("")

  const { highlights, total, isLoading, removeHighlight, updateHighlight } = useHighlights()

  // Extract unique books from highlights
  const uniqueBooks = useMemo(() => {
    const books = new Map<string, { id: string; title: string; author?: string }>()
    highlights.forEach((h) => {
      if (h.book && !books.has(h.book_id)) {
        books.set(h.book_id, {
          id: h.book_id,
          title: h.book.title,
          author: h.book.author,
        })
      }
    })
    return Array.from(books.values())
  }, [highlights])

  // Filter highlights
  const filteredHighlights = useMemo(() => {
    return highlights.filter((highlight) => {
      const matchesSearch =
        searchQuery === "" ||
        highlight.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        highlight.personal_note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        highlight.book?.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesBook =
        selectedBookFilter === null || highlight.book_id === selectedBookFilter

      return matchesSearch && matchesBook
    })
  }, [highlights, searchQuery, selectedBookFilter])

  // Handle edit
  const startEditing = (highlight: Highlight) => {
    setEditingHighlight(highlight)
    setEditContent(highlight.content)
    setEditNote(highlight.personal_note || "")
  }

  const saveEdit = async () => {
    if (!editingHighlight) return

    await updateHighlight(editingHighlight.id, {
      content: editContent,
      personalNote: editNote || undefined,
    })
    setEditingHighlight(null)
  }

  const cancelEdit = () => {
    setEditingHighlight(null)
    setEditContent("")
    setEditNote("")
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm("Supprimer ce passage ?")) {
      await removeHighlight(id)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Passages favoris" showBack />

      <main className="container px-4 py-6">
        <PageHeader
          title="Highlights"
          description={`${total} passage${total > 1 ? "s" : ""} sauvegardé${total > 1 ? "s" : ""}`}
        />

        {/* Search */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans tes passages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Book filters */}
          {uniqueBooks.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Badge
                variant={selectedBookFilter === null ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedBookFilter(null)}
              >
                Tous les livres
              </Badge>
              {uniqueBooks.map((book) => (
                <Badge
                  key={book.id}
                  variant={selectedBookFilter === book.id ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedBookFilter(book.id)}
                >
                  {book.title}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {filteredHighlights.length} résultat{filteredHighlights.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredHighlights.length > 0 ? (
          <div className="space-y-4">
            {filteredHighlights.map((highlight) => (
              <Card key={highlight.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Book info */}
                  {highlight.book && (
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                      {highlight.book.cover_url ? (
                        <Image
                          src={highlight.book.cover_url}
                          alt={highlight.book.title}
                          width={32}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-muted rounded flex items-center justify-center">
                          <Book className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {highlight.book.title}
                        </p>
                        {highlight.book.author && (
                          <p className="text-xs text-muted-foreground truncate">
                            {highlight.book.author}
                          </p>
                        )}
                      </div>
                      {(highlight.page_number || highlight.chapter) && (
                        <Badge variant="secondary" className="text-xs">
                          {highlight.chapter || `p. ${highlight.page_number}`}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Quote content */}
                  {editingHighlight?.id === highlight.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Note personnelle
                        </Label>
                        <Input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Ajouter une note..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          <Check className="h-4 w-4 mr-1" />
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative pl-4 border-l-2 border-primary/30">
                        <Quote className="absolute -left-3 -top-1 h-5 w-5 text-primary/50 bg-card" />
                        <p className="text-sm leading-relaxed italic">
                          {highlight.content}
                        </p>
                      </div>

                      {/* Personal note */}
                      {highlight.personal_note && (
                        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                          {highlight.personal_note}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(highlight)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(highlight.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Quote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium mb-2">
              {searchQuery || selectedBookFilter
                ? "Aucun passage trouvé"
                : "Aucun passage sauvegardé"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedBookFilter
                ? "Essaie de modifier tes filtres"
                : "Sauvegarde tes citations et passages préférés"}
            </p>
            <Button asChild>
              <Link href="/books">
                <Book className="h-4 w-4 mr-2" />
                Voir mes livres
              </Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
