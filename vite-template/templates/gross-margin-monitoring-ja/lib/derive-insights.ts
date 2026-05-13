import {
  marginTrend,
  categoryRanking,
  productScatter,
} from "@/lib/gross-margin-monitoring-mock-data"

export interface InsightItem {
  id: "margin-trajectory" | "category-leader" | "product-tail"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const trailing = marginTrend.slice(-6)
  const firstM = trailing[0].marginPct
  const lastM = trailing[trailing.length - 1].marginPct
  const slope = lastM - firstM
  const latest = marginTrend[marginTrend.length - 1]
  const prev = marginTrend[marginTrend.length - 2]
  const mom = latest.marginPct - prev.marginPct

  const sortedByMargin = [...categoryRanking].sort((a, b) => b.marginPct - a.marginPct)
  const leader = sortedByMargin[0]
  const laggard = sortedByMargin[sortedByMargin.length - 1]

  const lowMarginCount = productScatter.filter((p) => p.marginPct < 15).length
  const totalProducts = productScatter.length
  const lowMarginShare = (lowMarginCount / totalProducts) * 100
  const lowMarginRevenue = productScatter
    .filter((p) => p.marginPct < 15)
    .reduce((s, p) => s + p.revenue, 0)
  const totalRevenue = productScatter.reduce((s, p) => s + p.revenue, 0)
  const lowMarginRevenueShare = (lowMarginRevenue / totalRevenue) * 100

  return [
    {
      id: "margin-trajectory",
      label: "粗利率の方向感",
      text:
        slope >= 0.5
          ? `粗利率は直近6ヶ月で +${slope.toFixed(1)}pp 改善し ${lastM.toFixed(1)}% に到達。直近月は ${mom >= 0 ? "+" : ""}${mom.toFixed(1)}pp。`
          : slope >= -0.5
            ? `粗利率は ${lastM.toFixed(1)}% で横ばい (6ヶ月 ${slope >= 0 ? "+" : ""}${slope.toFixed(1)}pp)。仕入れコストの変動に注意。`
            : `粗利率は直近6ヶ月で ${Math.abs(slope).toFixed(1)}pp 低下し ${lastM.toFixed(1)}%。原価率の高いカテゴリのコスト構造を要確認。`,
      sentiment:
        slope >= 0.5 ? "positive" : slope >= -0.5 ? "neutral" : "attention",
    },
    {
      id: "category-leader",
      label: "カテゴリ別リーダーと劣位",
      text: `「${leader.category}」が粗利率 ${leader.marginPct.toFixed(1)}% で首位、「${laggard.category}」が ${laggard.marginPct.toFixed(1)}% で劣位 (差 ${(leader.marginPct - laggard.marginPct).toFixed(1)}pp)。劣位カテゴリは価格・MD 見直しの余地あり。`,
      sentiment: "neutral",
    },
    {
      id: "product-tail",
      label: "低粗利テール",
      text: `粗利率 15% 未満の商品が ${totalProducts} 中 ${lowMarginCount} SKU (${lowMarginShare.toFixed(0)}%)、売上構成比 ${lowMarginRevenueShare.toFixed(1)}%。${lowMarginShare > 20 ? "整理や価格改定で全体粗利率を底上げ可能。" : "低粗利テールは抑制されている。"}`,
      sentiment: lowMarginShare > 25 ? "attention" : "neutral",
    },
  ]
}
