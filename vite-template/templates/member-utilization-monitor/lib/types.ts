// ── Raw schema (matches ticket's expected input data) ──
export interface UtilizationRow {
  member_id: string
  work_hours: number
  overtime_hours: number
  available_hours: number
}

export type Team = "Engineering" | "Design" | "Data" | "QA" | "Ops"

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface MemberUtilization {
  memberId: string
  memberName: string
  team: Team
  workHours: number
  overtimeHours: number
  availableHours: number
  utilizationPct: number
}

export interface OvertimeCell {
  memberId: string
  memberName: string
  week: string
  overtimeHours: number
}

// Box plot data per team: [min, q1, median, q3, max]
export interface BoxPlotItem {
  team: Team
  values: [number, number, number, number, number]
  outliers: Array<{ memberId: string; memberName: string; value: number }>
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  team: string | undefined
}
