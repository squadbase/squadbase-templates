import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Sparkline } from "@/components/data/sparkline"
import type { KpiItem } from "@/types/ui-template-kpi-chart-simple"

interface KpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function KpiCard({ item, icon: Icon }: KpiCardProps) {
  const isPositive = item.change >= 0
  const isGood = item.positiveIsGood ? isPositive : !isPositive
  const colorClass = isGood ? "text-emerald-500" : "text-rose-500"
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
        <DashboardCardAction>
          <Icon className="size-4 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <p className="text-2xl font-bold tracking-tight">{item.value}</p>
        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${colorClass}`}>
          <TrendIcon className="size-3.5" />
          <span>
            {isPositive ? "+" : ""}{item.change}{item.id === "churn-rate" ? " pt" : "%"}
          </span>
          {item.changeLabel && (
            <span className="text-muted-foreground font-normal">{item.changeLabel}</span>
          )}
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
