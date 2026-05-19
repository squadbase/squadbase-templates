import type {
  ProjectHoursRow,
  UtilizationPoint,
  KpiItem,
  MemberHours,
} from "@/types/project-work-hours-dashboard"

const BASE_DATE = new Date("2024-03-15")

function isoWeek(weeksAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - weeksAgo * 7)
  // Anchor to Monday of that week
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

const rng = seededRand(101)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Members (10 people) ──

const MEMBERS: { id: string; name: string; role: string }[] = [
  { id: "M-001", name: "Alex Kim", role: "PM" },
  { id: "M-002", name: "Brooke Tanaka", role: "Senior Engineer" },
  { id: "M-003", name: "Casey Yamada", role: "Engineer" },
  { id: "M-004", name: "Devon Park", role: "Engineer" },
  { id: "M-005", name: "Eli Sato", role: "Designer" },
  { id: "M-006", name: "Farah Wong", role: "Designer" },
  { id: "M-007", name: "Gen Mori", role: "Data Analyst" },
  { id: "M-008", name: "Hayden Cruz", role: "QA" },
  { id: "M-009", name: "Iris Patel", role: "DevOps" },
  { id: "M-010", name: "Jamie Reyes", role: "Engineer" },
]

// ── Projects (8) with member allocations ──

const PROJECTS: {
  id: string
  name: string
  plannedTotal: number
  varianceBias: number // -1..1: <0 under budget, >0 over
}[] = [
  { id: "PRJ-A1", name: "Customer Portal Revamp", plannedTotal: 720, varianceBias: 0.12 },
  { id: "PRJ-A2", name: "Pricing Engine v2", plannedTotal: 640, varianceBias: 0.18 },
  { id: "PRJ-A3", name: "Mobile App Launch", plannedTotal: 880, varianceBias: -0.04 },
  { id: "PRJ-B1", name: "Data Pipeline Migration", plannedTotal: 540, varianceBias: 0.07 },
  { id: "PRJ-B2", name: "Analytics Modernization", plannedTotal: 460, varianceBias: -0.09 },
  { id: "PRJ-C1", name: "Vendor Integrations", plannedTotal: 380, varianceBias: 0.22 },
  { id: "PRJ-C2", name: "Internal Tools", plannedTotal: 320, varianceBias: -0.12 },
  { id: "PRJ-D1", name: "Compliance Audit Prep", plannedTotal: 260, varianceBias: 0.02 },
]

function generateProjects(): ProjectHoursRow[] {
  return PROJECTS.map((p) => {
    // Allocate planned hours roughly evenly among 4-6 members per project
    const memberCount = 4 + Math.floor(srand(0, 3))
    const memberSlice = [...MEMBERS]
      .sort(() => rng() - 0.5)
      .slice(0, memberCount)
    const members: Record<string, number> = {}
    let allocated = 0
    for (let i = 0; i < memberSlice.length; i++) {
      const remaining = p.plannedTotal - allocated
      const isLast = i === memberSlice.length - 1
      const share = isLast
        ? remaining
        : Math.round(remaining * (0.45 - i * 0.06) * (0.85 + srand(0, 0.3)))
      members[memberSlice[i].id] = Math.max(20, share)
      allocated += members[memberSlice[i].id]
    }
    const totalPlanned = Object.values(members).reduce((s, v) => s + v, 0)
    // Apply variance bias for actual hours
    const variancePct = p.varianceBias * 100 + srand(-2, 4)
    // Scale actuals per member proportionally
    const actualByMember: Record<string, number> = {}
    for (const [id, hours] of Object.entries(members)) {
      const memberVarianceNoise = 1 + srand(-0.04, 0.06)
      actualByMember[id] = Math.round(
        hours * (1 + variancePct / 100) * memberVarianceNoise,
      )
    }
    const totalActualAdjusted = Object.values(actualByMember).reduce(
      (s, v) => s + v,
      0,
    )

    const membersByHours: MemberHours[] = memberSlice
      .map((m) => ({
        memberId: m.id,
        memberName: m.name,
        role: m.role,
        hours: actualByMember[m.id],
      }))
      .sort((a, b) => b.hours - a.hours)

    return {
      projectId: p.id,
      projectName: p.name,
      totalActual: totalActualAdjusted,
      totalPlanned,
      variance: totalActualAdjusted - totalPlanned,
      variancePct: Math.round(((totalActualAdjusted - totalPlanned) / totalPlanned) * 1000) / 10,
      membersByHours,
      members: actualByMember,
    }
  }).sort((a, b) => b.totalActual - a.totalActual)
}

