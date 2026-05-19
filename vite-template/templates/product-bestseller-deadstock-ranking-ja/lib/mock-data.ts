import type {
  ProductRankingItem,
  ParetoPoint,
  QuadrantPoint,
  AbcClass,
  Quadrant,
  KpiItem,
} from "@/types/product-bestseller-deadstock-ranking"

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(67)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

const CATEGORIES = ["アパレル", "家電", "ホーム&リビング", "食品", "ビューティー", "スポーツ"]

const PRODUCT_NAMES = [
  "定番Tシャツ", "スリムジーンズ", "レザージャケット", "ニットセーター", "サマードレス", "ポロシャツ", "ボンバージャケット", "カーゴパンツ",
  "ワイヤレスイヤホン", "スマートウォッチ", "USB-Cハブ", "Bluetoothスピーカー", "ノートPCスタンド", "4Kウェブカム", "メカニカルキーボード", "ゲーミングマウス",
  "アロマディフューザー", "ブランケット", "セラミックマグセット", "リネン寝具", "ウォールクロック", "フロアランプ", "クッションカバー", "収納バスケット",
  "シングルオリジンコーヒー", "オリーブオイル500ml", "グラノーラミックス", "ダークチョコレート", "パスタソース", "スパイスパック", "蜂蜜瓶", "トリュフ塩",
  "ナイアシンアミド美容液", "リップバーム", "フェイスマスク", "ヘアオイル", "ボディウォッシュ", "ハンドクリーム", "パフュームミスト", "アイクリーム",
  "ヨガマット", "ランニングショーツ", "レジスタンスバンド", "トレイルバックパック", "フォームローラー", "スポーツボトル", "サイクリンググローブ", "テニスラケット",
  "トートバッグ", "再利用ストロー", "トラベルマグ", "ノートA5", "ペンセット", "茶葉サンプラー", "ビーチタオル", "サングラスケース",
  "スマホスタンド", "エココリーナー", "プラントスタンド", "ピクニックブランケット",
]

const N_PRODUCTS = PRODUCT_NAMES.length

function generateRawProducts() {
  const products: Array<{
    productId: string
    productName: string
    category: string
    revenue: number
    unitsSold: number
    stockQty: number
    prevPeriodRevenue: number
  }> = []
  for (let i = 0; i < N_PRODUCTS; i++) {
    const rankFactor = 1 / Math.pow(i + 1, 0.85)
    const baseRevenue = 32_000_000 * rankFactor
    const noise = 0.65 + srand(0, 0.7)
    const revenue = Math.round(baseRevenue * noise)
    const aov = 3_000 + srand(0, 16_000)
    const unitsSold = Math.max(1, Math.round(revenue / aov))
    const turnoverNoise = i < 12 ? 0.6 + srand(0, 1.2) : 0.05 + srand(0, 0.95)
    const stockQty = Math.max(10, Math.round(unitsSold / Math.max(0.2, turnoverNoise)))
    const yoyNoise = 1 + srand(-0.35, 0.45)
    const prevPeriodRevenue = Math.round(revenue / yoyNoise)
    products.push({
      productId: `P-${String(i + 1).padStart(4, "0")}`,
      productName: PRODUCT_NAMES[i],
      category: CATEGORIES[i % CATEGORIES.length],
      revenue,
      unitsSold,
      stockQty,
      prevPeriodRevenue,
    })
  }
  return products.sort((a, b) => b.revenue - a.revenue)
}

const rawProducts = generateRawProducts()

function classifyAbc(): Map<string, AbcClass> {
  const total = rawProducts.reduce((s, p) => s + p.revenue, 0)
  const map = new Map<string, AbcClass>()
  let cum = 0
  for (const p of rawProducts) {
    cum += p.revenue
    const pct = (cum / total) * 100
    const cls: AbcClass = pct <= 70 ? "A" : pct <= 90 ? "B" : "C"
    map.set(p.productId, cls)
  }
  return map
}

const abcMap = classifyAbc()

const revenueValues = rawProducts.map((p) => p.revenue)
const turnoverValues = rawProducts.map((p) => p.unitsSold / Math.max(1, p.stockQty))
const REVENUE_MEDIAN =
  revenueValues.sort((a, b) => a - b)[Math.floor(revenueValues.length / 2)]
const TURNOVER_MEDIAN =
  turnoverValues.sort((a, b) => a - b)[Math.floor(turnoverValues.length / 2)]

