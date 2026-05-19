import type {
  DefectRow,
  ParetoPoint,
  HeatmapCell,
  MonthlyTrendPoint,
  SummaryKpi,
  LineOption,
} from "@/types/quality-defect-tracking"

// ── Helpers ──

const BASE_DATE = new Date("2024-06-30")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Slug-unique seed for quality-defect-tracking
const rng = seededRand(4271)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function isoMonth(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// ── Defect dictionary ──

const CAUSES = [
  "Solder bridge",
  "Misalignment",
  "Surface scratch",
  "Component missing",
  "Cold solder",
  "Dimension out of spec",
  "Contamination",
  "Wrong polarity",
] as const

const CAUSE_WEIGHT = [0.32, 0.21, 0.14, 0.11, 0.08, 0.06, 0.05, 0.03]

const LINES = ["Line A", "Line B", "Line C", "Line D"] as const

// ── Raw rows (12 months synthetic stream) ──

function generateRows(): DefectRow[] {
  const rows: DefectRow[] = []
  for (let m = 11; m >= 0; m--) {
    const base = 380 + Math.round(srand(-40, 40)) + (m === 1 ? 95 : 0)
    for (let i = 0; i < base; i++) {
      // Sample cause according to weight
      const r = rng()
      let acc = 0
      let causeIdx = 0
      for (let c = 0; c < CAUSE_WEIGHT.length; c++) {
        acc += CAUSE_WEIGHT[c]
        if (r <= acc) {
          causeIdx = c
          break
        }
      }
      // Bias certain lines toward certain causes
      const lineIdx = Math.min(
        LINES.length - 1,
        Math.floor((causeIdx + Math.floor(srand(0, 2))) % LINES.length),
      )
      const dayOffset = Math.floor(srand(0, 28))
      const occurred = new Date(BASE_DATE)
      occurred.setMonth(occurred.getMonth() - m)
      occurred.setDate(1 + dayOffset)
      rows.push({
        defect_type: CAUSES[causeIdx],
        line_id: LINES[lineIdx],
        occurred_at: occurred.toISOString().slice(0, 10),
        qty: 1,
      })
    }
  }
  return rows
}

const rows: DefectRow[] = generateRows()

// ── Pareto of defect causes (current month) ──

function generatePareto(): ParetoPoint[] {
  const currentMonth = isoMonth(0)
  const totals = new Map<string, number>()
  for (const r of rows) {
    if (r.occurred_at.startsWith(currentMonth)) {
      totals.set(r.defect_type, (totals.get(r.defect_type) ?? 0) + r.qty)
    }
  }
  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  const grand = sorted.reduce((s, [, v]) => s + v, 0)
  let cum = 0
  return sorted.map(([cause, qty]) => {
    cum += qty
    return {
      cause,
      qty,
      cumulativeShare: grand === 0 ? 0 : (cum / grand) * 100,
    }
  })
}

export const defectPareto: ParetoPoint[] = generatePareto()

// ── Line × Cause heatmap (current month) ──

function generateHeatmap(): HeatmapCell[] {
  const currentMonth = isoMonth(0)
  const cells = new Map<string, number>()
  for (const r of rows) {
    if (r.occurred_at.startsWith(currentMonth)) {
      const key = `${r.line_id}|${r.defect_type}`
      cells.set(key, (cells.get(key) ?? 0) + r.qty)
    }
  }
  const result: HeatmapCell[] = []
  for (const line of LINES) {
    for (const cause of CAUSES) {
      result.push({
        line,
        cause,
        qty: cells.get(`${line}|${cause}`) ?? 0,
      })
    }
  }
  return result
}

export const lineCauseHeatmap: HeatmapCell[] = generateHeatmap()

// ── Monthly trend with control limits ──

function generateMonthlyTrend(): MonthlyTrendPoint[] {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const m = r.occurred_at.slice(0, 7)
    counts.set(m, (counts.get(m) ?? 0) + r.qty)
  }
  const months: { month: string; qty: number }[] = []
  for (let m = 11; m >= 0; m--) {
    const label = isoMonth(m)
    months.push({ month: label, qty: counts.get(label) ?? 0 })
  }
  const mean =
    months.reduce((s, p) => s + p.qty, 0) / Math.max(1, months.length)
  const variance =
    months.reduce((s, p) => s + (p.qty - mean) ** 2, 0) /
    Math.max(1, months.length)
  const sd = Math.sqrt(variance)
  const ucl = Math.round(mean + 3 * sd)
  const lcl = Math.max(0, Math.round(mean - 3 * sd))
  return months.map((p) => ({
    month: p.month,
    qty: p.qty,
    ucl,
    lcl,
    mean: Math.round(mean),
  }))
}

