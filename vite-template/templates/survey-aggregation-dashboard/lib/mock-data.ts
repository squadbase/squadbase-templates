import type {
  SummaryKpi,
  QuestionAggregation,
  TrendPoint,
  SegmentScore,
  FreeTextTag,
} from "@/types/survey-aggregation-dashboard"

// ── Seeded RNG ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(29)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Date helpers ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// ── Question aggregation (per-question average + 1..5 distribution) ──

const QUESTIONS: { id: string; text: string; baseScore: number }[] = [
  { id: "q1", text: "Overall satisfaction with our product", baseScore: 4.2 },
  { id: "q2", text: "Likelihood to recommend (NPS)", baseScore: 4.0 },
  { id: "q3", text: "Ease of use", baseScore: 4.3 },
  { id: "q4", text: "Customer support responsiveness", baseScore: 3.7 },
  { id: "q5", text: "Value for money", baseScore: 3.8 },
  { id: "q6", text: "Feature completeness", baseScore: 3.9 },
  { id: "q7", text: "Onboarding experience", baseScore: 3.6 },
]

function generateDistribution(targetMean: number, total: number): number[] {
  // Beta-like distribution skewed toward targetMean (1..5)
  const buckets = [0, 0, 0, 0, 0]
  for (let i = 0; i < total; i++) {
    // Sample score around target mean with noise, clamp to 1..5
    const noisy = targetMean + (srand(0, 2) - 1)
    const score = Math.max(1, Math.min(5, Math.round(noisy)))
    buckets[score - 1] += 1
  }
  return buckets
}

function generateQuestionAggregations(): QuestionAggregation[] {
  return QUESTIONS.map((q) => {
    const responseCount = Math.round(srand(180, 280))
    const distribution = generateDistribution(q.baseScore, responseCount)
    const sum = distribution.reduce((s, c, i) => s + c * (i + 1), 0)
    const avgScore =
      responseCount > 0 ? Math.round((sum / responseCount) * 100) / 100 : 0
    return {
      questionId: q.id,
      questionText: q.text,
      avgScore,
      responseCount,
      distribution,
    }
  })
}

export const questionAggregations: QuestionAggregation[] =
  generateQuestionAggregations()

// ── NPS / CSAT trend (last 12 weeks) ──

const WEEKS = 12

function generateTrend(): TrendPoint[] {
  const points: TrendPoint[] = []
  for (let w = WEEKS - 1; w >= 0; w--) {
    const trend = 1 + (WEEKS - 1 - w) * 0.012
    const npsBase = 32
    const csatBase = 4.1
    const nps = Math.round(npsBase * trend + (srand(0, 8) - 4))
    const csat =
      Math.round((csatBase * (0.98 + srand(0, 0.08)) + (trend - 1)) * 100) / 100
    const responseCount = Math.round(srand(40, 70))
    points.push({
      date: dateStr(w * 7),
      nps,
      csat,
      responseCount,
    })
  }
  return points
}

export const trendSeries: TrendPoint[] = generateTrend()

// ── Segment score breakdown ──

const SEGMENTS: { id: "new" | "returning" | "vip" | "churn-risk"; label: string; bias: number }[] = [
  { id: "new", label: "New", bias: -0.15 },
  { id: "returning", label: "Returning", bias: 0.05 },
  { id: "vip", label: "VIP", bias: 0.25 },
  { id: "churn-risk", label: "Churn risk", bias: -0.45 },
]

function generateSegmentScores(): SegmentScore[] {
  // Overall avg from questionAggregations weighted by response count
  const totalSum = questionAggregations.reduce(
    (s, q) => s + q.avgScore * q.responseCount,
    0,
  )
  const totalCount = questionAggregations.reduce(
    (s, q) => s + q.responseCount,
    0,
  )
  const overall = totalCount > 0 ? totalSum / totalCount : 0

  return SEGMENTS.map((s) => {
    const noise = srand(0, 0.1) - 0.05
    const avgScore = Math.round((overall + s.bias + noise) * 100) / 100
    const responseCount = Math.round(srand(120, 320))
    return {
      segment: s.id,
      segmentLabel: s.label,
      avgScore,
      responseCount,
      deltaVsOverall: Math.round((avgScore - overall) * 100) / 100,
    }
  })
}

export const segmentScores: SegmentScore[] = generateSegmentScores()

// ── Free-text tag distribution ──

