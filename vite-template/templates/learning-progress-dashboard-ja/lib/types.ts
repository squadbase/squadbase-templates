// ── 入力データスキーマ (チケットの「期待入力データ」に一致) ──
// learner_id, course_id, progress_pct, score, last_active_at

export interface LearningRow {
  learner_id: string
  course_id: string
  progress_pct: number
  score: number | null
  last_active_at: string
}

// ── 表示用・派生型 ──

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface CourseCompletion {
  courseId: string
  courseName: string
  enrolled: number
  completed: number
  completionRate: number
  avgScore: number
}

// 受講者インデックス × 日付インデックス (0=今日、大きいほど過去)
export interface LearnerActivityCell {
  learnerIndex: number
  learnerName: string
  dayIndex: number
  date: string
  progressDelta: number
}

export interface TestScoreBin {
  range: string
  rangeMin: number
  rangeMax: number
  count: number
  passed: boolean
}

export interface NoStartSegment {
  segment: string
  count: number
  share: number
}

// ── フィルター状態 ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  department: string | undefined
  courseCategory: string | undefined
}
