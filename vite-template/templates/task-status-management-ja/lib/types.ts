// ── Enum / Literal types ──

export type TaskStatus = "not_started" | "in_progress" | "completed"

export type Priority = "low" | "medium" | "high"

// ── Raw data schema (チケットの「期待入力データ」と一致) ──
// task_id, status, owner, due_date, completed_at

export interface TaskRow {
  task_id: string
  title: string
  status: TaskStatus
  owner: string
  due_date: string
  completed_at: string | null
  priority: Priority
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

export interface StatusSummaryItem {
  status: TaskStatus
  label: string
  count: number
  share: number
  overdueCount: number
}

export interface OwnerLoadItem {
  owner: string
  notStarted: number
  inProgress: number
  completed: number
  overdue: number
  totalActive: number
}

export interface OverdueTaskRow extends TaskRow {
  daysOverdue: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  owner: string | undefined
  priority: string | undefined
}
