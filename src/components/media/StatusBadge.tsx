import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { BookStatus, MovieStatus, ShowStatus } from "@/types"

type Status = BookStatus | MovieStatus | ShowStatus

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<
  Status,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
> = {
  // Books
  to_read: {
    label: "À lire",
    variant: "outline",
    className: "border-primary/50 text-primary",
  },
  reading: {
    label: "En cours",
    variant: "default",
    className: "bg-primary",
  },
  read: {
    label: "Lu",
    variant: "secondary",
    className: "bg-secondary text-white",
  },
  abandoned: {
    label: "Abandonné",
    variant: "outline",
    className: "border-muted-foreground text-muted-foreground",
  },

  // Movies
  to_watch: {
    label: "À voir",
    variant: "outline",
    className: "border-primary/50 text-primary",
  },
  watched: {
    label: "Vu",
    variant: "secondary",
    className: "bg-secondary text-white",
  },

  // Shows
  watching: {
    label: "En cours",
    variant: "default",
    className: "bg-primary",
  },
  paused: {
    label: "En pause",
    variant: "outline",
    className: "border-amber-500 text-amber-600",
  },

  // Common
  blacklist: {
    label: "Blacklist",
    variant: "destructive",
    className: "bg-destructive",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  if (!config) {
    return null
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

export function getStatusLabel(status: Status): string {
  return statusConfig[status]?.label || status
}
