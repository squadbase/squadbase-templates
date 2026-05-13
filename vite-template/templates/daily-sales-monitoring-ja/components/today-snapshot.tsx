import { JapaneseYen, Users, Receipt } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { todaySnapshot } from "@/lib/daily-sales-monitoring-mock-data"
import type { SnapshotItem } from "@/types/daily-sales-monitoring"

const ICONS: Record<SnapshotItem["id"], LucideIcon> = {
  revenue: JapaneseYen,
  customers: Users,
  aov: Receipt,
}

export function TodaySnapshot() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {todaySnapshot.map((item) => {
        const Icon = ICONS[item.id]
        const direction =
          item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"
        return (
          <DashboardCard key={item.id}>
            <DashboardCardHeader>
              <DashboardCardTitle className="font-medium text-muted-foreground">
                {item.label}
              </DashboardCardTitle>
              <DashboardCardAction>
                <Icon className="size-4 text-muted-foreground" />
              </DashboardCardAction>
            </DashboardCardHeader>
            <DashboardCardContent>
              <div className="text-3xl font-bold tabular-nums">{item.value}</div>
              <div className="mt-2 flex items-center gap-2">
                <TrendIndicator
                  value={Math.abs(item.change)}
                  direction={direction}
                  positiveIsGood={item.positiveIsGood}
                />
                <span className="text-xs text-muted-foreground">
                  {item.changeLabel}
                </span>
              </div>
            </DashboardCardContent>
          </DashboardCard>
        )
      })}
    </div>
  )
}
