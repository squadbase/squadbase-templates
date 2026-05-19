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

// ── Media catalog ──
// 12 affiliate media across 4 ASPs. Some are "new" (launched within last 60 days).

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
  { id: "m01", name: "CashbackHub", asp: "Awin", baseSpend: 14500, baseConv: 320, baseAov: 92 },
  { id: "m02", name: "DealNetwork", asp: "CJ", baseSpend: 11800, baseConv: 245, baseAov: 88 },
  { id: "m03", name: "CouponMaster", asp: "Rakuten", baseSpend: 9300, baseConv: 198, baseAov: 76 },
  { id: "m04", name: "InfluencerCircle", asp: "Impact", baseSpend: 8700, baseConv: 142, baseAov: 124 },
  { id: "m05", name: "ReviewSpot", asp: "Awin", baseSpend: 6400, baseConv: 118, baseAov: 95 },
  { id: "m06", name: "BlogCollective", asp: "CJ", baseSpend: 5200, baseConv: 84, baseAov: 102 },
  { id: "m07", name: "PriceTracker", asp: "Rakuten", baseSpend: 4800, baseConv: 76, baseAov: 71 },
  { id: "m08", name: "MediaHouseX", asp: "Impact", baseSpend: 4200, baseConv: 95, baseAov: 138, isNew: true },
  { id: "m09", name: "NicheReview", asp: "Awin", baseSpend: 3100, baseConv: 52, baseAov: 89 },
  { id: "m10", name: "CreatorPlus", asp: "Impact", baseSpend: 2400, baseConv: 48, baseAov: 116, isNew: true },
  { id: "m11", name: "BargainDaily", asp: "CJ", baseSpend: 1900, baseConv: 38, baseAov: 64 },
  { id: "m12", name: "SocialBuzz", asp: "Impact", baseSpend: 1500, baseConv: 22, baseAov: 108, isNew: true },
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

// ── Monthly CV trend (last 12 months) ──

function generateMonthlyTrend(): MonthlyCvPoint[] {
  const months: MonthlyCvPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setMonth(d.getMonth() - i)
    const monthLabel = d.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
    })
    const seasonal = 1 + Math.sin((d.getMonth() / 12) * Math.PI * 2) * 0.12
    const trend = 1 + (11 - i) * 0.025
    const noise = 0.92 + srand(0, 0.16)
    const baseCv = 1100
    const conversions = Math.round(baseCv * seasonal * trend * noise)
    // New-media contribution ramps up over the last 6 months
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

// ── Top-line KPIs (header summary, 5 cards) ──

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

  // 14-point sparklines derived from monthly trend (split across months)
  const cvSpark = monthlyCvTrend.map((m) => m.conversions)
  const newSpark = monthlyCvTrend.map((m) => m.newMediaConversions)
  // Synthetic CPA / ROAS sparkline: gentle improving trend
  const cpaSpark = monthlyCvTrend.map(
    (_, i) => overallCpa * (1.18 - i * 0.012),
  )
  const roasSpark = monthlyCvTrend.map(
    (_, i) => overallRoas * (0.84 + i * 0.012),
  )
  const spendSpark = monthlyCvTrend.map((m) => m.conversions * overallCpa)

  return [
    {
      label: "Total Conversions",
      value: totalConversions.toLocaleString("en-US"),
      change: 8.4,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: cvSpark,
    },
    {
      label: "Blended CPA",
      value: `$${overallCpa.toFixed(2)}`,
      change: -4.7,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: cpaSpark,
    },
    {
      label: "Blended ROAS",
      value: `${overallRoas.toFixed(2)}x`,
      change: 6.1,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: roasSpark,
    },
    {
      label: "New Media Share",
      value: `${newMediaShare.toFixed(1)}%`,
      change: 11.3,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: newSpark,
    },
    {
      label: "Total Spend",
      value: `$${(totalSpend / 1000).toFixed(1)}K`,
      change: 3.2,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: spendSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const aspOptions = [
  { label: "All ASPs", value: "all" },
  { label: "Awin", value: "Awin" },
  { label: "CJ", value: "CJ" },
  { label: "Rakuten", value: "Rakuten" },
  { label: "Impact", value: "Impact" },
]

export const segmentOptions = [
  { label: "All media", value: "all" },
  { label: "Established", value: "established" },
  { label: "New (last 60 days)", value: "new" },
]
