import type {
  SummaryKpi,
  QuestionAggregation,
  TrendPoint,
  SegmentScore,
  FreeTextTag,
} from "@/types/survey-aggregation-dashboard"

// ── シード付き乱数 ──

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

// ── 日付ヘルパー ──

const BASE_DATE = new Date("2024-03-15")

function dateStr(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// ── 設問別集計 (平均スコア + 1..5 の分布) ──

const QUESTIONS: { id: string; text: string; baseScore: number }[] = [
  { id: "q1", text: "製品全体の満足度", baseScore: 4.2 },
  { id: "q2", text: "他者への推奨意向 (NPS)", baseScore: 4.0 },
  { id: "q3", text: "使いやすさ", baseScore: 4.3 },
  { id: "q4", text: "サポートの対応速度", baseScore: 3.7 },
  { id: "q5", text: "価格に対する価値", baseScore: 3.8 },
  { id: "q6", text: "機能の充実度", baseScore: 3.9 },
  { id: "q7", text: "オンボーディング体験", baseScore: 3.6 },
]

function generateDistribution(targetMean: number, total: number): number[] {
  // 目標平均 (1..5) を中心としたベータ風分布
  const buckets = [0, 0, 0, 0, 0]
  for (let i = 0; i < total; i++) {
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

// ── NPS / CSAT の時系列推移 (直近 12 週) ──

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

// ── 属性別 (セグメント) のスコア ──

const SEGMENTS: { id: "new" | "returning" | "vip" | "churn-risk"; label: string; bias: number }[] = [
  { id: "new", label: "新規", bias: -0.15 },
  { id: "returning", label: "リピーター", bias: 0.05 },
  { id: "vip", label: "VIP", bias: 0.25 },
  { id: "churn-risk", label: "離反リスク", bias: -0.45 },
]

function generateSegmentScores(): SegmentScore[] {
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

// ── 自由記述のタグ分布 ──

const TAGS: { tag: string; baseShare: number; sentimentBias: number }[] = [
  { tag: "価格", baseShare: 0.22, sentimentBias: -0.4 },
  { tag: "サポート", baseShare: 0.18, sentimentBias: -0.2 },
  { tag: "UX", baseShare: 0.16, sentimentBias: 0.2 },
  { tag: "性能", baseShare: 0.13, sentimentBias: -0.1 },
  { tag: "機能要望", baseShare: 0.12, sentimentBias: 0.0 },
  { tag: "オンボーディング", baseShare: 0.1, sentimentBias: -0.3 },
  { tag: "連携", baseShare: 0.06, sentimentBias: 0.1 },
  { tag: "その他", baseShare: 0.03, sentimentBias: 0.0 },
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

// ── サマリー KPI (PageShellSummary) ──

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
      label: "回答数",
      value: totalResponses.toLocaleString("ja-JP"),
      change: respDelta,
      changeLabel: "前期間比",
      positiveIsGood: true,
      accent: "default",
    },
    {
      id: "nps",
      label: "NPS",
      value: `${latestTrend.nps >= 0 ? "+" : ""}${latestTrend.nps}`,
      change:
        Math.round((latestTrend.nps - prevTrend.nps) * 10) / 10,
      changeLabel: "前週比",
      positiveIsGood: true,
      accent: latestTrend.nps >= 30 ? "accent" : "amber",
    },
    {
      id: "csat",
      label: "満足度スコア",
      value: `${overallCsat.toFixed(2)} / 5`,
      change:
        Math.round((latestTrend.csat - prevTrend.csat) * 100) / 100,
      changeLabel: "前週比",
      positiveIsGood: true,
      accent: overallCsat >= 4 ? "accent" : "default",
    },
    {
      id: "segment-gap",
      label: "属性別スコア差",
      value: `${segGap.toFixed(2)} pt`,
      change: segGap,
      changeLabel: `${bestSeg.segmentLabel} - ${worstSeg.segmentLabel}`,
      positiveIsGood: false,
      accent: segGap >= 0.5 ? "amber" : "default",
    },
  ]
}

export const summaryKpis: SummaryKpi[] = computeKpis()

// ── フィルター選択肢 ──

export const segmentOptions = [
  { label: "全セグメント", value: "all" },
  { label: "新規", value: "new" },
  { label: "リピーター", value: "returning" },
  { label: "VIP", value: "vip" },
  { label: "離反リスク", value: "churn-risk" },
]

export const questionOptions = [
  { label: "全設問", value: "all" },
  ...QUESTIONS.map((q) => ({ label: q.text, value: q.id })),
]
