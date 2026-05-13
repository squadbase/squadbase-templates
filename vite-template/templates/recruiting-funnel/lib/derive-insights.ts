import {
  funnelStats,
  sourceStats,
  leadTimeBins,
  candidates,
} from "@/lib/recruiting-funnel-mock-data"

export interface InsightItem {
  id: "conversion" | "source" | "leadtime"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // ── Conversion: find weakest stage step ──
  const transitions = funnelStats
    .slice(1)
    .map((s) => ({ stage: s.stage, rate: s.conversionFromPrev }))
  const weakest = [...transitions].sort((a, b) => a.rate - b.rate)[0]
  const overall =
    funnelStats[0].count === 0
      ? 0
      : (funnelStats[funnelStats.length - 1].count / funnelStats[0].count) *
        100

  // ── Source: efficiency leader / laggard among material-volume sources ──
  const sized = sourceStats.filter((s) => s.applications >= 25 && s.hires > 0)
  const cheapest = [...sized].sort((a, b) => a.costPerHire - b.costPerHire)[0]
  const priciest = [...sized].sort((a, b) => b.costPerHire - a.costPerHire)[0]

  // ── Lead time: median bin + share of >30d candidates ──
  const totalCount = leadTimeBins.reduce((s, b) => s + b.count, 0)
  const slowCount = leadTimeBins
    .filter((b) => b.min >= 31)
    .reduce((s, b) => s + b.count, 0)
  const slowShare =
    totalCount === 0 ? 0 : Math.round((slowCount / totalCount) * 1000) / 10
  const avgLeadTime =
    candidates.length === 0
      ? 0
      : Math.round(
          (candidates.reduce((s, c) => s + c.lead_time_days, 0) /
            candidates.length) *
            10,
        ) / 10

  return [
    {
      id: "conversion",
      label: "Funnel Health",
      text: `End-to-end Applied → Hired converts at ${overall.toFixed(2)}%. The weakest step is "${weakest.stage}" at ${weakest.rate.toFixed(1)}% — review screening criteria and interviewer calibration for that transition.`,
      sentiment:
        weakest.rate >= 55
          ? "positive"
          : weakest.rate >= 40
            ? "neutral"
            : "attention",
    },
    {
      id: "source",
      label: "Source Efficiency",
      text:
        cheapest && priciest
          ? `${cheapest.source} delivers hires at $${cheapest.costPerHire.toLocaleString("en-US")} per hire, while ${priciest.source} runs at $${priciest.costPerHire.toLocaleString("en-US")} (${Math.round((priciest.costPerHire / Math.max(cheapest.costPerHire, 1)) * 10) / 10}× higher). Re-balance sourcing budget toward efficient channels next cycle.`
          : "Not enough hire volume across sources to evaluate cost-per-hire spread.",
      sentiment: "neutral",
    },
    {
      id: "leadtime",
      label: "Screening Lead Time",
      text: `Average screening lead time is ${avgLeadTime} days. ${slowShare}% of candidates exceed the 30-day window — long lead times correlate with offer-drop risk, so prioritize unblocking stale stages.`,
      sentiment:
        slowShare <= 15 ? "positive" : slowShare <= 30 ? "neutral" : "attention",
    },
  ]
}
