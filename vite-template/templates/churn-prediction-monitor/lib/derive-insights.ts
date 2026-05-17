import {
  atRiskCustomers,
  churnRateTrend,
  frequencyDecline,
  headerKpis,
} from "@/lib/churn-prediction-monitor-mock-data"

export interface InsightItem {
  id: "critical-risk" | "frequency-signal" | "save-momentum"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Critical-risk concentration — how many top-tier and what value segment
  const critical = atRiskCustomers.filter((c) => c.risk_tier === "critical")
  const criticalEnterprise = critical.filter((c) => c.segment === "enterprise")
    .length

  // 2. Frequency signal — current-week decline for critical tier vs older weeks
  const criticalCells = frequencyDecline.filter(
    (c) => c.riskTier === "critical",
  )
  const currentWeek = criticalCells.find((c) => c.weeksAgoBucket === 0)
  const olderAvg =
    criticalCells
      .filter((c) => c.weeksAgoBucket >= 6)
      .reduce((s, c) => s + c.declinePct, 0) /
    Math.max(1, criticalCells.filter((c) => c.weeksAgoBucket >= 6).length)
  const accelDelta = currentWeek
    ? Math.abs(currentWeek.declinePct) - Math.abs(olderAvg)
    : 0

  // 3. Save-rate momentum (last 3 months vs prior 3 months)
  const recent3 = churnRateTrend.slice(-3)
  const prior3 = churnRateTrend.slice(-6, -3)
  const recentSave =
    recent3.reduce((s, p) => s + p.saveRate, 0) / recent3.length
  const priorSave =
    prior3.reduce((s, p) => s + p.saveRate, 0) / prior3.length
  const saveDelta = recentSave - priorSave
  const churnKpi = headerKpis[0]

  return [
    {
      id: "critical-risk",
      label: "Critical-Risk Concentration",
      text:
        critical.length === 0
          ? "No customers are in the critical-risk tier right now. Keep monitoring weekly frequency drops."
          : `${critical.length} customers sit in the critical-risk tier (${criticalEnterprise} enterprise). Prioritize CS outreach this week before they cross into churn.`,
      sentiment:
        critical.length === 0
          ? "positive"
          : criticalEnterprise > 0
            ? "attention"
            : "neutral",
    },
    {
      id: "frequency-signal",
      label: "Frequency Signal",
      text:
        accelDelta > 4
          ? `Critical-tier weekly order frequency is declining ${accelDelta.toFixed(1)}pt faster than 6+ weeks ago — churn pressure is accelerating.`
          : accelDelta < -2
            ? `Critical-tier frequency decline has eased by ${Math.abs(accelDelta).toFixed(1)}pt vs older weeks — recent saves may be holding.`
            : `Critical-tier weekly frequency is declining at roughly the same pace as recent weeks (${currentWeek?.declinePct.toFixed(1) ?? "0"}%). Watch for new entrants to the tier.`,
      sentiment:
        accelDelta > 4 ? "attention" : accelDelta < -2 ? "positive" : "neutral",
    },
    {
      id: "save-momentum",
      label: "Save Momentum",
      text: `Last 3 months avg save rate is ${recentSave.toFixed(1)}% (${saveDelta >= 0 ? "+" : ""}${saveDelta.toFixed(1)}pt vs prior 3 months). Monthly churn rate is now ${churnKpi.value}, ${churnKpi.change >= 0 ? "+" : ""}${churnKpi.change.toFixed(1)}% vs last month.`,
      sentiment:
        saveDelta >= 1.5 ? "positive" : saveDelta <= -1 ? "attention" : "neutral",
    },
  ]
}
