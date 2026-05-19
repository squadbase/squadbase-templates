import type {
  CampaignRoasRow,
  CreativeScatterPoint,
  BudgetPacingRow,
  KpiItem,
} from "@/types/campaign-performance-analysis"

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
const rng = seededRand(4097)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Campaign roster ──

interface CampaignSpec {
  id: string
  name: string
  channel: "meta" | "google" | "tiktok" | "linkedin"
  objective: "conversion" | "awareness" | "consideration"
  baseSpend: number
  baseRoas: number
  baseCvr: number
  baseCtr: number
}

const CAMPAIGNS: CampaignSpec[] = [
  {
    id: "cmp-001",
    name: "Spring Launch — Prospecting",
    channel: "meta",
    objective: "conversion",
    baseSpend: 4_800,
    baseRoas: 3.4,
    baseCvr: 2.6,
    baseCtr: 1.8,
  },
  {
    id: "cmp-002",
    name: "Spring Launch — Retargeting",
    channel: "meta",
    objective: "conversion",
    baseSpend: 1_900,
    baseRoas: 6.1,
    baseCvr: 4.8,
    baseCtr: 2.9,
  },
  {
    id: "cmp-003",
    name: "Search — Brand Defense",
    channel: "google",
    objective: "conversion",
    baseSpend: 2_400,
    baseRoas: 7.8,
    baseCvr: 6.2,
    baseCtr: 8.4,
  },
  {
    id: "cmp-004",
    name: "Search — Non-brand Generic",
    channel: "google",
    objective: "conversion",
    baseSpend: 5_600,
    baseRoas: 2.8,
    baseCvr: 1.9,
    baseCtr: 3.1,
  },
  {
    id: "cmp-005",
    name: "Performance Max — Catalog",
    channel: "google",
    objective: "conversion",
    baseSpend: 3_800,
    baseRoas: 4.1,
    baseCvr: 3.0,
    baseCtr: 2.4,
  },
  {
    id: "cmp-006",
    name: "TikTok Discovery — UGC",
    channel: "tiktok",
    objective: "consideration",
    baseSpend: 3_200,
    baseRoas: 2.1,
    baseCvr: 1.4,
    baseCtr: 1.2,
  },
  {
    id: "cmp-007",
    name: "TikTok Spark Ads — Launch",
    channel: "tiktok",
    objective: "awareness",
    baseSpend: 2_600,
    baseRoas: 1.3,
    baseCvr: 0.9,
    baseCtr: 0.9,
  },
  {
    id: "cmp-008",
    name: "LinkedIn — B2B Webinar",
    channel: "linkedin",
    objective: "consideration",
    baseSpend: 2_100,
    baseRoas: 3.6,
    baseCvr: 2.2,
    baseCtr: 0.7,
  },
]

const CHANNEL_LABEL: Record<CampaignSpec["channel"], string> = {
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
}

// ── Campaign-level ROAS aggregation (last 14 days) ──

const PERIOD_DAYS = 14

