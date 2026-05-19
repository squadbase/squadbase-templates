// ── Raw data schema (matches ticket's expected input data) ──
// mr_id, facility_id, visit_date, outcome, rx_share

export type VisitOutcome = "met" | "dropoff" | "rescheduled" | "no_visit"

export interface VisitRow {
  mr_id: string
  facility_id: string
  visit_date: string
  outcome: VisitOutcome
  rx_share: number
}

// ── Display / derived types ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface MrRankingRow {
  mrId: string
  mrName: string
  territory: string
  visits: number
  meetings: number
  meetingRate: number
  avgRxShare: number
}

export interface FacilityRxSharePoint {
  weekLabel: string
  weekIndex: number
  // facility_id -> rx_share (0-100)
  [facilityId: string]: number | string
}

export interface FacilityRxSeries {
  facilityId: string
  facilityName: string
  data: { weekLabel: string; rxShare: number }[]
}

export interface UncoveredFacilityRow {
  facilityId: string
  facilityName: string
  territory: string
  segment: "key_account" | "growth" | "watch"
  daysSinceLastVisit: number
  potentialRxShare: number
  assignedMr: string | null
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  territory: string | undefined
  segment: string | undefined
}
