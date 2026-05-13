import type {
  Department,
  DeptBudgetActual,
  CumulativePoint,
  AchievementRow,
  KpiItem,
} from "@/types/budget-vs-actual-by-department"

const BASE_DATE = new Date("2024-03-15")
const MONTH_OF_FY = 3 // current month within fiscal year

function ym(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(197)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

const DEPARTMENTS: Department[] = [
  "Sales",
  "Marketing",
  "Engineering",
  "Operations",
  "Customer Success",
  "Finance",
  "HR",
]

const DEPT_PROFILE: Record<
  Department,
  { yearBudget: number; varianceBias: number }
> = {
  Sales: { yearBudget: 12_000_000, varianceBias: 0.08 },
  Marketing: { yearBudget: 3_600_000, varianceBias: -0.12 },
  Engineering: { yearBudget: 8_400_000, varianceBias: 0.02 },
  Operations: { yearBudget: 4_200_000, varianceBias: -0.04 },
  "Customer Success": { yearBudget: 2_400_000, varianceBias: 0.15 },
  Finance: { yearBudget: 1_600_000, varianceBias: -0.02 },
  HR: { yearBudget: 1_200_000, varianceBias: 0.06 },
}

// ── Per-department year totals ──

function generateDeptTotals(): DeptBudgetActual[] {
  return DEPARTMENTS.map((dept) => {
    const profile = DEPT_PROFILE[dept]
    const monthsElapsed = MONTH_OF_FY
    const monthlyBudget = profile.yearBudget / 12
    const expectedRunRate = monthlyBudget * monthsElapsed
    const variance = profile.varianceBias + srand(-0.04, 0.05)
    const yearActualToDate = Math.round(expectedRunRate * (1 + variance))
    const achievementPct = (yearActualToDate / expectedRunRate) * 100
    const dailyAvg = yearActualToDate / monthsElapsed
    const paceForecast = Math.round(dailyAvg * 12)
    return {
      department: dept,
      yearBudget: profile.yearBudget,
      yearActualToDate,
      achievementPct: Math.round(achievementPct * 10) / 10,
      monthsElapsed,
      expectedRunRate: Math.round(expectedRunRate),
      paceForecast,
      forecastVsBudget:
        Math.round(((paceForecast - profile.yearBudget) / profile.yearBudget) * 1000) /
        10,
    }
  })
}

export const deptTotals: DeptBudgetActual[] = generateDeptTotals()

// ── Cumulative (company-wide last 12 months) ──

function generateCumulative(): CumulativePoint[] {
  const totalYearBudget = DEPARTMENTS.reduce(
    (s, d) => s + DEPT_PROFILE[d].yearBudget,
    0,
  )
  const monthlyBudget = totalYearBudget / 12
  let budgetCum = 0
  let actualCum = 0
  const points: CumulativePoint[] = []
  for (let i = 11; i >= 0; i--) {
    const seasonal = 1 + Math.sin(((11 - i) / 12) * Math.PI * 2) * 0.06
    const monthBudget = Math.round(monthlyBudget * seasonal)
    const noise = 0.93 + srand(0, 0.16)
    const monthActual = Math.round(monthBudget * noise)
    budgetCum += monthBudget
    actualCum += monthActual
    points.push({
      month: ym(i),
      budgetCum,
      actualCum,
      monthBudget,
      monthActual,
    })
  }
  return points
}

export const cumulative: CumulativePoint[] = generateCumulative()

// ── Achievement ranking ──

function generateRanking(): AchievementRow[] {
  return [...deptTotals]
    .sort((a, b) => b.achievementPct - a.achievementPct)
    .map((d, i) => ({
      rank: i + 1,
      department: d.department,
      yearBudget: d.yearBudget,
      yearActualToDate: d.yearActualToDate,
      achievementPct: d.achievementPct,
      paceForecast: d.paceForecast,
      forecastVsBudget: d.forecastVsBudget,
    }))
}

export const ranking: AchievementRow[] = generateRanking()

// ── KPIs (company-wide) ──

function computeKpis(): KpiItem[] {
  const totalBudget = deptTotals.reduce((s, d) => s + d.yearBudget, 0)
  const totalActual = deptTotals.reduce((s, d) => s + d.yearActualToDate, 0)
  const totalExpected = deptTotals.reduce((s, d) => s + d.expectedRunRate, 0)
  const achievementPct = (totalActual / totalExpected) * 100
  const totalForecast = deptTotals.reduce((s, d) => s + d.paceForecast, 0)
  const forecastVsBudget = ((totalForecast - totalBudget) / totalBudget) * 100
  const cumulativeProgress = (totalActual / totalBudget) * 100

  return [
    {
      label: "Year Budget",
      value: `$${(totalBudget / 1_000_000).toFixed(2)}M`,
      change: 0,
      changeLabel: "annual plan",
      positiveIsGood: true,
      sparklineData: cumulative.map((c) => c.budgetCum),
    },
    {
      label: "YTD Actual",
      value: `$${(totalActual / 1_000_000).toFixed(2)}M`,
      change: Math.round(((totalActual - totalExpected) / totalExpected) * 1000) / 10,
      changeLabel: "vs expected pace",
      positiveIsGood: true,
      sparklineData: cumulative.map((c) => c.actualCum),
    },
    {
      label: "Achievement vs Pace",
      value: `${achievementPct.toFixed(1)}%`,
      change: Math.round((achievementPct - 100) * 10) / 10,
      changeLabel: "vs 100%",
      positiveIsGood: true,
      sparklineData: cumulative.map((c) =>
        c.budgetCum === 0 ? 0 : (c.actualCum / c.budgetCum) * 100,
      ),
    },
    {
      label: "YTD Progress",
      value: `${cumulativeProgress.toFixed(1)}%`,
      change: 0,
      changeLabel: "of annual",
      positiveIsGood: true,
      sparklineData: cumulative.map((c) =>
        Math.round((c.actualCum / totalBudget) * 1000) / 10,
      ),
    },
    {
      label: "Year-End Forecast",
      value: `$${(totalForecast / 1_000_000).toFixed(2)}M`,
      change: Math.round(forecastVsBudget * 10) / 10,
      changeLabel: "vs budget",
      positiveIsGood: true,
      sparklineData: deptTotals.map((d) => d.paceForecast),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const departmentOptions = [
  { label: "All departments", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
]
