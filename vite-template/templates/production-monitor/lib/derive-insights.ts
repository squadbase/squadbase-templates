import {
  headerKpis,
  lineOutputToday,
  defectRateTrend,
  planVsActualSeries,
} from "@/lib/production-monitor-mock-data"

export interface InsightItem {
  id: "attainment-snapshot" | "line-spotlight" | "defect-control"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Attainment snapshot — how the floor is tracking against plan today and over 7 days
  const attainmentKpi = headerKpis[1]
  const last7 = planVsActualSeries.slice(-7)
  const plannedSum7 = last7.reduce((s, d) => s + d.plannedQty, 0)
  const actualSum7 = last7.reduce((s, d) => s + d.actualQty, 0)
  const attain7 = (actualSum7 / plannedSum7) * 100

  // 2. Line spotlight — best and worst line by attainment today
  const sortedByAttain = [...lineOutputToday].sort(
    (a, b) => b.attainmentPct - a.attainmentPct,
  )
  const bestLine = sortedByAttain[0]
  const worstLine = sortedByAttain[sortedByAttain.length - 1]

  // 3. Defect control — any out-of-control points, trend direction
  const ooc = defectRateTrend.filter((p) => p.isOutOfControl)
  const recent7 = defectRateTrend.slice(-7).map((p) => p.defectRatePct)
  const prev7 = defectRateTrend.slice(-14, -7).map((p) => p.defectRatePct)
  const recent7Avg = recent7.reduce((s, v) => s + v, 0) / recent7.length
  const prev7Avg = prev7.reduce((s, v) => s + v, 0) / prev7.length
  const defectDelta = recent7Avg - prev7Avg
  const latest = defectRateTrend[defectRateTrend.length - 1]

  return [
    {
      id: "attainment-snapshot",
      label: "Plan Attainment",
      text: `Today's floor attainment is ${attainmentKpi.value}, with the trailing 7 days averaging ${attain7.toFixed(1)}% against plan. ${
        attain7 >= 98
          ? "The line is running at plan — keep an eye on changeover bottlenecks."
          : attain7 >= 92
            ? "Slightly behind plan; review staffing and material availability."
            : "Materially behind plan — escalate to shift leads for a recovery action."
      }`,
      sentiment:
        attain7 >= 98 ? "positive" : attain7 >= 92 ? "neutral" : "attention",
    },
    {
      id: "line-spotlight",
      label: "Line Spotlight",
      text: `${bestLine.lineName} leads at ${bestLine.attainmentPct.toFixed(1)}% of plan, while ${worstLine.lineName} trails at ${worstLine.attainmentPct.toFixed(1)}%. Investigate the gap — typical drivers are tooling, operator coverage, and upstream supply.`,
      sentiment: worstLine.attainmentPct < 85 ? "attention" : "neutral",
    },
    {
      id: "defect-control",
      label: "Defect Control",
      text: ooc.length > 0
        ? `${ooc.length} day(s) in the last 30 breached the control limits (UCL ${latest.ucl.toFixed(2)}% / LCL ${latest.lcl.toFixed(2)}%). The trailing 7 days are ${defectDelta >= 0 ? "+" : ""}${defectDelta.toFixed(2)} pp vs the prior week — root-cause review recommended.`
        : `Defect rate is in statistical control (UCL ${latest.ucl.toFixed(2)}% / LCL ${latest.lcl.toFixed(2)}%). The trailing 7 days are ${defectDelta >= 0 ? "+" : ""}${defectDelta.toFixed(2)} pp vs the prior week.`,
      sentiment:
        ooc.length > 0 ? "attention" : defectDelta <= 0 ? "positive" : "neutral",
    },
  ]
}
