import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { KpiItem } from "@/types/finance-budget"

interface AchievementProgressCardProps {
  item: KpiItem
}

const statusConfig = {
  achieved: {
    label: "達成",
    badge:
      "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  warning: {
    label: "警告",
    badge:
      "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  unmet: {
    label: "未達",
    badge:
      "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
  },
} as const

export function AchievementProgressCard({
  item,
}: AchievementProgressCardProps) {
  const cfg = statusConfig[item.status]
  const direction =
    item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"

  const achievedWidth = Math.min(100, Math.max(0, item.achievementRate))

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className="font-medium text-muted-foreground">
          {item.label}
        </DashboardCardTitle>
        <Badge variant="outline" className={cn("text-xs", cfg.badge)}>
          {cfg.label}
        </Badge>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="text-2xl font-bold tabular-nums">
          {item.achievementRate.toFixed(1)}%
        </div>
        <div className="mt-1 flex items-center gap-2">
          <TrendIndicator
            value={Math.abs(item.change)}
            direction={direction}
            positiveIsGood={item.positiveIsGood}
          />
          <span className="text-xs text-muted-foreground">
            {item.changeLabel}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">目標 100% に対する進捗</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                item.status === "achieved" && "text-emerald-600 dark:text-emerald-400",
                item.status === "warning" && "text-amber-600 dark:text-amber-400",
                item.status === "unmet" && "text-rose-600 dark:text-rose-400",
              )}
            >
              {item.achievementRate.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", cfg.bar)}
              style={{ width: `${achievedWidth}%` }}
            />
            <div
              className="absolute top-0 h-full w-px bg-foreground/60"
              style={{ left: "100%", transform: "translateX(-1px)" }}
              aria-hidden
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>
              目標 {item.target.toFixed(1)}
              {item.unit}
            </span>
            <span>現在値 {item.value}</span>
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  )
}
