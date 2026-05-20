import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Placeholder } from "@/components/common/placeholder"
import { Sparkline } from "@/components/data/sparkline"
import type { KpiItem } from "@/types/ui-template-kpi-chart-advanced"

interface KpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function KpiCard({ item, icon: Icon }: KpiCardProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle className="text-muted-foreground">
          {item.label}
        </DashboardCardTitle>
        <DashboardCardAction>
          <Icon className="size-4 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <Placeholder className="text-2xl font-bold">{item.value}</Placeholder>
        <div className="mt-2 flex items-center gap-2">
          <Placeholder className="text-sm font-medium">
            {item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
          </Placeholder>
          {item.changeLabel ? (
            <span className="text-xs text-muted-foreground">
              {item.changeLabel}
            </span>
          ) : null}
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
