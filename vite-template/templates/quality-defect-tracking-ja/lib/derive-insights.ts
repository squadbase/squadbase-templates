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
  // 1. パレート集中度：累積80%をカバーする要因数
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

  // 2. ライン×要因ホットスポット：最も件数が多い (ライン, 要因) セル
  const hotspot = lineCauseHeatmap.reduce(
    (best, c) => (c.qty > best.qty ? c : best),
    lineCauseHeatmap[0] ?? { line: "—", cause: "—", qty: 0 },
  )
  const hotspotShare =
    grandTotal === 0 ? 0 : (hotspot.qty / grandTotal) * 100

  // 3. プロセス安定性：当月 vs 管理限界線
  const latest = monthlyTrend[monthlyTrend.length - 1]
  const breach = latest && latest.qty > latest.ucl
  const tight = latest && latest.qty <= latest.mean

  return [
    {
      id: "pareto-focus",
      label: "パレート集中度",
      text: `当月の不良の約80%は ${coverCount} 要因に集中しています。首位の「${topCause?.cause ?? "—"}」だけで全体の ${topShare.toFixed(1)}% を占めるため、最初の対策はここに絞り込みましょう。`,
      sentiment: coverCount <= 3 ? "attention" : "neutral",
    },
    {
      id: "line-hotspot",
      label: "ライン別ホットスポット",
      text: `当月最も件数が多いのは ${hotspot.line} の「${hotspot.cause}」(${hotspot.qty}件、全体の ${hotspotShare.toFixed(1)}%)。当該工程の設備校正と作業者間の引継ぎを優先確認してください。`,
      sentiment: "neutral",
    },
    {
      id: "trend-stability",
      label: "工程安定性",
      text: breach
        ? `当月の不良件数 (${latest.qty}件) は 3σ 上方管理限界 (${latest.ucl}) を超えており、工程は管理外れの状態です。即時に根本原因レビューを実施してください。`
        : tight
          ? `当月の不良件数 (${latest.qty}件) は長期平均 (${latest.mean}) 以下で ±3σ の範囲内に収まっています。工程は安定しています。`
          : `当月の不良件数 (${latest.qty}件) は平均 (${latest.mean}) を上回るものの、上方管理限界 (${latest.ucl}) の内側にあります。来月の値を継続監視してください。`,
      sentiment: breach ? "attention" : tight ? "positive" : "neutral",
    },
  ]
}
