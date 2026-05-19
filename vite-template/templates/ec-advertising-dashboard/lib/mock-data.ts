import type {
  AdVsOrganicPoint,
  CampaignPerformanceRow,
  KeywordRankingRow,
  KpiItem,
  Marketplace,
} from "@/types/ec-advertising-dashboard"

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

// Unique seed for ec-advertising-dashboard
const rng = seededRand(40117)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function round(n: number, digits = 2): number {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}

// ── Campaign meta ──

interface CampaignMeta {
  campaignId: string
  campaignName: string
  marketplace: Marketplace
  marketplaceLabel: string
  spendShare: number
  acosBase: number // base ACoS (%)
  cvrBase: number // base ad CVR (%)
  organicMult: number // organic-revenue multiplier vs ad revenue
}

const CAMPAIGNS: CampaignMeta[] = [
  { campaignId: "AMZ-SP-001", campaignName: "Sponsored Products — Brand Core", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.22, acosBase: 14.5, cvrBase: 11.2, organicMult: 2.2 },
  { campaignId: "AMZ-SP-002", campaignName: "Sponsored Products — Auto", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.18, acosBase: 22.4, cvrBase: 7.8, organicMult: 1.4 },
  { campaignId: "AMZ-SB-001", campaignName: "Sponsored Brands — HQ Store", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.12, acosBase: 18.6, cvrBase: 9.1, organicMult: 1.8 },
  { campaignId: "AMZ-SD-001", campaignName: "Sponsored Display — Retargeting", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.08, acosBase: 28.2, cvrBase: 6.4, organicMult: 0.9 },
  { campaignId: "RKT-RPP-001", campaignName: "RPP — Best Sellers", marketplace: "rakuten", marketplaceLabel: "Rakuten", spendShare: 0.16, acosBase: 16.8, cvrBase: 10.4, organicMult: 1.9 },
  { campaignId: "RKT-CPA-001", campaignName: "CPA Ads — Acquisition", marketplace: "rakuten", marketplaceLabel: "Rakuten", spendShare: 0.14, acosBase: 24.6, cvrBase: 5.9, organicMult: 1.1 },
  { campaignId: "RKT-COU-001", campaignName: "Rakuten Coupon Boost", marketplace: "rakuten", marketplaceLabel: "Rakuten", spendShare: 0.10, acosBase: 31.5, cvrBase: 8.6, organicMult: 0.7 },
]

const TOTAL_SPEND_30D = 286_000 // USD

// ── Campaign performance table ──

function generateCampaignPerformance(): CampaignPerformanceRow[] {
  return CAMPAIGNS.map((c) => {
    const spend = Math.round(TOTAL_SPEND_30D * c.spendShare * (0.92 + srand(0, 0.16)))
    const acos = round(c.acosBase * (0.9 + srand(0, 0.2)), 1)
    const adRevenue = Math.round(spend / (acos / 100))
    const organicRevenue = Math.round(adRevenue * c.organicMult * (0.85 + srand(0, 0.3)))
    const totalRevenue = adRevenue + organicRevenue
    const tacos = round((spend / Math.max(1, totalRevenue)) * 100, 1)
    const cvr = round(c.cvrBase * (0.9 + srand(0, 0.2)), 2)
    const conversions = Math.max(1, Math.round((spend / 1.45) * (cvr / 100)))
    return {
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      marketplace: c.marketplace,
      marketplaceLabel: c.marketplaceLabel,
      spend,
      adRevenue,
      organicRevenue,
      acos,
      tacos,
      conversions,
      cvr,
    }
  }).sort((a, b) => a.acos - b.acos)
}

export const campaignPerformance: CampaignPerformanceRow[] = generateCampaignPerformance()

// ── Ad vs organic revenue (last 30 days, stacked) ──

function generateAdVsOrganic(): AdVsOrganicPoint[] {
  const out: AdVsOrganicPoint[] = []
  const avgAd =
    campaignPerformance.reduce((s, r) => s + r.adRevenue, 0) / 30
  const avgOrganic =
    campaignPerformance.reduce((s, r) => s + r.organicRevenue, 0) / 30
  for (let i = 29; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setDate(d.getDate() - i)
    const dow = d.getDay() // 0=Sun..6=Sat
    const weekendFactor = dow === 0 || dow === 6 ? 1.12 : 0.96
    const trend = 1 + (29 - i) * 0.0028
    const adNoise = 0.88 + srand(0, 0.24)
    const orgNoise = 0.9 + srand(0, 0.2)
    const adRevenue = Math.round(avgAd * weekendFactor * trend * adNoise)
    const organicRevenue = Math.round(avgOrganic * weekendFactor * trend * orgNoise)
    out.push({ date: dateStr(i), adRevenue, organicRevenue })
  }
  return out
}

export const adVsOrganic: AdVsOrganicPoint[] = generateAdVsOrganic()

// ── Keyword ranking ──

interface KeywordSeed {
  keyword: string
  campaignId: string
  marketplace: Marketplace
  marketplaceLabel: string
  share: number
  cpcBase: number
  cvrBase: number
}

