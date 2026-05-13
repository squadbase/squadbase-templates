import type {
  KpiItem,
  MrRankingRow,
  FacilityRxSeries,
  UncoveredFacilityRow,
} from "@/types/mr-activity-dashboard"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// unique seed for this template
const rng = seededRand(2027)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pct(now: number, prev: number): number {
  return prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10
}

// ── MR roster ──

const MR_NAMES = [
  "A. Carter",
  "B. Nakamura",
  "C. Singh",
  "D. Rivera",
  "E. Olsen",
  "F. Tanaka",
  "G. Ahmed",
  "H. Park",
  "I. Romero",
  "J. Müller",
  "K. Bailey",
  "L. Saito",
]

const TERRITORIES = ["North", "East", "South", "West", "Central"]

// ── MR ranking (top performers by visit volume) ──

function generateMrRanking(): MrRankingRow[] {
  const rows: MrRankingRow[] = MR_NAMES.map((name, i) => {
    const baseVisits = 70 - i * 3 + Math.round(srand(-6, 6))
    const visits = Math.max(8, baseVisits)
    const meetingRate = Math.round((58 + srand(-12, 18)) * 10) / 10
    const meetings = Math.round((visits * meetingRate) / 100)
    const avgRxShare = Math.round((34 + srand(-10, 14)) * 10) / 10
    return {
      mrId: `mr_${String(i + 1).padStart(3, "0")}`,
      mrName: name,
      territory: TERRITORIES[i % TERRITORIES.length],
      visits,
      meetings,
      meetingRate,
      avgRxShare,
    }
  })
  return rows.sort((a, b) => b.visits - a.visits)
}

export const mrRanking: MrRankingRow[] = generateMrRanking()

// ── Facility Rx-share trend (top 5 facilities, last 12 weeks) ──

const FACILITY_NAMES = [
  "Northbridge Medical Center",
  "Eastview General Hospital",
  "Lakeside University Hospital",
  "Riverside Health Clinic",
  "Central Memorial Hospital",
]

const WEEKS = 12

function generateFacilityRxSeries(): FacilityRxSeries[] {
  return FACILITY_NAMES.map((name, idx) => {
    const startShare = 24 + idx * 4 + srand(-3, 3)
    const slope = srand(-0.6, 1.4) // some growing, some flat/declining
    const data = Array.from({ length: WEEKS }).map((_, w) => {
      const weekFromNow = WEEKS - 1 - w
      const trend = startShare + slope * w
      const noise = srand(-1.8, 1.8)
      const rxShare = Math.max(2, Math.min(72, Math.round((trend + noise) * 10) / 10))
      return {
        weekLabel: weekFromNow === 0 ? "This wk" : `-${weekFromNow}w`,
        rxShare,
      }
    })
    return {
      facilityId: `fac_${String(idx + 1).padStart(3, "0")}`,
      facilityName: name,
      data,
    }
  })
}

export const facilityRxSeries: FacilityRxSeries[] = generateFacilityRxSeries()

// ── Uncovered facilities (no visits in N days) ──

const UNCOVERED_BASE: Omit<UncoveredFacilityRow, "daysSinceLastVisit">[] = [
  {
    facilityId: "fac_201",
    facilityName: "Highland Family Clinic",
    territory: "North",
    segment: "key_account",
    potentialRxShare: 38,
    assignedMr: "A. Carter",
  },
  {
    facilityId: "fac_202",
    facilityName: "Bayview Community Hospital",
    territory: "East",
    segment: "growth",
    potentialRxShare: 22,
    assignedMr: "B. Nakamura",
  },
  {
    facilityId: "fac_203",
    facilityName: "Maple Ridge Health Center",
    territory: "South",
    segment: "key_account",
    potentialRxShare: 45,
    assignedMr: null,
  },
  {
    facilityId: "fac_204",
    facilityName: "Sunset Internal Medicine",
    territory: "West",
    segment: "watch",
    potentialRxShare: 12,
    assignedMr: "C. Singh",
  },
  {
    facilityId: "fac_205",
    facilityName: "Greenfield Pediatric Hospital",
    territory: "Central",
    segment: "growth",
    potentialRxShare: 28,
    assignedMr: "D. Rivera",
  },
  {
    facilityId: "fac_206",
    facilityName: "Cedar Crest Clinic",
    territory: "North",
    segment: "watch",
    potentialRxShare: 9,
    assignedMr: null,
  },
  {
    facilityId: "fac_207",
    facilityName: "Harborview Surgical Center",
    territory: "East",
    segment: "key_account",
    potentialRxShare: 41,
    assignedMr: "E. Olsen",
  },
  {
    facilityId: "fac_208",
    facilityName: "Oakwood Memorial Hospital",
    territory: "South",
    segment: "growth",
    potentialRxShare: 19,
    assignedMr: "F. Tanaka",
  },
]

