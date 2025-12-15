"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number | null
  onChange: (value: number | null) => void
  min: number
  max: number
  step?: number
  className?: string
  showValue?: boolean
  nullLabel?: string
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
  showValue = true,
  nullLabel = "Tous",
}: SliderProps) {
  // Internal value: min - 1 represents "null" (all years)
  const internalMin = min - 1
  const internalValue = value === null ? internalMin : value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (newValue === internalMin) {
      onChange(null)
    } else {
      onChange(newValue)
    }
  }

  const displayValue = value === null ? nullLabel : value.toString()

  return (
    <div className={cn("space-y-2", className)}>
      {showValue && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Année minimum</span>
          <span className="font-medium">{displayValue}</span>
        </div>
      )}
      <input
        type="range"
        min={internalMin}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{nullLabel}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
