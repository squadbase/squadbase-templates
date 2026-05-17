// ── Enum / Literal types ──

export type Segment = "new" | "returning" | "vip" | "churn-risk"

// ── Raw data schema (matches ticket's expected input data) ──
// respondent_id, question_id, score, free_text, segment

export interface ResponseRow {
  respondent_id: string
  question_id: string
  score: number
  free_text: string
  segment: Segment
}

// ── Display / derived types ──

export interface SummaryKpi {
  id: "responses" | "nps" | "csat" | "segment-gap"
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  accent: "default" | "accent" | "amber"
}

export interface QuestionAggregation {
  questionId: string
  questionText: string
  avgScore: number
  responseCount: number
  // distribution buckets 1..5 (count)
  distribution: number[]
}

export interface TrendPoint {
  date: string
  nps: number
  csat: number
  responseCount: number
}

export interface SegmentScore {
  segment: Segment
  segmentLabel: string
  avgScore: number
  responseCount: number
  // delta vs overall average
  deltaVsOverall: number
}

export interface FreeTextTag {
  tag: string
  count: number
  // share of total free-text responses, 0..1
  share: number
  // average score of responses carrying this tag
  avgScore: number
}

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  segment: string | undefined
  question: string | undefined
}
