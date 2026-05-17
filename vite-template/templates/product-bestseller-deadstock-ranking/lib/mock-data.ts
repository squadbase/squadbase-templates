import type {
  ProductRankingItem,
  ParetoPoint,
  QuadrantPoint,
  AbcClass,
  Quadrant,
  KpiItem,
} from "@/types/product-bestseller-deadstock-ranking"

// ── Helpers ──

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

// ── Product catalog (60 SKUs, follows ~80/20 long-tail distribution) ──

const CATEGORIES = [
  "Apparel",
  "Electronics",
  "Home & Living",
  "Food",
  "Beauty",
  "Sports",
]

const PRODUCT_NAMES = [
  "Classic Tee",
  "Slim Jeans",
  "Leather Jacket",
  "Knit Sweater",
  "Summer Dress",
  "Polo Shirt",
  "Bomber Jacket",
  "Cargo Pants",
  "Wireless Earbuds",
  "Smart Watch",
  "USB-C Hub",
  "Bluetooth Speaker",
  "Laptop Stand",
  "4K Webcam",
  "Mechanical Keyboard",
  "Gaming Mouse",
  "Aroma Diffuser",
  "Throw Blanket",
  "Ceramic Mug Set",
  "Linen Bedding",
  "Wall Clock",
  "Floor Lamp",
  "Cushion Cover",
  "Storage Basket",
  "Single-Origin Coffee",
  "Olive Oil 500ml",
  "Granola Mix",
  "Dark Chocolate",
  "Pasta Sauce",
  "Spice Pack",
  "Honey Jar",
  "Truffle Salt",
  "Niacinamide Serum",
  "Lip Balm",
  "Face Mask Pack",
  "Hair Oil",
  "Body Wash",
  "Hand Cream",
  "Perfume Mist",
  "Eye Cream",
  "Yoga Mat",
  "Running Shorts",
  "Resistance Band Set",
  "Trail Backpack",
  "Foam Roller",
  "Sport Bottle",
  "Cycling Gloves",
  "Tennis Racket",
  "Tote Bag",
  "Reusable Straw",
  "Travel Mug",
  "Notebook A5",
  "Pen Set",
  "Tea Sampler",
  "Beach Towel",
  "Sunglasses Case",
  "Phone Stand",
  "Eco Cleaner",
  "Plant Stand",
  "Picnic Blanket",
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
    // Pareto-ish distribution via 1 / (rank^0.85)
    const rankFactor = 1 / Math.pow(i + 1, 0.85)
    const baseRevenue = 320_000 * rankFactor
    const noise = 0.65 + srand(0, 0.7)
    const revenue = Math.round(baseRevenue * noise)
    const aov = 30 + srand(0, 160)
    const unitsSold = Math.max(1, Math.round(revenue / aov))
    // Stock turnover varies wildly — low ranks include many slow movers
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

// ── ABC classification (cumulative revenue thresholds) ──

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

// ── Quadrant classification (revenue × turnover) ──

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

// ── Product ranking (with prev-period comparison) ──

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

// ── Pareto data ──

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

// ── Quadrant data ──

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

// ── KPIs ──

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
      label: "Top SKU Revenue",
      value: `$${(productRanking[0].revenue / 1000).toFixed(1)}K`,
      change: productRanking[0].yoyChange,
      changeLabel: "YoY",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 10).map((p) => p.revenue),
    },
    {
      label: "Bottom SKU Revenue",
      value: `$${(productRanking[productRanking.length - 1].revenue / 1000).toFixed(1)}K`,
      change: productRanking[productRanking.length - 1].yoyChange,
      changeLabel: "YoY",
      positiveIsGood: true,
      sparklineData: productRanking.slice(-10).map((p) => p.revenue),
    },
    {
      label: "Stock Turnover",
      value: `${overallTurnover.toFixed(2)}×`,
      change: 6.4,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: productRanking
        .slice(0, 30)
        .map((p) => p.turnoverRate),
    },
    {
      label: "Class A Share",
      value: `${aShare.toFixed(1)}% / ${aRevenueShare.toFixed(1)}%`,
      change: 0,
      changeLabel: "SKUs / Revenue",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 12).map((p) => p.revenue),
    },
    {
      label: "Top-10 Concentration",
      value: `${top10Concentration.toFixed(1)}%`,
      change: 1.8,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: productRanking.slice(0, 10).map((p) => p.revenue),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const categoryOptions = [
  { label: "All categories", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]
