import { TrendingUp, Lightbulb, Target } from "lucide-react"
import { PageShellSummaryCard } from "@/components/common/page-shell"
import { deriveInsights } from "@/lib/sales-revenue-derive-insights"

const iconMap = {
  momentum: TrendingUp,
  "category-opportunity": Lightbulb,
  "target-outlook": Target,
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
        const Icon = iconMap[insight.id as keyof typeof iconMap]
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
