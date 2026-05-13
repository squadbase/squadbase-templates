// ── Enum / Literal types ──

export type ProductCategory = "beverage" | "snack" | "frozen" | "fresh" | "household"

// ── 入力データスキーマ (チケットの「期待入力データ」と一致) ──
// product_id, week, forecast_qty, actual_qty

export interface ForecastRow {
  product_id: string
  week: string
  forecast_qty: number
  actual_qty: number
}

// ── 表示用 / 派生型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface ProductMeta {
  productId: string
  name: string
  category: ProductCategory
}

export interface ForecastVsActualPoint {
  week: string
  forecastQty: number
  actualQty: number
}

export interface ProductForecastSeries {
  productId: string
  productName: string
  category: ProductCategory
  points: ForecastVsActualPoint[]
}

// 商品 × 週 — 符号付き誤差率 (正 = 予測過剰)
export interface ErrorHeatmapCell {
  productId: string
  productName: string
  weekIndex: number
  week: string
  errorPct: number
}

export interface MonthlyAccuracyPoint {
  month: string
  mape: number
  bias: number
  fillRate: number
  stockoutRate: number
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
  product: string | undefined
}
