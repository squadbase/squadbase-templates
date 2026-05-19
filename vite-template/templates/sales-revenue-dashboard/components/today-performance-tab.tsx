import { DollarSign, ShoppingBag, Receipt, Target } from "lucide-react"
import { KpiCard } from "./kpi-card"
import { HourlyCumulativeChart } from "./hourly-cumulative-chart"
import { AlertPanel } from "./alert-panel"
import { TodayChannelBreakdown } from "./today-channel-breakdown"
import { TodayCategoryTop5 } from "./today-category-top5"
import {
  todayKpis,
  hourlyCumulative,
  todayChannelBreakdown,
  todayCategoryTop5,
  CURRENT_HOUR,
} from "@/lib/sales-revenue-mock-data"

const kpiIcons = [DollarSign, ShoppingBag, Receipt, Target] as const

export function TodayPerformanceTab() {
  const snapshotLabel = `Today's snapshot · as of ${String(CURRENT_HOUR).padStart(2, "0")}:00`

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{snapshotLabel}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {todayKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyCumulativeChart data={hourlyCumulative} />
        </div>
        <div>
          <AlertPanel />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TodayChannelBreakdown data={todayChannelBreakdown} />
        </div>
        <div className="lg:col-span-2">
          <TodayCategoryTop5 data={todayCategoryTop5} />
        </div>
      </div>
    </div>
  )
}
