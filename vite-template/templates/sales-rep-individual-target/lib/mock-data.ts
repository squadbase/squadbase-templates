import type {
  SalesRepMonthlyRow,
  KpiItem,
  RepAttainment,
  RepPaceRow,
  RepMonthlyTrend,
  RepPaceStatus,
  CurrentMonthMeta,
} from "@/types/sales-rep-individual-target"

// ── Seeded RNG ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(73)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Roster ──

interface RepProfile {
  name: string
  team: string
  baseQuota: number // monthly target in USD
  performance: number // multiplier vs quota over the long run
  variability: number // 0..1 — month-to-month variability
}

const REPS: RepProfile[] = [
  { name: "Alex Carter",     team: "east",    baseQuota: 120_000, performance: 1.06, variability: 0.18 },
  { name: "Brianna Lopez",   team: "east",    baseQuota: 110_000, performance: 0.96, variability: 0.22 },
  { name: "Chen Wei",        team: "west",    baseQuota: 130_000, performance: 1.12, variability: 0.14 },
  { name: "Diego Ramos",     team: "west",    baseQuota: 125_000, performance: 0.88, variability: 0.20 },
  { name: "Emma Johnson",    team: "central", baseQuota: 115_000, performance: 1.02, variability: 0.16 },
  { name: "Farah Khalid",    team: "central", baseQuota: 105_000, performance: 0.78, variability: 0.24 },
  { name: "Grace Lin",       team: "east",    baseQuota: 100_000, performance: 1.18, variability: 0.12 },
  { name: "Hideo Tanaka",    team: "west",    baseQuota: 140_000, performance: 0.94, variability: 0.18 },
]

// ── Calendar setup ──
// "Current month" is fixed to a deterministic date so the dashboard renders
// consistently. Reps' rolling history uses this anchor.

const BASE_DATE = new Date("2024-03-18") // mid-month for partial elapsed days

function monthKey(year: number, month: number): string {
  // month is 0-based
  const m = (month + 1).toString().padStart(2, "0")
  return `${year}-${m}-01`
}

function getMonthSequence(anchor: Date, monthsBack: number): string[] {
  const out: string[] = []
  for (let i = monthsBack; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    out.push(monthKey(d.getFullYear(), d.getMonth()))
  }
  return out
}

const MONTHS = getMonthSequence(BASE_DATE, 11) // 12 months including current

// ── Business-day counters (Mon-Fri) ──

function countBusinessDays(year: number, month: number, untilDay?: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = untilDay ? Math.min(untilDay, lastDay) : lastDay
  let count = 0
  for (let d = 1; d <= end; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6) count += 1
  }
  return count
}

const currentMonthYear = BASE_DATE.getFullYear()
const currentMonthMonth = BASE_DATE.getMonth()
const BUSINESS_DAYS_TOTAL = countBusinessDays(currentMonthYear, currentMonthMonth)
const BUSINESS_DAYS_ELAPSED = countBusinessDays(
  currentMonthYear,
  currentMonthMonth,
  BASE_DATE.getDate(),
)
const BUSINESS_DAYS_REMAINING = BUSINESS_DAYS_TOTAL - BUSINESS_DAYS_ELAPSED

export const currentMonthMeta: CurrentMonthMeta = {
  monthLabel: BASE_DATE.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  businessDaysTotal: BUSINESS_DAYS_TOTAL,
  businessDaysElapsed: BUSINESS_DAYS_ELAPSED,
  businessDaysRemaining: BUSINESS_DAYS_REMAINING,
}

// ── Raw dataset (sales_rep, target, actual, month) ──

