import type {
  MediaSummary,
  MonthlyCvPoint,
  KpiItem,
} from "@/types/affiliate-performance-dashboard"

// ── Helpers ──

const BASE_DATE = new Date("2024-03-15")

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(37)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── 媒体マスター ──
// 4 つの ASP に紐づく 12 媒体。一部は「新規」(直近 60 日以内に開始) としてフラグ付与。

interface MediaSeed {
  id: string
  name: string
  asp: string
  baseSpend: number
  baseConv: number
  baseAov: number
  isNew?: boolean
}

const MEDIA_SEEDS: MediaSeed[] = [
  { id: "m01", name: "ポイントモール", asp: "A8.net", baseSpend: 1_450_000, baseConv: 320, baseAov: 9_200 },
  { id: "m02", name: "比較ナビ", asp: "バリューコマース", baseSpend: 1_180_000, baseConv: 245, baseAov: 8_800 },
  { id: "m03", name: "クーポンマスター", asp: "楽天アフィリ", baseSpend: 930_000, baseConv: 198, baseAov: 7_600 },
  { id: "m04", name: "インフルエンサーサークル", asp: "アクセストレード", baseSpend: 870_000, baseConv: 142, baseAov: 12_400 },
  { id: "m05", name: "レビューSpot", asp: "A8.net", baseSpend: 640_000, baseConv: 118, baseAov: 9_500 },
  { id: "m06", name: "ブログコレクティブ", asp: "バリューコマース", baseSpend: 520_000, baseConv: 84, baseAov: 10_200 },
  { id: "m07", name: "プライストラッカー", asp: "楽天アフィリ", baseSpend: 480_000, baseConv: 76, baseAov: 7_100 },
  { id: "m08", name: "メディアハウスX", asp: "アクセストレード", baseSpend: 420_000, baseConv: 95, baseAov: 13_800, isNew: true },
  { id: "m09", name: "ニッチレビュー", asp: "A8.net", baseSpend: 310_000, baseConv: 52, baseAov: 8_900 },
  { id: "m10", name: "クリエイタープラス", asp: "アクセストレード", baseSpend: 240_000, baseConv: 48, baseAov: 11_600, isNew: true },
  { id: "m11", name: "バーゲンデイリー", asp: "バリューコマース", baseSpend: 190_000, baseConv: 38, baseAov: 6_400 },
  { id: "m12", name: "ソーシャルバズ", asp: "アクセストレード", baseSpend: 150_000, baseConv: 22, baseAov: 10_800, isNew: true },
]

function buildMediaSummary(seed: MediaSeed): MediaSummary {
  const spendNoise = 0.88 + srand(0, 0.24)
  const convNoise = 0.85 + srand(0, 0.3)
  const aovNoise = 0.92 + srand(0, 0.16)
  const spend = Math.round(seed.baseSpend * spendNoise)
  const conversions = Math.round(seed.baseConv * convNoise)
  const revenue = Math.round(conversions * seed.baseAov * aovNoise)
  const cpa = conversions > 0 ? spend / conversions : 0
  const roas = spend > 0 ? revenue / spend : 0
  return {
    mediaId: seed.id,
    mediaName: seed.name,
    asp: seed.asp,
    spend,
    conversions,
    revenue,
    cpa,
    roas,
    isNew: seed.isNew ?? false,
  }
}

export const mediaSummaries: MediaSummary[] = MEDIA_SEEDS.map(buildMediaSummary)

// ── 月次 CV 推移 (直近 12 ヶ月) ──

function generateMonthlyTrend(): MonthlyCvPoint[] {
  const months: MonthlyCvPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setMonth(d.getMonth() - i)
    const monthLabel = d.toLocaleDateString("ja-JP", {
      year: "2-digit",
      month: "short",
    })
    const seasonal = 1 + Math.sin((d.getMonth() / 12) * Math.PI * 2) * 0.12
    const trend = 1 + (11 - i) * 0.025
    const noise = 0.92 + srand(0, 0.16)
    const baseCv = 1100
    const conversions = Math.round(baseCv * seasonal * trend * noise)
    // 新規媒体の寄与は直近 6 ヶ月で増加
    const newRatio = i > 6 ? 0 : Math.min(0.22, (6 - i) * 0.035)
    const newMediaConversions = Math.round(conversions * newRatio)
    months.push({
      month: monthLabel,
      conversions,
      newMediaConversions,
    })
  }
  return months
}

export const monthlyCvTrend: MonthlyCvPoint[] = generateMonthlyTrend()

// ── 主要 KPI (ヘッダー直下に並べる 5 枚) ──

function computeKpis(): KpiItem[] {
  const totalConversions = mediaSummaries.reduce((s, m) => s + m.conversions, 0)
  const totalSpend = mediaSummaries.reduce((s, m) => s + m.spend, 0)
  const totalRevenue = mediaSummaries.reduce((s, m) => s + m.revenue, 0)
  const overallCpa = totalConversions > 0 ? totalSpend / totalConversions : 0
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
  const newMediaConversions = mediaSummaries
    .filter((m) => m.isNew)
    .reduce((s, m) => s + m.conversions, 0)
  const newMediaShare =
    totalConversions > 0 ? (newMediaConversions / totalConversions) * 100 : 0

  const cvSpark = monthlyCvTrend.map((m) => m.conversions)
  const newSpark = monthlyCvTrend.map((m) => m.newMediaConversions)
  const cpaSpark = monthlyCvTrend.map(
    (_, i) => overallCpa * (1.18 - i * 0.012),
  )
  const roasSpark = monthlyCvTrend.map(
    (_, i) => overallRoas * (0.84 + i * 0.012),
  )
  const spendSpark = monthlyCvTrend.map((m) => m.conversions * overallCpa)

  return [
    {
      label: "総CV数",
      value: totalConversions.toLocaleString("ja-JP"),
      change: 8.4,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: cvSpark,
    },
    {
      label: "ブレンドCPA",
      value: `¥${Math.round(overallCpa).toLocaleString("ja-JP")}`,
      change: -4.7,
      changeLabel: "前期間比",
      positiveIsGood: false,
      sparklineData: cpaSpark,
    },
    {
      label: "ブレンドROAS",
      value: `${overallRoas.toFixed(2)}倍`,
      change: 6.1,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: roasSpark,
    },
    {
      label: "新規メディア寄与",
      value: `${newMediaShare.toFixed(1)}%`,
      change: 11.3,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: newSpark,
    },
    {
      label: "総支出",
      value: `¥${(totalSpend / 10_000).toFixed(1)}万`,
      change: 3.2,
      changeLabel: "前期間比",
      positiveIsGood: false,
      sparklineData: spendSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const aspOptions = [
  { label: "全ASP", value: "all" },
  { label: "A8.net", value: "A8.net" },
  { label: "バリューコマース", value: "バリューコマース" },
  { label: "楽天アフィリ", value: "楽天アフィリ" },
  { label: "アクセストレード", value: "アクセストレード" },
]

export const segmentOptions = [
  { label: "全媒体", value: "all" },
  { label: "既存媒体", value: "established" },
  { label: "新規 (直近60日)", value: "new" },
]
