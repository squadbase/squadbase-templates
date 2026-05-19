import { JapaneseYen, Percent, Repeat, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PageShellSummaryCard } from "@/components/common/page-shell"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { Sparkline } from "@/components/data/sparkline"
import { headerKpis } from "@/lib/shareholder-return-dashboard-mock-data"
import type { KpiItem } from "@/types/shareholder-return-dashboard"

const ICONS: Record<KpiItem["id"], LucideIcon> = {
  "dividend-total": JapaneseYen,
  "dividend-yield": Percent,
  buyback: Repeat,
  "total-return-ratio": TrendingUp,
}

export function InsightCards() {
  return (
    <>
      {headerKpis.map((kpi) => {
        const Icon = ICONS[kpi.id]
        const direction =
          kpi.change > 0 ? "up" : kpi.change < 0 ? "down" : "neutral"
        return (
          <PageShellSummaryCard key={kpi.id} accent="accent">
            <Icon />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                {kpi.label}
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {kpi.value}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <TrendIndicator
                  value={Math.abs(kpi.change)}
                  direction={direction}
                  positiveIsGood={kpi.positiveIsGood}
                />
                <span className="text-xs text-muted-foreground">
                  {kpi.changeLabel}
                </span>
              </div>
              {kpi.sparklineData.length > 0 && (
                <Sparkline
                  data={kpi.sparklineData.map((v) => ({ value: v }))}
                  height={28}
                  area
                  className="mt-2"
                />
              )}
            </div>
          </PageShellSummaryCard>
        )
      })}
    </>
  )
}