function generateRows(): SalesRepMonthlyRow[] {
  const rows: SalesRepMonthlyRow[] = []
  const currentMonthKey = MONTHS[MONTHS.length - 1]
  const elapsedShare = BUSINESS_DAYS_ELAPSED / BUSINESS_DAYS_TOTAL

  for (const rep of REPS) {
    for (const month of MONTHS) {
      // Quota drifts slightly upward over the year (+5% by the end)
      const monthIdx = MONTHS.indexOf(month)
      const quotaTrend = 1 + monthIdx * 0.004
      const target = Math.round(rep.baseQuota * quotaTrend)

      // Actual is performance * target * monthly noise
      const noise = 1 - rep.variability + srand(0, rep.variability * 2)
      let actual = rep.performance * target * noise

      // If this is the current (in-progress) month, scale by elapsed share + small noise
      if (month === currentMonthKey) {
        const paceNoise = 0.85 + srand(0, 0.30)
        actual = rep.performance * target * elapsedShare * paceNoise
      }

      rows.push({
        sales_rep: rep.name,
        target,
        actual: Math.max(0, Math.round(actual)),
        month,
      })
    }
  }
  return rows
}

export const salesRepRows: SalesRepMonthlyRow[] = generateRows()

// ── Derived: current month attainment per rep ──

function getStatus(attainmentPct: number, paceDeltaPct: number): RepPaceStatus {
  if (paceDeltaPct >= 5 || attainmentPct >= 100) return "ahead"
  if (paceDeltaPct >= -5) return "on-track"
  return "behind"
}

function currentMonthRows(): SalesRepMonthlyRow[] {
  const currentMonth = MONTHS[MONTHS.length - 1]
  return salesRepRows.filter((r) => r.month === currentMonth)
}

function deriveRepAttainments(): RepAttainment[] {
  const elapsedShare = BUSINESS_DAYS_ELAPSED / BUSINESS_DAYS_TOTAL
  return currentMonthRows()
    .map((r) => {
      const attainmentPct = (r.actual / r.target) * 100
      const expectedToDatePct = elapsedShare * 100
      const paceDeltaPct = attainmentPct - expectedToDatePct
      return {
        salesRep: r.sales_rep,
        target: r.target,
        actual: r.actual,
        remaining: Math.max(0, r.target - r.actual),
        attainmentPct,
        status: getStatus(attainmentPct, paceDeltaPct),
      }
    })
    .sort((a, b) => b.attainmentPct - a.attainmentPct)
}

export const repAttainments: RepAttainment[] = deriveRepAttainments()

// ── Derived: pace judgement ──

function derivePaceRows(): RepPaceRow[] {
  return currentMonthRows()
    .map((r) => {
      const attainmentPct = (r.actual / r.target) * 100
      const actualDailyAvg =
        BUSINESS_DAYS_ELAPSED > 0 ? r.actual / BUSINESS_DAYS_ELAPSED : 0
      const requiredDailyAvg =
        BUSINESS_DAYS_REMAINING > 0
          ? Math.max(0, (r.target - r.actual) / BUSINESS_DAYS_REMAINING)
          : 0
      const denominatorDailyAvg =
        BUSINESS_DAYS_TOTAL > 0 ? r.target / BUSINESS_DAYS_TOTAL : 0
      const paceDeltaPct =
        denominatorDailyAvg > 0
          ? ((actualDailyAvg - denominatorDailyAvg) / denominatorDailyAvg) * 100
          : 0
      return {
        salesRep: r.sales_rep,
        target: r.target,
        actual: r.actual,
        remaining: Math.max(0, r.target - r.actual),
        attainmentPct,
        requiredDailyAvg,
        actualDailyAvg,
        paceDeltaPct,
        status: getStatus(attainmentPct, paceDeltaPct),
      }
    })
    .sort((a, b) => a.paceDeltaPct - b.paceDeltaPct)
}

export const repPaceRows: RepPaceRow[] = derivePaceRows()

// ── Derived: monthly trend per rep ──

function deriveMonthlyTrends(): RepMonthlyTrend[] {
  const elapsedShare = BUSINESS_DAYS_ELAPSED / BUSINESS_DAYS_TOTAL
  return REPS.map((rep) => {
    const repRows = salesRepRows.filter((r) => r.sales_rep === rep.name)
    const points = repRows.map((r) => ({
      month: r.month.slice(0, 7),
      target: r.target,
      actual: r.actual,
    }))
    const last = repRows[repRows.length - 1]
    const attainmentPct = (last.actual / last.target) * 100
    const paceDeltaPct = attainmentPct - elapsedShare * 100
    return {
      salesRep: rep.name,
      points,
      latestAttainmentPct: attainmentPct,
      status: getStatus(attainmentPct, paceDeltaPct),
    }
  }).sort((a, b) => b.latestAttainmentPct - a.latestAttainmentPct)
}