function classifyQuadrant(revenue: number, turnover: number): Quadrant {
  if (revenue >= REVENUE_MEDIAN && turnover >= TURNOVER_MEDIAN) return "star"
  if (revenue >= REVENUE_MEDIAN && turnover < TURNOVER_MEDIAN) return "workhorse"
  if (revenue < REVENUE_MEDIAN && turnover >= TURNOVER_MEDIAN) return "niche"
  return "deadstock"
}

export const productRanking: ProductRankingItem[] = rawProducts.map((p, i) => {
  const turnoverRate =
    Math.round((p.unitsSold / Math.max(1, p.stockQty)) * 100) / 100
  const yoyChange =
    Math.round(((p.revenue - p.prevPeriodRevenue) / p.prevPeriodRevenue) * 1000) /
    10
  return {
    rank: i + 1,
    productId: p.productId,
    productName: p.productName,
    category: p.category,
    revenue: p.revenue,
    unitsSold: p.unitsSold,
    stockQty: p.stockQty,
    turnoverRate,
    prevPeriodRevenue: p.prevPeriodRevenue,
    yoyChange,
    abcClass: abcMap.get(p.productId) ?? "C",
    quadrant: classifyQuadrant(p.revenue, turnoverRate),
  }
})

function buildPareto(): ParetoPoint[] {
  const total = rawProducts.reduce((s, p) => s + p.revenue, 0)
  let cum = 0
  return rawProducts.map((p) => {
    cum += p.revenue
    return {
      productId: p.productId,
      productName: p.productName,
      revenue: p.revenue,
      cumulativeRevenue: cum,
      cumulativePct: Math.round((cum / total) * 1000) / 10,
      abcClass: abcMap.get(p.productId) ?? "C",
    }
  })
}

export const paretoData: ParetoPoint[] = buildPareto()

export const quadrantData: QuadrantPoint[] = productRanking.map((r) => ({
  productId: r.productId,
  productName: r.productName,
  category: r.category,
  revenue: r.revenue,
  turnoverRate: r.turnoverRate,
  unitsSold: r.unitsSold,
  quadrant: r.quadrant,
}))

export const QUADRANT_BOUNDARIES = {
  revenueMedian: REVENUE_MEDIAN,
  turnoverMedian: TURNOVER_MEDIAN,
} as const

function computeKpis(): KpiItem[] {
  const total = productRanking.reduce((s, p) => s + p.revenue, 0)
  const totalUnits = productRanking.reduce((s, p) => s + p.unitsSold, 0)
  const totalStock = productRanking.reduce((s, p) => s + p.stockQty, 0)
  const overallTurnover = totalUnits / totalStock

  const aCount = productRanking.filter((p) => p.abcClass === "A").length
  const aShare = (aCount / productRanking.length) * 100
  const aRevenueShare =
    (productRanking
      .filter((p) => p.abcClass === "A")
      .reduce((s, p) => s + p.revenue, 0) /
      total) *
    100
  const top10Concentration =
    (productRanking
      .slice(0, 10)
      .reduce((s, p) => s + p.revenue, 0) /
      total) *
    100

  return [
    {
      label: "Top商品売上",
      value: `¥${(productRanking[0].revenue / 10_000).toFixed(0)}万`,
      change: productRanking[0].yoyChange,
      changeLabel: "前年比",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 10).map((p) => p.revenue),
    },
    {
      label: "Bottom商品売上",
      value: `¥${(productRanking[productRanking.length - 1].revenue / 10_000).toFixed(0)}万`,
      change: productRanking[productRanking.length - 1].yoyChange,
      changeLabel: "前年比",
      positiveIsGood: true,
      sparklineData: productRanking.slice(-10).map((p) => p.revenue),
    },
    {
      label: "在庫回転率",
      value: `${overallTurnover.toFixed(2)}回転`,
      change: 6.4,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 30).map((p) => p.turnoverRate),
    },
    {
      label: "A区分構成比",
      value: `${aShare.toFixed(1)}% / ${aRevenueShare.toFixed(1)}%`,
      change: 0,
      changeLabel: "SKU / 売上",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 12).map((p) => p.revenue),
    },
    {
      label: "上位10品集中度",
      value: `${top10Concentration.toFixed(1)}%`,
      change: 1.8,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 10).map((p) => p.revenue),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

export const categoryOptions = [
  { label: "全カテゴリ", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]
