import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { MetricValue } from "@/components/data/metric-value"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { Sparkline } from "@/components/data/sparkline"
import type { KpiItem } from "@/types/sales-revenue"

interface RealtimeKpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function RealtimeKpiCard({ item, icon: Icon }: RealtimeKpiCardProps) {
  const direction =
    item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className="text-sm font-medium text-muted-foreground">
          {item.label}
        </DashboardCardTitle>
        <DashboardCardAction>
          <Icon className="size-4 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <MetricValue size="lg" className="my-2 font-mono tabular-nums">
          {item.value}
        </MetricValue>
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
        {item.sparklineData.length > 0 && (
          <Sparkline
            data={item.sparklineData.map((v) => ({ value: v }))}
            height={40}
            area
            className="mt-3"
          />
        )}
      </DashboardCardContent>
    </DashboardCard>
  )
}
