// ── Enum / Literal types ──

export type Channel = "store" | "online" | "wholesale"

// ── Raw data schema (matches ticket's expected input data) ──
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

// Day-of-week (Mon=0 ... Sun=6) × week-index (0=this week, larger=older)
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
