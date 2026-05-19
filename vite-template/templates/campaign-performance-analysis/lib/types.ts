// ── Raw data schema (matches ticket's expected input data) ──
// campaign_id, creative_id, spend, conversions, revenue, date

export interface AdEventRow {
  campaign_id: string
  creative_id: string
  spend: number
  conversions: number
  revenue: number
  date: string
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

// One row per campaign, aggregated across creatives/dates in the active window
export interface CampaignRoasRow {
  campaignId: string
  campaignName: string
  channel: string
  spend: number
  conversions: number
  revenue: number
  roas: number
  cpa: number
  ctr: number
  cvr: number
  // ROAS delta vs the prior equal-length window
  roasDelta: number
}

// One row per creative — used in the CTR × CVR scatter plot
export interface CreativeScatterPoint {
  creativeId: string
  creativeName: string
  campaignId: string
  campaignName: string
  format: "image" | "video" | "carousel"
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue: number
  ctr: number
  cvr: number
  // Marks creatives that have exited the platform's learning phase
  learningPhase: "learning" | "active" | "limited"
}

// One row per campaign with budget pacing info (signature section)
export interface BudgetPacingRow {
  campaignId: string
  campaignName: string
  budget: number
  spent: number
  pctSpent: number
  daysElapsed: number
  daysInPeriod: number
  pctTimeElapsed: number
  // pctSpent vs pctTimeElapsed → ahead / on-track / behind
  paceStatus: "ahead" | "on-track" | "behind"
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  channel: string | undefined
  objective: string | undefined
}
