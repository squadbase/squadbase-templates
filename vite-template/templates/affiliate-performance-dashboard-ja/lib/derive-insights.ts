import {
  mediaSummaries,
  monthlyCvTrend,
} from "@/lib/affiliate-performance-dashboard-mock-data"

export interface InsightItem {
  id: "roas-leader" | "new-media-momentum" | "cpa-efficiency"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. ROAS リーダー — 一定 CV 規模を持つ媒体の中で ROAS トップ
  const meaningful = mediaSummaries.filter((m) => m.conversions >= 30)
  const sortedByRoas = [...meaningful].sort((a, b) => b.roas - a.roas)
  const leader = sortedByRoas[0]
  const totalSpend = mediaSummaries.reduce((s, m) => s + m.spend, 0)
  const totalRevenue = mediaSummaries.reduce((s, m) => s + m.revenue, 0)
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const leaderLift = blendedRoas > 0
    ? ((leader.roas - blendedRoas) / blendedRoas) * 100
    : 0

  // 2. 新規メディア寄与 — 直近 3 ヶ月の新規 CV シェア
  const last3 = monthlyCvTrend.slice(-3)
  const last3Total = last3.reduce((s, m) => s + m.conversions, 0)
  const last3New = last3.reduce((s, m) => s + m.newMediaConversions, 0)
  const newShare = last3Total > 0 ? (last3New / last3Total) * 100 : 0
  const newMediaCount = mediaSummaries.filter((m) => m.isNew).length

  // 3. CPA 効率 — 高支出かつ CPA が高い「コストドラッグ」媒体群
  const totalCv = mediaSummaries.reduce((s, m) => s + m.conversions, 0)
  const blendedCpa = totalCv > 0 ? totalSpend / totalCv : 0
  const drag = mediaSummaries
    .filter((m) => m.cpa > blendedCpa * 1.25 && m.spend > totalSpend * 0.05)
    .sort((a, b) => b.spend - a.spend)
  const dragSpend = drag.reduce((s, m) => s + m.spend, 0)
  const dragShare = totalSpend > 0 ? (dragSpend / totalSpend) * 100 : 0

  return [
    {
      id: "roas-leader",
      label: "ROASリーダー",
      text:
        leader && leaderLift > 0
          ? `${leader.mediaName} (${leader.asp}) が ROAS ${leader.roas.toFixed(2)}倍 でトップ — ブレンド ${blendedRoas.toFixed(2)}倍 を ${leaderLift.toFixed(1)}% 上回る。低ROAS媒体から予算をスライドして拡大余地を検討したい。`
          : leader
            ? `${leader.mediaName} (${leader.asp}) が ROAS ${leader.roas.toFixed(2)}倍 でトップ。ブレンド ${blendedRoas.toFixed(2)}倍 とほぼ同水準。`
            : `今期間は ROAS 比較の最低 CV 基準を満たす媒体がない。`,
      sentiment: leaderLift > 10 ? "positive" : "neutral",
    },
    {
      id: "new-media-momentum",
      label: "新規メディア寄与",
      text:
        newShare >= 12
          ? `新規 ${newMediaCount} 媒体が直近3ヶ月 CV の ${newShare.toFixed(1)}% を占める。分散化の仮説が機能しているため、選別しつつオンボーディングを継続したい。`
          : newShare >= 4
            ? `新規 ${newMediaCount} 媒体が直近 CV の ${newShare.toFixed(1)}% に到達。想定通りのランプだが、依然として既存提携先に集中している。`
            : `新規媒体の寄与は直近 CV の ${newShare.toFixed(1)}% に留まる。オンボーディングペースとパイプラインを見直したい。`,
      sentiment:
        newShare >= 12 ? "positive" : newShare >= 4 ? "neutral" : "attention",
    },
    {
      id: "cpa-efficiency",
      label: "CPA効率",
      text:
        drag.length === 0
          ? `ブレンド CPA ¥${Math.round(blendedCpa).toLocaleString("ja-JP")} の 1.25 倍を超える高支出媒体はなし。支出効率は良好に分散している。`
          : `${drag.length} 媒体 (総支出の ${dragShare.toFixed(1)}%) がブレンド CPA ¥${Math.round(blendedCpa).toLocaleString("ja-JP")} の 1.25 倍を上回って稼働。${drag[0].mediaName} の上限を引き締めれば、ROAS リーダーへの再配分余地が生まれる。`,
      sentiment:
        drag.length === 0 ? "positive" : dragShare > 20 ? "attention" : "neutral",
    },
  ]
}
