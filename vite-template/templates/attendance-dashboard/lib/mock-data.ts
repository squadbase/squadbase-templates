import type {
  KpiItem,
  MemberWorkHours,
  OvertimeTrendPoint,
  DepartmentPaidLeave,
  Department,
} from "@/types/attendance-dashboard"

// ── Seeded RNG (deterministic for snapshots) ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(31)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Constants ──

const BASE_DATE = new Date("2024-03-31")

// Statutory monthly working hours used as the baseline
const STANDARD_MONTHLY_HOURS = 160

// Overtime warning threshold (Japan: 法定 45h / 月 を参考に、80h は過労ライン)
export const OVERTIME_CAUTION = 45
export const OVERTIME_WARNING = 80

const DEPARTMENTS: { id: Department; label: string; size: number }[] = [
  { id: "engineering", label: "Engineering", size: 6 },
  { id: "sales", label: "Sales", size: 4 },
  { id: "marketing", label: "Marketing", size: 3 },
  { id: "operations", label: "Operations", size: 3 },
  { id: "support", label: "Support", size: 3 },
  { id: "corporate", label: "Corporate", size: 2 },
]

const FIRST_NAMES = [
  "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Riley", "Casey", "Quinn",
  "Avery", "Drew", "Reese", "Skyler", "Hayden", "Cameron", "Parker", "Rowan",
  "Emerson", "Finley", "Sage", "Blake", "Logan",
]
const LAST_NAMES = [
  "Garcia", "Johnson", "Smith", "Brown", "Wilson", "Davis", "Miller",
  "Anderson", "Thompson", "Martinez", "Robinson", "Clark", "Lewis", "Walker",
  "Hall", "Young", "King", "Wright", "Lopez", "Hill", "Scott",
]

// ── Member work-hours ranking (signature element) ──

function generateMembers(): MemberWorkHours[] {
  const members: MemberWorkHours[] = []
  let memberCounter = 0
  for (const dept of DEPARTMENTS) {
    for (let i = 0; i < dept.size; i++) {
      const id = `M${(memberCounter + 1).toString().padStart(3, "0")}`
      const memberName = `${FIRST_NAMES[memberCounter % FIRST_NAMES.length]} ${LAST_NAMES[(memberCounter * 3) % LAST_NAMES.length]}`

      // Department flavor: engineering and sales tend to longer hours
      const deptBias =
        dept.id === "engineering"
          ? 12
          : dept.id === "sales"
            ? 8
            : dept.id === "operations"
              ? 4
              : dept.id === "support"
                ? 2
                : 0
      const individualNoise = srand(-8, 16)
      const overtimeHours = Math.max(
        0,
        Math.round((deptBias + individualNoise) * 10) / 10,
      )
      const paidLeaveDays = Math.round(srand(0.5, 2.4) * 10) / 10
      const totalWorkHours =
        Math.round(
          (STANDARD_MONTHLY_HOURS + overtimeHours - paidLeaveDays * 8) * 10,
        ) / 10

      // ~12% of population takes any night shift in the period
      const nightShiftDays = rng() < 0.12 ? Math.ceil(srand(1, 5)) : 0

      members.push({
        memberId: id,
        memberName,
        department: dept.id,
        totalWorkHours,
        overtimeHours,
        paidLeaveDays,
        nightShiftDays,
      })
      memberCounter += 1
    }
  }
  // Sort descending by total work hours so ranking is meaningful
  return members.sort((a, b) => b.totalWorkHours - a.totalWorkHours)
}

export const members: MemberWorkHours[] = generateMembers()

// ── Overtime trend (12 months) ──

function monthLabel(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toISOString().slice(0, 7) // YYYY-MM
}

