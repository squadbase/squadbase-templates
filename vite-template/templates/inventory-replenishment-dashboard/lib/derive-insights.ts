import {
  skuStockItems,
  shortageRisks,
  replenishmentQueue,
  totalRecommendedSpend,
} from "@/lib/inventory-replenishment-dashboard-mock-data"

export interface InsightItem {
  id: "shortage-pressure" | "excess-capital" | "replenish-action"
  label: string
  text: string
  sentiment: "positive" | "neutral" | "attention"
}

export function deriveInsights(): InsightItem[] {
  // 1. Shortage pressure — how many SKUs are below reorder point
  const totalSkus = skuStockItems.length
  const belowReorder = skuStockItems.filter((r) => r.stockDays < r.reorderPoint).length
  const shortagePct = (belowReorder / totalSkus) * 100
  const tightest = shortageRisks[0]

  // 2. Excess capital tied up in slow movers
  const excessSkus = skuStockItems.filter((r) => r.tier === "excess")
  const excessValue = excessSkus.reduce((s, r) => s + r.excessValue, 0)
  const excessPct = (excessSkus.length / totalSkus) * 100

  // 3. Replenishment action — how much spend will clear the queue
  const queueCount = replenishmentQueue.length
  const avgRecommendedSpend = queueCount > 0 ? totalRecommendedSpend / queueCount : 0

  return [
    {
      id: "shortage-pressure",
      label: "Shortage Pressure",
      text: tightest
        ? `${belowReorder} of ${totalSkus} SKUs (${shortagePct.toFixed(0)}%) are below reorder point. ${tightest.name} (${tightest.sku}) has only ${tightest.stockDays.toFixed(1)} days of cover against a ${tightest.leadTimeDays}-day lead time — act today to avoid a stockout.`
        : `All ${totalSkus} SKUs are at or above reorder point. Stock posture is healthy across the assortment.`,
      sentiment:
        shortagePct >= 25 ? "attention" : shortagePct >= 10 ? "neutral" : "positive",
    },
    {
      id: "excess-capital",
      label: "Excess Capital",
      text:
        excessSkus.length > 0
          ? `${excessSkus.length} SKUs (${excessPct.toFixed(0)}%) carry more than 90 days of cover, tying up $${excessValue.toLocaleString("en-US")} in slow-moving stock. Consider markdowns or pause replenishment for these lines.`
          : `No SKU is carrying excess stock above the 90-day cover threshold. Working capital efficiency is on plan.`,
      sentiment: excessValue > 5000 ? "attention" : excessSkus.length > 0 ? "neutral" : "positive",
    },
    {
      id: "replenish-action",
      label: "Replenishment Action",
      text:
        queueCount > 0
          ? `Auto-replenishment recommends ${queueCount} purchase orders totalling $${totalRecommendedSpend.toLocaleString("en-US")} (avg $${Math.round(avgRecommendedSpend).toLocaleString("en-US")}/SKU). Submitting today aligns delivery with the longest lead-time SKUs.`
          : `No SKU is currently below reorder point — no purchase orders required.`,
      sentiment: queueCount > 0 ? "neutral" : "positive",
    },
  ]
}
