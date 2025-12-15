"use client"

import Link from "next/link"
import {
  User,
  Tv,
  Heart,
  Palette,
  Download,
  Upload,
  Trash2,
  ChevronRight,
  Github,
  ExternalLink,
} from "lucide-react"
import { Header, PageHeader } from "@/components/layout"
import { BottomNav } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const settingsSections = [
  {
    title: "Préférences",
    items: [
      {
        href: "/settings/tropes",
        icon: Heart,
        label: "Tropes",
        description: "Gère tes préférences de tropes",
      },
      {
        href: "/settings/subscriptions",
        icon: Tv,
        label: "Abonnements",
        description: "Streaming et lecture",
      },
    ],
  },
  {
    title: "Apparence",
    items: [
      {
        href: "#",
        icon: Palette,
        label: "Thème",
        description: "Clair, sombre ou automatique",
        disabled: true,
      },
    ],
  },
  {
    title: "Données",
    items: [
      {
        href: "/settings/import",
        icon: Upload,
        label: "Importer",
        description: "BookNode, TV Time",
      },
      {
        href: "#",
        icon: Download,
        label: "Exporter",
        description: "Télécharger tes données",
        disabled: true,
      },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Paramètres" showBack showSearch={false} />

      <main className="container px-4 py-6">
        {/* Profile Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold">Mon profil</h2>
                <p className="text-sm text-muted-foreground">
                  Application single-user
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <section key={section.title} className="mb-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-3 px-1">
              {section.title}
            </h3>
            <Card>
              <CardContent className="p-0 divide-y">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.disabled ? "#" : item.href}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      item.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>
        ))}

        {/* Danger Zone */}
        <section className="mb-6">
          <h3 className="font-medium text-sm text-muted-foreground mb-3 px-1">
            Zone de danger
          </h3>
          <Card className="border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Supprimer mes données</p>
                  <p className="text-sm text-muted-foreground">
                    Cette action est irréversible
                  </p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* About */}
        <section>
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="font-display text-lg font-semibold text-primary mb-1">
                MyShelf
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ta bibliothèque personnelle
              </p>
              <p className="text-xs text-muted-foreground">
                Version 0.1.0 - MVP
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
