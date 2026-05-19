// ── Enum / Literal types ──

export type EquipmentCategory =
  | "press"
  | "cnc"
  | "robot"
  | "assembly"
  | "packaging"

export type PmStatus = "overdue" | "due-today" | "upcoming" | "scheduled"

// ── Raw data schema (matches ticket's expected input data) ──
// equipment_id, date, uptime_hours, failure_count, maintenance_done

export interface DailyEquipmentLog {
  equipment_id: string
  date: string
  uptime_hours: number
  failure_count: number
  maintenance_done: boolean
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

export interface EquipmentUptimeRow {
  equipment_id: string
  name: string
  category: EquipmentCategory
  uptimeHours: number
  scheduledHours: number
  uptimePct: number
  failureCount: number
  mtbfHours: number
  mttrHours: number
}

export interface FailureTrendPoint {
  month: string
  failureCount: number
  mttrHours: number
}

// Equipment x week downtime heatmap (signature element)
export interface DowntimeHeatmapCell {
  equipmentRow: number
  weekIndex: number
  weekLabel: string
  equipmentName: string
  downtimeHours: number
}

export interface PreventiveMaintenanceTask {
  task_id: string
  equipment_id: string
  equipmentName: string
  taskName: string
  dueDate: string
  daysOffset: number
  assignee: string
  status: PmStatus
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  category: string | undefined
  line: string | undefined
}
