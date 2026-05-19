import { StatusBadge } from "@/components/common/status-badge"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { formatCurrencyMillions } from "./chart-helpers"
import type { BuybackEvent } from "@/types/shareholder-return-dashboard"

interface BuybackTimelineChartProps {
  events: BuybackEvent[]
}

const statusLabel: Record<BuybackEvent["status"], string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  announced: "Announced",
}

const statusKey: Record<BuybackEvent["status"], string> = {
  completed: "active",
  "in-progress": "pending",
  announced: "warning",
}

export function BuybackTimelineChart({ events }: BuybackTimelineChartProps) {
  if (events.length === 0) {
    return (
      <DashboardCardPreset
        title="Share Buyback Timeline"
        description="Announced buyback programs by fiscal year"
      >
        <p className="text-sm text-muted-foreground">No buyback events recorded.</p>
      </DashboardCardPreset>
    )
  }

  const maxAmount = events.reduce((m, e) => (e.amount > m ? e.amount : m), 0)
  // Newest first
  const sorted = [...events].sort((a, b) => b.fiscalYear - a.fiscalYear)

  return (
    <DashboardCardPreset
      title="Share Buyback Timeline"
      description="Announced buyback programs by fiscal year"
    >
      <ol className="relative space-y-5 border-l border-border pl-6">
        {sorted.map((event) => {
          const widthPct = Math.max(8, (event.amount / maxAmount) * 100)
          return (
            <li key={event.id} className="relative">
              <span className="absolute -left-[31px] top-1 inline-flex size-3 rounded-full bg-chart-1 ring-4 ring-background" />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-foreground">
                  FY{event.fiscalYear}
                </span>
                <span className="text-xs text-muted-foreground">
                  Announced {event.announcedAt}
                </span>
                <StatusBadge
                  status={statusKey[event.status]}
                  label={statusLabel[event.status]}
                  className="ml-auto"
                />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="min-w-[70px] text-right text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrencyMillions(event.amount)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.shares.toLocaleString("en-US")} shares repurchased
              </p>
            </li>
          )
        })}
      </ol>
    </DashboardCardPreset>
  )
}
