import {
  customerRanking,
  paretoSeries,
  churnCandidates,
  headerKpis,
} from "@/lib/customer-sales-dashboard-mock-data"

export interface InsightItem {
  id: "concentration" | "yoy-momentum" | "churn-watch"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 売上集中度 — A 区分が売上全体に占める比率
  const totalRevenue = customerRanking.reduce(
    (s, r) => s + r.currentRevenue,
    0,
  )
  const aClassCount = paretoSeries.filter((p) => p.abcClass === "A").length
  const aSharePct =
    (paretoSeries
      .filter((p) => p.abcClass === "A")
      .reduce((s, p) => s + p.revenue, 0) /
      totalRevenue) *
    100
  const aSharePctOfBase = (aClassCount / customerRanking.length) * 100

  // 2. 前年比モメンタム
  const yoyKpi = headerKpis[1]
  const decliners = customerRanking.filter((r) => r.yoyChange < -10).length

  // 3. 離反ウォッチ — 前年売上が最大の離反候補
  const top = [...churnCandidates].sort(
    (a, b) => b.prevYearRevenue - a.prevYearRevenue,
  )[0]
  const churnExposure = churnCandidates.reduce(
    (s, c) => s + c.prevYearRevenue,
    0,
  )

  return [
    {
      id: "concentration",
      label: "売上集中度",
      text: `上位 ${aClassCount} 社 (全体の ${aSharePctOfBase.toFixed(0)}%) が売上の ${aSharePct.toFixed(1)}% を担っており、A 区分は名指しでの担当割り当てと先回りの契約更新で守りたい。`,
      sentiment: aSharePct > 75 ? "attention" : "neutral",
    },
    {
      id: "yoy-momentum",
      label: "前年比モメンタム",
      text:
        yoyKpi.change > 3
          ? `得意先全体は前年比 ${yoyKpi.change >= 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}%。一方で ${decliners} 社は前年比 -10% を下回っており、差が広がる前に QBR を組みたい。`
          : yoyKpi.change >= -3
            ? `得意先全体は前年比 ${yoyKpi.change >= 0 ? "+" : ""}${yoyKpi.change.toFixed(1)}% で概ね横ばい。前年比 -10% 超の ${decliners} 社が平均を押し下げている可能性。`
            : `得意先全体は前年比 ${yoyKpi.change.toFixed(1)}% と下振れ、${decliners} 社が -10% 超で推移。最も影響の大きい先から今週中に再アプローチしたい。`,
      sentiment:
        yoyKpi.change > 3
          ? "positive"
          : yoyKpi.change >= -3
            ? "neutral"
            : "attention",
    },
    {
      id: "churn-watch",
      label: "離反ウォッチ",
      text: top
        ? `45 日以上発注のない ${churnCandidates.length} 社で、前年売上ベースで ¥${Math.round(churnExposure / 10_000).toLocaleString("ja-JP")}万 のリスクを抱える。最大級は ${top.customerName} (最終発注 ${top.daysSinceLastOrder} 日前)。`
        : `現時点で離反フラグの該当先はなし。週次で継続モニタリングしたい。`,
      sentiment: churnCandidates.length > 4 ? "attention" : "neutral",
    },
  ]
}
