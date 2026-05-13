import type {
  Channel,
  ChannelPerformanceRow,
  DailySpendConvPoint,
  KpiItem,
  SankeyLink,
  SankeyNode,
} from "@/types/ad-roas-cpa-dashboard"

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

// Unique seed for ad-roas-cpa-dashboard
const rng = seededRand(2914)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function round(n: number, digits = 2): number {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}

// ── Channel meta ──

interface ChannelMeta {
  channel: Channel
  label: string
  spendShare: number // share of total spend
  ctrBase: number
  cvrBase: number
  cpcBase: number // base cost per click (USD)
  aovBase: number // base average order value (USD)
}

const CHANNELS: ChannelMeta[] = [
  { channel: "google", label: "Google Ads", spendShare: 0.34, ctrBase: 0.042, cvrBase: 0.052, cpcBase: 1.85, aovBase: 145 },
  { channel: "meta", label: "Meta", spendShare: 0.28, ctrBase: 0.018, cvrBase: 0.038, cpcBase: 1.15, aovBase: 132 },
  { channel: "tiktok", label: "TikTok", spendShare: 0.14, ctrBase: 0.028, cvrBase: 0.022, cpcBase: 0.85, aovBase: 98 },
  { channel: "linkedin", label: "LinkedIn", spendShare: 0.16, ctrBase: 0.011, cvrBase: 0.045, cpcBase: 4.8, aovBase: 240 },
  { channel: "yahoo", label: "Yahoo", spendShare: 0.08, ctrBase: 0.022, cvrBase: 0.029, cpcBase: 1.45, aovBase: 118 },
]

// ── Channel performance table ──

const TOTAL_SPEND_30D = 412_000 // USD

function generateChannelPerformance(): ChannelPerformanceRow[] {
  return CHANNELS.map((c) => {
    const spend = Math.round(TOTAL_SPEND_30D * c.spendShare * (0.93 + srand(0, 0.14)))
    const cpc = c.cpcBase * (0.92 + srand(0, 0.16))
    const clicks = Math.round(spend / cpc)
    const ctr = c.ctrBase * (0.9 + srand(0, 0.2))
    const impressions = Math.round(clicks / ctr)
    const cvr = c.cvrBase * (0.88 + srand(0, 0.24))
    const conversions = Math.max(1, Math.round(clicks * cvr))
    const aov = c.aovBase * (0.92 + srand(0, 0.16))
    const revenue = Math.round(conversions * aov)
    return {
      channel: c.channel,
      channelLabel: c.label,
      spend,
      conversions,
      revenue,
      cpa: round(spend / conversions, 2),
      roas: round(revenue / spend, 2),
      ctr: round((clicks / impressions) * 100, 2),
      cvr: round((conversions / clicks) * 100, 2),
    }
  }).sort((a, b) => b.roas - a.roas)
}

export const channelPerformance: ChannelPerformanceRow[] = generateChannelPerformance()

// ── Daily spend vs conversions (last 30 days) ──

function generateDailySpendConv(): DailySpendConvPoint[] {
  const out: DailySpendConvPoint[] = []
  const avgDailySpend = TOTAL_SPEND_30D / 30
  for (let i = 29; i >= 0; i--) {
    // weekend dip + slight upward trend
    const d = new Date(BASE_DATE)
    d.setDate(d.getDate() - i)
    const dow = d.getDay() // 0=Sun..6=Sat
    const weekendFactor = dow === 0 || dow === 6 ? 0.78 : 1.06
    const trend = 1 + (29 - i) * 0.0035
    const noise = 0.88 + srand(0, 0.24)
    const spend = Math.round(avgDailySpend * weekendFactor * trend * noise)
    // weighted blended CVR across channels by spend share
    const blendedCvr = CHANNELS.reduce(
      (s, c) => s + c.spendShare * c.cvrBase,
      0,
    )
    const blendedCpc = CHANNELS.reduce(
      (s, c) => s + c.spendShare * c.cpcBase,
      0,
    )
    const conversions = Math.max(
      1,
      Math.round((spend / blendedCpc) * blendedCvr * (0.9 + srand(0, 0.2))),
    )
    out.push({ date: dateStr(i), spend, conversions })
  }
  return out
}

export const dailySpendConv: DailySpendConvPoint[] = generateDailySpendConv()

// ── Sankey: Total Budget → Channel → Objective ──

const OBJECTIVES = [
  { key: "acquisition", label: "Acquisition" },
  { key: "retargeting", label: "Retargeting" },
  { key: "branding", label: "Branding" },
] as const

