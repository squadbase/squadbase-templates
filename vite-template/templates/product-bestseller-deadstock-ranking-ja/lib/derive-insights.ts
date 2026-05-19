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
  const deadstockStockValue = deadstock.reduce((s, p) => s + p.stockQty * 4_000, 0)

  const rising = [...productRanking]
    .filter((p) => p.yoyChange > 0)
    .sort((a, b) => b.yoyChange - a.yoyChange)[0]

  return [
    {
      id: "concentration",
      label: "売上集中",
      text: `SKU の ${aSkuShare.toFixed(1)}% (A区分) が売上の ${aRevenueShare.toFixed(1)}% を占有。${aSkuShare < 25 ? "典型的なロングテール — Top SKU 保護とテール整理が有効。" : "通常より分散的な構成。"}`,
      sentiment: aSkuShare < 18 ? "attention" : "neutral",
    },
    {
      id: "deadstock",
      label: "死に筋リスク",
      text: `${deadstock.length} SKU が低売上×低回転象限 (カタログの ${deadstockShare.toFixed(0)}%) にあり、推定 ¥${Math.round(deadstockStockValue / 10_000).toLocaleString("ja-JP")}万 の在庫を拘束。値下げ・終売の検討余地あり。`,
      sentiment: deadstockShare > 30 ? "attention" : "neutral",
    },
    {
      id: "rising",
      label: "急上昇商品",
      text: rising
        ? `「${rising.productName}」が前年比 ${rising.yoyChange >= 0 ? "+" : ""}${rising.yoyChange.toFixed(1)}% (¥${Math.round(rising.revenue / 10_000).toLocaleString("ja-JP")}万) と好調。在庫拡充と展開強化を検討。`
        : "目立つ急上昇 SKU は検出されず、勢いは広く分散。",
      sentiment: rising ? "positive" : "neutral",
    },
  ]
}
