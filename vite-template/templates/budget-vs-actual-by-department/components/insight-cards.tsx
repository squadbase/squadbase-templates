import { TrendingUp, AlertCircle, GaugeCircle } from "lucide-react"
import { PageShellSummaryCard } from "@/components/common/page-shell"
import { deriveInsights } from "@/lib/budget-vs-actual-by-department-derive-insights"

const iconMap = {
  "over-budget": TrendingUp,
  "under-budget": AlertCircle,
  pace: GaugeCircle,
} as const

const accentMap = {
  positive: "accent",
  neutral: "default",
  attention: "amber",
} as const

const titleClassMap = {
  positive: "text-chart-1",
  neutral: "",
  attention: "text-amber-700",
}

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
            <div className="min-w-0 flex-1">
              <div
                className={`font-semibold mb-1 ${titleClassMap[insight.sentiment]}`}
              >
                {insight.label}
              </div>
              <p className="mt-1 text-sm leading-relaxed">{insight.text}</p>
            </div>
          </PageShellSummaryCard>
        )
      })}
    </>
  )
}
