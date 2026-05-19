import type {
  SkuStockItem,
  KpiItem,
  ShortageRiskItem,
  StockDaysBucket,
  Category,
  StockTier,
} from "@/types/inventory-replenishment-dashboard"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(42)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function classifyTier(stockDays: number, reorderPoint: number, stockQty: number): StockTier {
  if (stockQty === 0) return "stockout"
  if (stockDays < reorderPoint * 0.5) return "critical"
  if (stockDays < reorderPoint) return "low"
  if (stockDays > 90) return "excess"
  return "healthy"
}

// ── SKU マスター ──

const SKU_NAMES_JA: Record<Category, string[]> = {
  apparel: [
    "リネンシャツ M",
    "オックスフォードポロ L",
    "スリムチノ 32",
    "ニットカーディガン S",
    "フーディスウェット M",
    "テーラードジャケット L",
  ],
  accessories: [
    "レザーウォレット",
    "ウールビーニー",
    "キャンバストート",
    "シルバーブレスレット",
    "シルクスカーフ",
  ],
  footwear: [
    "ランナースニーカー 26.5",
    "ローファー 27.0",
    "チャッカブーツ 26.5",
    "トレイルシューズ 27.0",
  ],
  home: [
    "コットンスロー",
    "セラミックマグ 2点セット",
    "バンブートレイ",
    "アロマディフューザー",
    "リネンピローケース",
  ],
}

const CATEGORIES: Category[] = ["apparel", "accessories", "footwear", "home"]

function generateSkuData(): SkuStockItem[] {
  const rows: SkuStockItem[] = []
  let counter = 1001
  for (const category of CATEGORIES) {
    for (const name of SKU_NAMES_JA[category]) {
      const sku = `SKU-${counter++}`
      const dailySalesAvg = Math.max(0.4, srand(0.5, 14))
      const leadTimeDays = pick([5, 7, 10, 14, 21, 28])
      const stockBias = srand(0, 1)
      let stockDays: number
      if (stockBias < 0.12) stockDays = 0
      else if (stockBias < 0.28) stockDays = srand(1, 6)
      else if (stockBias < 0.5) stockDays = srand(6, 18)
      else if (stockBias < 0.82) stockDays = srand(18, 70)
      else stockDays = srand(95, 220)
      const stockQty = Math.round(stockDays * dailySalesAvg)
      // 単価は円 (約 ¥800〜¥9,000)
      const unitCost = Math.round(srand(800, 9000) / 100) * 100
      const safetyDays = 7
      const reorderPoint = leadTimeDays + safetyDays
      const targetDays = leadTimeDays + safetyDays + 14
      const recommendedOrderQty =
        stockDays < reorderPoint
          ? Math.max(1, Math.round((targetDays - stockDays) * dailySalesAvg))
          : 0
      const tier = classifyTier(stockDays, reorderPoint, stockQty)
      const excessValue =
        tier === "excess"
          ? Math.round((stockDays - 90) * dailySalesAvg * unitCost)
          : 0
      rows.push({
        sku,
        name,
        category,
        stock_qty: stockQty,
        daily_sales_avg: Math.round(dailySalesAvg * 10) / 10,
        lead_time_days: leadTimeDays,
        unitCost,
        stockDays: Math.round(stockDays * 10) / 10,
        reorderPoint,
        recommendedOrderQty,
        tier,
        excessValue,
      })
    }
  }
  return rows.sort((a, b) => a.stockDays - b.stockDays)
}

export const skuStockItems: SkuStockItem[] = generateSkuData()

// ── 主要 KPI ──

