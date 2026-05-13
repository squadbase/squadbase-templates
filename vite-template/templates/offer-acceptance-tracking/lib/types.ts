// ── Enum / Literal types ──

export type OfferStatus =
  | "offered"
  | "considering"
  | "accepted"
  | "declined"

export type DeclineReason =
  | "compensation"
  | "competing_offer"
  | "career_fit"
  | "location"
  | "culture_fit"
  | "personal"
  | "other"

export type FollowUpPriority = "high" | "medium" | "low"

// ── Raw data schema (matches ticket's expected input data) ──
// candidate_id, status, decision_at, decline_reason

export interface CandidateRow {
  candidate_id: string
  status: OfferStatus
  decision_at: string | null
  decline_reason: DeclineReason | null
  // Display-only fields kept on the row for convenience
  candidate_name: string
  department: string
  recruiter: string
  offered_at: string
  days_since_offer: number
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

export interface StatusFunnelStep {
  status: Exclude<OfferStatus, "declined">
  count: number
  conversionFromPrev: number
}

export interface DeclineReasonBreakdown {
  reason: DeclineReason
  count: number
  share: number
}

export interface FollowUpRow {
  candidate_id: string
  candidate_name: string
  department: string
  recruiter: string
  status: OfferStatus
  daysSinceOffer: number
  daysUntilDeadline: number
  priority: FollowUpPriority
  note: string
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  department: string | undefined
  recruiter: string | undefined
}
