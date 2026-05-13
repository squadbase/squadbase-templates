import {
  serviceMonthly,
  modelTokenCost,
  resourceTop,
} from "@/lib/ai-cloud-cost-analysis-mock-data"

export interface InsightItem {
  id: "spend-trajectory" | "ai-share" | "top-resource"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const current = serviceMonthly[serviceMonthly.length - 1]
  const prev = serviceMonthly[serviceMonthly.length - 2]
  const firstMonth = serviceMonthly[0]

  // 1. Overall spend trajectory (last 12 months → current month)
  const annualGrowthPct = ((current.total - firstMonth.total) / firstMonth.total) * 100
  const momPct =
    prev.total === 0 ? 0 : ((current.total - prev.total) / prev.total) * 100

  // 2. AI share of total spend and AI growth
  const aiCurrent =
    current.series.find((s) => s.service === "AI Inference (LLM API)")?.cost ?? 0
  const aiPrev =
    prev.series.find((s) => s.service === "AI Inference (LLM API)")?.cost ?? 0
  const aiShare = (aiCurrent / current.total) * 100
  const aiMoM =
    aiPrev === 0 ? 0 : ((aiCurrent - aiPrev) / aiPrev) * 100

  const topModel = modelTokenCost[0]
  const totalTokenCost = modelTokenCost.reduce((s, m) => s + m.totalCost, 0)
  const topModelShare = (topModel.totalCost / totalTokenCost) * 100

  // 3. Resource hot spot
  const topResource = resourceTop[0]
  const topResourceShare = (topResource.monthlyCost / current.total) * 100

  return [
    {
      id: "spend-trajectory",
      label: "Spend Trajectory",
      text:
        momPct > 8
          ? `Total cloud spend reached $${(current.total / 1_000).toFixed(1)}K this month — up ${momPct.toFixed(1)}% MoM and ${annualGrowthPct.toFixed(1)}% YTD. Investigate the top growth drivers before commitments compound.`
          : momPct >= -2
            ? `Total spend is $${(current.total / 1_000).toFixed(1)}K this month (${momPct >= 0 ? "+" : ""}${momPct.toFixed(1)}% MoM, ${annualGrowthPct >= 0 ? "+" : ""}${annualGrowthPct.toFixed(1)}% YTD) — broadly tracking the trend line.`
            : `Total spend dropped ${Math.abs(momPct).toFixed(1)}% MoM to $${(current.total / 1_000).toFixed(1)}K — verify the dip is not caused by data gaps or paused workloads.`,
      sentiment:
        momPct > 8 ? "attention" : momPct >= -2 ? "neutral" : "positive",
    },
    {
      id: "ai-share",
      label: "AI Cost Share",
      text: `AI inference accounts for ${aiShare.toFixed(1)}% of monthly spend (${aiMoM >= 0 ? "+" : ""}${aiMoM.toFixed(1)}% MoM). ${topModel.model} alone drives ${topModelShare.toFixed(1)}% of token cost — review routing rules and prompt caching to keep growth in check.`,
      sentiment: aiMoM > 12 ? "attention" : "neutral",
    },
    {
      id: "top-resource",
      label: "Top Resource Hot Spot",
      text: `${topResource.resourceName} (${topResource.service}) is the largest single resource at $${topResource.monthlyCost.toLocaleString("en-US")}/mo — about ${topResourceShare.toFixed(1)}% of total spend. ${topResource.changePct >= 5 ? `Up ${topResource.changePct.toFixed(1)}% MoM — confirm right-sizing, autoscaling, and reserved-capacity coverage.` : "Cost is stable, but the concentration warrants ownership and a quarterly review."}`,
      sentiment: topResource.changePct >= 10 ? "attention" : "neutral",
    },
  ]
}
