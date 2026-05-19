import type {
  Channel,
  ChannelPerformanceRow,
  DailySpendConvPoint,
  KpiItem,
  SankeyLink,
  SankeyNode,
} from "@/types/ad-roas-cpa-dashboard"

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

// ad-roas-cpa-dashboard 専用シード
const rng = seededRand(2914)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function round(n: number, digits = 2): number {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}

// ── 媒体メタ ──

interface ChannelMeta {
  channel: Channel
  label: string
  spendShare: number
  ctrBase: number
  cvrBase: number
  cpcBase: number // 円
  aovBase: number // 円
}

const CHANNELS: ChannelMeta[] = [
  { channel: "google", label: "Google Ads", spendShare: 0.34, ctrBase: 0.042, cvrBase: 0.052, cpcBase: 280, aovBase: 21_800 },
  { channel: "meta", label: "Meta", spendShare: 0.28, ctrBase: 0.018, cvrBase: 0.038, cpcBase: 170, aovBase: 19_800 },
  { channel: "tiktok", label: "TikTok", spendShare: 0.14, ctrBase: 0.028, cvrBase: 0.022, cpcBase: 130, aovBase: 14_700 },
  { channel: "linkedin", label: "LinkedIn", spendShare: 0.16, ctrBase: 0.011, cvrBase: 0.045, cpcBase: 720, aovBase: 36_000 },
  { channel: "yahoo", label: "Yahoo!広告", spendShare: 0.08, ctrBase: 0.022, cvrBase: 0.029, cpcBase: 220, aovBase: 17_700 },
]

// ── 媒体別パフォーマンス ──

const TOTAL_SPEND_30D = 61_800_000 // 円 (約 4,120 万 × 1.5 倍想定)

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
      cpa: round(spend / conversions, 0),
      roas: round(revenue / spend, 2),
      ctr: round((clicks / impressions) * 100, 2),
      cvr: round((conversions / clicks) * 100, 2),
    }
  }).sort((a, b) => b.roas - a.roas)
}

export const channelPerformance: ChannelPerformanceRow[] = generateChannelPerformance()

// ── 日次広告費 vs CV数 (直近 30 日) ──

function generateDailySpendConv(): DailySpendConvPoint[] {
  const out: DailySpendConvPoint[] = []
  const avgDailySpend = TOTAL_SPEND_30D / 30
  for (let i = 29; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekendFactor = dow === 0 || dow === 6 ? 0.78 : 1.06
    const trend = 1 + (29 - i) * 0.0035
    const noise = 0.88 + srand(0, 0.24)
    const spend = Math.round(avgDailySpend * weekendFactor * trend * noise)
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

// ── サンキー: 総予算 → 媒体 → 目的 ──

const OBJECTIVES = [
  { key: "acquisition", label: "新規獲得" },
  { key: "retargeting", label: "リターゲ" },
  { key: "branding", label: "ブランディング" },
] as const

const CHANNEL_OBJECTIVE_SPLIT: Record<Channel, [number, number, number]> = {
  google: [0.58, 0.3, 0.12],
  meta: [0.42, 0.36, 0.22],
  tiktok: [0.35, 0.18, 0.47],
  linkedin: [0.62, 0.22, 0.16],
  yahoo: [0.46, 0.32, 0.22],
}

function generateBudgetSankey(): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const totalLabel = "総予算"
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

// ── ヘッダー KPI ──

function computeKpis(): KpiItem[] {
  const totalSpend = channelPerformance.reduce((s, r) => s + r.spend, 0)
  const totalConv = channelPerformance.reduce((s, r) => s + r.conversions, 0)
  const totalRev = channelPerformance.reduce((s, r) => s + r.revenue, 0)
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

  const spendSpark = dailySpendConv.slice(-14).map((d) => d.spend)
  const convSpark = dailySpendConv.slice(-14).map((d) => d.conversions)
  const roasSpark = dailySpendConv.slice(-14).map((d) =>
    d.spend === 0 ? 0 : (d.conversions * 19800) / d.spend,
  )
  const cpaSpark = dailySpendConv
    .slice(-14)
    .map((d) => (d.conversions === 0 ? 0 : d.spend / d.conversions))
  const ctrSpark = dailySpendConv
    .slice(-14)
    .map(() => overallCtr * (0.92 + srand(0, 0.16)))
  const cvrSpark = dailySpendConv
    .slice(-14)
    .map(() => overallCvr * (0.92 + srand(0, 0.16)))

  return [
    {
      label: "広告費",
      value: `¥${(totalSpend / 10_000).toFixed(1)}万`,
      change: 6.2,
      changeLabel: "前30日比",
      positiveIsGood: false,
      sparklineData: spendSpark,
    },
    {
      label: "CV数",
      value: totalConv.toLocaleString("ja-JP"),
      change: 8.4,
      changeLabel: "前30日比",
      positiveIsGood: true,
      sparklineData: convSpark,
    },
    {
      label: "CPA",
      value: `¥${Math.round(overallCpa).toLocaleString("ja-JP")}`,
      change: -2.1,
      changeLabel: "前30日比",
      positiveIsGood: false,
      sparklineData: cpaSpark,
    },
    {
      label: "ROAS",
      value: `${overallRoas.toFixed(2)}x`,
      change: 4.8,
      changeLabel: "前30日比",
      positiveIsGood: true,
      sparklineData: roasSpark,
    },
    {
      label: "CTR",
      value: `${overallCtr.toFixed(2)}%`,
      change: 0.6,
      changeLabel: "前30日比",
      positiveIsGood: true,
      sparklineData: ctrSpark,
    },
    {
      label: "CVR",
      value: `${overallCvr.toFixed(2)}%`,
      change: 1.4,
      changeLabel: "前30日比",
      positiveIsGood: true,
      sparklineData: cvrSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const channelOptions = [
  { label: "全媒体", value: "all" },
  { label: "Google Ads", value: "google" },
  { label: "Meta", value: "meta" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Yahoo!広告", value: "yahoo" },
]

export const objectiveOptions = [
  { label: "全目的", value: "all" },
  { label: "新規獲得", value: "acquisition" },
  { label: "リターゲ", value: "retargeting" },
  { label: "ブランディング", value: "branding" },
]
