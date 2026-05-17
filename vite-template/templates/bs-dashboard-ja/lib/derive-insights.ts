import {
  bsStructure,
  ratioTrend,
  accountTrend,
} from "@/lib/bs-dashboard-mock-data"

export interface InsightItem {
  id: "capital-structure" | "liquidity-trend" | "cash-position"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 資本構造 — 自己資本比率 (最新月)
  const latestRatio = ratioTrend[ratioTrend.length - 1]
  const firstRatio = ratioTrend[0]
  const equityRatioDelta = latestRatio.equityRatio - firstRatio.equityRatio

  // 2. 流動性 — 流動比率トレンド
  const currentRatioDelta = latestRatio.currentRatio - firstRatio.currentRatio
  const currentRatio = latestRatio.currentRatio

  // 3. 現金ポジション
  const cashSeries = accountTrend.map((p) => p.cash)
  const cashLatest = cashSeries[cashSeries.length - 1]
  const cashStart = cashSeries[0]
  const cashGrowthPct = cashStart === 0 ? 0 : ((cashLatest - cashStart) / cashStart) * 100

  const totalAssetsOku = bsStructure.totalAssets / 100_000_000

  return [
    {
      id: "capital-structure",
      label: "資本構造",
      text:
        latestRatio.equityRatio >= 40
          ? `自己資本比率は ${latestRatio.equityRatio.toFixed(1)}% — 過去12ヶ月で ${equityRatioDelta >= 0 ? "+" : ""}${equityRatioDelta.toFixed(1)}pt 推移し、総資産 ¥${totalAssetsOku.toFixed(0)}億 に対して十分な自己資本バッファを確保しています。`
          : latestRatio.equityRatio >= 25
            ? `自己資本比率は ${latestRatio.equityRatio.toFixed(1)}% — 健全な水準 (12ヶ月で ${equityRatioDelta >= 0 ? "+" : ""}${equityRatioDelta.toFixed(1)}pt) ですが、有利子負債の増加に注視が必要です。`
            : `自己資本比率は ${latestRatio.equityRatio.toFixed(1)}% — レバレッジが高めです。借入金返済ペースと利益剰余金の積み増し方針を見直してください。`,
      sentiment:
        latestRatio.equityRatio >= 40
          ? "positive"
          : latestRatio.equityRatio >= 25
            ? "neutral"
            : "attention",
    },
    {
      id: "liquidity-trend",
      label: "流動性トレンド",
      text:
        currentRatio >= 150
          ? `流動比率は ${currentRatio.toFixed(0)}% (前年差 ${currentRatioDelta >= 0 ? "+" : ""}${currentRatioDelta.toFixed(1)}pt) — 短期負債を流動資産で十分カバーできています。`
          : currentRatio >= 100
            ? `流動比率は ${currentRatio.toFixed(0)}% (前年差 ${currentRatioDelta >= 0 ? "+" : ""}${currentRatioDelta.toFixed(1)}pt) — 短期負債は流動資産でカバーされていますが、バッファは薄めです。`
            : `流動比率は ${currentRatio.toFixed(0)}% — 短期流動性に余裕がありません。運転資金と短期借入金の借換え計画を見直してください。`,
      sentiment:
        currentRatio >= 150
          ? "positive"
          : currentRatio >= 100
            ? "neutral"
            : "attention",
    },
    {
      id: "cash-position",
      label: "現金ポジション",
      text: `現預金残高は ¥${(cashLatest / 100_000_000).toFixed(1)}億 (過去12ヶ月で ${cashGrowthPct >= 0 ? "+" : ""}${cashGrowthPct.toFixed(1)}%)。営業活動キャッシュアウトのランレートと併せて推移を監視してください。`,
      sentiment:
        cashGrowthPct >= 5
          ? "positive"
          : cashGrowthPct >= -5
            ? "neutral"
            : "attention",
    },
  ]
}
