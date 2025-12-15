"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Book, Sparkles, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    label: "Accueil",
    icon: Home,
  },
  {
    href: "/books",
    label: "Biblio",
    icon: Book,
    matchPaths: ["/books", "/movies", "/shows"],
  },
  {
    href: "/recommendations",
    label: "Recos",
    icon: Sparkles,
  },
  {
    href: "/stats",
    label: "Stats",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Plus",
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background safe-area-bottom">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = item.matchPaths
            ? item.matchPaths.some((path) => pathname.startsWith(path))
            : pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon
                className={cn("h-6 w-6", isActive && "fill-primary/10")}
              />
              <span className={cn("text-xs", isActive && "font-medium")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
