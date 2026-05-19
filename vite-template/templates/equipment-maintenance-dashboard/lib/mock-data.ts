import type {
  EquipmentCategory,
  EquipmentUptimeRow,
  FailureTrendPoint,
  DowntimeHeatmapCell,
  PreventiveMaintenanceTask,
  KpiItem,
  PmStatus,
} from "@/types/equipment-maintenance-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(347)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function dateStr(offsetDays: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

// ── Equipment master ──

interface EquipmentMaster {
  id: string
  name: string
  category: EquipmentCategory
  // Reliability factor: higher means more reliable (less downtime, fewer failures)
  reliability: number
  scheduledHours: number
}

const EQUIPMENT: EquipmentMaster[] = [
  { id: "PR-101", name: "Press Line A", category: "press", reliability: 0.94, scheduledHours: 720 },
  { id: "PR-102", name: "Press Line B", category: "press", reliability: 0.78, scheduledHours: 720 },
  { id: "CN-201", name: "CNC Mill 1", category: "cnc", reliability: 0.96, scheduledHours: 720 },
  { id: "CN-202", name: "CNC Mill 2", category: "cnc", reliability: 0.88, scheduledHours: 720 },
  { id: "RB-301", name: "Welding Robot 1", category: "robot", reliability: 0.92, scheduledHours: 720 },
  { id: "RB-302", name: "Welding Robot 2", category: "robot", reliability: 0.83, scheduledHours: 720 },
  { id: "AS-401", name: "Assembly Cell 1", category: "assembly", reliability: 0.9, scheduledHours: 720 },
  { id: "AS-402", name: "Assembly Cell 2", category: "assembly", reliability: 0.86, scheduledHours: 720 },
  { id: "PK-501", name: "Packaging Line", category: "packaging", reliability: 0.91, scheduledHours: 720 },
  { id: "PK-502", name: "Labelling Station", category: "packaging", reliability: 0.97, scheduledHours: 720 },
]

// ── Equipment uptime / MTBF / MTTR table (required section 1) ──

function computeEquipmentUptime(): EquipmentUptimeRow[] {
  return EQUIPMENT.map((eq) => {
    const failureBase = Math.max(0, (1 - eq.reliability) * 28 + srand(-2, 2))
    const failureCount = Math.max(0, Math.round(failureBase))
    // Each failure costs ~3-6 hours of repair on average
    const mttrHours = Math.round((3 + (1 - eq.reliability) * 12 + srand(0, 2)) * 10) / 10
    const downtimeHours = failureCount * mttrHours
    const uptimeHours = Math.max(0, eq.scheduledHours - downtimeHours)
    const uptimePct = Math.round((uptimeHours / eq.scheduledHours) * 1000) / 10
    // MTBF: scheduled - downtime divided by failure count (or scheduled if no failures)
    const mtbfHours =
      failureCount === 0
        ? eq.scheduledHours
        : Math.round((uptimeHours / failureCount) * 10) / 10
    return {
      equipment_id: eq.id,
      name: eq.name,
      category: eq.category,
      uptimeHours: Math.round(uptimeHours * 10) / 10,
      scheduledHours: eq.scheduledHours,
      uptimePct,
      failureCount,
      mtbfHours,
      mttrHours,
    }
  }).sort((a, b) => a.uptimePct - b.uptimePct)
}

export const equipmentUptime: EquipmentUptimeRow[] = computeEquipmentUptime()

// ── Monthly failure trend (required section 2) ──
// 12 months back through current month

function generateFailureTrend(): FailureTrendPoint[] {
  const months: FailureTrendPoint[] = []
  const baseDate = new Date(BASE_DATE)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1)
    const monthLabel = d.toISOString().slice(0, 7)
    // Seasonal pattern: winter months see slightly more failures (cold-start stress)
    const month = d.getMonth()
    const seasonal = month <= 1 || month === 11 ? 1.18 : month >= 6 && month <= 7 ? 1.08 : 1.0
    // Slight improvement trend over time (-1.5% per month) thanks to PM rollout
    const trend = 1 - (11 - i) * 0.015
    const failureCount = Math.max(
      4,
      Math.round(38 * seasonal * trend + srand(-6, 6)),
    )
    // MTTR slowly improving as well
    const mttrHours =
      Math.round((5.2 - (11 - i) * 0.05 + srand(-0.6, 0.6)) * 10) / 10
    months.push({
      month: monthLabel,
      failureCount,
      mttrHours,
    })
  }
  return months
}

