import type { LucideIcon } from "lucide-react"
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardAction,
  DashboardCardContent,
} from "@/components/common/dashboard-card"
import { Skeleton } from "@/components/ui/skeleton"
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
        <Skeleton className="h-4 w-20" />
        <DashboardCardAction>
          <Icon className="size-4 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent>
        <Skeleton className="h-7 w-24" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3 w-24" />
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
