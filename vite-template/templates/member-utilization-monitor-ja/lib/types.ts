export interface UtilizationRow {
  member_id: string
  work_hours: number
  overtime_hours: number
  available_hours: number
}

export type Team = "エンジニアリング" | "デザイン" | "データ" | "QA" | "オペレーション"

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

export interface BoxPlotItem {
  team: Team
  values: [number, number, number, number, number]
  outliers: Array<{ memberId: string; memberName: string; value: number }>
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  team: string | undefined
}
