import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strip HTML tags and decode HTML entities from text
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return ""
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Format minutes into a human-readable duration string
 * Examples: "2h 30min", "45min", "12h"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0min"

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours === 0) {
    return `${minutes}min`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}min`
}

/**
 * Format minutes into days, hours, minutes for very long durations
 * Examples: "5j 2h", "12h 30min", "45min"
 */
export function formatLongDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0min"

  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = Math.round(totalMinutes % 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}j`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 && days === 0) parts.push(`${minutes}min`)

  return parts.join(" ") || "0min"
}
