"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ArrowLeft, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title?: string
  showBack?: boolean
  showSearch?: boolean
  showMenu?: boolean
  className?: string
  children?: React.ReactNode
}

export function Header({
  title = "MyShelf",
  showBack = false,
  showSearch = true,
  showMenu = false,
  className,
  children,
}: HeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-2">
          {showBack && !isHome && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <h1
            className={cn(
              "font-display font-semibold",
              isHome ? "text-xl text-primary" : "text-lg"
            )}
          >
            {title}
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {children}
          {showSearch && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
          )}
          {showMenu && (
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