function buildCampaignRoas(): CampaignRoasRow[] {
  return CAMPAIGNS.map((cmp) => {
    const spendNoise = 0.92 + srand(0, 0.16)
    const roasNoise = 0.88 + srand(0, 0.24)
    const spend = Math.round(cmp.baseSpend * PERIOD_DAYS * spendNoise)
    const roas = cmp.baseRoas * roasNoise
    const revenue = Math.round(spend * roas)
    const cvr = cmp.baseCvr * (0.92 + srand(0, 0.16))
    const ctr = cmp.baseCtr * (0.94 + srand(0, 0.12))
    // Approximate conversions from spend / CPA (CPA ≈ spend / conversions)
    const avgOrderValue = 70 + srand(0, 60)
    const conversions = Math.max(1, Math.round(revenue / avgOrderValue))
    const cpa = spend / conversions
    // Prior window ROAS delta (random but seeded so it stays stable)
    const roasDelta = (srand(0, 1) - 0.45) * 24 // %

    return {
      campaignId: cmp.id,
      campaignName: cmp.name,
      channel: CHANNEL_LABEL[cmp.channel],
      spend,
      conversions,
      revenue,
      roas: Math.round(roas * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      cvr: Math.round(cvr * 100) / 100,
      roasDelta: Math.round(roasDelta * 10) / 10,
    }
  }).sort((a, b) => b.roas - a.roas)
}

export const campaignRoas: CampaignRoasRow[] = buildCampaignRoas()

// ── Creative-level scatter (CTR × CVR) ──

const CREATIVE_FORMATS: CreativeScatterPoint["format"][] = [
  "image",
  "video",
  "carousel",
]

function buildCreatives(): CreativeScatterPoint[] {
  const out: CreativeScatterPoint[] = []
  for (const cmp of CAMPAIGNS) {
    // 3-5 creatives per campaign
    const count = 3 + Math.floor(srand(0, 3))
    for (let i = 0; i < count; i++) {
      const format = CREATIVE_FORMATS[Math.floor(srand(0, 3))]
      const ctrNoise = 0.5 + srand(0, 1.4)
      const cvrNoise = 0.5 + srand(0, 1.4)
      const ctr = cmp.baseCtr * ctrNoise
      const cvr = cmp.baseCvr * cvrNoise
      const impressions = Math.round(20_000 + srand(0, 90_000))
      const clicks = Math.max(1, Math.round((impressions * ctr) / 100))
      const conversions = Math.max(0, Math.round((clicks * cvr) / 100))
      const spend = Math.round(clicks * (0.6 + srand(0, 1.2)))
      const revenue = Math.round(spend * cmp.baseRoas * (0.7 + srand(0, 0.7)))
      // Learning-phase classification
      // - <50 conversions in window → learning
      // - Low CTR + lots of impressions → limited
      // - Otherwise → active
      const phase: CreativeScatterPoint["learningPhase"] =
        conversions < 12
          ? "learning"
          : ctr < cmp.baseCtr * 0.6
            ? "limited"
            : "active"

      out.push({
        creativeId: `${cmp.id}-cr-${String(i + 1).padStart(2, "0")}`,
        creativeName: `${cmp.name.split("—")[0].trim()} · ${format} ${i + 1}`,
        campaignId: cmp.id,
        campaignName: cmp.name,
        format,
        impressions,
        clicks,
        conversions,
        spend,
        revenue,
        ctr: Math.round(ctr * 100) / 100,
        cvr: Math.round(cvr * 100) / 100,
        learningPhase: phase,
      })
    }
  }
  return out
}

export const creatives: CreativeScatterPoint[] = buildCreatives()

// ── Budget pacing ──

function buildBudgetPacing(): BudgetPacingRow[] {
  // Assume a monthly budget cycle. We're "day 15 of 31".
  const daysInPeriod = 31
  const daysElapsed = 15
  const pctTimeElapsed = (daysElapsed / daysInPeriod) * 100

  return CAMPAIGNS.map((cmp, i) => {
    // Monthly budget ≈ 31 days of base spend with some variation per campaign
    const monthly = cmp.baseSpend * daysInPeriod
    const budgetMultiplier = 0.9 + srand(0, 0.4)
    const budget = Math.round(monthly * budgetMultiplier)
    // pctSpent: vary around pctTimeElapsed with skew
    const skew = (i % 3 === 0 ? 1.18 : i % 3 === 1 ? 0.82 : 1.02) + (srand(0, 0.1) - 0.05)
    const pctSpentRaw = pctTimeElapsed * skew
    const pctSpent = Math.min(100, Math.max(0, pctSpentRaw))
    const spent = Math.round((budget * pctSpent) / 100)

    const diff = pctSpent - pctTimeElapsed
    const paceStatus: BudgetPacingRow["paceStatus"] =
      diff > 6 ? "ahead" : diff < -6 ? "behind" : "on-track"

    return {
      campaignId: cmp.id,
      campaignName: cmp.name,
      budget,
      spent,
      pctSpent: Math.round(pctSpent * 10) / 10,
      daysElapsed,
      daysInPeriod,
      pctTimeElapsed: Math.round(pctTimeElapsed * 10) / 10,
      paceStatus,
    }
  }).sort((a, b) => b.pctSpent - a.pctSpent)
}

export const budgetPacing: BudgetPacingRow[] = buildBudgetPacing()

// ── Header KPIs ──

function buildKpis(): KpiItem[] {
  const totalSpend = campaignRoas.reduce((s, c) => s + c.spend, 0)
  const totalRevenue = campaignRoas.reduce((s, c) => s + c.revenue, 0)
  const totalConv = campaignRoas.reduce((s, c) => s + c.conversions, 0)
  const blendedRoas = totalRevenue / totalSpend

  // Creative-level CVR aggregate
  const cvSum = creatives.reduce((s, c) => s + c.conversions, 0)
  const clickSum = creatives.reduce((s, c) => s + c.clicks, 0)
  const blendedCvr = (cvSum / clickSum) * 100

  // Learning-phase exits — % of creatives that left learning into "active"
  const exited = creatives.filter((c) => c.learningPhase === "active").length
  const exitRate = (exited / creatives.length) * 100

  // Sparkline series (14 days) — use seeded micro-noise around base for shape
  const roasSpark = Array.from({ length: 14 }, (_, i) =>
    Math.round((blendedRoas + Math.sin(i / 2.4) * 0.4 + (srand(0, 0.5) - 0.25)) * 100) / 100,
  )
  const cvrSpark = Array.from({ length: 14 }, (_, i) =>
    Math.round((blendedCvr + Math.sin(i / 1.8 + 0.5) * 0.3 + (srand(0, 0.4) - 0.2)) * 100) / 100,
  )
  const exitSpark = Array.from({ length: 14 }, (_, i) =>
    Math.round(exitRate + Math.sin(i / 3) * 5 + (srand(0, 6) - 3)),
  )

  return [
    {
      label: "Blended ROAS",
      value: `${blendedRoas.toFixed(2)}x`,
      change: 8.2,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: roasSpark,
    },
    {
      label: "Creative CVR",
      value: `${blendedCvr.toFixed(2)}%`,
      change: 3.4,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: cvrSpark,
    },
    {
      label: "Total Spend",
      value: `$${(totalSpend / 1000).toFixed(1)}K`,
      change: -2.1,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: Array.from({ length: 14 }, () => Math.round(totalSpend / 14)),
    },
    {
      label: "Conversions",
      value: totalConv.toLocaleString("en-US"),
      change: 11.6,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: Array.from({ length: 14 }, (_, i) =>
        Math.round(totalConv / 14 + Math.sin(i / 2) * (totalConv / 60)),
      ),
    },
    {
      label: "Post-Learning Rate",
      value: `${exitRate.toFixed(0)}%`,
      change: 6.8,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: exitSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = buildKpis()

// ── Filter options ──

export const channelOptions = [
  { label: "All channels", value: "all" },
  { label: "Meta", value: "meta" },
  { label: "Google", value: "google" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
]

export const objectiveOptions = [
  { label: "All objectives", value: "all" },
  { label: "Conversion", value: "conversion" },
  { label: "Consideration", value: "consideration" },
  { label: "Awareness", value: "awareness" },
]

// ── Date markers for header display ──

export const periodStart: string = dateStr(PERIOD_DAYS - 1)
export const periodEnd: string = dateStr(0)
