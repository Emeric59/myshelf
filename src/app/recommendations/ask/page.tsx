"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { DismissDialog, RecommendationCard } from "@/components/media"
import { cn } from "@/lib/utils"

const CURRENT_YEAR = new Date().getFullYear()

interface RecommendationItem {
  id: string
  type: "book" | "movie" | "show"
  title: string
  subtitle?: string
  reason: string
  added?: boolean
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  recommendations?: RecommendationItem[]
}

const suggestions = [
  "Un livre comme ACOTAR mais plus dark",
  "Une romance fantasy avec enemies to lovers",
  "Un film feel-good pour ce soir",
  "Une série courte avec du suspense",
  "Quelque chose qui va me faire pleurer",
]

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Dismiss dialog state
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
  const [selectedForDismiss, setSelectedForDismiss] = useState<{
    messageId: string
    reco: RecommendationItem
  } | null>(null)
  const [isDismissing, setIsDismissing] = useState(false)
  const [isAddingFromDismiss, setIsAddingFromDismiss] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add to library helper
  const addToLibrary = async (reco: RecommendationItem, status?: string) => {
    // Search for the media first
    const searchResponse = await fetch(
      `/api/search?q=${encodeURIComponent(reco.title)}&type=${reco.type}`
    )
    const searchData = await searchResponse.json() as { results?: Array<{ id: string; title: string }> }

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('Media not found')
    }

    // Get the first match
    const media = searchData.results[0]

    // Add to library based on type
    const endpoint = reco.type === 'book' ? '/api/books' : reco.type === 'movie' ? '/api/movies' : '/api/shows'
    const defaultStatus = reco.type === 'book' ? 'to_read' : 'to_watch'

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: media.id, status: status || defaultStatus }),
    })
  }

  // Handle add from recommendation card
  const handleAddFromCard = async (messageId: string, recoId: string, reco: RecommendationItem) => {
    try {
      await addToLibrary(reco)
      // Mark as added
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.recommendations) {
          return {
            ...msg,
            recommendations: msg.recommendations.map(r =>
              r.id === recoId ? { ...r, added: true } : r
            )
          }
        }
        return msg
      }))
    } catch (error) {
      console.error('Error adding to library:', error)
      alert('Impossible de trouver ce média. Essaie de le chercher manuellement.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/recommendations/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input.trim(),
          ...(yearFilter !== null && { minYear: yearFilter }),
        }),
      })

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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Voici ce que j'ai trouvé !",
        recommendations: data.recommendations?.map((r) => ({
          id: `${r.type}-${r.title}`.replace(/\s+/g, "-").toLowerCase(),
          type: r.type,
          title: r.title,
          subtitle: r.author || r.year,
          reason: r.reason,
        })) || [],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, je n'ai pas pu obtenir de recommandations. Réessaie !",
        recommendations: [],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  // Handle dismiss
  const openDismissDialog = (messageId: string, reco: RecommendationItem) => {
    setSelectedForDismiss({ messageId, reco })
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
          mediaType: selectedForDismiss.reco.type,
          title: selectedForDismiss.reco.title,
          reason,
          reasonDetail: detail,
        }),
      })

      // Remove from UI
      setMessages(prev => prev.map(msg => {
        if (msg.id === selectedForDismiss.messageId && msg.recommendations) {
          return {
            ...msg,
            recommendations: msg.recommendations.filter(r => r.id !== selectedForDismiss.reco.id)
          }
        }
        return msg
      }))

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

    const { messageId, reco } = selectedForDismiss
    setIsAddingFromDismiss(true)

    try {
      const status = reco.type === 'book' ? 'read' : 'watched'
      await addToLibrary(reco, status)

      // Mark as added in UI (instead of removing)
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.recommendations) {
          return {
            ...msg,
            recommendations: msg.recommendations.map(r =>
              r.id === reco.id ? { ...r, added: true } : r
            )
          }
        }
        return msg
      }))

      setDismissDialogOpen(false)
      setSelectedForDismiss(null)
    } catch (error) {
      console.error('Error adding to library:', error)
      alert('Impossible de trouver ce média. Essaie de le chercher manuellement.')
    } finally {
      setIsAddingFromDismiss(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recommendations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-display font-semibold">Demande à l'IA</h1>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 container px-4 py-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="h-16 w-16 text-primary mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">
              Qu'est-ce que tu cherches ?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Décris ce que tu as envie de lire ou regarder, et je te trouverai
              des suggestions parfaites basées sur tes goûts.
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-2 text-sm rounded-full border border-primary/20 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.recommendations.map((reco) => (
                        <RecommendationCard
                          key={reco.id}
                          type={reco.type}
                          title={reco.title}
                          subtitle={reco.subtitle}
                          reason={reco.reason}
                          added={reco.added}
                          onAdd={() => handleAddFromCard(message.id, reco.id, reco)}
                          onDismiss={() => openDismissDialog(message.id, reco)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="container space-y-3">
          {/* Year filter */}
          <Slider
            value={yearFilter}
            onChange={setYearFilter}
            min={1985}
            max={CURRENT_YEAR}
            nullLabel="Toutes les années"
          />
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Décris ce que tu cherches..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Dismiss Dialog */}
      <DismissDialog
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        title={selectedForDismiss?.reco.title || ""}
        mediaType={selectedForDismiss?.reco.type || "book"}
        onDismiss={handleDismiss}
        onAddToLibrary={handleAddFromDismiss}
        isLoading={isDismissing}
        isAddingToLibrary={isAddingFromDismiss}
      />
    </div>
  )
}