const KEYWORD_SEEDS: KeywordSeed[] = [
  { keyword: "wireless earbuds", campaignId: "AMZ-SP-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.16, cpcBase: 0.86, cvrBase: 12.8 },
  { keyword: "noise cancelling headphones", campaignId: "AMZ-SP-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.12, cpcBase: 1.42, cvrBase: 9.6 },
  { keyword: "bluetooth speaker", campaignId: "AMZ-SP-002", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.10, cpcBase: 0.74, cvrBase: 8.4 },
  { keyword: "portable charger", campaignId: "AMZ-SP-002", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.09, cpcBase: 0.58, cvrBase: 11.2 },
  { keyword: "smart watch", campaignId: "AMZ-SB-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.08, cpcBase: 1.18, cvrBase: 6.8 },
  { keyword: "usb-c cable", campaignId: "AMZ-SD-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.07, cpcBase: 0.42, cvrBase: 14.1 },
  { keyword: "ワイヤレスイヤホン", campaignId: "RKT-RPP-001", marketplace: "rakuten", marketplaceLabel: "Rakuten", share: 0.10, cpcBase: 0.92, cvrBase: 11.6 },
  { keyword: "モバイルバッテリー", campaignId: "RKT-RPP-001", marketplace: "rakuten", marketplaceLabel: "Rakuten", share: 0.08, cpcBase: 0.68, cvrBase: 9.8 },
  { keyword: "スマートウォッチ", campaignId: "RKT-CPA-001", marketplace: "rakuten", marketplaceLabel: "Rakuten", share: 0.07, cpcBase: 1.32, cvrBase: 6.2 },
  { keyword: "bluetoothスピーカー", campaignId: "RKT-CPA-001", marketplace: "rakuten", marketplaceLabel: "Rakuten", share: 0.06, cpcBase: 0.84, cvrBase: 7.8 },
  { keyword: "充電ケーブル", campaignId: "RKT-COU-001", marketplace: "rakuten", marketplaceLabel: "Rakuten", share: 0.04, cpcBase: 0.38, cvrBase: 12.4 },
  { keyword: "tablet stand", campaignId: "AMZ-SD-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.03, cpcBase: 0.52, cvrBase: 5.2 },
]

function generateKeywordRanking(): KeywordRankingRow[] {
  const totalKeywordSpend = TOTAL_SPEND_30D * 0.78
  return KEYWORD_SEEDS.map((k) => {
    const spend = Math.round(totalKeywordSpend * k.share * (0.92 + srand(0, 0.16)))
    const cpc = round(k.cpcBase * (0.9 + srand(0, 0.2)), 2)
    const clicks = Math.max(1, Math.round(spend / cpc))
    const cvr = round(k.cvrBase * (0.9 + srand(0, 0.2)), 2)
    const conversions = Math.max(1, Math.round(clicks * (cvr / 100)))
    const cpa = round(spend / conversions, 2)
    return {
      keyword: k.keyword,
      campaignId: k.campaignId,
      marketplace: k.marketplace,
      marketplaceLabel: k.marketplaceLabel,
      spend,
      clicks,
      conversions,
      cpc,
      cpa,
      cvr,
    }
  }).sort((a, b) => b.conversions - a.conversions)
}

export const keywordRanking: KeywordRankingRow[] = generateKeywordRanking()

// ── Header KPIs ──

function computeKpis(): KpiItem[] {
  const totalSpend = campaignPerformance.reduce((s, r) => s + r.spend, 0)
  const totalAdRev = campaignPerformance.reduce((s, r) => s + r.adRevenue, 0)
  const totalOrganicRev = campaignPerformance.reduce(
    (s, r) => s + r.organicRevenue,
    0,
  )
  const totalRevenue = totalAdRev + totalOrganicRev

  const acos = (totalSpend / totalAdRev) * 100
  const tacos = (totalSpend / totalRevenue) * 100
  const adCvr =
    campaignPerformance.reduce((s, r) => s + r.cvr, 0) /
    campaignPerformance.length
  const organicShare = (totalOrganicRev / totalRevenue) * 100

  // 14-day sparklines from the daily ad-vs-organic series
  const last14 = adVsOrganic.slice(-14)
  const adRevSpark = last14.map((d) => d.adRevenue)
  const acosSpark = last14.map(
    (d) => (totalSpend / 30 / Math.max(1, d.adRevenue)) * 100,
  )
  const tacosSpark = last14.map(
    (d) =>
      (totalSpend / 30 / Math.max(1, d.adRevenue + d.organicRevenue)) * 100,
  )
  const cvrSpark = last14.map(() => adCvr * (0.92 + srand(0, 0.16)))
  const organicSpark = last14.map(
    (d) =>
      (d.organicRevenue / Math.max(1, d.adRevenue + d.organicRevenue)) * 100,
  )

  return [
    {
      label: "Ad Revenue",
      value: `$${(totalAdRev / 1000).toFixed(1)}K`,
      change: 8.4,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: adRevSpark,
    },
    {
      label: "ACoS",
      value: `${acos.toFixed(1)}%`,
      change: -2.6,
      changeLabel: "vs prev 30d",
      positiveIsGood: false,
      sparklineData: acosSpark,
    },
    {
      label: "TACoS",
      value: `${tacos.toFixed(1)}%`,
      change: -1.2,
      changeLabel: "vs prev 30d",
      positiveIsGood: false,
      sparklineData: tacosSpark,
    },
    {
      label: "Ad CVR",
      value: `${adCvr.toFixed(2)}%`,
      change: 0.7,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: cvrSpark,
    },
    {
      label: "Organic Share",
      value: `${organicShare.toFixed(1)}%`,
      change: 3.1,
      changeLabel: "vs prev 30d",
      positiveIsGood: true,
      sparklineData: organicSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const marketplaceOptions = [
  { label: "All marketplaces", value: "all" },
  { label: "Amazon", value: "amazon" },
  { label: "Rakuten", value: "rakuten" },
]

export const campaignOptions = [
  { label: "All campaigns", value: "all" },
  ...CAMPAIGNS.map((c) => ({ label: c.campaignName, value: c.campaignId })),
]
