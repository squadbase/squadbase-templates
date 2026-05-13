import {
  defectPareto,
  lineCauseHeatmap,
  monthlyTrend,
} from "@/lib/quality-defect-tracking-mock-data"

export interface InsightItem {
  id: "pareto-focus" | "line-hotspot" | "trend-stability"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Pareto focus — how many causes cover 80% of defects
  const grandTotal = defectPareto.reduce((s, p) => s + p.qty, 0)
  let coverCount = 0
  for (const p of defectPareto) {
    coverCount += 1
    if (p.cumulativeShare >= 80) break
  }
  const topCause = defectPareto[0]
  const topShare = topCause && grandTotal > 0
    ? (topCause.qty / grandTotal) * 100
    : 0

  // 2. Line × cause hotspot — single (line, cause) cell that stands out
  const hotspot = lineCauseHeatmap.reduce(
    (best, c) => (c.qty > best.qty ? c : best),
    lineCauseHeatmap[0] ?? { line: "—", cause: "—", qty: 0 },
  )
  const hotspotShare =
    grandTotal === 0 ? 0 : (hotspot.qty / grandTotal) * 100

  // 3. Trend stability — current vs control limits
  const latest = monthlyTrend[monthlyTrend.length - 1]
  const breach = latest && latest.qty > latest.ucl
  const tight = latest && latest.qty <= latest.mean

  return [
    {
      id: "pareto-focus",
      label: "Pareto Focus",
      text: `${coverCount} causes account for ~80% of this month's defects. The top contributor "${topCause?.cause ?? "—"}" alone drives ${topShare.toFixed(1)}% — concentrate countermeasures there first.`,
      sentiment: coverCount <= 3 ? "attention" : "neutral",
    },
    {
      id: "line-hotspot",
      label: "Line Hotspot",
      text: `${hotspot.line} produces the highest "${hotspot.cause}" defect volume this month (${hotspot.qty} units, ${hotspotShare.toFixed(1)}% of total). Investigate equipment calibration and operator handoff at this station.`,
      sentiment: "neutral",
    },
    {
      id: "trend-stability",
      label: "Process Stability",
      text: breach
        ? `Latest month (${latest.qty} defects) breaches the 3σ upper control limit (${latest.ucl}). The process is out of control — trigger a root-cause review.`
        : tight
          ? `Latest month (${latest.qty}) sits at or below the long-run mean (${latest.mean}) and well within ±3σ. Process is in control.`
          : `Latest month (${latest.qty}) is above the mean (${latest.mean}) but inside the upper control limit (${latest.ucl}). Monitor next month before escalating.`,
      sentiment: breach ? "attention" : tight ? "positive" : "neutral",
    },
  ]
}
