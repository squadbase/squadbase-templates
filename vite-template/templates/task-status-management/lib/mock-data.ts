import type {
  TaskRow,
  TaskStatus,
  Priority,
  KpiItem,
  StatusSummaryItem,
  OwnerLoadItem,
  OverdueTaskRow,
} from "@/types/task-status-management"

// ── Helpers ──

const BASE_DATE = new Date("2024-06-10")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Unique seed for this template
const rng = seededRand(2027)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function dateOffset(daysOffset: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

// ── Owners and titles ──

const OWNERS = [
  "Alex Chen",
  "Bailey Park",
  "Casey Reed",
  "Dana Singh",
  "Evan Liu",
  "Farah Khan",
] as const

const TITLE_TEMPLATES = [
  "Draft Q3 launch plan",
  "Review vendor contract",
  "Onboard new hire",
  "Migrate legacy API",
  "Publish release notes",
  "Audit billing flow",
  "Refresh design system tokens",
  "Triage open incidents",
  "Sync with partner team",
  "Prepare board update",
  "Update privacy policy",
  "Run customer interviews",
  "Patch staging cluster",
  "Roll out feature flag",
  "Refactor reporting module",
  "Compile compliance evidence",
  "Resolve flaky tests",
  "Plan offsite agenda",
  "Backfill metrics pipeline",
  "Negotiate renewal terms",
  "Set up tracing for checkout",
  "Document oncall runbook",
  "Close out FY budget",
  "Review hiring loop",
] as const

const PRIORITIES: Priority[] = ["low", "medium", "high"]

// ── Generate tasks ──

const TOTAL_TASKS = 48

function generateTasks(): TaskRow[] {
  const tasks: TaskRow[] = []
  for (let i = 0; i < TOTAL_TASKS; i++) {
    const owner = pick(OWNERS)
    const title = pick(TITLE_TEMPLATES)
    const priority = pick(PRIORITIES)

    // Status distribution: ~25% not_started, ~45% in_progress, ~30% completed
    const r = rng()
    const status: TaskStatus =
      r < 0.25 ? "not_started" : r < 0.7 ? "in_progress" : "completed"

    // Due date: spread from 21 days ago to 30 days ahead
    const dueOffset = Math.round(srand(-21, 30))
    const due_date = dateOffset(dueOffset)

    // completed_at: only for completed tasks; near due_date
    let completed_at: string | null = null
    if (status === "completed") {
      // Completed slightly before or after due date, within last 28 days
      const completedOffset = Math.min(0, dueOffset + Math.round(srand(-3, 2)))
      completed_at = dateOffset(completedOffset)
    }

    tasks.push({
      task_id: `T-${String(1000 + i)}`,
      title,
      status,
      owner,
      due_date,
      completed_at,
      priority,
    })
  }
  return tasks
}

export const tasks: TaskRow[] = generateTasks()

// ── Status summary (Kanban) ──

const STATUS_LABELS_EN: Record<TaskStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
}

function isOverdue(task: TaskRow): boolean {
  if (task.status === "completed") return false
  return new Date(task.due_date) < BASE_DATE
}

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function computeStatusSummary(): StatusSummaryItem[] {
  const order: TaskStatus[] = ["not_started", "in_progress", "completed"]
  return order.map((status) => {
    const filtered = tasks.filter((t) => t.status === status)
    const overdueCount = filtered.filter(isOverdue).length
    return {
      status,
      label: STATUS_LABELS_EN[status],
      count: filtered.length,
      share: filtered.length / tasks.length,
      overdueCount,
    }
  })
}

export const statusSummary: StatusSummaryItem[] = computeStatusSummary()

// ── Per-owner load ──

function computeOwnerLoad(): OwnerLoadItem[] {
  return OWNERS.map((owner) => {
    const ownerTasks = tasks.filter((t) => t.owner === owner)
    const notStarted = ownerTasks.filter((t) => t.status === "not_started").length
    const inProgress = ownerTasks.filter((t) => t.status === "in_progress").length
    const completed = ownerTasks.filter((t) => t.status === "completed").length
    const overdue = ownerTasks.filter(isOverdue).length
    return {
      owner,
      notStarted,
      inProgress,
      completed,
      overdue,
      totalActive: notStarted + inProgress,
    }
  }).sort((a, b) => b.totalActive - a.totalActive)
}

export const ownerLoad: OwnerLoadItem[] = computeOwnerLoad()

// ── Overdue tasks ──

function computeOverdueTasks(): OverdueTaskRow[] {
  return tasks
    .filter(isOverdue)
    .map((t) => ({
      ...t,
      daysOverdue: daysBetween(BASE_DATE, new Date(t.due_date)),
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
}

export const overdueTasks: OverdueTaskRow[] = computeOverdueTasks()

// ── Header KPIs ──

function buildSparkline(seedShift: number, length = 14): number[] {
  const local = seededRand(2027 + seedShift)
  const points: number[] = []
  let v = 10 + local() * 6
  for (let i = 0; i < length; i++) {
    v += (local() - 0.45) * 2
    points.push(Math.max(0, Math.round(v)))
  }
  return points
}

function computeKpis(): KpiItem[] {
  const notStarted = statusSummary[0].count
  const inProgress = statusSummary[1].count
  const completed = statusSummary[2].count
  const overdue = overdueTasks.length
  const completionRate = (completed / tasks.length) * 100

  // Imagined trend vs prior period
  return [
    {
      label: "Active Tasks",
      value: String(notStarted + inProgress),
      change: 4.2,
      changeLabel: "vs last week",
      positiveIsGood: false,
      sparklineData: buildSparkline(1),
    },
    {
      label: "In Progress",
      value: String(inProgress),
      change: 2.1,
      changeLabel: "vs last week",
      positiveIsGood: true,
      sparklineData: buildSparkline(2),
    },
    {
      label: "Overdue",
      value: String(overdue),
      change: -3.5,
      changeLabel: "vs last week",
      positiveIsGood: false,
      sparklineData: buildSparkline(3),
    },
    {
      label: "Completion Rate",
      value: `${completionRate.toFixed(1)}%`,
      change: 5.8,
      changeLabel: "vs last week",
      positiveIsGood: true,
      sparklineData: buildSparkline(4),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const ownerOptions = [
  { label: "All owners", value: "all" },
  ...OWNERS.map((o) => ({ label: o, value: o })),
]

export const priorityOptions = [
  { label: "All priorities", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
]

export const statusLabels = STATUS_LABELS_EN
