import type {
  KpiItem,
  CourseCompletion,
  LearnerActivityCell,
  TestScoreBin,
  NoStartSegment,
} from "@/types/learning-progress-dashboard"

// ── ヘルパー ──

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

// このテンプレート用のユニークなシード
const rng = seededRand(317)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// ── コース別完了率ランキング ──

const COURSES: { id: string; name: string; category: string }[] = [
  { id: "C-101", name: "情報セキュリティ基礎", category: "compliance" },
  { id: "C-102", name: "個人情報保護とGDPR", category: "compliance" },
  { id: "C-201", name: "カスタマーサクセス基礎", category: "business" },
  { id: "C-202", name: "交渉スキル入門", category: "business" },
  { id: "C-301", name: "SQL実践 (アナリスト向け)", category: "technical" },
  { id: "C-302", name: "クラウドインフラ入門", category: "technical" },
  { id: "C-401", name: "インクルーシブ・リーダーシップ", category: "leadership" },
  { id: "C-402", name: "フィードバックと1on1", category: "leadership" },
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

// ── 受講者別アクティビティヒートマップ (14名 × 直近14日) ──

const LEARNERS = [
  "佐藤 玲",
  "鈴木 翔",
  "高橋 美咲",
  "田中 健",
  "渡辺 蓮",
  "伊藤 結衣",
  "山本 大輔",
  "中村 さくら",
  "小林 直樹",
  "加藤 まり",
  "吉田 隼",
  "山田 葵",
  "佐々木 涼",
  "山口 千夏",
]

const DAYS_HEATMAP = 14

function generateLearnerActivity(): LearnerActivityCell[] {
  const cells: LearnerActivityCell[] = []
  for (let li = 0; li < LEARNERS.length; li++) {
    // 受講者ごとのエンゲージメント基準値 — ヒートマップで明確な差を出すため
    const baseline = clamp(srand(0, 1), 0.05, 0.95)
    for (let di = 0; di < DAYS_HEATMAP; di++) {
      const dow = (new Date(BASE_DATE).getDay() - di + 700) % 7
      // 週末はアクティビティ低下
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

// ── テスト得点分布 (合格/不合格) ──

const PASS_LINE = 70

function generateTestScoreBins(): TestScoreBin[] {
  // 合成 (やや右寄り) 得点分布
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

// ── 未着手セグメント ──

function generateNoStartSegments(): NoStartSegment[] {
  const raw = [
    { segment: "オンボーディング中 (30日未満)", weight: 0.42 },
    { segment: "在籍 1〜3年", weight: 0.31 },
    { segment: "在籍 3年以上", weight: 0.18 },
    { segment: "業務委託・パートタイム", weight: 0.09 },
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

// ── ヘッダー直下の主要 KPI ──

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function computeKpis(): KpiItem[] {
  const completionRate = avg(courseCompletions.map((c) => c.completionRate))
  const avgScore = avg(courseCompletions.map((c) => c.avgScore))
  // 学習時間: ヒートマップの progressDelta を proxy として算出 (1% = 0.1時間)
  const totalHours = learnerActivity.reduce(
    (s, c) => s + c.progressDelta * 0.1,
    0,
  )
  // 未着手率: 未着手数 / 受講登録数
  const totalEnrolled = courseCompletions.reduce((s, c) => s + c.enrolled, 0)
  const totalNoStart = noStartSegments.reduce((s, c) => s + c.count, 0)
  const noStartRate = (totalNoStart / totalEnrolled) * 100

  const dailyHours = Array.from({ length: DAYS_HEATMAP }, (_, di) => {
    const day = learnerActivity.filter((c) => c.dayIndex === di)
    return day.reduce((s, c) => s + c.progressDelta * 0.1, 0)
  }).reverse()

  return [
    {
      label: "受講完了率",
      value: `${completionRate.toFixed(1)}%`,
      change: 2.4,
      changeLabel: "前30日比",
      positiveIsGood: true,
      sparklineData: courseCompletions.map((c) => c.completionRate),
    },
    {
      label: "テスト平均点",
      value: `${avgScore.toFixed(1)}`,
      change: 1.1,
      changeLabel: "前30日比",
      positiveIsGood: true,
      sparklineData: courseCompletions.map((c) => c.avgScore),
    },
    {
      label: "学習時間",
      value: `${Math.round(totalHours).toLocaleString("ja-JP")}時間`,
      change: 8.6,
      changeLabel: "前14日比",
      positiveIsGood: true,
      sparklineData: dailyHours,
    },
    {
      label: "未着手率",
      value: `${noStartRate.toFixed(1)}%`,
      change: -1.8,
      changeLabel: "前30日比",
      positiveIsGood: false,
      sparklineData: noStartSegments.map((s) => s.share),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const departmentOptions = [
  { label: "全部署", value: "all" },
  { label: "エンジニアリング", value: "engineering" },
  { label: "セールス", value: "sales" },
  { label: "カスタマーサクセス", value: "customer-success" },
  { label: "オペレーション", value: "operations" },
  { label: "人事・カルチャー", value: "people" },
]

export const courseCategoryOptions = [
  { label: "全カテゴリ", value: "all" },
  { label: "コンプライアンス", value: "compliance" },
  { label: "ビジネス", value: "business" },
  { label: "テクニカル", value: "technical" },
  { label: "リーダーシップ", value: "leadership" },
]
