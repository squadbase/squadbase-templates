import { TrendingUp, PieChart, Activity } from "lucide-react"
import { PageShellSummaryCard } from "@/components/common/page-shell"
import { deriveInsights } from "@/lib/ui-template-kpi-chart-advanced-derive-insights"

const iconMap = {
  "growth-direction": TrendingUp,
  "channel-mix": PieChart,
  "campaign-lever": Activity,
} as const

const accentMap = {
  positive: "accent",
  neutral: "default",
  attention: "amber",
} as const

export function InsightCards() {
  const insights = deriveInsights()

  return (
    <>
      {insights.map((insight) => {
        const Icon = iconMap[insight.id]
        return (
          <PageShellSummaryCard
            key={insight.id}
            accent={accentMap[insight.sentiment]}
          >
            <Icon />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold">{insight.label}</p>
              <p className="text-xs text-muted-foreground">{insight.text}</p>
            </div>
          </PageShellSummaryCard>
        )
      })}
    </>
  )
}
