import {
  funnelStats,
  channelStats,
  ownerRanking,
} from "@/lib/lead-funnel-mock-data"

export interface InsightItem {
  id: "conversion" | "channel" | "owner"
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

  // ── Channel: highest/lowest CPL with material volume ──
  const sized = channelStats.filter((c) => c.leads >= 30)
  const cheapest = [...sized].sort((a, b) => a.cpl - b.cpl)[0]
  const priciest = [...sized].sort((a, b) => b.cpl - a.cpl)[0]

  // ── Owner: top performer ──
  const top = ownerRanking[0]
  const median = ownerRanking[Math.floor(ownerRanking.length / 2)]
  const gap =
    median && median.appointments > 0
      ? Math.round(((top.appointments - median.appointments) / median.appointments) * 100)
      : 0

  return [
    {
      id: "conversion",
      label: "Funnel Conversion",
      text: `End-to-end Lead → Opportunity converts at ${overall.toFixed(1)}%. The weakest step is "${weakest.stage}" at ${weakest.rate.toFixed(1)}% — concentrate enablement and content on that transition.`,
      sentiment:
        weakest.rate >= 55
          ? "positive"
          : weakest.rate >= 40
            ? "neutral"
            : "attention",
    },
    {
      id: "channel",
      label: "Channel Efficiency",
      text:
        cheapest && priciest
          ? `${cheapest.source} delivers leads at $${cheapest.cpl} CPL, while ${priciest.source} runs at $${priciest.cpl} (${Math.round((priciest.cpl / Math.max(cheapest.cpl, 1)) * 10) / 10}× higher). Re-weight budget toward efficient channels next cycle.`
          : "Not enough channel volume to evaluate CPL spread.",
      sentiment: "neutral",
    },
    {
      id: "owner",
      label: "Top IS Member",
      text: `${top.owner} leads the team with ${top.appointments} appointments (rate ${top.appointmentRate.toFixed(1)}%)${gap > 0 ? `, ${gap}% above the median` : ""}. Share their playbook in the next IS sync.`,
      sentiment: "positive",
    },
  ]
}
