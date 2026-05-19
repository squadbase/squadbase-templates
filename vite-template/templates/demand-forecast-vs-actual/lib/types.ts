// ── Enum / Literal types ──

export type ProductCategory = "beverage" | "snack" | "frozen" | "fresh" | "household"

// ── Raw data schema (matches ticket's expected input data) ──
// product_id, week, forecast_qty, actual_qty

export interface ForecastRow {
  product_id: string
  week: string
  forecast_qty: number
  actual_qty: number
}

// ── Display / derived types ──

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

// product × week — signed forecast error percentage (positive = over-forecast)
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

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
  product: string | undefined
}
