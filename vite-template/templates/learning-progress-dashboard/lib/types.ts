// ── Raw data schema (matches ticket's expected input data) ──
// learner_id, course_id, progress_pct, score, last_active_at

export interface LearningRow {
  learner_id: string
  course_id: string
  progress_pct: number
  score: number | null
  last_active_at: string
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

export interface CourseCompletion {
  courseId: string
  courseName: string
  enrolled: number
  completed: number
  completionRate: number
  avgScore: number
}

// learner-index × day-index (0 = today, larger = older)
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

// ── Filter state ──

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  department: string | undefined
  courseCategory: string | undefined
}
