import { MessageCircleQuestion, TrendingUp, Smile, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PageShellSummaryCard } from "@/components/common/page-shell"
import { TrendIndicator } from "@/components/data/trend-indicator"
import { summaryKpis } from "@/lib/survey-aggregation-dashboard-mock-data"
import type { SummaryKpi } from "@/types/survey-aggregation-dashboard"

const iconMap: Record<SummaryKpi["id"], LucideIcon> = {
  responses: MessageCircleQuestion,
  nps: TrendingUp,
  csat: Smile,
  "segment-gap": Users,
}

export function InsightCards() {
  return (
    <>
      {summaryKpis.map((kpi) => {
        const Icon = iconMap[kpi.id]
        const direction =
          kpi.change > 0 ? "up" : kpi.change < 0 ? "down" : "neutral"
        return (
          <PageShellSummaryCard key={kpi.id} accent={kpi.accent}>
            <Icon />
            <div className="min-w-0 flex-1">
              <div className="font-semibold mb-1">{kpi.label}</div>
              <div className="text-2xl font-bold tabular-nums">{kpi.value}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <TrendIndicator
                  value={Math.abs(kpi.change)}
                  direction={direction}
                  positiveIsGood={kpi.positiveIsGood}
                />
                <span className="text-muted-foreground truncate">
                  {kpi.changeLabel}
                </span>
              </div>
            </div>
          </PageShellSummaryCard>
        )
      })}
    </>
  )
}