export const failureTrend: FailureTrendPoint[] = generateFailureTrend()

// ── Equipment x week downtime heatmap (signature element) ──
// 12 weeks back through current week, one row per equipment

const HEATMAP_WEEKS = 12

function generateDowntimeHeatmap(): DowntimeHeatmapCell[] {
  const cells: DowntimeHeatmapCell[] = []
  EQUIPMENT.forEach((eq, rowIdx) => {
    for (let w = 0; w < HEATMAP_WEEKS; w++) {
      // Expected weekly downtime hours scaled by 1-reliability
      const baseDowntime = (1 - eq.reliability) * 16
      // Occasional spikes (15% chance of a "bad week")
      const spike = rng() < 0.15 ? srand(8, 24) : 0
      const downtime = Math.max(
        0,
        Math.round((baseDowntime + spike + srand(-2, 3)) * 10) / 10,
      )
      cells.push({
        equipmentRow: rowIdx,
        weekIndex: w,
        weekLabel: w === 0 ? "This wk" : `-${w}w`,
        equipmentName: eq.name,
        downtimeHours: downtime,
      })
    }
  })
  return cells
}

export const downtimeHeatmap: DowntimeHeatmapCell[] = generateDowntimeHeatmap()
export const heatmapEquipmentNames: string[] = EQUIPMENT.map((e) => e.name)

// ── Preventive maintenance schedule (required section 3) ──

interface PmSeed {
  taskId: string
  equipmentId: string
  taskName: string
  daysOffset: number // negative = overdue, 0 = due today, positive = upcoming
  assignee: string
}

const PM_SEEDS: PmSeed[] = [
  { taskId: "PM-2403-001", equipmentId: "PR-102", taskName: "Hydraulic oil change", daysOffset: -5, assignee: "Sato" },
  { taskId: "PM-2403-002", equipmentId: "RB-302", taskName: "Torch nozzle replacement", daysOffset: -2, assignee: "Tanaka" },
  { taskId: "PM-2403-003", equipmentId: "AS-402", taskName: "Conveyor belt tensioning", daysOffset: -1, assignee: "Kim" },
  { taskId: "PM-2403-004", equipmentId: "CN-202", taskName: "Spindle bearing inspection", daysOffset: 0, assignee: "Lee" },
  { taskId: "PM-2403-005", equipmentId: "PR-101", taskName: "Die alignment check", daysOffset: 1, assignee: "Mori" },
  { taskId: "PM-2403-006", equipmentId: "PK-501", taskName: "Sealing bar replacement", daysOffset: 3, assignee: "Sato" },
  { taskId: "PM-2403-007", equipmentId: "RB-301", taskName: "Robot calibration", daysOffset: 5, assignee: "Tanaka" },
  { taskId: "PM-2403-008", equipmentId: "CN-201", taskName: "Coolant filter swap", daysOffset: 7, assignee: "Lee" },
  { taskId: "PM-2403-009", equipmentId: "AS-401", taskName: "Pneumatic line leak test", daysOffset: 10, assignee: "Kim" },
  { taskId: "PM-2403-010", equipmentId: "PK-502", taskName: "Label sensor cleaning", daysOffset: 14, assignee: "Mori" },
]

function pmStatusFromOffset(daysOffset: number): PmStatus {
  if (daysOffset < 0) return "overdue"
  if (daysOffset === 0) return "due-today"
  if (daysOffset <= 7) return "upcoming"
  return "scheduled"
}

function generatePmTasks(): PreventiveMaintenanceTask[] {
  return PM_SEEDS.map((seed) => {
    const eq = EQUIPMENT.find((e) => e.id === seed.equipmentId)
    return {
      task_id: seed.taskId,
      equipment_id: seed.equipmentId,
      equipmentName: eq?.name ?? seed.equipmentId,
      taskName: seed.taskName,
      dueDate: dateStr(seed.daysOffset),
      daysOffset: seed.daysOffset,
      assignee: seed.assignee,
      status: pmStatusFromOffset(seed.daysOffset),
    }
  }).sort((a, b) => a.daysOffset - b.daysOffset)
}

