import {
  conversionFunnel,
  deviceCvr,
  exitPages,
} from "@/lib/ec-conversion-funnel-mock-data"

export interface InsightItem {
  id: "weakest-step" | "device-gap" | "top-exit"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Weakest funnel step — biggest drop-off between consecutive stages.
  const stepDrops = conversionFunnel.slice(1).map((step, i) => {
    const prev = conversionFunnel[i]
    const conv = (step.value / prev.value) * 100
    return { from: prev.label, to: step.label, conv }
  })
  const weakest = [...stepDrops].sort((a, b) => a.conv - b.conv)[0]

  // 2. Device CVR gap — strongest vs weakest device.
  const sortedDevice = [...deviceCvr].sort((a, b) => b.overallCvr - a.overallCvr)
  const bestDevice = sortedDevice[0]
  const worstDevice = sortedDevice[sortedDevice.length - 1]
  const cvrGap = bestDevice.overallCvr - worstDevice.overallCvr
  const cvrGapPct =
    worstDevice.overallCvr > 0
      ? (cvrGap / worstDevice.overallCvr) * 100
      : 0

  // 3. Top exit page (highest exit rate).
  const topExit = exitPages[0]

  return [
    {
      id: "weakest-step",
      label: "Funnel Weak Point",
      text: `${weakest.from} → ${weakest.to} converts at ${weakest.conv.toFixed(1)}% — the lowest hand-off in the funnel. Investigate UX friction or product fit on this step.`,
      sentiment:
        weakest.conv >= 35
          ? "positive"
          : weakest.conv >= 20
            ? "neutral"
            : "attention",
    },
    {
      id: "device-gap",
      label: "Device CVR Gap",
      text: `${bestDevice.device} leads at ${bestDevice.overallCvr.toFixed(2)}% CVR vs ${worstDevice.device} at ${worstDevice.overallCvr.toFixed(2)}% — a ${cvrGapPct.toFixed(0)}% relative gap. Mobile and checkout layouts likely need attention.`,
      sentiment: cvrGapPct < 15 ? "positive" : cvrGapPct < 35 ? "neutral" : "attention",
    },
    {
      id: "top-exit",
      label: "Top Exit Page",
      text: `${topExit.pagePath} loses ${topExit.exitRate.toFixed(1)}% of sessions (${topExit.exits.toLocaleString("en-US")} exits). Prioritize testing on this page first.`,
      sentiment: topExit.exitRate >= 40 ? "attention" : topExit.exitRate >= 25 ? "neutral" : "positive",
    },
  ]
}
