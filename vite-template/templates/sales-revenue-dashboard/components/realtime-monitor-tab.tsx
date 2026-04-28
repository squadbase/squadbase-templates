import { useState } from "react"
import { Zap, TrendingUp, Gauge, BellRing } from "lucide-react"
import { RefreshControl } from "@/components/data/refresh-control"
import { RealtimeKpiCard } from "./realtime-kpi-card"
import { HourlyCumulativeChart } from "./hourly-cumulative-chart"
import { OrderLiveFeed } from "./order-live-feed"
import { AlertPanel } from "./alert-panel"
import {
  realtimeKpis,
  hourlyCumulative,
} from "@/lib/sales-revenue-mock-data"

const kpiIcons = [Zap, TrendingUp, Gauge, BellRing] as const

export function RealtimeMonitorTab() {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date())

  const handleRefresh = () => {
    setLastUpdatedAt(new Date())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Realtime revenue monitoring · auto-refresh every 5s
        </p>
        <RefreshControl
          onRefresh={handleRefresh}
          lastUpdatedAt={lastUpdatedAt}
          autoRefreshInterval={5}
          size="sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {realtimeKpis.map((kpi, i) => (
          <RealtimeKpiCard key={kpi.label} item={kpi} icon={kpiIcons[i]} />
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

      <OrderLiveFeed />
    </div>
  )
}
