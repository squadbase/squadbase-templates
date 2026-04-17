"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const defaultColorMap: Record<string, string> = {
  active: "green",
  inactive: "gray",
  warning: "yellow",
  error: "red",
  pending: "blue",
}

const colorStyles: Record<string, { dot: string; bg: string; text: string }> = {
  green: {
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
  },
  gray: {
    dot: "bg-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950",
    text: "text-gray-700 dark:text-gray-300",
  },
  yellow: {
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  red: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
  },
  blue: {
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
  },
}

const fallbackStyle = {
  dot: "bg-gray-500",
  bg: "bg-gray-50 dark:bg-gray-950",
  text: "text-gray-700 dark:text-gray-300",
}

interface StatusBadgeProps {
  status: string
  label?: string
  colorMap?: Partial<Record<string, string>>
  className?: string
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  function StatusBadge({ status, label, colorMap, className }, ref) {
    const mergedColorMap = { ...defaultColorMap, ...colorMap }
    const color = mergedColorMap[status] ?? "gray"
    const style = colorStyles[color] ?? fallbackStyle
    const displayLabel = label ?? status

    return (
      <Badge
        ref={ref}
        data-slot="status-badge"
        variant="outline"
        className={cn(
          "gap-1.5 border-transparent",
          style.bg,
          style.text,
          className
        )}
        aria-label={displayLabel}
      >
        <span
          className={cn("inline-block size-2 rounded-full", style.dot)}
          aria-hidden="true"
        />
        {displayLabel}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
export type { StatusBadgeProps }
