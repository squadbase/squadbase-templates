import {
  salesKpis,
  categoryRanking,
  channelBreakdown,
  dailySalesTrend,
} from "@/lib/sales-revenue-mock-data"

export interface InsightItem {
  id: string
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. 前年比モメンタム: GMV の前年同期比
  const gmvKpi = salesKpis[0]

  // 2. カテゴリ機会: 売上シェア低いが YoY 伸長率の高いカテゴリ
  const growthOpportunity = [...categoryRanking]
    .filter((c) => c.shareOfTotal < 20 && c.yoyChange > 15)
    .sort((a, b) => b.yoyChange - a.yoyChange)[0]

  // 3. 目標達成見通し: 直近30日実績合計 vs 目標合計
  const recent = dailySalesTrend.slice(-30)
  const actual = recent.reduce((s, d) => s + d.revenue, 0)
  const target = recent.reduce((s, d) => s + d.target, 0)
  const achievement = (actual / target) * 100
  const dominantChannel = channelBreakdown[0]

  return [
    {
      id: "momentum",
      label: "前年比モメンタム",
      text: `GMV は前年同期比 ${gmvKpi.change > 0 ? "+" : ""}${gmvKpi.change}%。${gmvKpi.change > 10 ? "好調な成長基調を維持しています" : gmvKpi.change > 0 ? "緩やかな成長を継続中です" : "前年を下回る水準、施策の見直しを検討"}`,
      sentiment:
        gmvKpi.change > 10
          ? "positive"
          : gmvKpi.change > 0
            ? "neutral"
            : "attention",
    },
    {
      id: "category-opportunity",
      label: "カテゴリ成長機会",
      text: growthOpportunity
        ? `「${growthOpportunity.category}」が前年比 +${growthOpportunity.yoyChange}% で伸長中。売上シェアは${growthOpportunity.shareOfTotal}%に留まり、広告・在庫投資の余地があります`
        : "主要カテゴリの成長率は均衡しており、大きな機会は検出されませんでした",
      sentiment: growthOpportunity ? "positive" : "neutral",
    },
    {
      id: "target-outlook",
      label: "目標達成見通し",
      text: `直近30日は目標 ${achievement.toFixed(1)}% を${achievement >= 100 ? "達成" : "未達"}。流入の${dominantChannel.percentage}%を占める${dominantChannel.channel}が全体を牽引しており、${achievement >= 100 ? "この推移が続けば月次目標クリア見込み" : "強化チャネルの選定が必要"}`,
      sentiment:
        achievement >= 100
          ? "positive"
          : achievement >= 90
            ? "neutral"
            : "attention",
    },
  ]
}
