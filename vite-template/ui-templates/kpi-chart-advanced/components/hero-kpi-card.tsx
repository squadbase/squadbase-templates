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
import type { KpiItem } from "@/types/ui-template-kpi-chart-advanced"

interface SubStat {
  label: string
  value: string
}

interface HeroKpiCardProps {
  item: KpiItem
  icon: LucideIcon
  subStats?: SubStat[]
}

export function HeroKpiCard({ item, icon: Icon, subStats }: HeroKpiCardProps) {
  const direction =
    item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"

  return (
    <DashboardCard className="h-full">
      <DashboardCardHeader>
        <DashboardCardTitle className="text-base font-semibold">
          {item.label}
        </DashboardCardTitle>
        <DashboardCardAction>
          <Icon className="size-5 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent className="flex flex-1 flex-col gap-5">
        <div>
          <div className="text-5xl font-bold tabular-nums tracking-tight">
            {item.value}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <TrendIndicator
              value={Math.abs(item.change)}
              direction={direction}
              positiveIsGood={item.positiveIsGood}
            />
            <span className="text-sm text-muted-foreground">
              {item.changeLabel}
            </span>
          </div>
        </div>
        {item.sparklineData.length > 0 && (
          <Sparkline
            data={item.sparklineData.map((v) => ({ value: v }))}
            height={88}
            area
          />
        )}
        {subStats && subStats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 border-t pt-3">
            {subStats.map((s) => (
              <div key={s.label}>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-base font-semibold tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  )
}
