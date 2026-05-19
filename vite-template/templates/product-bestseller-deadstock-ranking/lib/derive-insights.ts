import {
  productRanking,
  paretoData,
} from "@/lib/product-bestseller-deadstock-ranking-mock-data"

export interface InsightItem {
  id: "concentration" | "deadstock" | "rising"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  const total = productRanking.reduce((s, p) => s + p.revenue, 0)
  const aSkus = paretoData.filter((p) => p.abcClass === "A")
  const aRevenueShare =
    (aSkus.reduce((s, p) => s + p.revenue, 0) / total) * 100
  const aSkuShare = (aSkus.length / paretoData.length) * 100

  const deadstock = productRanking.filter((p) => p.quadrant === "deadstock")
  const deadstockShare = (deadstock.length / productRanking.length) * 100
  const deadstockStockValue = deadstock.reduce((s, p) => s + p.stockQty * 40, 0)

  const rising = [...productRanking]
    .filter((p) => p.yoyChange > 0)
    .sort((a, b) => b.yoyChange - a.yoyChange)[0]

  return [
    {
      id: "concentration",
      label: "Revenue Concentration",
      text: `${aSkuShare.toFixed(1)}% of SKUs (Class A) generate ${aRevenueShare.toFixed(1)}% of revenue. ${aSkuShare < 25 ? "Classic long-tail pattern — protect top sellers and rationalize the tail." : "Concentration is more evenly spread than typical."}`,
      sentiment: aSkuShare < 18 ? "attention" : "neutral",
    },
    {
      id: "deadstock",
      label: "Deadstock Risk",
      text: `${deadstock.length} SKUs sit in the low-revenue / low-turnover quadrant (${deadstockShare.toFixed(0)}% of catalog), tying up an estimated $${Math.round(deadstockStockValue / 1000).toLocaleString("en-US")}K of stock. Consider clearance, markdown, or delisting.`,
      sentiment: deadstockShare > 30 ? "attention" : "neutral",
    },
    {
      id: "rising",
      label: "Rising Star",
      text: rising
        ? `"${rising.productName}" is up ${rising.yoyChange >= 0 ? "+" : ""}${rising.yoyChange.toFixed(1)}% YoY at $${Math.round(rising.revenue / 1000)}K — consider boosting stock and shelf space.`
        : "No standout rising SKU detected; momentum is broadly distributed.",
      sentiment: rising ? "positive" : "neutral",
    },
  ]
}