// Channel × objective allocation (fractions sum to 1 per channel)
const CHANNEL_OBJECTIVE_SPLIT: Record<Channel, [number, number, number]> = {
  google: [0.58, 0.3, 0.12],
  meta: [0.42, 0.36, 0.22],
  tiktok: [0.35, 0.18, 0.47],
  linkedin: [0.62, 0.22, 0.16],
  yahoo: [0.46, 0.32, 0.22],
}

function generateBudgetSankey(): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const totalLabel = "Total Budget"
  const nodes: SankeyNode[] = [
    { name: totalLabel },
    ...CHANNELS.map((c) => ({ name: c.label })),
    ...OBJECTIVES.map((o) => ({ name: o.label })),
  ]
  const links: SankeyLink[] = []
  for (const row of channelPerformance) {
    links.push({
      source: totalLabel,
      target: row.channelLabel,
      value: row.spend,
    })
    const split = CHANNEL_OBJECTIVE_SPLIT[row.channel]
    OBJECTIVES.forEach((obj, i) => {
      links.push({
        source: row.channelLabel,
        target: obj.label,
        value: Math.round(row.spend * split[i]),
      })
    })
  }
  return { nodes, links }
}

export const budgetSankey = generateBudgetSankey()

// ── Header KPIs ──

function computeKpis(): KpiItem[] {
  const totalSpend = channelPerformance.reduce((s, r) => s + r.spend, 0)
  const totalConv = channelPerformance.reduce((s, r) => s + r.conversions, 0)
  const totalRev = channelPerformance.reduce((s, r) => s + r.revenue, 0)
  const totalClicks = dailySpendConv.reduce((s) => s, 0) // placeholder; use channel sums
  void totalClicks
  const totalImpressions = channelPerformance.reduce(
    (s, r) => s + Math.round((r.conversions / (r.cvr / 100)) / (r.ctr / 100)),
    0,
  )
  const totalClicksAcc = channelPerformance.reduce(
    (s, r) => s + Math.round(r.conversions / (r.cvr / 100)),
    0,
  )

  const overallCpa = totalSpend / totalConv
  const overallRoas = totalRev / totalSpend
  const overallCtr = (totalClicksAcc / totalImpressions) * 100
  const overallCvr = (totalConv / totalClicksAcc) * 100

  // Trend mocks
  const spendSpark = dailySpendConv.slice(-14).map((d) => d.spend)
  const convSpark = dailySpendConv.slice(-14).map((d) => d.conversions)
  const roasSpark = dailySpendConv.slice(-14).map((d, i, arr) => {
    const prevSpend = i === 0 ? d.spend : arr[i - 1].spend
    return prevSpend === 0 ? 0 : (d.conversions * 130) / d.spend
  })
  const cpaSpark = dailySpendConv.slice(-14).map((d) =>
    d.conversions === 0 ? 0 : d.spend / d.conversions,
  )
  const ctrSpark = dailySpendConv.slice(-14).map(() =>
    overallCtr * (0.92 + srand(0, 0.16)),
  )
  const cvrSpark = dailySpendConv.slice(-14).map(() =>
    overallCvr * (0.92 + srand(0, 0.16)),
  )

  return [
    {
      label: "Ad Spend",
      value: `$${(totalSpend / 1000).toFixed(1)}K`,
      change: 6.2,
      changeLabel: "vs prev 30d",
      positiveIsGood: false,
      sparklineData: spendSpark,
    },
    {
      label: "Conversions",
      value: totalConv.toLocaleString("en-US"),
      change: 8.4,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: convSpark,
    },
    {
      label: "CPA",
      value: `$${overallCpa.toFixed(2)}`,
      change: -2.1,
      changeLabel: "vs prev 30d",
      positiveIsGood: false,
      sparklineData: cpaSpark,
    },
    {
      label: "ROAS",
      value: `${overallRoas.toFixed(2)}x`,
      change: 4.8,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: roasSpark,
    },
    {
      label: "CTR",
      value: `${overallCtr.toFixed(2)}%`,
      change: 0.6,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: ctrSpark,
    },
    {
      label: "CVR",
      value: `${overallCvr.toFixed(2)}%`,
      change: 1.4,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: cvrSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const channelOptions = [
  { label: "All channels", value: "all" },
  { label: "Google Ads", value: "google" },
  { label: "Meta", value: "meta" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Yahoo", value: "yahoo" },
]

export const objectiveOptions = [
  { label: "All objectives", value: "all" },
  { label: "Acquisition", value: "acquisition" },
  { label: "Retargeting", value: "retargeting" },
  { label: "Branding", value: "branding" },
]
