import {
  transactions,
  discountHistogram,
  customerRanking,
  channelRanking,
} from "@/lib/discount-margin-erosion-analysis-mock-data"

export interface InsightItem {
  id: "discount-tail" | "channel-concentration" | "customer-concentration"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const heavyBins = discountHistogram.filter((b) => b.binStart >= 25)
  const heavyCount = heavyBins.reduce((s, b) => s + b.count, 0)
  const heavyShare = (heavyCount / transactions.length) * 100
  const heavyRevenue = heavyBins.reduce((s, b) => s + b.revenue, 0)

  const topChannel = channelRanking[0]
  const topChannelShare =
    (topChannel.totalDiscountAmount /
      channelRanking.reduce((s, r) => s + r.totalDiscountAmount, 0)) *
    100

  const top3Customers = customerRanking.slice(0, 3)
  const top3Discount = top3Customers.reduce(
    (s, r) => s + r.totalDiscountAmount,
    0,
  )
  const totalCustomerDiscount = customerRanking.reduce(
    (s, r) => s + r.totalDiscountAmount,
    0,
  )
  const top3Share = (top3Discount / totalCustomerDiscount) * 100

  return [
    {
      id: "discount-tail",
      label: "深い値引きの裾",
      text:
        heavyShare > 8
          ? `25% 超の値引きが取引の ${heavyShare.toFixed(1)}% を占め、¥${Math.round(heavyRevenue / 10_000).toLocaleString("ja-JP")}万の売上に相当。25% 超の値引きには承認フロー強化を検討。`
          : `25% 超の値引きは取引の ${heavyShare.toFixed(1)}% のみ — 深い値引きの裾は抑制されている。`,
      sentiment:
        heavyShare > 12 ? "attention" : heavyShare > 6 ? "neutral" : "positive",
    },
    {
      id: "channel-concentration",
      label: "チャネルの集中",
      text: `「${topChannel.channel}」が値引き総額の ${topChannelShare.toFixed(1)}% を占め、平均 ${topChannel.averageDiscountRate.toFixed(1)}% の割引。チャネルの値引きポリシー再点検で粗利回復の余地あり。`,
      sentiment: topChannelShare > 45 ? "attention" : "neutral",
    },
    {
      id: "customer-concentration",
      label: "上位3社への集中",
      text: `上位3社が値引き総額の ${top3Share.toFixed(1)}% を吸収。${top3Share > 35 ? "段階値引きや契約見直しの検討余地あり。" : "顧客間の値引き配分は均衡。"}`,
      sentiment: top3Share > 40 ? "attention" : "neutral",
    },
  ]
}
