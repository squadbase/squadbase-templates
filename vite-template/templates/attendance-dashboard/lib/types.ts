// ── Enum / Literal types ──

export type Department =
  | "engineering"
  | "sales"
  | "marketing"
  | "operations"
  | "support"
  | "corporate"

// ── Raw data schema (matches ticket's expected input data) ──
// member_id, work_date, work_hours, overtime_hours, paid_leave (+ department, night_shift for grouping)

export interface AttendanceRow {
  member_id: string
  work_date: string
  work_hours: number
  overtime_hours: number
  paid_leave: number
  department: Department
  night_shift: boolean
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

export interface MemberWorkHours {
  memberId: string
  memberName: string
  department: Department
  totalWorkHours: number
  overtimeHours: number
  paidLeaveDays: number
  nightShiftDays: number
}

export interface OvertimeTrendPoint {
  month: string
  totalOvertime: number
  averageOvertimePerMember: number
}

export interface DepartmentPaidLeave {
  department: Department
  departmentLabel: string
  grantedDays: number
  usedDays: number
  usageRatePct: number
  headcount: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  department: string | undefined
}
