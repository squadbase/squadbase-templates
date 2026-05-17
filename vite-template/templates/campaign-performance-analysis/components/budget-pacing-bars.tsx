import {
  DashboardCardPreset,
} from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatPercent } from "./chart-helpers"
import type { BudgetPacingRow } from "@/types/campaign-performance-analysis"

interface BudgetPacingBarsProps {
  data: BudgetPacingRow[]
}

const STATUS_LABEL: Record<BudgetPacingRow["paceStatus"], string> = {
  ahead: "Ahead",
  "on-track": "On-track",
  behind: "Behind",
}

const STATUS_BADGE: Record<BudgetPacingRow["paceStatus"], string> = {
  ahead:
    "border-amber-500 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/40",
  "on-track":
    "border-emerald-500 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/40",
  behind:
    "border-red-500 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-950/40",
}

const BAR_FILL: Record<BudgetPacingRow["paceStatus"], string> = {
  ahead: "bg-amber-500",
  "on-track": "bg-chart-1",
  behind: "bg-red-500",
}

export function BudgetPacingBars({ data }: BudgetPacingBarsProps) {
  return (
    <DashboardCardPreset
      title="Budget Pacing"
      description="Spend vs time elapsed for the current monthly cycle"
    >
      <div className="space-y-4">
        {data.map((row) => {
          const widthPct = Math.min(100, Math.max(0, row.pctSpent))
          const markerPct = Math.min(100, Math.max(0, row.pctTimeElapsed))
          return (
            <div key={row.campaignId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {row.campaignName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Day {row.daysElapsed}/{row.daysInPeriod} —{" "}
                    {formatCurrency(row.spent, { short: true })} of{" "}
                    {formatCurrency(row.budget, { short: true })}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0", STATUS_BADGE[row.paceStatus])}
                >
                  {STATUS_LABEL[row.paceStatus]}
                </Badge>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-3 rounded-full transition-all",
                    BAR_FILL[row.paceStatus],
                  )}
                  style={{ width: `${widthPct}%` }}
                />
                {/* Time-elapsed marker (vertical dashed) */}
                <div
                  className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-foreground/40"
                  style={{ left: `${markerPct}%` }}
                  aria-label="Time elapsed"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{formatPercent(row.pctSpent)} spent</span>
                <span>{formatPercent(row.pctTimeElapsed)} of month</span>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCardPreset>
  )
}
