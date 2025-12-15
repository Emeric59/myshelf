"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating?: number | null
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function RatingStars({
  rating = 0,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const displayRating = rating ?? 0

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (!interactive || !onChange) return
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1
    onChange(newRating)
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = displayRating >= i + 1
        const halfFilled = !filled && displayRating >= i + 0.5

        return (
          <div
            key={i}
            className={cn("relative", interactive && "cursor-pointer")}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "text-muted-foreground/30",
                interactive && "hover:text-primary/50 transition-colors"
              )}
              strokeWidth={1.5}
            />

            {/* Filled star overlay */}
            {(filled || halfFilled) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: halfFilled ? "50%" : "100%" }}
              >
                <Star
                  className={cn(sizeClasses[size], "text-amber-400 fill-amber-400")}
                  strokeWidth={1.5}
                />
              </div>
            )}

            {/* Interactive click areas */}
            {interactive && (
              <>
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 w-1/2"
                  onClick={() => handleClick(i, true)}
                  aria-label={`${i + 0.5} étoiles`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 w-1/2"
                  onClick={() => handleClick(i, false)}
                  aria-label={`${i + 1} étoiles`}
                />
              </>
            )}
          </div>
        )
      })}

      {/* Display numeric rating */}
      {displayRating > 0 && !interactive && (
        <span className="ml-1 text-sm text-muted-foreground">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
