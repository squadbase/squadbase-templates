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

interface HeroKpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function HeroKpiCard({ item, icon: Icon }: HeroKpiCardProps) {
  return (
    <DashboardCard className="h-full">
      <DashboardCardHeader>
        <Skeleton className="h-5 w-32" />
        <DashboardCardAction>
          <Icon className="size-5 text-muted-foreground" />
        </DashboardCardAction>
      </DashboardCardHeader>
      <DashboardCardContent className="flex flex-1 flex-col gap-5">
        <div>
          <Skeleton className="h-10 w-40" />
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3.5 w-32" />
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
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  )
}
