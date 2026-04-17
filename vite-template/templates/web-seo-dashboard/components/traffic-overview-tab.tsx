import { Eye, Users, Activity, ArrowDownRight } from "lucide-react"
import { KpiCard } from "./kpi-card"
import { TrafficTrendChart } from "./traffic-trend-chart"
import { ChannelPieChart } from "./channel-pie-chart"
import { PageTrafficTable } from "./page-traffic-table"
import {
  trafficKpis,
  dailyTrafficTrend,
  channelBreakdown,
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
          <ChannelPieChart data={channelBreakdown} />
        </div>
      </div>

      <PageTrafficTable data={pageTrafficData} />
    </div>
  )
}
