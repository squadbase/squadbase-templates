// ── 入力データスキーマ (チケット「期待入力データ」に対応) ──
// line_id, date, planned_qty, actual_qty, defect_qty

export interface ProductionRow {
  line_id: string
  date: string
  planned_qty: number
  actual_qty: number
  defect_qty: number
}

// ── 表示・導出型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface LineOutputItem {
  line_id: string
  lineName: string
  plannedQty: number
  actualQty: number
  defectQty: number
  attainmentPct: number
}

export interface PlanVsActualPoint {
  date: string
  plannedQty: number
  actualQty: number
}

export interface DefectRatePoint {
  date: string
  defectRatePct: number
  ucl: number
  lcl: number
  centerline: number
  isOutOfControl: boolean
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  line: string | undefined
  shift: string | undefined
}
