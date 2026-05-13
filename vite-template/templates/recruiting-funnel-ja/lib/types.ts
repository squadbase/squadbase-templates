// ── Enum / Literal types ──

export type CandidateStage =
  | "Applied"
  | "Screen"
  | "Interview"
  | "Offer"
  | "Hired"

export type CandidateSource =
  | "リファラル"
  | "コーポレートサイト"
  | "LinkedIn"
  | "ビズリーチ"
  | "エージェント"
  | "イベント"
  | "ダイレクトリクルーティング"

// ── Raw schema (matches ticket's expected input data) ──
export interface CandidateRow {
  candidate_id: string
  source: CandidateSource
  stage: CandidateStage
  stage_changed_at: string
  lead_time_days: number
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
  stage: CandidateStage
  count: number
  conversionFromPrev: number
  conversionFromTop: number
}

export interface SourceStat {
  source: CandidateSource
  applications: number
  interviews: number
  offers: number
  hires: number
  spend: number
  costPerHire: number
  passRate: number
}

export interface LeadTimeBin {
  label: string
  min: number
  max: number
  count: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  source: string | undefined
  stage: string | undefined
}
