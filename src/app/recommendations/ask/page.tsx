"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Sparkles, Loader2, Book, Film, Tv } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MediaCard } from "@/components/media"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  recommendations?: Array<{
    id: string
    type: "book" | "movie" | "show"
    title: string
    subtitle?: string
    image_url?: string
    reason: string
  }>
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        body: JSON.stringify({ query: input.trim() }),
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
                        <Card key={reco.id} className="bg-background">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              {reco.type === "book" && (
                                <Book className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              )}
                              {reco.type === "movie" && (
                                <Film className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              )}
                              {reco.type === "show" && (
                                <Tv className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">
                                  {reco.title}
                                </h4>
                                {reco.subtitle && (
                                  <p className="text-xs text-muted-foreground">
                                    {reco.subtitle}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  "{reco.reason}"
                                </p>
                              </div>
                              <Button size="sm" variant="secondary">
                                Ajouter
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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
        <form onSubmit={handleSubmit} className="container flex gap-2">
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
  )
}