const TAGS: { tag: string; baseShare: number; sentimentBias: number }[] = [
  { tag: "pricing", baseShare: 0.22, sentimentBias: -0.4 },
  { tag: "support", baseShare: 0.18, sentimentBias: -0.2 },
  { tag: "ux", baseShare: 0.16, sentimentBias: 0.2 },
  { tag: "performance", baseShare: 0.13, sentimentBias: -0.1 },
  { tag: "feature-request", baseShare: 0.12, sentimentBias: 0.0 },
  { tag: "onboarding", baseShare: 0.1, sentimentBias: -0.3 },
  { tag: "integrations", baseShare: 0.06, sentimentBias: 0.1 },
  { tag: "other", baseShare: 0.03, sentimentBias: 0.0 },
]

function generateFreeTextTags(): FreeTextTag[] {
  const totalResponses = Math.round(srand(640, 780))
  const rawCounts = TAGS.map((t) => {
    const noise = 0.9 + srand(0, 0.2)
    return Math.round(totalResponses * t.baseShare * noise)
  })
  const sumCounts = rawCounts.reduce((s, c) => s + c, 0)
  return TAGS.map((t, i) => {
    const count = rawCounts[i]
    const share = sumCounts > 0 ? count / sumCounts : 0
    const avgScore =
      Math.round((3.9 + t.sentimentBias + (srand(0, 0.2) - 0.1)) * 100) / 100
    return {
      tag: t.tag,
      count,
      share,
      avgScore,
    }
  })
}

export const freeTextTags: FreeTextTag[] = generateFreeTextTags()

// ── Summary KPIs (PageShellSummary) ──

function computeKpis(): SummaryKpi[] {
  const totalResponses = questionAggregations.reduce(
    (s, q) => s + q.responseCount,
    0,
  )

  const latestTrend = trendSeries[trendSeries.length - 1]
  const prevTrend = trendSeries[trendSeries.length - 2]

  const sumScore = questionAggregations.reduce(
    (s, q) => s + q.avgScore * q.responseCount,
    0,
  )
  const totalCount = questionAggregations.reduce(
    (s, q) => s + q.responseCount,
    0,
  )
  const overallCsat =
    totalCount > 0 ? Math.round((sumScore / totalCount) * 100) / 100 : 0

  const bestSeg = segmentScores.reduce((b, s) =>
    s.avgScore > b.avgScore ? s : b,
  )
  const worstSeg = segmentScores.reduce((w, s) =>
    s.avgScore < w.avgScore ? s : w,
  )
  const segGap = Math.round((bestSeg.avgScore - worstSeg.avgScore) * 100) / 100

  const respDelta = Math.round(
    (totalResponses / Math.max(1, totalResponses - 60) - 1) * 1000,
  ) / 10

  return [
    {
      id: "responses",
      label: "Total Responses",
      value: totalResponses.toLocaleString("en-US"),
      change: respDelta,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      accent: "default",
    },
    {
      id: "nps",
      label: "NPS",
      value: `${latestTrend.nps >= 0 ? "+" : ""}${latestTrend.nps}`,
      change:
        Math.round((latestTrend.nps - prevTrend.nps) * 10) / 10,
      changeLabel: "vs prev week",
      positiveIsGood: true,
      accent: latestTrend.nps >= 30 ? "accent" : "amber",
    },
    {
      id: "csat",
      label: "Satisfaction Score",
      value: `${overallCsat.toFixed(2)} / 5`,
      change:
        Math.round((latestTrend.csat - prevTrend.csat) * 100) / 100,
      changeLabel: "vs prev week",
      positiveIsGood: true,
      accent: overallCsat >= 4 ? "accent" : "default",
    },
    {
      id: "segment-gap",
      label: "Segment Score Gap",
      value: `${segGap.toFixed(2)} pts`,
      change: segGap,
      changeLabel: `${bestSeg.segmentLabel} vs ${worstSeg.segmentLabel}`,
      positiveIsGood: false,
      accent: segGap >= 0.5 ? "amber" : "default",
    },
  ]
}

export const summaryKpis: SummaryKpi[] = computeKpis()

// ── Filter options ──

export const segmentOptions = [
  { label: "All segments", value: "all" },
  { label: "New", value: "new" },
  { label: "Returning", value: "returning" },
  { label: "VIP", value: "vip" },
  { label: "Churn risk", value: "churn-risk" },
]

export const questionOptions = [
  { label: "All questions", value: "all" },
  ...QUESTIONS.map((q) => ({ label: q.text, value: q.id })),
]