export const preventiveMaintenanceTasks: PreventiveMaintenanceTask[] =
  generatePmTasks()

// ── Header KPIs ──

function computeKpis(): KpiItem[] {
  const totalScheduled = equipmentUptime.reduce((s, r) => s + r.scheduledHours, 0)
  const totalUptime = equipmentUptime.reduce((s, r) => s + r.uptimeHours, 0)
  const fleetUptimePct =
    Math.round((totalUptime / totalScheduled) * 1000) / 10

  const totalFailures = equipmentUptime.reduce((s, r) => s + r.failureCount, 0)
  const totalDowntime = equipmentUptime.reduce(
    (s, r) => s + (r.scheduledHours - r.uptimeHours),
    0,
  )
  const fleetMtbf =
    totalFailures === 0
      ? totalScheduled
      : Math.round((totalUptime / totalFailures) * 10) / 10
  const fleetMttr =
    totalFailures === 0
      ? 0
      : Math.round((totalDowntime / totalFailures) * 10) / 10

  const completedPm = preventiveMaintenanceTasks.filter(
    (t) => t.daysOffset < 0 && t.status !== "overdue",
  ).length
  const overduePm = preventiveMaintenanceTasks.filter(
    (t) => t.status === "overdue",
  ).length
  // PM completion rate over last 30 days — derive from monthly trend stand-in:
  // For mock purposes assume 28 tasks scheduled, 24 completed in last 30 days,
  // adjusted by overdue carry-over.
  const pmScheduledLast30 = 28
  const pmCompletedLast30 = Math.max(0, 24 - overduePm + completedPm)
  const pmCompletionPct =
    Math.round((pmCompletedLast30 / pmScheduledLast30) * 1000) / 10

  // Previous-period comparison values (mocked)
  const prevUptimePct = fleetUptimePct - 1.4
  const prevFailures = Math.round(totalFailures * 1.12)
  const prevMtbf = Math.max(1, fleetMtbf * 0.93)
  const prevMttr = fleetMttr * 1.08
  const prevPmCompletionPct = pmCompletionPct - 4.2

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Fleet Availability",
      value: `${fleetUptimePct.toFixed(1)}%`,
      change: Math.round((fleetUptimePct - prevUptimePct) * 10) / 10,
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: failureTrend.map((m) => 100 - m.failureCount * 0.15),
    },
    {
      label: "MTBF",
      value: `${fleetMtbf.toFixed(1)} h`,
      change: pct(fleetMtbf, prevMtbf),
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: failureTrend.map((m) =>
        m.failureCount === 0 ? 720 : 720 / m.failureCount,
      ),
    },
    {
      label: "MTTR",
      value: `${fleetMttr.toFixed(1)} h`,
      change: pct(fleetMttr, prevMttr),
      changeLabel: "vs last month",
      positiveIsGood: false,
      sparklineData: failureTrend.map((m) => m.mttrHours),
    },
    {
      label: "Failures (30d)",
      value: totalFailures.toLocaleString("en-US"),
      change: pct(totalFailures, prevFailures),
      changeLabel: "vs last month",
      positiveIsGood: false,
      sparklineData: failureTrend.map((m) => m.failureCount),
    },
    {
      label: "PM Completion",
      value: `${pmCompletionPct.toFixed(1)}%`,
      change: Math.round((pmCompletionPct - prevPmCompletionPct) * 10) / 10,
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: failureTrend.map(
        (_, i) => 78 + i * 1.2 + (i % 3 === 0 ? 1.8 : 0),
      ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const categoryOptions = [
  { label: "All categories", value: "all" },
  { label: "Press", value: "press" },
  { label: "CNC", value: "cnc" },
  { label: "Robot", value: "robot" },
  { label: "Assembly", value: "assembly" },
  { label: "Packaging", value: "packaging" },
]

export const lineOptions = [
  { label: "All lines", value: "all" },
  { label: "Line A", value: "line-a" },
  { label: "Line B", value: "line-b" },
  { label: "Line C", value: "line-c" },
]
