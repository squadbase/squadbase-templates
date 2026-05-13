// ── Enum / Literal types ──

export type Department =
  | "engineering"
  | "sales"
  | "marketing"
  | "operations"
  | "support"
  | "corporate"

// ── 元データのスキーマ (チケットの「期待入力データ」に対応) ──
// member_id, work_date, work_hours, overtime_hours, paid_leave (+ department, night_shift)

export interface AttendanceRow {
  member_id: string
  work_date: string
  work_hours: number
  overtime_hours: number
  paid_leave: number
  department: Department
  night_shift: boolean
}

// ── 表示・派生型 ──

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

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  department: string | undefined
}
