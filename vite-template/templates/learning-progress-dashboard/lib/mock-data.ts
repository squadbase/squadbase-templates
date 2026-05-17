import type {
  KpiItem,
  CourseCompletion,
  LearnerActivityCell,
  TestScoreBin,
  NoStartSegment,
} from "@/types/learning-progress-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Unique seed for this template
const rng = seededRand(317)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// ── Course completion ranking ──

const COURSES: { id: string; name: string; category: string }[] = [
  { id: "C-101", name: "Information Security Basics", category: "compliance" },
  { id: "C-102", name: "Data Privacy & GDPR", category: "compliance" },
  { id: "C-201", name: "Customer Success Fundamentals", category: "business" },
  { id: "C-202", name: "Negotiation Essentials", category: "business" },
  { id: "C-301", name: "SQL for Analysts", category: "technical" },
  { id: "C-302", name: "Cloud Infrastructure 101", category: "technical" },
  { id: "C-401", name: "Inclusive Leadership", category: "leadership" },
  { id: "C-402", name: "Feedback & 1-on-1s", category: "leadership" },
]

function generateCourseCompletions(): CourseCompletion[] {
  const rows = COURSES.map((c) => {
    const enrolled = Math.round(120 + srand(0, 220))
    const completionRate = clamp(35 + srand(0, 55), 20, 96)
    const completed = Math.round((enrolled * completionRate) / 100)
    const avgScore = Math.round(62 + srand(0, 28))
    return {
      courseId: c.id,
      courseName: c.name,
      enrolled,
      completed,
      completionRate: Math.round(completionRate * 10) / 10,
      avgScore,
    }
  })
  return rows.sort((a, b) => b.completionRate - a.completionRate)
}

export const courseCompletions: CourseCompletion[] = generateCourseCompletions()

// ── Learner activity heatmap (14 learners × last 14 days) ──

const LEARNERS = [
  "A. Becker",
  "B. Chen",
  "C. Dawson",
  "D. Esposito",
  "E. Fisher",
  "F. Gomez",
  "G. Hayashi",
  "H. Ito",
  "I. Jansen",
  "J. Kovac",
  "K. Lima",
  "L. Mori",
  "M. Novak",
  "N. Oki",
]

const DAYS_HEATMAP = 14

function generateLearnerActivity(): LearnerActivityCell[] {
  const cells: LearnerActivityCell[] = []
  for (let li = 0; li < LEARNERS.length; li++) {
    // Per-learner engagement baseline so heatmap shows real variation
    const baseline = clamp(srand(0, 1), 0.05, 0.95)
    for (let di = 0; di < DAYS_HEATMAP; di++) {
      const dow = (new Date(BASE_DATE).getDay() - di + 700) % 7
      // Lower activity on weekends
      const weekendFactor = dow === 0 || dow === 6 ? 0.4 : 1
      const r = srand(0, 1)
      const active = r < baseline * weekendFactor
      const delta = active
        ? Math.round(clamp(srand(2, 16), 1, 18))
        : 0
      cells.push({
        learnerIndex: li,
        learnerName: LEARNERS[li],
        dayIndex: di,
        date: dateStr(di),
        progressDelta: delta,
      })
    }
  }
  return cells
}

export const learnerActivity: LearnerActivityCell[] = generateLearnerActivity()

// ── Test score distribution (pass / fail) ──

const PASS_LINE = 70

function generateTestScoreBins(): TestScoreBin[] {
  // Synthetic right-skewed score distribution
  const buckets: { range: string; min: number; max: number; weight: number }[] =
    [
      { range: "0-49", min: 0, max: 49, weight: 0.06 },
      { range: "50-59", min: 50, max: 59, weight: 0.1 },
      { range: "60-69", min: 60, max: 69, weight: 0.17 },
      { range: "70-79", min: 70, max: 79, weight: 0.28 },
      { range: "80-89", min: 80, max: 89, weight: 0.24 },
      { range: "90-100", min: 90, max: 100, weight: 0.15 },
    ]
  const TOTAL = 480
  return buckets.map((b) => {
    const jitter = 0.85 + srand(0, 0.3)
    const count = Math.round(TOTAL * b.weight * jitter)
    return {
      range: b.range,
      rangeMin: b.min,
      rangeMax: b.max,
      count,
      passed: b.min >= PASS_LINE,
    }
  })
}

