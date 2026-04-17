import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { Sparkline } from "@/components/data/sparkline"
import type { KpiItem } from "@/types/web-seo"

interface KpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function KpiCard({ item, icon: Icon }: KpiCardProps) {
  const direction =
    item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className="font-medium text-muted-foreground">
          {item.label}
        </DashboardCardTitle>
        <DashboardCardAction>
          <Icon className="size-4 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <div className="text-2xl font-bold">{item.value}</div>
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
            height={32}
            area
            className="mt-3"
          />
        )}
      </DashboardCardContent>
    </DashboardCard>
  )
}
