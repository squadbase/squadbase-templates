import type {
  ProductForecastSeries,
  ErrorHeatmapCell,
  MonthlyAccuracyPoint,
  KpiItem,
  ProductMeta,
  ProductCategory,
} from "@/types/demand-forecast-vs-actual"

// ── ヘルパー ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// JA 専用シード (EN と独立)
const rng = seededRand(19)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function weekStartLabel(weeksAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - weeksAgo * 7)
  const day = d.getDay()
  const offset = (day + 6) % 7
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

function monthLabel(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toISOString().slice(0, 7)
}

// ── 商品マスタ ──

export const products: ProductMeta[] = [
  { productId: "P-1001", name: "コールドブリュー 500ml", category: "beverage" },
  { productId: "P-1002", name: "炭酸水 1L", category: "beverage" },
  { productId: "P-2001", name: "プロテインバー チョコ", category: "snack" },
  { productId: "P-2002", name: "ミックスナッツ 200g", category: "snack" },
  { productId: "P-3001", name: "冷凍ピザ マルゲリータ", category: "frozen" },
  { productId: "P-3002", name: "冷凍ベリーミックス", category: "frozen" },
  { productId: "P-4001", name: "オーガニックサラダパック", category: "fresh" },
  { productId: "P-5001", name: "ジェルボール洗剤 30個", category: "household" },
]

// 商品ごとの週次基準需要 (個)
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

// 商品ごとの系統的バイアス (正 = 予測過剰)
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

// ── 予測 vs 実績の時系列 (商品 × 12 週) ──

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

// ── 誤差ヒートマップ (商品 × 週) ──

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

// ── 月次予測精度トレンド (直近 6 ヶ月) ──

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
  const allPoints = productForecasts.flatMap((s) => s.points)
  const currentMape = computeMape(allPoints.slice(-products.length * 4))
  const currentBias = computeBias(allPoints.slice(-products.length * 4))
  for (let m = MONTHS - 1; m >= 0; m--) {
    const noise = 0.9 + srand(0, 0.2)
    const drift = (m / MONTHS) * 4 // 古い月ほど精度低下
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

// ── 主要 KPI (ヘッダー直下) ──

function computeKpis(): KpiItem[] {
  const latest = monthlyAccuracy[monthlyAccuracy.length - 1]
  const prev = monthlyAccuracy[monthlyAccuracy.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "予測精度 (MAPE)",
      value: `${latest.mape.toFixed(1)}%`,
      change: pct(latest.mape, prev.mape),
      changeLabel: "前月比",
      positiveIsGood: false, // MAPE は低いほどよい
      sparklineData: monthlyAccuracy.map((m) => m.mape),
    },
    {
      label: "予測バイアス",
      value: `${latest.bias >= 0 ? "+" : ""}${latest.bias.toFixed(1)}%`,
      change: pct(latest.bias, prev.bias),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: monthlyAccuracy.map((m) => m.bias),
    },
    {
      label: "在庫充足率",
      value: `${latest.fillRate.toFixed(1)}%`,
      change: pct(latest.fillRate, prev.fillRate),
      changeLabel: "前月比",
      positiveIsGood: true,
      sparklineData: monthlyAccuracy.map((m) => m.fillRate),
    },
    {
      label: "欠品率",
      value: `${latest.stockoutRate.toFixed(2)}%`,
      change: pct(latest.stockoutRate, prev.stockoutRate),
      changeLabel: "前月比",
      positiveIsGood: false,
      sparklineData: monthlyAccuracy.map((m) => m.stockoutRate),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const categoryOptions: { label: string; value: string }[] = [
  { label: "全カテゴリ", value: "all" },
  { label: "飲料", value: "beverage" },
  { label: "スナック", value: "snack" },
  { label: "冷凍", value: "frozen" },
  { label: "生鮮", value: "fresh" },
  { label: "日用品", value: "household" },
]

export const productOptions: { label: string; value: string }[] = [
  { label: "全商品", value: "all" },
  ...products.map((p) => ({ label: p.name, value: p.productId })),
]

export const categoryLabels: Record<ProductCategory, string> = {
  beverage: "飲料",
  snack: "スナック",
  frozen: "冷凍",
  fresh: "生鮮",
  household: "日用品",
}
