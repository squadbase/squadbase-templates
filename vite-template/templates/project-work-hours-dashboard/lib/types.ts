// ── Raw data schema (matches ticket's expected input data) ──
// project_id, member_id, work_hours, planned_hours, week

export interface WorkHoursRow {
  project_id: string
  member_id: string
  work_hours: number
  planned_hours: number
  week: string // ISO week date "YYYY-MM-DD"
}

// ── Display types ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface MemberHours {
  memberId: string
  memberName: string
  role: string
  hours: number
}

export interface ProjectHoursRow {
  projectId: string
  projectName: string
  totalActual: number
  totalPlanned: number
  variance: number // hours over (positive) / under (negative)
  variancePct: number
  membersByHours: MemberHours[]
  members: Record<string, number> // memberId -> hours (for stacked bar)
}

export interface UtilizationPoint {
  week: string
  utilizationPct: number
  billableHours: number
  totalCapacityHours: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  project: string | undefined
  member: string | undefined
}
