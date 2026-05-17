import {
  headerKpis,
  monthlyAccuracy,
  errorHeatmap,
  productForecasts,
} from "@/lib/demand-forecast-vs-actual-mock-data"

export interface InsightItem {
  id: "accuracy-trend" | "worst-product" | "fill-vs-stockout"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Accuracy trend (MAPE this month vs 3-month avg)
  const latest = monthlyAccuracy[monthlyAccuracy.length - 1]
  const recent = monthlyAccuracy.slice(-4, -1)
  const recentAvgMape =
    recent.reduce((s, m) => s + m.mape, 0) / Math.max(recent.length, 1)
  const mapeDelta = latest.mape - recentAvgMape

  // 2. Worst-performing product by mean absolute error %
  const productErrors = productForecasts.map((series) => {
    const cells = errorHeatmap.filter((c) => c.productId === series.productId)
    const meanAbsErr =
      cells.reduce((s, c) => s + Math.abs(c.errorPct), 0) / Math.max(cells.length, 1)
    const meanBias = cells.reduce((s, c) => s + c.errorPct, 0) / Math.max(cells.length, 1)
    return { productName: series.productName, meanAbsErr, meanBias }
  })
  productErrors.sort((a, b) => b.meanAbsErr - a.meanAbsErr)
  const worst = productErrors[0]

  // 3. Fill rate vs stockout
  const fillKpi = headerKpis[2]
  const stockoutKpi = headerKpis[3]

  return [
    {
      id: "accuracy-trend",
      label: "Accuracy Trend",
      text:
        mapeDelta < -0.5
          ? `MAPE is ${latest.mape.toFixed(1)}%, improving by ${Math.abs(mapeDelta).toFixed(1)}pt vs the prior 3-month average. Forecast quality is trending up.`
          : mapeDelta <= 0.5
            ? `MAPE held steady at ${latest.mape.toFixed(1)}% (within ±0.5pt of the prior 3-month average). Accuracy is stable.`
            : `MAPE drifted up to ${latest.mape.toFixed(1)}%, ${mapeDelta.toFixed(1)}pt worse than the prior 3-month average. Inspect models and recent demand shocks.`,
      sentiment:
        mapeDelta < -0.5 ? "positive" : mapeDelta <= 0.5 ? "neutral" : "attention",
    },
    {
      id: "worst-product",
      label: "Worst Forecast Quality",
      text: `${worst.productName} averages ${worst.meanAbsErr.toFixed(1)}% absolute error per week with a ${worst.meanBias >= 0 ? "+" : ""}${worst.meanBias.toFixed(1)}% mean bias — prioritize re-tuning this SKU's model.`,
      sentiment: "attention",
    },
    {
      id: "fill-vs-stockout",
      label: "Service Level",
      text: `Fill rate at ${fillKpi.value} and stockout at ${stockoutKpi.value}. ${
        Number(stockoutKpi.value.replace(/[^\d.-]/g, "")) < 1
          ? "Both are within healthy bounds for the current plan."
          : "Stockout rate is above the 1% guardrail — review safety stock and lead-time buffers."
      }`,
      sentiment:
        Number(stockoutKpi.value.replace(/[^\d.-]/g, "")) < 1 ? "positive" : "attention",
    },
  ]
}
