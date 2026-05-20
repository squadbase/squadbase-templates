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

interface HeroKpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function HeroKpiCard({ item, icon: Icon }: HeroKpiCardProps) {
  return (
    <DashboardCard className="h-full">
      <DashboardCardHeader>
        <DashboardCardTitle className="text-muted-foreground">
          {item.label}
        </DashboardCardTitle>
        <DashboardCardAction>
          <Icon className="size-5 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent className="flex flex-1 flex-col gap-5">
        <div>
          <Placeholder className="text-4xl font-bold">{item.value}</Placeholder>
          <div className="mt-3 flex items-center gap-2">
            <Placeholder className="text-sm font-medium">
              {item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
            </Placeholder>
            {item.changeLabel ? (
              <span className="text-xs text-muted-foreground">
                {item.changeLabel}
              </span>
            ) : null}
          </div>
        </div>
        {item.sparklineData.length > 0 && (
          <Sparkline
            data={item.sparklineData.map((v) => ({ value: v }))}
            height={88}
            area
          />
        )}
        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Metric A</p>
            <Placeholder className="text-sm font-medium">$0.92M</Placeholder>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Metric B</p>
            <Placeholder className="text-sm font-medium">+8.4%</Placeholder>
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  )
}
