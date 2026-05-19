import {
  funnelStats,
  sourceStats,
  leadTimeBins,
  candidates,
  STAGE_LABEL_JA,
} from "@/lib/recruiting-funnel-mock-data"

export interface InsightItem {
  id: "conversion" | "source" | "leadtime"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // ── ファネル: 最も弱い段差を特定 ──
  const transitions = funnelStats
    .slice(1)
    .map((s) => ({ stage: s.stage, rate: s.conversionFromPrev }))
  const weakest = [...transitions].sort((a, b) => a.rate - b.rate)[0]
  const overall =
    funnelStats[0].count === 0
      ? 0
      : (funnelStats[funnelStats.length - 1].count / funnelStats[0].count) *
        100

  // ── 媒体: ボリュームのある媒体で最安/最高コスト ──
  const sized = sourceStats.filter((s) => s.applications >= 25 && s.hires > 0)
  const cheapest = [...sized].sort((a, b) => a.costPerHire - b.costPerHire)[0]
  const priciest = [...sized].sort((a, b) => b.costPerHire - a.costPerHire)[0]

  // ── リードタイム: 中央値ビン + 30日超の比率 ──
  const totalCount = leadTimeBins.reduce((s, b) => s + b.count, 0)
  const slowCount = leadTimeBins
    .filter((b) => b.min >= 31)
    .reduce((s, b) => s + b.count, 0)
  const slowShare =
    totalCount === 0 ? 0 : Math.round((slowCount / totalCount) * 1000) / 10
  const avgLeadTime =
    candidates.length === 0
      ? 0
      : Math.round(
          (candidates.reduce((s, c) => s + c.lead_time_days, 0) /
            candidates.length) *
            10,
        ) / 10

  return [
    {
      id: "conversion",
      label: "ファネル全体の通過率",
      text: `応募→入社までの通過率は${overall.toFixed(2)}%。最も弱い段差は「${STAGE_LABEL_JA[weakest.stage]}」で${weakest.rate.toFixed(1)}%。書類選考基準や面接官キャリブレーションをこの遷移に集中させましょう。`,
      sentiment:
        weakest.rate >= 55
          ? "positive"
          : weakest.rate >= 40
            ? "neutral"
            : "attention",
    },
    {
      id: "source",
      label: "媒体効率",
      text:
        cheapest && priciest
          ? `${cheapest.source}は採用単価¥${cheapest.costPerHire.toLocaleString("ja-JP")}と最も効率的。一方で${priciest.source}は¥${priciest.costPerHire.toLocaleString("ja-JP")} (${Math.round((priciest.costPerHire / Math.max(cheapest.costPerHire, 1)) * 10) / 10}倍)。次サイクルの媒体予算配分を効率媒体へ寄せましょう。`
          : "媒体ごとの採用実績が不足しており、採用単価の優劣評価には材料が足りません。",
      sentiment: "neutral",
    },
    {
      id: "leadtime",
      label: "選考リードタイム",
      text: `平均選考リードタイムは${avgLeadTime}日。30日を超える候補者の比率は${slowShare}%。長期化は内定辞退リスクと相関するため、停滞しているステージの解消を優先しましょう。`,
      sentiment:
        slowShare <= 15 ? "positive" : slowShare <= 30 ? "neutral" : "attention",
    },
  ]
}
