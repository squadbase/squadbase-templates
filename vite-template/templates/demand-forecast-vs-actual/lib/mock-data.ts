import type {
  ProductForecastSeries,
  ErrorHeatmapCell,
  MonthlyAccuracyPoint,
  KpiItem,
  ProductMeta,
  ProductCategory,
} from "@/types/demand-forecast-vs-actual"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Unique seed for this template
const rng = seededRand(17)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function weekStartLabel(weeksAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - weeksAgo * 7)
  // ISO week start label (yyyy-mm-dd of the Monday before BASE_DATE - weeksAgo*7)
  const day = d.getDay() // 0=Sun..6=Sat
  const offset = (day + 6) % 7
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

function monthLabel(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toISOString().slice(0, 7)
}

// ── Product catalog ──

export const products: ProductMeta[] = [
  { productId: "P-1001", name: "Cold Brew 500ml", category: "beverage" },
  { productId: "P-1002", name: "Sparkling Water 1L", category: "beverage" },
  { productId: "P-2001", name: "Protein Bar Choco", category: "snack" },
  { productId: "P-2002", name: "Trail Mix 200g", category: "snack" },
  { productId: "P-3001", name: "Frozen Pizza Margherita", category: "frozen" },
  { productId: "P-3002", name: "Frozen Berry Mix", category: "frozen" },
  { productId: "P-4001", name: "Organic Salad Pack", category: "fresh" },
  { productId: "P-5001", name: "Laundry Pods 30ct", category: "household" },
]

// Base weekly demand per product
const BASE_WEEKLY: Record<string, number> = {
  "P-1001": 1_800,
  "P-1002": 2_400,
  "P-2001": 1_200,
  "P-2002": 900,
  "P-3001": 700,
  "P-3002": 540,
  "P-4001": 1_500,
  "P-5001": 1_100,
}

// Per-product systematic bias (positive = forecast overshoots)
const PRODUCT_BIAS: Record<string, number> = {
  "P-1001": 0.04,
  "P-1002": -0.02,
  "P-2001": 0.08,
  "P-2002": -0.06,
  "P-3001": 0.12,
  "P-3002": 0.03,
  "P-4001": -0.09,
  "P-5001": 0.01,
}

// ── Forecast vs Actual time series ──
// 12 weeks of history per product

const WEEKS = 12

function generateForecastSeries(): ProductForecastSeries[] {
  return products.map((p) => {
    const base = BASE_WEEKLY[p.productId]
    const bias = PRODUCT_BIAS[p.productId]
    const points = []
    for (let w = WEEKS - 1; w >= 0; w--) {
      const seasonal = 1 + Math.sin(((WEEKS - w) / WEEKS) * Math.PI * 2) * 0.08
      const noiseAct = 0.85 + srand(0, 0.3)
      const actualQty = Math.round(base * seasonal * noiseAct)
      const forecastNoise = 0.95 + srand(0, 0.1)
      const forecastQty = Math.round(actualQty * (1 + bias) * forecastNoise)
      points.push({
        week: weekStartLabel(w),
        forecastQty,
        actualQty,
      })
    }
    return {
      productId: p.productId,
      productName: p.name,
      category: p.category,
      points,
    }
  })
}

export const productForecasts: ProductForecastSeries[] = generateForecastSeries()

// ── Error heatmap (product × week) ──

function generateErrorHeatmap(): ErrorHeatmapCell[] {
  const cells: ErrorHeatmapCell[] = []
  for (const series of productForecasts) {
    series.points.forEach((point, i) => {
      const errorPct =
        point.actualQty === 0
          ? 0
          : ((point.forecastQty - point.actualQty) / point.actualQty) * 100
      cells.push({
        productId: series.productId,
        productName: series.productName,
        weekIndex: i,
        week: point.week,
        errorPct: Math.round(errorPct * 10) / 10,
      })
    })
  }
  return cells
}

export const errorHeatmap: ErrorHeatmapCell[] = generateErrorHeatmap()

// ── Monthly accuracy trend (last 6 months) ──

const MONTHS = 6

