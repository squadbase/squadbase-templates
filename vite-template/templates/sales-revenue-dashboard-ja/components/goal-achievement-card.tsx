import { Target } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { formatCurrency } from "./chart-helpers"
import type { KpiItem } from "@/types/sales-revenue"

interface MonthProgress {
  currentRevenue: number
  achievementRate: number
  expectedRate: number
  dayOfMonth: number
  daysInMonth: number
  remainingDays: number
}

interface GoalAchievementCardProps {
  item: KpiItem
  progress: MonthProgress
  target: number
}

export function GoalAchievementCard({
  item,
  progress,
  target,
}: GoalAchievementCardProps) {
  const direction =
    item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"

  const isOnTrack = progress.achievementRate >= progress.expectedRate
  const achievedWidth = Math.min(100, progress.achievementRate)
  const expectedPosition = Math.min(100, progress.expectedRate)

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className="font-medium text-muted-foreground">
          {item.label}
        </DashboardCardTitle>
        <DashboardCardAction>
          <Target className="size-4 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="text-2xl font-bold tabular-nums">{item.value}</div>
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
            <span className="text-muted-foreground">月次目標達成率</span>
            <span
              className={`font-semibold tabular-nums ${
                isOnTrack ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {progress.achievementRate.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                isOnTrack ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${achievedWidth}%` }}
            />
            <div
              className="absolute top-0 h-full w-px bg-foreground/60"
              style={{ left: `${expectedPosition}%` }}
              aria-hidden
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>目標 {formatCurrency(target, { short: true })}</span>
            <span>
              残 {progress.remainingDays}日 / {progress.daysInMonth}日中
            </span>
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  )
}
