import type { LucideIcon } from "lucide-react"
import { PageShellSummaryCard } from "@/components/common/page-shell"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { Sparkline } from "@/components/data/sparkline"
import type { KpiItem } from "@/types/pl-dashboard"

interface PlKpiCardProps {
  item: KpiItem
  icon: LucideIcon
}

export function PlKpiCard({ item, icon: Icon }: PlKpiCardProps) {
  const direction =
    item.change > 0 ? "up" : item.change < 0 ? "down" : "neutral"

  return (
    <PageShellSummaryCard accent="default" className="flex-col items-stretch">
      <div className="flex items-start gap-3">
        <Icon />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-muted-foreground">
            {item.label}
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {item.value}
          </div>
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
        </div>
      </div>
      {item.spark.length > 0 && (
        <Sparkline
          data={item.spark.map((v) => ({ value: v }))}
          height={28}
          area
          className="mt-2"
        />
      )}
    </PageShellSummaryCard>
  )
}
