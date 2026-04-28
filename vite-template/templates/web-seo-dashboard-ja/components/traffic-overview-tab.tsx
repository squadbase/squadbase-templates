import { Eye, Users, Activity, ArrowDownRight } from "lucide-react"
import { KpiCard } from "./kpi-card"
import { TrafficTrendChart } from "./traffic-trend-chart"
import { ChannelBreakdownList } from "./channel-breakdown-list"
import { HourlyHeatmapChart } from "./hourly-heatmap-chart"
import { PageTrafficTable } from "./page-traffic-table"
import {
  trafficKpis,
  dailyTrafficTrend,
  channelBreakdown,
  hourlyTrafficMatrix,
  pageTrafficData,
} from "@/lib/web-seo-mock-data"

const kpiIcons = [Eye, Users, Activity, ArrowDownRight] as const

export function TrafficOverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trafficKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrafficTrendChart data={dailyTrafficTrend} />
        </div>
        <div>
          <ChannelBreakdownList data={channelBreakdown} />
        </div>
      </div>

      <HourlyHeatmapChart data={hourlyTrafficMatrix} />

      <PageTrafficTable data={pageTrafficData} />
    </div>
  )
}
