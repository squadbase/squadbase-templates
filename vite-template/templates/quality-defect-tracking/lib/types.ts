// ── Raw data schema (matches ticket's expected input data) ──
// defect_type, line_id, occurred_at, qty

export interface DefectRow {
  defect_type: string
  line_id: string
  occurred_at: string
  qty: number
}

// ── Display / derived types ──

export interface SummaryKpi {
  id: "defect-rate" | "defect-count" | "top-cause" | "recurrence-rate"
  label: string
  value: string
  helper: string
  sentiment: "positive" | "neutral" | "attention"
}

export interface ParetoPoint {
  cause: string
  qty: number
  cumulativeShare: number
}

export interface HeatmapCell {
  line: string
  cause: string
  qty: number
}

export interface MonthlyTrendPoint {
  month: string
  qty: number
  ucl: number
  lcl: number
  mean: number
}

export interface LineOption {
  label: string
  value: string
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  line: string | undefined
}
