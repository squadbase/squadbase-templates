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
      label: "Heavy-Discount Tail",
      text:
        heavyShare > 8
          ? `${heavyShare.toFixed(1)}% of transactions sit above a 25% discount and account for $${Math.round(heavyRevenue / 1000).toLocaleString("en-US")}K of revenue. Tighten approval gates on >25% discounts.`
          : `Only ${heavyShare.toFixed(1)}% of transactions are above 25% discount — the long tail is contained.`,
      sentiment: heavyShare > 12 ? "attention" : heavyShare > 6 ? "neutral" : "positive",
    },
    {
      id: "channel-concentration",
      label: "Channel Concentration",
      text: `${topChannel.channel} accounts for ${topChannelShare.toFixed(1)}% of total discount spend at an avg ${topChannel.averageDiscountRate.toFixed(1)}% off. Aligning channel discount policy could recover meaningful margin.`,
      sentiment: topChannelShare > 45 ? "attention" : "neutral",
    },
    {
      id: "customer-concentration",
      label: "Top-3 Customer Concentration",
      text: `The top 3 customers absorb ${top3Share.toFixed(1)}% of total discount value. ${top3Share > 35 ? "Consider tiered pricing or contract review for those accounts." : "Discount distribution across customers is balanced."}`,
      sentiment: top3Share > 40 ? "attention" : "neutral",
    },
  ]
}
