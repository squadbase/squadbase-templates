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
  // 1. 精度トレンド (今月 MAPE vs 直近 3 ヶ月平均)
  const latest = monthlyAccuracy[monthlyAccuracy.length - 1]
  const recent = monthlyAccuracy.slice(-4, -1)
  const recentAvgMape =
    recent.reduce((s, m) => s + m.mape, 0) / Math.max(recent.length, 1)
  const mapeDelta = latest.mape - recentAvgMape

  // 2. 平均絶対誤差率がワーストの SKU
  const productErrors = productForecasts.map((series) => {
    const cells = errorHeatmap.filter((c) => c.productId === series.productId)
    const meanAbsErr =
      cells.reduce((s, c) => s + Math.abs(c.errorPct), 0) / Math.max(cells.length, 1)
    const meanBias = cells.reduce((s, c) => s + c.errorPct, 0) / Math.max(cells.length, 1)
    return { productName: series.productName, meanAbsErr, meanBias }
  })
  productErrors.sort((a, b) => b.meanAbsErr - a.meanAbsErr)
  const worst = productErrors[0]

  // 3. 充足率 vs 欠品率
  const fillKpi = headerKpis[2]
  const stockoutKpi = headerKpis[3]

  return [
    {
      id: "accuracy-trend",
      label: "精度トレンド",
      text:
        mapeDelta < -0.5
          ? `MAPE は ${latest.mape.toFixed(1)}%、直近 3 ヶ月平均より ${Math.abs(mapeDelta).toFixed(1)}pt 改善。予測品質は上向きです。`
          : mapeDelta <= 0.5
            ? `MAPE は ${latest.mape.toFixed(1)}% で安定 (直近 3 ヶ月平均との差は ±0.5pt 以内)。`
            : `MAPE が ${latest.mape.toFixed(1)}% まで悪化、直近 3 ヶ月平均より ${mapeDelta.toFixed(1)}pt 上昇。モデルと直近の需要変動要因を確認してください。`,
      sentiment:
        mapeDelta < -0.5 ? "positive" : mapeDelta <= 0.5 ? "neutral" : "attention",
    },
    {
      id: "worst-product",
      label: "予測精度ワースト",
      text: `${worst.productName} は週次平均絶対誤差 ${worst.meanAbsErr.toFixed(1)}%、バイアス ${worst.meanBias >= 0 ? "+" : ""}${worst.meanBias.toFixed(1)}%。この SKU のモデル再学習を優先してください。`,
      sentiment: "attention",
    },
    {
      id: "fill-vs-stockout",
      label: "サービスレベル",
      text: `在庫充足率 ${fillKpi.value}、欠品率 ${stockoutKpi.value}。${
        Number(stockoutKpi.value.replace(/[^\d.-]/g, "")) < 1
          ? "現行計画の許容範囲内です。"
          : "欠品率が 1% のガードレールを超過しています。安全在庫とリードタイムバッファを見直してください。"
      }`,
      sentiment:
        Number(stockoutKpi.value.replace(/[^\d.-]/g, "")) < 1 ? "positive" : "attention",
    },
  ]
}