function generateUncovered(): UncoveredFacilityRow[] {
  return UNCOVERED_BASE.map((row, i) => ({
    ...row,
    daysSinceLastVisit: 18 + i * 6 + Math.round(srand(0, 9)),
  })).sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit)
}

export const uncoveredFacilities: UncoveredFacilityRow[] = generateUncovered()

// ── Top-line KPIs (visit volume, meeting rate, Rx share, facility coverage) ──

const TOTAL_FACILITIES = 184
const COVERED_FACILITIES = 142
const PREV_COVERED_FACILITIES = 134

function computeKpis(): KpiItem[] {
  const totalVisits = mrRanking.reduce((s, r) => s + r.visits, 0)
  const totalMeetings = mrRanking.reduce((s, r) => s + r.meetings, 0)
  const meetingRate = (totalMeetings / Math.max(1, totalVisits)) * 100
  const prevVisits = Math.round(totalVisits * 0.94)
  const prevMeetingRate = meetingRate - 2.4
  const rxShare =
    mrRanking.reduce((s, r) => s + r.avgRxShare, 0) / mrRanking.length
  const prevRxShare = rxShare - 1.6
  const coverage = (COVERED_FACILITIES / TOTAL_FACILITIES) * 100
  const prevCoverage = (PREV_COVERED_FACILITIES / TOTAL_FACILITIES) * 100

  // sparkline data — simple synthetic weekly trends
  const visitTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(prevVisits + ((totalVisits - prevVisits) * (i + 1)) / 12 + srand(-12, 12)),
  )
  const meetingTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(((prevMeetingRate + ((meetingRate - prevMeetingRate) * (i + 1)) / 12) + srand(-0.6, 0.6)) * 10) / 10,
  )
  const rxTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(((prevRxShare + ((rxShare - prevRxShare) * (i + 1)) / 12) + srand(-0.4, 0.4)) * 10) / 10,
  )
  const coverageTrend = Array.from({ length: 12 }).map((_, i) =>
    Math.round(((prevCoverage + ((coverage - prevCoverage) * (i + 1)) / 12) + srand(-0.3, 0.3)) * 10) / 10,
  )

  return [
    {
      label: "Visits",
      value: totalVisits.toLocaleString("en-US"),
      change: pct(totalVisits, prevVisits),
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: visitTrend,
    },
    {
      label: "Meeting Rate",
      value: `${meetingRate.toFixed(1)}%`,
      change: Math.round((meetingRate - prevMeetingRate) * 10) / 10,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: meetingTrend,
    },
    {
      label: "Avg Rx Share",
      value: `${rxShare.toFixed(1)}%`,
      change: Math.round((rxShare - prevRxShare) * 10) / 10,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: rxTrend,
    },
    {
      label: "Facility Coverage",
      value: `${coverage.toFixed(1)}%`,
      change: Math.round((coverage - prevCoverage) * 10) / 10,
      changeLabel: `${COVERED_FACILITIES}/${TOTAL_FACILITIES} facilities`,
      positiveIsGood: true,
      sparklineData: coverageTrend,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Aggregate stats (for insight derivation) ──

export const coverageStats = {
  total: TOTAL_FACILITIES,
  covered: COVERED_FACILITIES,
  uncovered: TOTAL_FACILITIES - COVERED_FACILITIES,
  prevCovered: PREV_COVERED_FACILITIES,
}

// ── Filter options ──

export const territoryOptions = [
  { label: "All territories", value: "all" },
  { label: "North", value: "North" },
  { label: "East", value: "East" },
  { label: "South", value: "South" },
  { label: "West", value: "West" },
  { label: "Central", value: "Central" },
]

export const segmentOptions = [
  { label: "All segments", value: "all" },
  { label: "Key account", value: "key_account" },
  { label: "Growth", value: "growth" },
  { label: "Watch", value: "watch" },
]