export const monthlyTrend: MonthlyTrendPoint[] = generateMonthlyTrend()

// ── Production volume per month (for defect-rate calc) ──

const MONTHLY_INSPECTED = 42_500

function defectRateForMonth(monthIdx: number): number {
  const target = isoMonth(monthIdx)
  const point = monthlyTrend.find((p) => p.month === target)
  if (!point) return 0
  return (point.qty / MONTHLY_INSPECTED) * 100
}

// ── Recurrence: defect types occurring in 2+ consecutive recent months ──

function computeRecurrenceRate(): number {
  const recentMonths = [isoMonth(2), isoMonth(1), isoMonth(0)]
  const presence = new Map<string, Set<string>>()
  for (const r of rows) {
    const m = r.occurred_at.slice(0, 7)
    if (!recentMonths.includes(m)) continue
    if (!presence.has(r.defect_type)) presence.set(r.defect_type, new Set())
    presence.get(r.defect_type)!.add(m)
  }
  const recurring = Array.from(presence.values()).filter(
    (s) => s.size >= 2,
  ).length
  const total = presence.size
  return total === 0 ? 0 : (recurring / total) * 100
}

// ── Summary KPIs (header) ──

function computeKpis(): SummaryKpi[] {
  const current = defectRateForMonth(0)
  const previous = defectRateForMonth(1)
  const delta = current - previous

  const totalCount = monthlyTrend[monthlyTrend.length - 1]?.qty ?? 0
  const prevCount = monthlyTrend[monthlyTrend.length - 2]?.qty ?? 0
  const countDelta =
    prevCount === 0 ? 0 : ((totalCount - prevCount) / prevCount) * 100

  const topCause = defectPareto[0]
  const topShare = topCause
    ? (topCause.qty / defectPareto.reduce((s, p) => s + p.qty, 0)) * 100
    : 0

  const recurrence = computeRecurrenceRate()

  return [
    {
      id: "defect-rate",
      label: "Defect Rate",
      value: `${current.toFixed(2)}%`,
      helper: `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}pt vs prev month`,
      sentiment: delta <= 0 ? "positive" : delta <= 0.05 ? "neutral" : "attention",
    },
    {
      id: "defect-count",
      label: "Defect Count",
      value: totalCount.toLocaleString("en-US"),
      helper: `${countDelta >= 0 ? "+" : ""}${countDelta.toFixed(1)}% vs prev month`,
      sentiment:
        countDelta <= 0 ? "positive" : countDelta <= 5 ? "neutral" : "attention",
    },
    {
      id: "top-cause",
      label: "Top Defect Cause",
      value: topCause?.cause ?? "—",
      helper: topCause ? `${topShare.toFixed(1)}% of this month` : "No data",
      sentiment: "neutral",
    },
    {
      id: "recurrence-rate",
      label: "Recurrence Rate",
      value: `${recurrence.toFixed(0)}%`,
      helper: "Causes seen in 2+ recent months",
      sentiment:
        recurrence < 30 ? "positive" : recurrence < 55 ? "neutral" : "attention",
    },
  ]
}

export const summaryKpis: SummaryKpi[] = computeKpis()

// ── Filter options ──

export const lineOptions: LineOption[] = [
  { label: "All lines", value: "all" },
  ...LINES.map((l) => ({ label: l, value: l })),
]

// ── Top causes for derived insights ──

export function topCauses(limit = 5): ParetoPoint[] {
  return defectPareto.slice(0, limit)
}
