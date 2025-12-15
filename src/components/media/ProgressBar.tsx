import { cn } from "@/lib/utils"

interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  showPercentage?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
}

export function ProgressBar({
  current,
  total,
  showLabel = false,
  showPercentage = true,
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const roundedPercentage = Math.round(percentage)

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full bg-primary rounded-full transition-all duration-300",
            percentage === 100 && "bg-secondary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mt-1">
          {showLabel && (
            <span className="text-xs text-muted-foreground">
              {current} / {total}
            </span>
          )}
          {showPercentage && (
            <span
              className={cn(
                "text-xs font-medium",
                percentage === 100 ? "text-secondary" : "text-primary"
              )}
            >
              {roundedPercentage}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface BookProgressProps {
  currentPage: number
  totalPages: number
  className?: string
}

export function BookProgress({
  currentPage,
  totalPages,
  className,
}: BookProgressProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <ProgressBar
        current={currentPage}
        total={totalPages}
        showPercentage
        size="sm"
      />
      <p className="text-xs text-muted-foreground">
        Page {currentPage} sur {totalPages}
      </p>
    </div>
  )
}

interface ShowProgressProps {
  currentSeason: number
  currentEpisode: number
  totalSeasons: number
  totalEpisodes: number
  className?: string
}

export function ShowProgress({
  currentSeason,
  currentEpisode,
  totalSeasons,
  totalEpisodes,
  className,
}: ShowProgressProps) {
  // Calculate total watched episodes (simplified)
  const watchedEpisodes = currentEpisode

  return (
    <div className={cn("space-y-1", className)}>
      <ProgressBar
        current={watchedEpisodes}
        total={totalEpisodes}
        showPercentage
        size="sm"
      />
      <p className="text-xs text-muted-foreground">
        S{currentSeason} E{currentEpisode} / {totalSeasons} saisons
      </p>
    </div>
  )
}
