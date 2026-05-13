import type {
  MemberUtilization,
  OvertimeCell,
  BoxPlotItem,
  Team,
  KpiItem,
} from "@/types/member-utilization-monitor"

const BASE_DATE = new Date("2024-03-15")

function isoWeek(weeksAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - weeksAgo * 7)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(131)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function gaussian(mean: number, std: number): number {
  const u1 = Math.max(1e-6, rng())
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

// ── Members (24 across 5 teams) ──

const TEAM_PROFILE: Record<Team, { mean: number; std: number; size: number }> = {
  Engineering: { mean: 0.86, std: 0.06, size: 8 },
  Design: { mean: 0.78, std: 0.08, size: 4 },
  Data: { mean: 0.83, std: 0.07, size: 4 },
  QA: { mean: 0.74, std: 0.09, size: 4 },
  Ops: { mean: 0.7, std: 0.1, size: 4 },
}

const NAME_POOL = [
  "Alex Kim",
  "Brooke Tanaka",
  "Casey Yamada",
  "Devon Park",
  "Eli Sato",
  "Farah Wong",
  "Gen Mori",
  "Hayden Cruz",
  "Iris Patel",
  "Jamie Reyes",
  "Kai Nakamura",
  "Lana Ng",
  "Mila Hoshino",
  "Nate Sasaki",
  "Owen Chen",
  "Pat Yamamoto",
  "Quinn Bailey",
  "Riley Watanabe",
  "Sage Ohara",
  "Tia Fujita",
  "Uma Lin",
  "Vee Goto",
  "Wren Aoki",
  "Xiu Kobayashi",
]

function generateMembers(): MemberUtilization[] {
  const out: MemberUtilization[] = []
  let idx = 0
  for (const team of Object.keys(TEAM_PROFILE) as Team[]) {
    const profile = TEAM_PROFILE[team]
    for (let i = 0; i < profile.size; i++) {
      const utilization = Math.max(
        0.32,
        Math.min(1.18, gaussian(profile.mean, profile.std)),
      )
      const available = 160 // hours/month
      const work = Math.round(available * utilization)
      const overtime = Math.max(0, work - available + Math.round(srand(-4, 24)))
      out.push({
        memberId: `M-${String(idx + 1).padStart(3, "0")}`,
        memberName: NAME_POOL[idx % NAME_POOL.length],
        team,
        workHours: work,
        overtimeHours: overtime,
        availableHours: available,
        utilizationPct: Math.round(utilization * 1000) / 10,
      })
      idx += 1
    }
  }
  return out
}

export const members: MemberUtilization[] = generateMembers()

// ── Overtime heatmap (member × week, last 12 weeks) ──

function generateOvertime(): OvertimeCell[] {
  const cells: OvertimeCell[] = []
  for (const member of members) {
    const baseline = member.overtimeHours / 12 // distribute across weeks
    for (let w = 11; w >= 0; w--) {
      const noise = 0.5 + srand(0, 1.2)
      const overtime = Math.max(0, Math.round(baseline * noise))
      cells.push({
        memberId: member.memberId,
        memberName: member.memberName,
        week: isoWeek(w),
        overtimeHours: overtime,
      })
    }
  }
  return cells
}

export const overtimeCells: OvertimeCell[] = generateOvertime()

// ── Box plot by team ──

function generateBoxPlot(): BoxPlotItem[] {
  const teams = Array.from(new Set(members.map((m) => m.team)))
  return teams.map((team) => {
    const teamMembers = members.filter((m) => m.team === team)
    const sorted = teamMembers
      .map((m) => m.utilizationPct)
      .sort((a, b) => a - b)
    const q1Idx = Math.floor(sorted.length * 0.25)
    const medIdx = Math.floor(sorted.length * 0.5)
    const q3Idx = Math.floor(sorted.length * 0.75)
    const q1 = sorted[q1Idx]
    const med = sorted[medIdx]
    const q3 = sorted[q3Idx]
    const iqr = q3 - q1
    const fenceLow = q1 - 1.5 * iqr
    const fenceHigh = q3 + 1.5 * iqr
    const nonOutliers = sorted.filter(
      (v) => v >= fenceLow && v <= fenceHigh,
    )
    const min = nonOutliers[0] ?? sorted[0]
    const max = nonOutliers[nonOutliers.length - 1] ?? sorted[sorted.length - 1]
    const outliers = teamMembers
      .filter(
        (m) =>
          m.utilizationPct < fenceLow || m.utilizationPct > fenceHigh,
      )
      .map((m) => ({
        memberId: m.memberId,
        memberName: m.memberName,
        value: m.utilizationPct,
      }))
    return {
      team,
      values: [min, q1, med, q3, max],
      outliers,
    }
  })
}

export const boxPlot: BoxPlotItem[] = generateBoxPlot()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const avgUtil =
    members.reduce((s, m) => s + m.utilizationPct, 0) / members.length
  const totalOvertime = members.reduce((s, m) => s + m.overtimeHours, 0)
  const idleMembers = members.filter((m) => m.utilizationPct < 60).length
  const sorted = members.map((m) => m.utilizationPct).sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const range = max - min

  return [
    {
      label: "Avg Utilization",
      value: `${avgUtil.toFixed(1)}%`,
      change: Math.round((avgUtil - 80) * 10) / 10,
      changeLabel: "vs target 80%",
      positiveIsGood: true,
      sparklineData: members.map((m) => m.utilizationPct).slice(0, 12),
    },
    {
      label: "Overtime Hours",
      value: `${totalOvertime}h`,
      change: 6.2,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: members.map((m) => m.overtimeHours).slice(0, 12),
    },
    {
      label: "Idle Members",
      value: `${idleMembers}`,
      change: 0,
      changeLabel: "<60% utilization",
      positiveIsGood: false,
      sparklineData: members.map((m) => Math.max(0, 60 - m.utilizationPct)),
    },
    {
      label: "Utilization Spread",
      value: `${range.toFixed(1)}pp`,
      change: Math.round((range - 25) * 10) / 10,
      changeLabel: "min→max",
      positiveIsGood: false,
      sparklineData: sorted,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const teamOptions = [
  { label: "All teams", value: "all" },
  ...(Object.keys(TEAM_PROFILE) as Team[]).map((t) => ({ label: t, value: t })),
]

export const TEAM_LIST: Team[] = Object.keys(TEAM_PROFILE) as Team[]
