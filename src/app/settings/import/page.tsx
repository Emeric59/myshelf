"use client"

import { useState } from "react"
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ImportStatus = "idle" | "uploading" | "processing" | "success" | "error"

export default function ImportPage() {
  const [bookNodeStatus, setBookNodeStatus] = useState<ImportStatus>("idle")
  const [tvTimeStatus, setTvTimeStatus] = useState<ImportStatus>("idle")

  const handleBookNodeImport = () => {
    // TODO: Implement file upload and processing
    setBookNodeStatus("uploading")
    setTimeout(() => {
      setBookNodeStatus("error")
    }, 2000)
  }

  const handleTvTimeImport = () => {
    // TODO: Implement file upload and processing
    setTvTimeStatus("uploading")
    setTimeout(() => {
      setTvTimeStatus("error")
    }, 2000)
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
          <h1 className="font-display font-semibold ml-2">Importer mes données</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <p className="text-muted-foreground mb-6">
          Importe ta bibliothèque depuis d'autres applications pour ne pas
          repartir de zéro.
        </p>

        {/* BookNode Import */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  BookNode
                </CardTitle>
                <CardDescription className="mt-1">
                  Importe tes livres depuis BookNode
                </CardDescription>
              </div>
              <Badge variant="outline">CSV</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Pour exporter depuis BookNode :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Va sur ton profil BookNode</li>
                  <li>Clique sur "Exporter ma bibliothèque"</li>
                  <li>Télécharge le fichier CSV</li>
                  <li>Importe-le ici</li>
                </ol>
              </div>

              {bookNodeStatus === "error" && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Import non disponible (base de données non configurée)</span>
                </div>
              )}

              {bookNodeStatus === "success" && (
                <div className="flex items-center gap-2 text-secondary text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Import réussi !</span>
                </div>
              )}

              <Button
                onClick={handleBookNodeImport}
                disabled={bookNodeStatus === "uploading" || bookNodeStatus === "processing"}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {bookNodeStatus === "uploading"
                  ? "Envoi en cours..."
                  : bookNodeStatus === "processing"
                    ? "Traitement..."
                    : "Choisir un fichier CSV"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TV Time Import */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  TV Time
                </CardTitle>
                <CardDescription className="mt-1">
                  Importe tes séries et films depuis TV Time
                </CardDescription>
              </div>
              <Badge variant="outline">ZIP</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Pour exporter depuis TV Time :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Va dans Paramètres {">"} Confidentialité</li>
                  <li>Clique sur "Télécharger mes données"</li>
                  <li>Attends l'email avec le lien de téléchargement</li>
                  <li>Télécharge le fichier ZIP</li>
                  <li>Importe-le ici</li>
                </ol>
              </div>

              {tvTimeStatus === "error" && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Import non disponible (base de données non configurée)</span>
                </div>
              )}

              {tvTimeStatus === "success" && (
                <div className="flex items-center gap-2 text-secondary text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Import réussi !</span>
                </div>
              )}

              <Button
                onClick={handleTvTimeImport}
                disabled={tvTimeStatus === "uploading" || tvTimeStatus === "processing"}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {tvTimeStatus === "uploading"
                  ? "Envoi en cours..."
                  : tvTimeStatus === "processing"
                    ? "Traitement..."
                    : "Choisir un fichier ZIP"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