function generateOvertimeTrend(): OvertimeTrendPoint[] {
  const points: OvertimeTrendPoint[] = []
  const totalHeadcount = members.length
  for (let i = 11; i >= 0; i--) {
    // Seasonality: peaks in Q1 month-end, dips in summer
    const month = new Date(BASE_DATE)
    month.setMonth(month.getMonth() - i)
    const m = month.getMonth() // 0..11
    const seasonal =
      m === 2 || m === 11
        ? 1.18 // Mar / Dec — closing months
        : m === 7
          ? 0.78 // Aug — holiday lull
          : 1.0
    const averageOvertimePerMember = Math.round(
      (8 + srand(-1.5, 2.5)) * seasonal * 10,
    ) / 10
    const totalOvertime = Math.round(
      averageOvertimePerMember * totalHeadcount * 10,
    ) / 10
    points.push({
      month: monthLabel(i),
      totalOvertime,
      averageOvertimePerMember,
    })
  }
  return points
}

export const overtimeTrend: OvertimeTrendPoint[] = generateOvertimeTrend()

// ── Paid leave usage by department ──

function generatePaidLeaveByDept(): DepartmentPaidLeave[] {
  return DEPARTMENTS.map((dept) => {
    const headcount = dept.size
    const grantedPerPerson = 18 // 年次有給付与日数の想定
    const grantedDays = grantedPerPerson * headcount
    // Engineering/Operations tend to hold back on PTO in this sample
    const usagePctBias =
      dept.id === "marketing"
        ? 0.78
        : dept.id === "corporate"
          ? 0.74
          : dept.id === "sales"
            ? 0.62
            : dept.id === "support"
              ? 0.58
              : dept.id === "engineering"
                ? 0.52
                : 0.48
    const noise = srand(-0.07, 0.07)
    const usageRate = Math.min(0.95, Math.max(0.3, usagePctBias + noise))
    const usedDays = Math.round(grantedDays * usageRate * 10) / 10
    return {
      department: dept.id,
      departmentLabel: dept.label,
      grantedDays,
      usedDays,
      usageRatePct: Math.round(usageRate * 1000) / 10,
      headcount,
    }
  })
}

export const paidLeaveByDept: DepartmentPaidLeave[] = generatePaidLeaveByDept()

// ── Header KPIs (4 cards) ──

function computeKpis(): KpiItem[] {
  const headcount = members.length
  const avgWorkHours =
    members.reduce((s, m) => s + m.totalWorkHours, 0) / headcount
  const totalOvertime = members.reduce((s, m) => s + m.overtimeHours, 0)
  const nightShiftMembers = members.filter((m) => m.nightShiftDays > 0).length

  const totalGranted = paidLeaveByDept.reduce((s, d) => s + d.grantedDays, 0)
  const totalUsed = paidLeaveByDept.reduce((s, d) => s + d.usedDays, 0)
  const paidLeaveRate = Math.round((totalUsed / totalGranted) * 1000) / 10

  const last = overtimeTrend[overtimeTrend.length - 1]
  const prev = overtimeTrend[overtimeTrend.length - 2]
  const pct = (now: number, p: number) =>
    p === 0 ? 0 : Math.round(((now - p) / p) * 1000) / 10

  return [
    {
      label: "Average Work Hours",
      value: `${avgWorkHours.toFixed(1)} h`,
      change: pct(avgWorkHours, STANDARD_MONTHLY_HOURS),
      changeLabel: "vs standard",
      positiveIsGood: false,
      sparklineData: overtimeTrend.map(
        (p) => STANDARD_MONTHLY_HOURS + p.averageOvertimePerMember,
      ),
    },
    {
      label: "Total Overtime",
      value: `${Math.round(totalOvertime).toLocaleString("en-US")} h`,
      change: pct(last.totalOvertime, prev.totalOvertime),
      changeLabel: "vs last month",
      positiveIsGood: false,
      sparklineData: overtimeTrend.map((p) => p.totalOvertime),
    },
    {
      label: "Paid Leave Usage Rate",
      value: `${paidLeaveRate.toFixed(1)}%`,
      change: paidLeaveRate - 70,
      changeLabel: "vs 70% target",
      positiveIsGood: true,
      sparklineData: paidLeaveByDept.map((d) => d.usageRatePct),
    },
    {
      label: "Night-shift Members",
      value: `${nightShiftMembers}`,
      change: nightShiftMembers,
      changeLabel: "this period",
      positiveIsGood: false,
      sparklineData: members.map((m) => m.nightShiftDays),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const departmentOptions = [
  { label: "All departments", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d.label, value: d.id })),
]
