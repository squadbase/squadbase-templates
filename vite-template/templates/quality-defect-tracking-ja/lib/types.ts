// ── 生データスキーマ（チケットの「期待入力データ」と一致） ──
// defect_type, line_id, occurred_at, qty

export interface DefectRow {
  defect_type: string
  line_id: string
  occurred_at: string
  qty: number
}

// ── 表示用 / 派生型 ──

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

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  line: string | undefined
}