export const projectHours: ProjectHoursRow[] = generateProjects()

// ── Member list for stacked bar (sorted by total hours) ──

function getMemberOrder() {
  const totals: Record<string, number> = {}
  for (const p of projectHours) {
    for (const [id, hours] of Object.entries(p.members)) {
      totals[id] = (totals[id] || 0) + hours
    }
  }
  return MEMBERS.filter((m) => totals[m.id] > 0).sort(
    (a, b) => (totals[b.id] || 0) - (totals[a.id] || 0),
  )
}

export const orderedMembers = getMemberOrder()

// ── Weekly utilization trend (12 weeks) ──

function generateUtilization(): UtilizationPoint[] {
  const points: UtilizationPoint[] = []
  const capacityPerMember = 40 // hours/week
  const totalCapacity = MEMBERS.length * capacityPerMember
  for (let i = 11; i >= 0; i--) {
    const noise = 0.85 + srand(0, 0.18)
    const utilizationPct = Math.min(98, 72 + (11 - i) * 1.2) * noise
    const billable = Math.round((utilizationPct / 100) * totalCapacity)
    points.push({
      week: isoWeek(i),
      utilizationPct: Math.round(utilizationPct * 10) / 10,
      billableHours: billable,
      totalCapacityHours: totalCapacity,
    })
  }
  return points
}

export const utilizationTrend: UtilizationPoint[] = generateUtilization()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const totalActual = projectHours.reduce((s, p) => s + p.totalActual, 0)
  const totalPlanned = projectHours.reduce((s, p) => s + p.totalPlanned, 0)
  const overrunPct = ((totalActual - totalPlanned) / totalPlanned) * 100
  const latestUtilization = utilizationTrend[utilizationTrend.length - 1]
  const prevUtilization = utilizationTrend[utilizationTrend.length - 2]
  const topMember = orderedMembers[0]
  const topMemberHours = projectHours.reduce(
    (s, p) => s + (p.members[topMember.id] || 0),
    0,
  )

  return [
    {
      label: "Total Hours Logged",
      value: `${totalActual.toLocaleString("en-US")}h`,
      change: Math.round(overrunPct * 10) / 10,
      changeLabel: "vs plan",
      positiveIsGood: false,
      sparklineData: projectHours.map((p) => p.totalActual),
    },
    {
      label: "Plan vs Actual",
      value: `${overrunPct >= 0 ? "+" : ""}${overrunPct.toFixed(1)}%`,
      change: Math.round(overrunPct * 10) / 10,
      changeLabel: "over plan",
      positiveIsGood: false,
      sparklineData: projectHours.map((p) => p.variancePct),
    },
    {
      label: "Utilization",
      value: `${latestUtilization.utilizationPct.toFixed(1)}%`,
      change:
        Math.round(
          (latestUtilization.utilizationPct - prevUtilization.utilizationPct) *
            10,
        ) / 10,
      changeLabel: "WoW (pp)",
      positiveIsGood: true,
      sparklineData: utilizationTrend.map((u) => u.utilizationPct),
    },
    {
      label: "Top Allocated Member",
      value: `${topMemberHours.toLocaleString("en-US")}h`,
      change: 0,
      changeLabel: topMember.name,
      positiveIsGood: true,
      sparklineData: orderedMembers
        .slice(0, 6)
        .map((m) =>
          projectHours.reduce((s, p) => s + (p.members[m.id] || 0), 0),
        ),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const projectOptions = [
  { label: "All projects", value: "all" },
  ...PROJECTS.map((p) => ({ label: p.name, value: p.id })),
]

export const memberOptions = [
  { label: "All members", value: "all" },
  ...MEMBERS.map((m) => ({ label: m.name, value: m.id })),
]

export const MEMBERS_LIST = MEMBERS
