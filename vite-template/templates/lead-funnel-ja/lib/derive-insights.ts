import {
  funnelStats,
  channelStats,
  ownerRanking,
  STAGE_LABEL_JA,
} from "@/lib/lead-funnel-mock-data"

export interface InsightItem {
  id: "conversion" | "channel" | "owner"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // ── ファネル: 最も弱いステップを特定 ──
  const transitions = funnelStats
    .slice(1)
    .map((s) => ({ stage: s.stage, rate: s.conversionFromPrev }))
  const weakest = [...transitions].sort((a, b) => a.rate - b.rate)[0]
  const overall =
    funnelStats[0].count === 0
      ? 0
      : (funnelStats[funnelStats.length - 1].count / funnelStats[0].count) *
        100

  // ── チャネル: ボリュームのあるチャネルで最安/最高CPL ──
  const sized = channelStats.filter((c) => c.leads >= 30)
  const cheapest = [...sized].sort((a, b) => a.cpl - b.cpl)[0]
  const priciest = [...sized].sort((a, b) => b.cpl - a.cpl)[0]

  // ── 担当者: トップ ──
  const top = ownerRanking[0]
  const median = ownerRanking[Math.floor(ownerRanking.length / 2)]
  const gap =
    median && median.appointments > 0
      ? Math.round(
          ((top.appointments - median.appointments) / median.appointments) *
            100,
        )
      : 0

  return [
    {
      id: "conversion",
      label: "ファネル全体の通過率",
      text: `リード→商談化までの通過率は${overall.toFixed(1)}%。最も弱い段差は「${STAGE_LABEL_JA[weakest.stage]}」で${weakest.rate.toFixed(1)}%。この遷移に向けたコンテンツ・トークン整備を優先しましょう。`,
      sentiment:
        weakest.rate >= 55
          ? "positive"
          : weakest.rate >= 40
            ? "neutral"
            : "attention",
    },
    {
      id: "channel",
      label: "チャネル効率",
      text:
        cheapest && priciest
          ? `${cheapest.source}はCPL ¥${cheapest.cpl.toLocaleString("ja-JP")}と最も効率的。一方で${priciest.source}は¥${priciest.cpl.toLocaleString("ja-JP")} (${Math.round((priciest.cpl / Math.max(cheapest.cpl, 1)) * 10) / 10}倍)。次サイクルの予算配分を効率チャネルへ寄せましょう。`
          : "チャネル別のリード数が不足しており、CPLの優劣評価には材料が足りません。",
      sentiment: "neutral",
    },
    {
      id: "owner",
      label: "トップIS担当",
      text: `${top.owner}がチームトップで${top.appointments}件のアポを獲得（獲得率${top.appointmentRate.toFixed(1)}%）${gap > 0 ? `、中央値より${gap}%上回り` : ""}。次のIS定例で進め方を共有しましょう。`,
      sentiment: "positive",
    },
  ]
}