function computeMape(points: { forecastQty: number; actualQty: number }[]): number {
  if (points.length === 0) return 0
  const sum = points.reduce((s, p) => {
    if (p.actualQty === 0) return s
    return s + Math.abs(p.forecastQty - p.actualQty) / p.actualQty
  }, 0)
  return (sum / points.length) * 100
}

function computeBias(points: { forecastQty: number; actualQty: number }[]): number {
  if (points.length === 0) return 0
  const sum = points.reduce((s, p) => {
    if (p.actualQty === 0) return s
    return s + (p.forecastQty - p.actualQty) / p.actualQty
  }, 0)
  return (sum / points.length) * 100
}

function generateMonthlyAccuracy(): MonthlyAccuracyPoint[] {
  const months: MonthlyAccuracyPoint[] = []
  // Use the latest 4 weeks (~1 month) of forecast data as a proxy for current
  // month, and synthesize prior months with a degrading-then-recovering pattern
  // to keep the trend visually meaningful in the demo.
  const allPoints = productForecasts.flatMap((s) => s.points)
  const currentMape = computeMape(allPoints.slice(-products.length * 4))
  const currentBias = computeBias(allPoints.slice(-products.length * 4))
  for (let m = MONTHS - 1; m >= 0; m--) {
    const noise = 0.9 + srand(0, 0.2)
    const drift = (m / MONTHS) * 4 // older months had worse accuracy
    const mape = Math.round((currentMape + drift) * noise * 10) / 10
    const bias = Math.round((currentBias - drift / 2) * noise * 10) / 10
    const fillRate = Math.round((96 - mape * 0.18 + srand(-0.5, 0.5)) * 10) / 10
    const stockoutRate = Math.round((mape * 0.06 + srand(0, 0.3)) * 100) / 100
    months.push({
      month: monthLabel(m),
      mape,
      bias,
      fillRate,
      stockoutRate,
    })
  }
  return months
}

export const monthlyAccuracy: MonthlyAccuracyPoint[] = generateMonthlyAccuracy()

// ── Header KPIs ──

function computeKpis(): KpiItem[] {
  const latest = monthlyAccuracy[monthlyAccuracy.length - 1]
  const prev = monthlyAccuracy[monthlyAccuracy.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Forecast Accuracy (MAPE)",
      value: `${latest.mape.toFixed(1)}%`,
      change: pct(latest.mape, prev.mape),
      changeLabel: "vs prev month",
      positiveIsGood: false, // lower MAPE is better
      sparklineData: monthlyAccuracy.map((m) => m.mape),
    },
    {
      label: "Forecast Bias",
      value: `${latest.bias >= 0 ? "+" : ""}${latest.bias.toFixed(1)}%`,
      change: pct(latest.bias, prev.bias),
      changeLabel: "vs prev month",
      positiveIsGood: false,
      sparklineData: monthlyAccuracy.map((m) => m.bias),
    },
    {
      label: "Inventory Fill Rate",
      value: `${latest.fillRate.toFixed(1)}%`,
      change: pct(latest.fillRate, prev.fillRate),
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: monthlyAccuracy.map((m) => m.fillRate),
    },
    {
      label: "Stockout Rate",
      value: `${latest.stockoutRate.toFixed(2)}%`,
      change: pct(latest.stockoutRate, prev.stockoutRate),
      changeLabel: "vs prev month",
      positiveIsGood: false,
      sparklineData: monthlyAccuracy.map((m) => m.stockoutRate),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const categoryOptions: { label: string; value: string }[] = [
  { label: "All categories", value: "all" },
  { label: "Beverage", value: "beverage" },
  { label: "Snack", value: "snack" },
  { label: "Frozen", value: "frozen" },
  { label: "Fresh", value: "fresh" },
  { label: "Household", value: "household" },
]

export const productOptions: { label: string; value: string }[] = [
  { label: "All products", value: "all" },
  ...products.map((p) => ({ label: p.name, value: p.productId })),
]

// Re-export category label resolver for callers that want a human-readable
// label without re-deriving it.
export const categoryLabels: Record<ProductCategory, string> = {
  beverage: "Beverage",
  snack: "Snack",
  frozen: "Frozen",
  fresh: "Fresh",
  household: "Household",
}
