import type {
  AdVsOrganicPoint,
  CampaignPerformanceRow,
  KeywordRankingRow,
  KpiItem,
  Marketplace,
} from "@/types/ec-advertising-dashboard"

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

// ec-advertising-dashboard 専用シード
const rng = seededRand(40117)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function round(n: number, digits = 2): number {
  const f = Math.pow(10, digits)
  return Math.round(n * f) / f
}

// ── キャンペーンメタ ──

interface CampaignMeta {
  campaignId: string
  campaignName: string
  marketplace: Marketplace
  marketplaceLabel: string
  spendShare: number
  acosBase: number // ACoS のベース値 (%)
  cvrBase: number // 広告 CVR のベース値 (%)
  organicMult: number // 広告売上に対するオーガニック売上の倍率
}

const CAMPAIGNS: CampaignMeta[] = [
  { campaignId: "AMZ-SP-001", campaignName: "スポンサープロダクト — ブランド主要", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.22, acosBase: 14.5, cvrBase: 11.2, organicMult: 2.2 },
  { campaignId: "AMZ-SP-002", campaignName: "スポンサープロダクト — オート", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.18, acosBase: 22.4, cvrBase: 7.8, organicMult: 1.4 },
  { campaignId: "AMZ-SB-001", campaignName: "スポンサーブランド — 公式ストア", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.12, acosBase: 18.6, cvrBase: 9.1, organicMult: 1.8 },
  { campaignId: "AMZ-SD-001", campaignName: "スポンサーディスプレイ — リターゲ", marketplace: "amazon", marketplaceLabel: "Amazon", spendShare: 0.08, acosBase: 28.2, cvrBase: 6.4, organicMult: 0.9 },
  { campaignId: "RKT-RPP-001", campaignName: "RPP — 人気商品", marketplace: "rakuten", marketplaceLabel: "楽天市場", spendShare: 0.16, acosBase: 16.8, cvrBase: 10.4, organicMult: 1.9 },
  { campaignId: "RKT-CPA-001", campaignName: "CPA 広告 — 新規獲得", marketplace: "rakuten", marketplaceLabel: "楽天市場", spendShare: 0.14, acosBase: 24.6, cvrBase: 5.9, organicMult: 1.1 },
  { campaignId: "RKT-COU-001", campaignName: "楽天クーポン強化", marketplace: "rakuten", marketplaceLabel: "楽天市場", spendShare: 0.10, acosBase: 31.5, cvrBase: 8.6, organicMult: 0.7 },
]

const TOTAL_SPEND_30D = 42_900_000 // 円

// ── キャンペーン別パフォーマンステーブル ──