function computeKpis(): KpiItem[] {
  const totalSkus = skuStockItems.length
  const totalStockDays = skuStockItems.reduce((s, r) => s + r.stockDays, 0)
  const avgStockDays = totalStockDays / totalSkus

  const stockoutCount = skuStockItems.filter((r) => r.tier === "stockout").length
  const shortageRate = (stockoutCount / totalSkus) * 100

  const excessValue = skuStockItems.reduce((s, r) => s + r.excessValue, 0)

  const replenishCount = skuStockItems.filter((r) => r.recommendedOrderQty > 0).length

  const avgLeadTime =
    skuStockItems.reduce((s, r) => s + r.lead_time_days, 0) / totalSkus

  const sparkA = [38, 36, 35, 34, 36, 33, 32, 31, 30, 31, 30, 29, 28, 27]
  const sparkB = [9.1, 8.4, 8.9, 8.3, 7.7, 8.2, 7.4, 7.1, 7.6, 6.9, 7.2, 6.5, 6.8, 7.2]
  const sparkC = [22, 24, 23, 26, 28, 27, 29, 31, 32, 33, 31, 34, 36, 38]
  const sparkD = [4, 5, 6, 6, 7, 9, 11, 10, 12, 11, 12, 13, 14, replenishCount]
  const sparkE = [13.8, 13.6, 13.4, 13.5, 13.3, 13.1, 13.2, 13.0, 12.9, 13.1, 12.8, 12.7, 12.9, avgLeadTime]

  return [
    {
      label: "平均在庫日数",
      value: `${avgStockDays.toFixed(1)} 日`,
      change: -8.2,
      changeLabel: "前週比",
      positiveIsGood: false,
      sparklineData: sparkA,
    },
    {
      label: "欠品率",
      value: `${shortageRate.toFixed(1)}%`,
      change: -1.6,
      changeLabel: "前週比",
      positiveIsGood: false,
      sparklineData: sparkB,
    },
    {
      label: "過剰在庫額",
      value: `¥${(excessValue / 10_000).toFixed(1)}万`,
      change: 4.3,
      changeLabel: "前週比",
      positiveIsGood: false,
      sparklineData: sparkC,
    },
    {
      label: "発注推奨件数",
      value: `${replenishCount} 件`,
      change: 12.5,
      changeLabel: "前週比",
      positiveIsGood: false,
      sparklineData: sparkD,
    },
    {
      label: "平均リードタイム",
      value: `${avgLeadTime.toFixed(1)} 日`,
      change: -2.1,
      changeLabel: "前期比",
      positiveIsGood: false,
      sparklineData: sparkE,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── 欠品リスクリスト ──

function computeShortageRisks(): ShortageRiskItem[] {
  return skuStockItems
    .filter((r) => r.tier === "stockout" || r.tier === "critical" || r.tier === "low")
    .map((r) => ({
      sku: r.sku,
      name: r.name,
      stockDays: r.stockDays,
      leadTimeDays: r.lead_time_days,
      bufferDays: Math.round((r.stockDays - r.lead_time_days) * 10) / 10,
      dailySalesAvg: r.daily_sales_avg,
    }))
    .sort((a, b) => a.bufferDays - b.bufferDays)
    .slice(0, 6)
}

export const shortageRisks: ShortageRiskItem[] = computeShortageRisks()

// ── 在庫日数分布 (シグネチャ要素の補助ビュー) ──

const BUCKETS: { label: string; min: number; max: number; tier: StockTier }[] = [
  { label: "0日 (欠品)", min: 0, max: 0.001, tier: "stockout" },
  { label: "1-7日", min: 0.001, max: 7.01, tier: "critical" },
  { label: "8-14日", min: 7.01, max: 14.01, tier: "low" },
  { label: "15-30日", min: 14.01, max: 30.01, tier: "healthy" },
  { label: "31-60日", min: 30.01, max: 60.01, tier: "healthy" },
  { label: "61-90日", min: 60.01, max: 90.01, tier: "healthy" },
  { label: "90日+", min: 90.01, max: Infinity, tier: "excess" },
]

function computeStockDaysDistribution(): StockDaysBucket[] {
  return BUCKETS.map((b) => ({
    bucket: b.label,
    skuCount: skuStockItems.filter((r) => r.stockDays >= b.min && r.stockDays < b.max).length,
    tier: b.tier,
  }))
}

export const stockDaysDistribution: StockDaysBucket[] = computeStockDaysDistribution()

// ── 発注推奨キュー ──

export const replenishmentQueue: SkuStockItem[] = skuStockItems
  .filter((r) => r.recommendedOrderQty > 0)
  .sort((a, b) => a.stockDays - b.stockDays)

export const totalRecommendedSpend: number = replenishmentQueue.reduce(
  (s, r) => s + r.recommendedOrderQty * r.unitCost,
  0,
)

// ── フィルター選択肢 ──

export const categoryOptions = [
  { label: "全カテゴリ", value: "all" },
  { label: "アパレル", value: "apparel" },
  { label: "アクセサリー", value: "accessories" },
  { label: "シューズ", value: "footwear" },
  { label: "ホーム", value: "home" },
]

export const tierOptions = [
  { label: "全ステータス", value: "all" },
  { label: "欠品", value: "stockout" },
  { label: "在庫薄 (危険)", value: "critical" },
  { label: "在庫薄", value: "low" },
  { label: "適正", value: "healthy" },
  { label: "過剰", value: "excess" },
]