export const repMonthlyTrends: RepMonthlyTrend[] = deriveMonthlyTrends()

// ── Top-line KPIs (header summary) ──

function pct(now: number, prev: number): number {
  return prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10
}

function computeKpis(): KpiItem[] {
  const totalTarget = repAttainments.reduce((s, r) => s + r.target, 0)
  const totalActual = repAttainments.reduce((s, r) => s + r.actual, 0)
  const teamAttainment = (totalActual / totalTarget) * 100
  const totalRemaining = Math.max(0, totalTarget - totalActual)

  // Last full month team attainment for delta
  const prevMonth = MONTHS[MONTHS.length - 2]
  const prevRows = salesRepRows.filter((r) => r.month === prevMonth)
  const prevTarget = prevRows.reduce((s, r) => s + r.target, 0)
  const prevActual = prevRows.reduce((s, r) => s + r.actual, 0)
  const prevAttainment = (prevActual / prevTarget) * 100

  // Per-month team attainment trend for sparkline
  const trend: number[] = MONTHS.map((m) => {
    const rows = salesRepRows.filter((r) => r.month === m)
    const t = rows.reduce((s, r) => s + r.target, 0)
    const a = rows.reduce((s, r) => s + r.actual, 0)
    return t === 0 ? 0 : (a / t) * 100
  })

  // Per-month team actual / target sparklines
  const actualTrend: number[] = MONTHS.map((m) => {
    return salesRepRows.filter((r) => r.month === m).reduce((s, r) => s + r.actual, 0)
  })
  const targetTrend: number[] = MONTHS.map((m) => {
    return salesRepRows.filter((r) => r.month === m).reduce((s, r) => s + r.target, 0)
  })
  const remainingTrend: number[] = MONTHS.map((m) => {
    const rows = salesRepRows.filter((r) => r.month === m)
    const t = rows.reduce((s, r) => s + r.target, 0)
    const a = rows.reduce((s, r) => s + r.actual, 0)
    return Math.max(0, t - a)
  })

  return [
    {
      label: "Total Target",
      value: `$${Math.round(totalTarget).toLocaleString("en-US")}`,
      change: pct(totalTarget, prevTarget),
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: targetTrend,
    },
    {
      label: "Total Actual",
      value: `$${Math.round(totalActual).toLocaleString("en-US")}`,
      change: pct(totalActual, prevActual),
      changeLabel: "vs last month",
      positiveIsGood: true,
      sparklineData: actualTrend,
    },
    {
      label: "Attainment",
      value: `${teamAttainment.toFixed(1)}%`,
      change: Math.round((teamAttainment - prevAttainment) * 10) / 10,
      changeLabel: "pts vs last month",
      positiveIsGood: true,
      sparklineData: trend,
    },
    {
      label: "Remaining Target",
      value: `$${Math.round(totalRemaining).toLocaleString("en-US")}`,
      change: 0,
      changeLabel: `${repAttainments.filter((r) => r.attainmentPct < 100).length} reps below 100%`,
      positiveIsGood: false,
      sparklineData: remainingTrend,
    },
    {
      label: "Business Days Left",
      value: `${BUSINESS_DAYS_REMAINING} / ${BUSINESS_DAYS_TOTAL}`,
      change: 0,
      changeLabel: `Day ${BUSINESS_DAYS_ELAPSED} of ${BUSINESS_DAYS_TOTAL}`,
      positiveIsGood: false,
      sparklineData: [],
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const teamOptions = [
  { label: "All teams", value: "all" },
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "Central", value: "central" },
]

export const repOptions = [
  { label: "All reps", value: "all" },
  ...REPS.map((r) => ({ label: r.name, value: r.name })),
]