export const testScoreBins: TestScoreBin[] = generateTestScoreBins()

// ── No-start segments ──

function generateNoStartSegments(): NoStartSegment[] {
  const raw = [
    { segment: "Onboarding (< 30 days)", weight: 0.42 },
    { segment: "Tenured 1-3 years", weight: 0.31 },
    { segment: "Tenured 3+ years", weight: 0.18 },
    { segment: "Contract / part-time", weight: 0.09 },
  ]
  const total = 184
  return raw.map((r) => {
    const count = Math.round(total * r.weight)
    return {
      segment: r.segment,
      count,
      share: Math.round(((count / total) * 100) * 10) / 10,
    }
  })
}

export const noStartSegments: NoStartSegment[] = generateNoStartSegments()

// ── Header KPIs ──

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function computeKpis(): KpiItem[] {
  const completionRate = avg(courseCompletions.map((c) => c.completionRate))
  const avgScore = avg(courseCompletions.map((c) => c.avgScore))
  // Learning hours: derive from heatmap progressDelta as a proxy (0.1 h per %)
  const totalHours = learnerActivity.reduce(
    (s, c) => s + c.progressDelta * 0.1,
    0,
  )
  // No-start rate: total no-start vs enrolled
  const totalEnrolled = courseCompletions.reduce((s, c) => s + c.enrolled, 0)
  const totalNoStart = noStartSegments.reduce((s, c) => s + c.count, 0)
  const noStartRate = (totalNoStart / totalEnrolled) * 100

  // Sparklines — use mock-derived weekly slope
  const dailyHours = Array.from({ length: DAYS_HEATMAP }, (_, di) => {
    const day = learnerActivity.filter((c) => c.dayIndex === di)
    return day.reduce((s, c) => s + c.progressDelta * 0.1, 0)
  }).reverse()

  return [
    {
      label: "Completion Rate",
      value: `${completionRate.toFixed(1)}%`,
      change: 2.4,
      changeLabel: "vs last 30d",
      positiveIsGood: true,
      sparklineData: courseCompletions.map((c) => c.completionRate),
    },
    {
      label: "Avg. Test Score",
      value: `${avgScore.toFixed(1)}`,
      change: 1.1,
      changeLabel: "vs last 30d",
      positiveIsGood: true,
      sparklineData: courseCompletions.map((c) => c.avgScore),
    },
    {
      label: "Learning Hours",
      value: `${Math.round(totalHours).toLocaleString("en-US")} h`,
      change: 8.6,
      changeLabel: "vs last 14d",
      positiveIsGood: true,
      sparklineData: dailyHours,
    },
    {
      label: "No-Start Rate",
      value: `${noStartRate.toFixed(1)}%`,
      change: -1.8,
      changeLabel: "vs last 30d",
      positiveIsGood: false,
      sparklineData: noStartSegments.map((s) => s.share),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const departmentOptions = [
  { label: "All departments", value: "all" },
  { label: "Engineering", value: "engineering" },
  { label: "Sales", value: "sales" },
  { label: "Customer Success", value: "customer-success" },
  { label: "Operations", value: "operations" },
  { label: "People & Culture", value: "people" },
]

export const courseCategoryOptions = [
  { label: "All categories", value: "all" },
  { label: "Compliance", value: "compliance" },
  { label: "Business", value: "business" },
  { label: "Technical", value: "technical" },
  { label: "Leadership", value: "leadership" },
]
