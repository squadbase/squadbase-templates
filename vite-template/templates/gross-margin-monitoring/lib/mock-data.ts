import type {
  Category,
  MarginTrendPoint,
  CategoryMarginRow,
  ProductMarginScatterPoint,
  KpiItem,
} from "@/types/gross-margin-monitoring"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-31")

function ym(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(37)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Categories with baseline characteristics ──

const CATEGORIES: Category[] = [
  "Apparel",
  "Electronics",
  "Home & Living",
  "Food",
  "Beauty",
  "Sports",
]

interface CategoryBaseline {
  baseMargin: number
  baseRevenue: number
}

const CATEGORY_BASELINE: Record<Category, CategoryBaseline> = {
  Apparel: { baseMargin: 0.48, baseRevenue: 420_000 },
  Electronics: { baseMargin: 0.22, baseRevenue: 360_000 },
  "Home & Living": { baseMargin: 0.41, baseRevenue: 280_000 },
  Food: { baseMargin: 0.32, baseRevenue: 240_000 },
  Beauty: { baseMargin: 0.58, baseRevenue: 220_000 },
  Sports: { baseMargin: 0.39, baseRevenue: 180_000 },
}

// ── Margin trend (12 months) ──

function generateMarginTrend(): MarginTrendPoint[] {
  const points: MarginTrendPoint[] = []
  for (let i = 11; i >= 0; i--) {
    let revenue = 0
    let cogs = 0
    for (const cat of CATEGORIES) {
      const baseline = CATEGORY_BASELINE[cat]
      const trend = 1 + (11 - i) * 0.0035
      const noise = 0.9 + srand(0, 0.2)
      const catRevenue = baseline.baseRevenue * trend * noise
      const marginNoise = 1 + srand(-0.04, 0.04)
      const catMargin = baseline.baseMargin * marginNoise
      revenue += catRevenue
      cogs += catRevenue * (1 - catMargin)
    }
    const grossProfit = revenue - cogs
    const marginPct = (grossProfit / revenue) * 100
    points.push({
      month: ym(i),
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      marginPct: Math.round(marginPct * 10) / 10,
    })
  }
  return points
}

export const marginTrend: MarginTrendPoint[] = generateMarginTrend()

// ── Category ranking (latest month) ──

function generateCategoryRanking(): CategoryMarginRow[] {
  const rows = CATEGORIES.map((cat) => {
    const baseline = CATEGORY_BASELINE[cat]
    const revenue = Math.round(baseline.baseRevenue * (1 + srand(-0.08, 0.16)))
    const marginPct = baseline.baseMargin * 100 * (1 + srand(-0.06, 0.06))
    const grossProfit = Math.round((revenue * marginPct) / 100)
    const cogs = revenue - grossProfit
    const vsPrevMonth = Math.round(srand(-3.2, 4.5) * 10) / 10
    return {
      category: cat,
      revenue,
      cogs,
      grossProfit,
      marginPct: Math.round(marginPct * 10) / 10,
      vsPrevMonth,
    }
  })
  const sorted = rows
    .slice()
    .sort((a, b) => b.marginPct - a.marginPct)
    .map((r, i) => ({ rank: i + 1, ...r }))
  return sorted
}

export const categoryRanking: CategoryMarginRow[] = generateCategoryRanking()

// ── Product scatter (signature element) ──
// 36 products: x = margin %, y = gross profit, size = revenue, color = category

const PRODUCT_NAMES: Record<Category, string[]> = {
  Apparel: ["Classic Tee", "Slim Jeans", "Leather Jacket", "Knit Sweater", "Summer Dress", "Polo Shirt"],
  Electronics: ["Wireless Earbuds", "Smart Watch", "USB-C Hub", "Bluetooth Speaker", "Laptop Stand", "4K Webcam"],
  "Home & Living": ["Aroma Diffuser", "Throw Blanket", "Ceramic Mug Set", "Linen Bedding", "Wall Clock", "Floor Lamp"],
  Food: ["Single-Origin Coffee", "Olive Oil 500ml", "Granola Mix", "Dark Chocolate", "Pasta Sauce", "Spice Pack"],
  Beauty: ["Niacinamide Serum", "Lip Balm", "Face Mask Pack", "Hair Oil", "Body Wash", "Hand Cream"],
  Sports: ["Yoga Mat", "Running Shorts", "Resistance Band Set", "Trail Backpack", "Foam Roller", "Sport Bottle"],
}

function generateProductScatter(): ProductMarginScatterPoint[] {
  const out: ProductMarginScatterPoint[] = []
  let productCounter = 0
  for (const cat of CATEGORIES) {
    const baseline = CATEGORY_BASELINE[cat]
    const names = PRODUCT_NAMES[cat]
    for (let i = 0; i < 6; i++) {
      productCounter += 1
      const marginNoise = 1 + srand(-0.3, 0.3)
      const marginPct = Math.max(
        2,
        Math.min(78, baseline.baseMargin * 100 * marginNoise),
      )
      const revenueNoise = 0.45 + srand(0, 1.4)
      const revenue = Math.round((baseline.baseRevenue / 6) * revenueNoise)
      const grossProfit = Math.round((revenue * marginPct) / 100)
      out.push({
        productId: `P-${String(productCounter).padStart(4, "0")}`,
        productName: names[i],
        category: cat,
        revenue,
        grossProfit,
        marginPct: Math.round(marginPct * 10) / 10,
      })
    }
  }
  return out
}

export const productScatter: ProductMarginScatterPoint[] = generateProductScatter()

// ── KPIs (latest month) ──

function computeKpis(): KpiItem[] {
  const latest = marginTrend[marginTrend.length - 1]
  const prev = marginTrend[marginTrend.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Revenue",
      value: `$${(latest.revenue / 1_000_000).toFixed(2)}M`,
      change: pct(latest.revenue, prev.revenue),
      changeLabel: "MoM",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m) => m.revenue),
    },
    {
      label: "COGS",
      value: `$${(latest.cogs / 1_000_000).toFixed(2)}M`,
      change: pct(latest.cogs, prev.cogs),
      changeLabel: "MoM",
      positiveIsGood: false,
      sparklineData: marginTrend.map((m) => m.cogs),
    },
    {
      label: "Gross Profit",
      value: `$${(latest.grossProfit / 1_000_000).toFixed(2)}M`,
      change: pct(latest.grossProfit, prev.grossProfit),
      changeLabel: "MoM",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m) => m.grossProfit),
    },
    {
      label: "Gross Margin",
      value: `${latest.marginPct.toFixed(1)}%`,
      change: Math.round((latest.marginPct - prev.marginPct) * 10) / 10,
      changeLabel: "MoM (pp)",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m) => m.marginPct),
    },
    {
      label: "Margin Δ vs Last Month",
      value: `${latest.marginPct - prev.marginPct >= 0 ? "+" : ""}${(latest.marginPct - prev.marginPct).toFixed(1)}pp`,
      change: Math.round((latest.marginPct - prev.marginPct) * 10) / 10,
      changeLabel: "month-over-month",
      positiveIsGood: true,
      sparklineData: marginTrend.map((m, i, arr) =>
        i === 0 ? 0 : m.marginPct - arr[i - 1].marginPct,
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const categoryOptions = [
  { label: "All categories", value: "all" },
  ...CATEGORIES.map((c) => ({ label: c, value: c })),
]

export const CATEGORY_LIST = CATEGORIES
