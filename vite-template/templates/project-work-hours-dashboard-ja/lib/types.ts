// ── Raw data schema (チケットの期待入力データに準拠) ──
export interface WorkHoursRow {
  project_id: string
  member_id: string
  work_hours: number
  planned_hours: number
  week: string
}

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
  variance: number
  variancePct: number
  membersByHours: MemberHours[]
  members: Record<string, number>
}

export interface UtilizationPoint {
  week: string
  utilizationPct: number
  billableHours: number
  totalCapacityHours: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  project: string | undefined
  member: string | undefined
}
