// ── Enum / Literal types ──

export type LeadStage = "Lead" | "MQL" | "SQL" | "Appointment" | "Opportunity"

export type LeadSource =
  | "自然検索"
  | "リスティング"
  | "ソーシャル広告"
  | "リファラル"
  | "ウェビナー"
  | "イベント"
  | "アウトバウンド"

// ── Raw schema (matches ticket's expected input data) ──
export interface LeadRow {
  lead_id: string
  source: LeadSource
  stage: LeadStage
  stage_changed_at: string
  owner: string
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

export interface FunnelStageStat {
  stage: LeadStage
  count: number
  conversionFromPrev: number
  conversionFromTop: number
}

export interface ChannelStat {
  source: LeadSource
  leads: number
  mqls: number
  sqls: number
  appointments: number
  spend: number
  cpl: number
}

export interface OwnerRanking {
  owner: string
  appointments: number
  sqls: number
  opportunities: number
  appointmentRate: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  source: string | undefined
  owner: string | undefined
}
