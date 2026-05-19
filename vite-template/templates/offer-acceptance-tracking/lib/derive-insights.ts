import {
  candidates,
  declineReasons,
  declineReasonLabels,
  followUpList,
  headerKpis,
} from "@/lib/offer-acceptance-tracking-mock-data"

export interface InsightItem {
  id: "accept-momentum" | "decline-driver" | "follow-up-urgency"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Accept momentum
  const acceptRateKpi = headerKpis[1]
  const acceptRateValue = parseFloat(acceptRateKpi.value)

  // 2. Decline driver — top reason and its share
  const topReason = declineReasons[0]
  const totalDeclines = candidates.filter((c) => c.status === "declined").length
  const topShare = topReason?.share ?? 0

  // 3. Follow-up urgency — count of high-priority follow-ups
  const highCount = followUpList.filter((r) => r.priority === "high").length
  const totalOpen = followUpList.length

  return [
    {
      id: "accept-momentum",
      label: "Acceptance Momentum",
      text:
        acceptRateValue >= 75
          ? `Acceptance is running at ${acceptRateValue.toFixed(1)}% — well above a healthy 70% benchmark. Keep current offer playbook in place.`
          : acceptRateValue >= 60
            ? `Acceptance is at ${acceptRateValue.toFixed(1)}%. Sustaining this through peak season will keep new-grad hiring on plan.`
            : `Acceptance has slipped to ${acceptRateValue.toFixed(1)}%. Review offer terms and time-to-decision against last cycle before more offers go out.`,
      sentiment:
        acceptRateValue >= 75
          ? "positive"
          : acceptRateValue >= 60
            ? "neutral"
            : "attention",
    },
    {
      id: "decline-driver",
      label: "Top Decline Driver",
      text: topReason
        ? `${declineReasonLabels[topReason.reason]} accounts for ${topShare.toFixed(1)}% of the ${totalDeclines} declines this period. Brief hiring managers on counter-narratives before the next round of offers.`
        : "No declines recorded this period — strong outcome to celebrate with the team.",
      sentiment: topShare >= 35 ? "attention" : topShare === 0 ? "positive" : "neutral",
    },
    {
      id: "follow-up-urgency",
      label: "Follow-up Urgency",
      text:
        highCount === 0
          ? `${totalOpen} candidates are in progress with no high-priority cases — keep cadence steady.`
          : `${highCount} of ${totalOpen} open candidates are nearing their decision deadline. Personalize outreach in the next 48 hours.`,
      sentiment: highCount >= 5 ? "attention" : highCount === 0 ? "positive" : "neutral",
    },
  ]
}
