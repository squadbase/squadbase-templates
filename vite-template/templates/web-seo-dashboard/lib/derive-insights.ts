import {
  trafficKpis,
  seoKpis,
  keywordRankings,
  channelBreakdown,
  categoryPerformance,
} from "@/lib/web-seo-mock-data"

export interface InsightItem {
  id: string
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. SEO上昇トレンド: rankChange 最大のキーワード
  const bestRising = [...keywordRankings]
    .filter((kw) => kw.rankChange > 0)
    .sort((a, b) => b.rankChange - a.rankChange)[0]

  // 2. チャネル × コンテンツ機会: 自然検索シェア × CVR最高カテゴリ
  const dominantChannel = channelBreakdown[0]
  const topCvrCat = [...categoryPerformance].sort(
    (a, b) => b.conversionRate - a.conversionRate,
  )[0]
  const lowestPvCat = [...categoryPerformance].sort(
    (a, b) => a.pageviews - b.pageviews,
  )[0]

  // 3. 今月のパフォーマンス概況: PV変化率 + 直帰率変化 + 掲載順位変化
  const pvKpi = trafficKpis[0]
  const bounceKpi = trafficKpis[3]
  const posKpi = seoKpis[3]

  return [
    {
      id: "seo-rising",
      label: "SEO上昇トレンド",
      text: `「${bestRising.keyword}」が${bestRising.rankChange}位上昇（現在${bestRising.rank}位）。検索ボリューム${bestRising.searchVolume.toLocaleString()}の注目キーワードです`,
      sentiment: "positive",
    },
    {
      id: "channel-opportunity",
      label: "チャネル × コンテンツ機会",
      text: `${dominantChannel.channel}が全セッションの${dominantChannel.percentage}%を占める一方、CVR最高の「${topCvrCat.category}」(${topCvrCat.conversionRate}%)はPVが${topCvrCat.category === lowestPvCat.category ? "最下位" : "低水準"}。SEO注力カテゴリの見直しを検討`,
      sentiment: "attention",
    },
    {
      id: "momentum",
      label: "今月のパフォーマンス概況",
      text: `PV前月比${pvKpi.change > 0 ? "+" : ""}${pvKpi.change}%、直帰率${bounceKpi.change > 0 ? "+" : ""}${bounceKpi.change}pt、平均掲載順位${posKpi.change > 0 ? "+" : ""}${posKpi.change}位改善。全体的に好調な推移です`,
      sentiment: "positive",
    },
  ]
}
