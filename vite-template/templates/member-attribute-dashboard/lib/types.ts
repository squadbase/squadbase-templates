// ── Enum / Literal types ──

export type AgeBand = "10s" | "20s" | "30s" | "40s" | "50s" | "60s+"
export type Gender = "male" | "female" | "other"
export type AcquisitionChannel =
  | "organic"
  | "search_ad"
  | "social_ad"
  | "referral"
  | "campaign"
  | "store"

// ── Raw data schema (matches ticket's expected input data) ──
// member_id, age_band, gender, joined_at, ltv

export interface MemberRow {
  member_id: string
  age_band: AgeBand
  gender: Gender
  joined_at: string
  ltv: number
  acquisition_channel: AcquisitionChannel
  is_active: boolean
  purchase_count: number
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

// Age-band × Gender crosstab cell
export interface AgeGenderCell {
  ageBand: AgeBand
  gender: Gender
  memberCount: number
  share: number
  avgLtv: number
  purchaseRate: number
}

// Attribute LTV ranking row (one row per age-band × gender segment)
export interface AttributeLtvRow {
  rank: number
  segment: string
  ageBand: AgeBand
  gender: Gender
  memberCount: number
  share: number
  avgLtv: number
  purchaseRate: number
}

// New-member acquisition by channel
export interface AcquisitionChannelPoint {
  channel: AcquisitionChannel
  channelLabel: string
  newMembers: number
  share: number
  avgLtv: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  gender: string | undefined
  ageBand: string | undefined
}
