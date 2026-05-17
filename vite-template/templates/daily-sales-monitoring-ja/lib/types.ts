// ── Enum / Literal types ──

export type Channel = "store" | "online" | "wholesale"

// ── Raw data schema (チケットの期待入力データに準拠) ──
// sales_date, amount, store_id or channel

export interface SalesRow {
  sales_date: string
  amount: number
  store_id: string
  channel: Channel
  customers: number
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

export interface DailySalesPoint {
  date: string
  revenue: number
  movingAvg7: number | null
  customers: number
  aov: number
}

export interface YoYSalesPoint {
  date: string
  currentRevenue: number
  prevYearRevenue: number
}

// 曜日 (月=0..日=6) × 週インデックス (0=今週, 大きいほど過去)
export interface DowHeatmapCell {
  dayOfWeek: number
  weekIndex: number
  date: string
  revenue: number
}

export interface SnapshotItem {
  id: "revenue" | "customers" | "aov"
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
}

export interface MonthForecast {
  monthLabel: string
  daysElapsed: number
  daysInMonth: number
  actualToDate: number
  paceForecast: number
  monthlyTarget: number
  pctOfTarget: number
}

export interface WeekToDate {
  weekStartDate: string
  cumulativeRevenue: number
  prevWeekCumulative: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  store: string | undefined
}
