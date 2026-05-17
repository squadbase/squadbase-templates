import {
  funnel,
  conversionTrend,
  lossReasons,
} from "@/lib/quote-to-order-conversion-mock-data"

export interface InsightItem {
  id: "conversion-trend" | "weakest-step" | "loss-driver"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const recent3 =
    conversionTrend.slice(-3).reduce((s, p) => s + p.conversionPct, 0) / 3
  const prior3 =
    conversionTrend.slice(-6, -3).reduce((s, p) => s + p.conversionPct, 0) / 3
  const delta = recent3 - prior3

  const weakest = [...funnel.slice(1)].sort(
    (a, b) => a.conversionFromPrev - b.conversionFromPrev,
  )[0]

  const topLoss = lossReasons[0]
  const lossTotal = lossReasons.reduce((s, r) => s + r.amount, 0)

  return [
    {
      id: "conversion-trend",
      label: "Conversion Trend",
      text: `Trailing 3-month conversion averages ${recent3.toFixed(1)}% (${delta >= 0 ? "+" : ""}${delta.toFixed(1)}pp vs prior 3 months). ${delta >= 1 ? "Momentum building." : delta <= -1 ? "Conversion is slipping — focus on sales motions." : "Conversion is stable."}`,
      sentiment: delta >= 1 ? "positive" : delta <= -1 ? "attention" : "neutral",
    },
    {
      id: "weakest-step",
      label: "Weakest Funnel Step",
      text: `The biggest drop is into "${weakest.step}" at ${weakest.conversionFromPrev.toFixed(1)}% from the prior stage. Investigate why prospects stall at this step.`,
      sentiment: "neutral",
    },
    {
      id: "loss-driver",
      label: "Primary Loss Driver",
      text: `"${topLoss.reason}" drives ${topLoss.share.toFixed(1)}% of losses ($${Math.round(topLoss.amount / 1000)}K of the $${Math.round(lossTotal / 1000)}K lost pipeline). ${topLoss.reason === "Price" ? "Consider pricing flexibility or value-positioning training." : "Run a focused win/loss review on this reason."}`,
      sentiment: topLoss.share > 30 ? "attention" : "neutral",
    },
  ]
}
