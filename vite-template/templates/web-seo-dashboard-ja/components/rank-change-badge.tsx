import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RankChangeBadgeProps {
  change: number
  className?: string
}

export function RankChangeBadge({ change, className }: RankChangeBadgeProps) {
  if (change === 0) {
    return (
      <Badge variant="secondary" className={cn("gap-0.5", className)}>
        <Minus className="size-3" />
        <span>-</span>
      </Badge>
    )
  }

  const improved = change > 0
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-0.5",
        improved
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        className,
      )}
    >
      {improved ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      <span>{Math.abs(change)}</span>
    </Badge>
  )
}
