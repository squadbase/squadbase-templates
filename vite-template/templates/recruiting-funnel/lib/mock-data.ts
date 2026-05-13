import type {
  CandidateStage,
  CandidateSource,
  CandidateRow,
  KpiItem,
  FunnelStageStat,
  SourceStat,
  LeadTimeBin,
} from "@/types/recruiting-funnel"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function isoDateBack(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// Seeded RNG unique to this template (recruiting-funnel)
function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(241)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Static data ──

const STAGE_ORDER: CandidateStage[] = [
  "Applied",
  "Screen",
  "Interview",
  "Offer",
  "Hired",
]

// Stage transition probability — Applied → Screen → Interview → Offer → Hired
const STAGE_PASS_PROB: Record<CandidateStage, number> = {
  Applied: 1.0,
  Screen: 0.42,
  Interview: 0.55,
  Offer: 0.38,
  Hired: 0.72,
}

const SOURCES: CandidateSource[] = [
  "Referral",
  "Corporate Site",
  "LinkedIn",
  "Indeed",
  "Agency",
  "Event",
  "Direct Sourcing",
]

// Per-source volume weighting & cost-per-hire profile
const SOURCE_PROFILE: Record<
  CandidateSource,
  { weight: number; costPerHireBase: number; passBoost: number }
> = {
  Referral: { weight: 0.14, costPerHireBase: 2_400, passBoost: 1.35 },
  "Corporate Site": { weight: 0.18, costPerHireBase: 4_200, passBoost: 1.0 },
  LinkedIn: { weight: 0.2, costPerHireBase: 8_800, passBoost: 1.1 },
  Indeed: { weight: 0.22, costPerHireBase: 6_400, passBoost: 0.85 },
  Agency: { weight: 0.1, costPerHireBase: 22_000, passBoost: 1.25 },
  Event: { weight: 0.06, costPerHireBase: 11_500, passBoost: 1.05 },
  "Direct Sourcing": { weight: 0.1, costPerHireBase: 14_500, passBoost: 1.2 },
}

// ── Generate candidates ──

const TOTAL_CANDIDATES = 640

function pickSource(): CandidateSource {
  const r = rng()
  let acc = 0
  for (const s of SOURCES) {
    acc += SOURCE_PROFILE[s].weight
    if (r <= acc) return s
  }
  return SOURCES[SOURCES.length - 1]
}

function stageForCandidate(boost: number): CandidateStage {
  // Walk the funnel — each transition probability is modulated by source boost
  let current: CandidateStage = "Applied"
  for (let i = 1; i < STAGE_ORDER.length; i++) {
    const next = STAGE_ORDER[i]
    const prob = Math.min(STAGE_PASS_PROB[next] * boost, 0.95)
    if (rng() < prob) {
      current = next
    } else {
      break
    }
  }
  return current
}

function generateCandidates(): CandidateRow[] {
  const out: CandidateRow[] = []
  for (let i = 0; i < TOTAL_CANDIDATES; i++) {
    const source = pickSource()
    const stage = stageForCandidate(SOURCE_PROFILE[source].passBoost)
    const daysAgo = Math.round(srand(0, 89))
    // Lead time correlates with depth in funnel
    const stageIdx = STAGE_ORDER.indexOf(stage)
    const baseLead = 2 + stageIdx * 5
    const leadTime = Math.max(
      1,
      Math.round(baseLead + srand(-2, 6) + (stageIdx >= 3 ? srand(0, 8) : 0)),
    )
    out.push({
      candidate_id: `C-${String(i + 1).padStart(5, "0")}`,
      source,
      stage,
      stage_changed_at: isoDateBack(daysAgo),
      lead_time_days: leadTime,
    })
  }
  return out
}

export const candidates: CandidateRow[] = generateCandidates()

// ── Funnel by stage (cumulative — anyone who reached stage X or beyond) ──

const STAGE_INDEX: Record<CandidateStage, number> = STAGE_ORDER.reduce(
  (acc, s, i) => {
    acc[s] = i
    return acc
  },
  {} as Record<CandidateStage, number>,
)

function countAtOrBeyond(stage: CandidateStage): number {
  const idx = STAGE_INDEX[stage]
  return candidates.filter((c) => STAGE_INDEX[c.stage] >= idx).length
}

function generateFunnel(): FunnelStageStat[] {
  const raw = STAGE_ORDER.map((stage) => ({
    stage,
    count: countAtOrBeyond(stage),
  }))
  // Funnel must be in descending order — sort defensively
  const sorted = [...raw].sort((a, b) => b.count - a.count)
  const top = sorted[0]?.count ?? 0
  return sorted.map((row, i) => {
    const prev = i === 0 ? row.count : sorted[i - 1].count
    return {
      stage: row.stage,
      count: row.count,
      conversionFromPrev:
        prev === 0 ? 0 : Math.round((row.count / prev) * 1000) / 10,
      conversionFromTop:
        top === 0 ? 0 : Math.round((row.count / top) * 1000) / 10,
    }
  })
}

export const funnelStats: FunnelStageStat[] = generateFunnel()

// ── Source acquisition + cost per hire ──

function generateSourceStats(): SourceStat[] {
  return SOURCES.map((source) => {
    const sourceCandidates = candidates.filter((c) => c.source === source)
    const applications = sourceCandidates.length
    const interviews = sourceCandidates.filter(
      (c) => STAGE_INDEX[c.stage] >= STAGE_INDEX.Interview,
    ).length
    const offers = sourceCandidates.filter(
      (c) => STAGE_INDEX[c.stage] >= STAGE_INDEX.Offer,
    ).length
    const hires = sourceCandidates.filter((c) => c.stage === "Hired").length
    const baseCost = SOURCE_PROFILE[source].costPerHireBase
    const variance = 0.88 + srand(0, 0.24)
    const costPerHire = Math.round(baseCost * variance)
    const spend = costPerHire * Math.max(hires, 1)
    const passRate =
      applications === 0
        ? 0
        : Math.round((hires / applications) * 1000) / 10
    return {
      source,
      applications,
      interviews,
      offers,
      hires,
      spend,
      costPerHire,
      passRate,
    }
  }).sort((a, b) => b.applications - a.applications)
}

export const sourceStats: SourceStat[] = generateSourceStats()

// ── Lead-time distribution (histogram bins) ──

function generateLeadTimeBins(): LeadTimeBin[] {
  const bins: { label: string; min: number; max: number }[] = [
    { label: "0–7d", min: 0, max: 7 },
    { label: "8–14d", min: 8, max: 14 },
    { label: "15–21d", min: 15, max: 21 },
    { label: "22–30d", min: 22, max: 30 },
    { label: "31–45d", min: 31, max: 45 },
    { label: "46d+", min: 46, max: 999 },
  ]
  return bins.map((b) => ({
    label: b.label,
    min: b.min,
    max: b.max,
    count: candidates.filter(
      (c) => c.lead_time_days >= b.min && c.lead_time_days <= b.max,
    ).length,
  }))
}

export const leadTimeBins: LeadTimeBin[] = generateLeadTimeBins()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const totalApps = candidates.length
  const totalScreen = countAtOrBeyond("Screen")
  const totalInterview = countAtOrBeyond("Interview")
  const totalOffer = countAtOrBeyond("Offer")
  const totalHired = countAtOrBeyond("Hired")
  const screenRate = totalApps === 0 ? 0 : (totalScreen / totalApps) * 100
  const offerRate = totalInterview === 0 ? 0 : (totalOffer / totalInterview) * 100
  const hireRate = totalApps === 0 ? 0 : (totalHired / totalApps) * 100
  const totalSpend = sourceStats.reduce((s, c) => s + c.spend, 0)
  const avgCostPerHire = totalHired === 0 ? 0 : totalSpend / totalHired
  const topSourceCount = sourceStats[0]?.applications ?? 0

  return [
    {
      label: "Applications",
      value: totalApps.toLocaleString("en-US"),
      change: 9.4,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: funnelStats.map((f) => f.count),
    },
    {
      label: "Screen Pass Rate",
      value: `${screenRate.toFixed(1)}%`,
      change: 2.6,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: sourceStats.map((s) =>
        s.applications === 0 ? 0 : (s.interviews / s.applications) * 100,
      ),
    },
    {
      label: "Offer Rate",
      value: `${offerRate.toFixed(1)}%`,
      change: -1.4,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: sourceStats.map((s) =>
        s.interviews === 0 ? 0 : (s.offers / s.interviews) * 100,
      ),
    },
    {
      label: "Hire Rate",
      value: `${hireRate.toFixed(2)}%`,
      change: 0.8,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: sourceStats.map((s) => s.passRate),
    },
    {
      label: "Cost per Hire",
      value: `$${Math.round(avgCostPerHire).toLocaleString("en-US")}`,
      change: -3.2,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: sourceStats.map((s) => s.costPerHire),
    },
    {
      label: "Top Source",
      value: `${topSourceCount.toLocaleString("en-US")}`,
      change: 5.1,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: sourceStats.map((s) => s.applications),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const sourceOptions = [
  { label: "All sources", value: "all" },
  ...SOURCES.map((s) => ({ label: s, value: s })),
]

export const stageOptions = [
  { label: "All stages", value: "all" },
  ...STAGE_ORDER.map((s) => ({ label: s, value: s })),
]

export const STAGE_LIST = STAGE_ORDER