function generateCampaignPerformance(): CampaignPerformanceRow[] {
  return CAMPAIGNS.map((c) => {
    const spend = Math.round(TOTAL_SPEND_30D * c.spendShare * (0.92 + srand(0, 0.16)))
    const acos = round(c.acosBase * (0.9 + srand(0, 0.2)), 1)
    const adRevenue = Math.round(spend / (acos / 100))
    const organicRevenue = Math.round(adRevenue * c.organicMult * (0.85 + srand(0, 0.3)))
    const totalRevenue = adRevenue + organicRevenue
    const tacos = round((spend / Math.max(1, totalRevenue)) * 100, 1)
    const cvr = round(c.cvrBase * (0.9 + srand(0, 0.2)), 2)
    const conversions = Math.max(1, Math.round((spend / 220) * (cvr / 100)))
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

// ── 広告売上 vs オーガニック売上 (直近 30 日、積み上げ) ──

function generateAdVsOrganic(): AdVsOrganicPoint[] {
  const out: AdVsOrganicPoint[] = []
  const avgAd =
    campaignPerformance.reduce((s, r) => s + r.adRevenue, 0) / 30
  const avgOrganic =
    campaignPerformance.reduce((s, r) => s + r.organicRevenue, 0) / 30
  for (let i = 29; i >= 0; i--) {
    const d = new Date(BASE_DATE)
    d.setDate(d.getDate() - i)
    const dow = d.getDay() // 0=日..6=土
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

// ── キーワード別ランキング ──

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
  { keyword: "ワイヤレスイヤホン", campaignId: "AMZ-SP-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.16, cpcBase: 128, cvrBase: 12.8 },
  { keyword: "ノイズキャンセリングヘッドホン", campaignId: "AMZ-SP-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.12, cpcBase: 214, cvrBase: 9.6 },
  { keyword: "Bluetoothスピーカー", campaignId: "AMZ-SP-002", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.10, cpcBase: 112, cvrBase: 8.4 },
  { keyword: "モバイルバッテリー", campaignId: "AMZ-SP-002", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.09, cpcBase: 88, cvrBase: 11.2 },
  { keyword: "スマートウォッチ", campaignId: "AMZ-SB-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.08, cpcBase: 178, cvrBase: 6.8 },
  { keyword: "USB-Cケーブル", campaignId: "AMZ-SD-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.07, cpcBase: 64, cvrBase: 14.1 },
  { keyword: "ワイヤレスイヤホン 楽天", campaignId: "RKT-RPP-001", marketplace: "rakuten", marketplaceLabel: "楽天市場", share: 0.10, cpcBase: 138, cvrBase: 11.6 },
  { keyword: "モバイルバッテリー 大容量", campaignId: "RKT-RPP-001", marketplace: "rakuten", marketplaceLabel: "楽天市場", share: 0.08, cpcBase: 102, cvrBase: 9.8 },
  { keyword: "スマートウォッチ レディース", campaignId: "RKT-CPA-001", marketplace: "rakuten", marketplaceLabel: "楽天市場", share: 0.07, cpcBase: 198, cvrBase: 6.2 },
  { keyword: "Bluetoothスピーカー 防水", campaignId: "RKT-CPA-001", marketplace: "rakuten", marketplaceLabel: "楽天市場", share: 0.06, cpcBase: 126, cvrBase: 7.8 },
  { keyword: "充電ケーブル iPhone", campaignId: "RKT-COU-001", marketplace: "rakuten", marketplaceLabel: "楽天市場", share: 0.04, cpcBase: 58, cvrBase: 12.4 },
  { keyword: "タブレットスタンド", campaignId: "AMZ-SD-001", marketplace: "amazon", marketplaceLabel: "Amazon", share: 0.03, cpcBase: 78, cvrBase: 5.2 },
]

function generateKeywordRanking(): KeywordRankingRow[] {
  const totalKeywordSpend = TOTAL_SPEND_30D * 0.78
  return KEYWORD_SEEDS.map((k) => {
    const spend = Math.round(totalKeywordSpend * k.share * (0.92 + srand(0, 0.16)))
    const cpc = round(k.cpcBase * (0.9 + srand(0, 0.2)), 0)
    const clicks = Math.max(1, Math.round(spend / cpc))
    const cvr = round(k.cvrBase * (0.9 + srand(0, 0.2)), 2)
    const conversions = Math.max(1, Math.round(clicks * (cvr / 100)))
    const cpa = round(spend / conversions, 0)
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

// ── ヘッダー KPI ──

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

  // 直近 14 日 (日次) のスパークライン
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
      label: "広告売上",
      value: `¥${(totalAdRev / 1_000_000).toFixed(1)}M`,
      change: 8.4,
      changeLabel: "前 30 日比",
      positiveIsGood: true,
      sparklineData: adRevSpark,
    },
    {
      label: "ACoS",
      value: `${acos.toFixed(1)}%`,
      change: -2.6,
      changeLabel: "前 30 日比",
      positiveIsGood: false,
      sparklineData: acosSpark,
    },
    {
      label: "TACoS",
      value: `${tacos.toFixed(1)}%`,
      change: -1.2,
      changeLabel: "前 30 日比",
      positiveIsGood: false,
      sparklineData: tacosSpark,
    },
    {
      label: "広告 CVR",
      value: `${adCvr.toFixed(2)}%`,
      change: 0.7,
      changeLabel: "前 30 日比",
      positiveIsGood: true,
      sparklineData: cvrSpark,
    },
    {
      label: "オーガニック比率",
      value: `${organicShare.toFixed(1)}%`,
      change: 3.1,
      changeLabel: "前 30 日比",
      positiveIsGood: true,
      sparklineData: organicSpark,
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const marketplaceOptions = [
  { label: "全モール", value: "all" },
  { label: "Amazon", value: "amazon" },
  { label: "楽天市場", value: "rakuten" },
]

export const campaignOptions = [
  { label: "全キャンペーン", value: "all" },
  ...CAMPAIGNS.map((c) => ({ label: c.campaignName, value: c.campaignId })),
]
