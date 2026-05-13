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

// このテンプレート固有の seed
const rng = seededRand(4097)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── キャンペーンマスタ ──

interface CampaignSpec {
  id: string
  name: string
  channel: "meta" | "google" | "tiktok" | "linkedin"
  objective: "conversion" | "awareness" | "consideration"
  baseSpend: number // 円/日
  baseRoas: number
  baseCvr: number
  baseCtr: number
}

const CAMPAIGNS: CampaignSpec[] = [
  {
    id: "cmp-001",
    name: "春の新作 — 新規獲得",
    channel: "meta",
    objective: "conversion",
    baseSpend: 480_000,
    baseRoas: 3.4,
    baseCvr: 2.6,
    baseCtr: 1.8,
  },
  {
    id: "cmp-002",
    name: "春の新作 — リターゲ",
    channel: "meta",
    objective: "conversion",
    baseSpend: 190_000,
    baseRoas: 6.1,
    baseCvr: 4.8,
    baseCtr: 2.9,
  },
  {
    id: "cmp-003",
    name: "検索 — 指名防衛",
    channel: "google",
    objective: "conversion",
    baseSpend: 240_000,
    baseRoas: 7.8,
    baseCvr: 6.2,
    baseCtr: 8.4,
  },
  {
    id: "cmp-004",
    name: "検索 — 非指名ジェネリック",
    channel: "google",
    objective: "conversion",
    baseSpend: 560_000,
    baseRoas: 2.8,
    baseCvr: 1.9,
    baseCtr: 3.1,
  },
  {
    id: "cmp-005",
    name: "P-MAX — カタログ",
    channel: "google",
    objective: "conversion",
    baseSpend: 380_000,
    baseRoas: 4.1,
    baseCvr: 3.0,
    baseCtr: 2.4,
  },
  {
    id: "cmp-006",
    name: "TikTok ディスカバリ — UGC",
    channel: "tiktok",
    objective: "consideration",
    baseSpend: 320_000,
    baseRoas: 2.1,
    baseCvr: 1.4,
    baseCtr: 1.2,
  },
  {
    id: "cmp-007",
    name: "TikTok Spark Ads — 認知",
    channel: "tiktok",
    objective: "awareness",
    baseSpend: 260_000,
    baseRoas: 1.3,
    baseCvr: 0.9,
    baseCtr: 0.9,
  },
  {
    id: "cmp-008",
    name: "LinkedIn — B2B ウェビナー",
    channel: "linkedin",
    objective: "consideration",
    baseSpend: 210_000,
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

// ── キャンペーン別 ROAS 集計 (直近 14 日) ──

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
    // 平均 CV 単価から CV 数を逆算
    const avgOrderValue = 7_000 + srand(0, 6_000)
    const conversions = Math.max(1, Math.round(revenue / avgOrderValue))
    const cpa = spend / conversions
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

// ── クリエイティブ散布図 (CTR × CVR) ──

const CREATIVE_FORMATS: CreativeScatterPoint["format"][] = [
  "image",
  "video",
  "carousel",
]

const FORMAT_LABEL: Record<CreativeScatterPoint["format"], string> = {
  image: "画像",
  video: "動画",
  carousel: "カルーセル",
}

function buildCreatives(): CreativeScatterPoint[] {
  const out: CreativeScatterPoint[] = []
  for (const cmp of CAMPAIGNS) {
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
      const spend = Math.round(clicks * (60 + srand(0, 120)))
      const revenue = Math.round(spend * cmp.baseRoas * (0.7 + srand(0, 0.7)))
      // 学習期間ステータス
      const phase: CreativeScatterPoint["learningPhase"] =
        conversions < 12
          ? "learning"
          : ctr < cmp.baseCtr * 0.6
            ? "limited"
            : "active"

      out.push({
        creativeId: `${cmp.id}-cr-${String(i + 1).padStart(2, "0")}`,
        creativeName: `${cmp.name.split("—")[0].trim()} ・ ${FORMAT_LABEL[format]} ${i + 1}`,
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

// ── 予算消化進捗 ──

function buildBudgetPacing(): BudgetPacingRow[] {
  // 月次予算サイクル: 31 日中の 15 日目
  const daysInPeriod = 31
  const daysElapsed = 15
  const pctTimeElapsed = (daysElapsed / daysInPeriod) * 100

  return CAMPAIGNS.map((cmp, i) => {
    const monthly = cmp.baseSpend * daysInPeriod
    const budgetMultiplier = 0.9 + srand(0, 0.4)
    const budget = Math.round(monthly * budgetMultiplier)
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

// ── ヘッダー KPI ──

function buildKpis(): KpiItem[] {
  const totalSpend = campaignRoas.reduce((s, c) => s + c.spend, 0)
  const totalRevenue = campaignRoas.reduce((s, c) => s + c.revenue, 0)
  const totalConv = campaignRoas.reduce((s, c) => s + c.conversions, 0)
  const blendedRoas = totalRevenue / totalSpend

  const cvSum = creatives.reduce((s, c) => s + c.conversions, 0)
  const clickSum = creatives.reduce((s, c) => s + c.clicks, 0)
  const blendedCvr = (cvSum / clickSum) * 100

  const exited = creatives.filter((c) => c.learningPhase === "active").length
  const exitRate = (exited / creatives.length) * 100

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
      label: "ブレンド ROAS",
      value: `${blendedRoas.toFixed(2)}x`,
      change: 8.2,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: roasSpark,
    },
    {
      label: "クリエイティブ CVR",
      value: `${blendedCvr.toFixed(2)}%`,
      change: 3.4,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: cvrSpark,
    },
    {
      label: "総支出",
      value: `¥${(totalSpend / 10_000).toFixed(0)}万`,
      change: -2.1,
      changeLabel: "前期間比",
      positiveIsGood: false,
      sparklineData: Array.from({ length: 14 }, () => Math.round(totalSpend / 14)),
    },
    {
      label: "CV 数",
      value: totalConv.toLocaleString("ja-JP"),
      change: 11.6,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: Array.from({ length: 14 }, (_, i) =>
        Math.round(totalConv / 14 + Math.sin(i / 2) * (totalConv / 60)),
      ),
    },
    {
      label: "学習終了率",
      value: `${exitRate.toFixed(0)}%`,
      change: 6.8,
      changeLabel: "前期間比",
      positiveIsGood: true,
      sparklineData: exitSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = buildKpis()

// ── フィルター選択肢 ──

export const channelOptions = [
  { label: "すべてのチャネル", value: "all" },
  { label: "Meta", value: "meta" },
  { label: "Google", value: "google" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
]

export const objectiveOptions = [
  { label: "すべての目的", value: "all" },
  { label: "コンバージョン", value: "conversion" },
  { label: "比較検討", value: "consideration" },
  { label: "認知", value: "awareness" },
]

// ── ヘッダー表示用の期間 ──

export const periodStart: string = dateStr(PERIOD_DAYS - 1)
export const periodEnd: string = dateStr(0)
