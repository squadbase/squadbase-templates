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
  // 1. 欠品プレッシャー — 発注点を割っている SKU 数
  const totalSkus = skuStockItems.length
  const belowReorder = skuStockItems.filter((r) => r.stockDays < r.reorderPoint).length
  const shortagePct = (belowReorder / totalSkus) * 100
  const tightest = shortageRisks[0]

  // 2. 過剰在庫として滞留している資金
  const excessSkus = skuStockItems.filter((r) => r.tier === "excess")
  const excessValue = excessSkus.reduce((s, r) => s + r.excessValue, 0)
  const excessPct = (excessSkus.length / totalSkus) * 100

  // 3. 発注アクション — キューを消化するために必要な金額
  const queueCount = replenishmentQueue.length
  const avgRecommendedSpend = queueCount > 0 ? totalRecommendedSpend / queueCount : 0

  return [
    {
      id: "shortage-pressure",
      label: "欠品プレッシャー",
      text: tightest
        ? `全 ${totalSkus} SKU 中 ${belowReorder} 件 (${shortagePct.toFixed(0)}%) が発注点を下回り。${tightest.name} (${tightest.sku}) は在庫 ${tightest.stockDays.toFixed(1)} 日に対しリードタイム ${tightest.leadTimeDays} 日 — 本日中の発注で欠品を回避したい。`
        : `全 ${totalSkus} SKU が発注点以上を維持。在庫状態は良好。`,
      sentiment:
        shortagePct >= 25 ? "attention" : shortagePct >= 10 ? "neutral" : "positive",
    },
    {
      id: "excess-capital",
      label: "滞留資金",
      text:
        excessSkus.length > 0
          ? `${excessSkus.length} SKU (${excessPct.toFixed(0)}%) が在庫日数 90 日超で、¥${excessValue.toLocaleString("ja-JP")} の運転資金を圧迫。値下げや発注一時停止を検討する余地あり。`
          : `在庫日数 90 日超の SKU はなし。運転資金は計画通りに回っている。`,
      sentiment: excessValue > 500_000 ? "attention" : excessSkus.length > 0 ? "neutral" : "positive",
    },
    {
      id: "replenish-action",
      label: "発注アクション",
      text:
        queueCount > 0
          ? `自動発注ロジックは ${queueCount} 件の発注 (合計 ¥${totalRecommendedSpend.toLocaleString("ja-JP")} / 平均 ¥${Math.round(avgRecommendedSpend).toLocaleString("ja-JP")} per SKU) を推奨。本日中に発注すれば長納期 SKU の入荷タイミングが揃う。`
          : `発注点を割っている SKU はなし — 本日の発注対象は無し。`,
      sentiment: queueCount > 0 ? "neutral" : "positive",
    },
  ]
}
