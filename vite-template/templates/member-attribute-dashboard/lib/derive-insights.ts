import {
  ageGenderCrosstab,
  attributeLtvRanking,
  acquisitionChannels,
} from "@/lib/member-attribute-dashboard-mock-data"

export interface InsightItem {
  id: "top-segment" | "ltv-leader" | "channel-mix"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Largest segment by member share
  const sortedByShare = [...ageGenderCrosstab].sort((a, b) => b.share - a.share)
  const topShare = sortedByShare[0]

  // 2. Highest-LTV segment (already sorted desc in the ranking)
  const topLtv = attributeLtvRanking[0]
  const totalMembers = ageGenderCrosstab.reduce(
    (s, c) => s + c.memberCount,
    0,
  )
  const weightedLtv =
    ageGenderCrosstab.reduce((s, c) => s + c.avgLtv * c.memberCount, 0) /
    totalMembers
  const ltvLift = ((topLtv.avgLtv - weightedLtv) / weightedLtv) * 100

  // 3. Channel mix — top acquisition channel and how lopsided the mix is
  const sortedChannels = [...acquisitionChannels].sort(
    (a, b) => b.newMembers - a.newMembers,
  )
  const topChannel = sortedChannels[0]
  const totalNew = sortedChannels.reduce((s, c) => s + c.newMembers, 0)
  const topChannelShare = (topChannel.newMembers / totalNew) * 100
  // Highest-LTV channel — quality, not just volume
  const topQualityChannel = [...acquisitionChannels].sort(
    (a, b) => b.avgLtv - a.avgLtv,
  )[0]

  return [
    {
      id: "top-segment",
      label: "Largest Segment",
      text: `${topShare.ageBand} ${topShare.gender === "female" ? "Female" : topShare.gender === "male" ? "Male" : "Other"} make up ${topShare.share.toFixed(1)}% of the base (${topShare.memberCount.toLocaleString("en-US")} members) — the highest share across all age x gender segments.`,
      sentiment: "neutral",
    },
    {
      id: "ltv-leader",
      label: "LTV Leader",
      text: `${topLtv.segment} leads with an average LTV of $${topLtv.avgLtv.toLocaleString("en-US")} — ${ltvLift > 0 ? "+" : ""}${ltvLift.toFixed(1)}% above the weighted base average. Prioritise retention and upsell for this segment.`,
      sentiment: ltvLift > 10 ? "positive" : "neutral",
    },
    {
      id: "channel-mix",
      label: "Acquisition Mix",
      text: `${topChannel.channelLabel} drives ${topChannelShare.toFixed(1)}% of new members this period, while ${topQualityChannel.channelLabel} brings the highest-quality joiners at $${topQualityChannel.avgLtv.toLocaleString("en-US")} LTV. Consider reweighting spend toward channels with stronger LTV.`,
      sentiment: topChannelShare > 45 ? "attention" : "neutral",
    },
  ]
}
