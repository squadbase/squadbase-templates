import type {
  PrePostPoint,
  CampaignRoiRow,
  CouponRedemptionRow,
  KpiItem,
} from "@/types/campaign-effectiveness-test"

// ── ヘルパー ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// このテンプレート固有の seed
const rng = seededRand(7193)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── キャンペーンマスタ ──

interface CampaignSpec {
  id: string
  name: string
  channel: "email" | "push" | "sms" | "in-app"
  // コントロール群との 1 人あたり post-period 平均売上差 (円)
  baseLift: number
  // テスト群のリーチ規模
  testSize: number
  // 配布するクーポン
  couponCode: string
  discountLabel: string
  // 1 人あたりの施策コスト (円)
  perCustomerCost: number
}

const CAMPAIGNS: CampaignSpec[] = [
  {
    id: "cmp-101",
    name: "春のリフレッシュ — 会員メール",
    channel: "email",
    baseLift: 1_200,
    testSize: 18_400,
    couponCode: "SPRING15",
    discountLabel: "15%OFF",
    perCustomerCost: 45,
  },
  {
    id: "cmp-102",
    name: "離脱復帰プッシュ — 60日休眠",
    channel: "push",
    baseLift: 860,
    testSize: 9_600,
    couponCode: "COMEBACK10",
    discountLabel: "1,000円OFF (5,000円以上)",
    perCustomerCost: 22,
  },
  {
    id: "cmp-103",
    name: "アプリ限定 — 送料無料",
    channel: "in-app",
    baseLift: 640,
    testSize: 22_500,
    couponCode: "APPSHIP",
    discountLabel: "送料無料",
    perCustomerCost: 35,
  },
  {
    id: "cmp-104",
    name: "VIP SMS — 先行販売",
    channel: "sms",
    baseLift: 1_560,
    testSize: 4_200,
    couponCode: "VIPEARLY",
    discountLabel: "20%OFF",
    perCustomerCost: 100,
  },
  {
    id: "cmp-105",
    name: "カゴ落ちプッシュ",
    channel: "push",
    baseLift: 1_010,
    testSize: 11_800,
    couponCode: "CART5",
    discountLabel: "500円OFF",
    perCustomerCost: 26,
  },
  {
    id: "cmp-106",
    name: "カテゴリ強化 — アスレジャー",
    channel: "email",
    baseLift: 500,
    testSize: 27_300,
    couponCode: "MOVE20",
    discountLabel: "アスレジャー 20%OFF",
    perCustomerCost: 38,
  },
  {
    id: "cmp-107",
    name: "リファラル特典メール",
    channel: "email",
    baseLift: 780,
    testSize: 6_900,
    couponCode: "REF25",
    discountLabel: "紹介で 2,500円分",
    perCustomerCost: 60,
  },
]

const CHANNEL_LABEL: Record<CampaignSpec["channel"], string> = {
  email: "メール",
  push: "プッシュ通知",
  sms: "SMS",
  "in-app": "アプリ内",
}

// ── 施策前後比較: テスト vs コントロール ARPU (7週分 -3..+3) ──

const CONTROL_BASE_ARPU = 4_500

function buildPrePost(): PrePostPoint[] {
  const points: PrePostPoint[] = []
  // ポートフォリオ全体のリフトを規模加重で算出
  const portfolioLift =
    CAMPAIGNS.reduce((s, c) => s + c.baseLift * c.testSize, 0) /
    CAMPAIGNS.reduce((s, c) => s + c.testSize, 0)

  for (let w = -3; w <= 3; w++) {
    const phase = w < 0 ? "pre" : "post"
    const wave = Math.sin((w + 3) * 0.55) * 220
    const controlNoise = 0.92 + srand(0, 0.16)
    const testNoise = 0.92 + srand(0, 0.16)
    const control = CONTROL_BASE_ARPU * controlNoise + wave
    // pre 期間はテスト ≈ コントロール、post 期間はリフトが立ち上がる
    const liftRamp = phase === "pre" ? 0 : Math.min(1, (w + 1) / 3)
    const test = control * testNoise + portfolioLift * liftRamp

    points.push({
      weekIndex: w,
      weekLabel:
        w === 0
          ? "W0"
          : w < 0
            ? `W${w}`
            : `W+${w}`,
      testRevenuePerCustomer: Math.round(test),
      controlRevenuePerCustomer: Math.round(control),
      phase,
    })
  }
  return points
}

export const prePostSeries: PrePostPoint[] = buildPrePost()

// ── ROI ランキングテーブル ──

function buildCampaignRoi(): CampaignRoiRow[] {
  return CAMPAIGNS.map((cmp) => {
    const testCustomers = cmp.testSize
    // コントロールはテスト群の約 25%
    const controlCustomers = Math.round(cmp.testSize * (0.22 + srand(0, 0.08)))
    const controlArpu = CONTROL_BASE_ARPU * (0.94 + srand(0, 0.12))
    const liftNoise = 0.85 + srand(0, 0.3)
    const liftPerCustomer = cmp.baseLift * liftNoise
    const testArpu = controlArpu + liftPerCustomer
    const incrementalRevenue = liftPerCustomer * testCustomers
    const cost = cmp.perCustomerCost * testCustomers
    const roi = ((incrementalRevenue - cost) / cost) * 100

    // 信頼度: 規模が大きくリフトも高ければ high、小さく/限定的なら low
    const sampleScore = Math.log10(testCustomers) - 3
    const liftScore = liftPerCustomer / 300
    const score = sampleScore + liftScore
    const confidence: CampaignRoiRow["confidence"] =
      score > 2.6 ? "high" : score > 1.4 ? "medium" : "low"

    return {
      campaignId: cmp.id,
      campaignName: cmp.name,
      channel: CHANNEL_LABEL[cmp.channel],
      testCustomers,
      controlCustomers,
      testArpu: Math.round(testArpu),
      controlArpu: Math.round(controlArpu),
      incrementalArpu: Math.round(liftPerCustomer),
      incrementalRevenue: Math.round(incrementalRevenue),
      cost: Math.round(cost),
      roi: Math.round(roi * 10) / 10,
      confidence,
    }
  }).sort((a, b) => b.roi - a.roi)
}

export const campaignRoi: CampaignRoiRow[] = buildCampaignRoi()

// ── クーポン消化率テーブル ──

function buildCouponRedemption(): CouponRedemptionRow[] {
  return CAMPAIGNS.map((cmp) => {
    const distributed = cmp.testSize
    // 単価が高いチャネルは消化率は低めだが AOV は高い、という傾向を再現
    const baseRate =
      cmp.channel === "sms"
        ? 0.18
        : cmp.channel === "in-app"
          ? 0.12
          : cmp.channel === "push"
            ? 0.09
            : 0.065
    const redemptionRate = baseRate * (0.85 + srand(0, 0.3))
    const redeemed = Math.round(distributed * redemptionRate)
    const avgOrderValue = 6_400 + srand(0, 6_800)
    // 値引きコストは AOV の約 12% と仮定
    const grossRevenue = redeemed * avgOrderValue
    const discountCost = grossRevenue * 0.12
    const netRevenue = Math.round(grossRevenue - discountCost)

    return {
      campaignId: cmp.id,
      campaignName: cmp.name,
      couponCode: cmp.couponCode,
      discountLabel: cmp.discountLabel,
      distributed,
      redeemed,
      redemptionRate: Math.round(redemptionRate * 1000) / 10,
      avgOrderValue: Math.round(avgOrderValue),
      netRevenue,
    }
  }).sort((a, b) => b.redemptionRate - a.redemptionRate)
}

export const couponRedemption: CouponRedemptionRow[] = buildCouponRedemption()

// ── ヘッダー KPI ──

function buildKpis(): KpiItem[] {
  const totalIncrementalRevenue = campaignRoi.reduce(
    (s, c) => s + c.incrementalRevenue,
    0,
  )
  const totalCost = campaignRoi.reduce((s, c) => s + c.cost, 0)
  const portfolioRoi = ((totalIncrementalRevenue - totalCost) / totalCost) * 100

  const totalTestCustomers = campaignRoi.reduce(
    (s, c) => s + c.testCustomers,
    0,
  )
  const totalControlCustomers = campaignRoi.reduce(
    (s, c) => s + c.controlCustomers,
    0,
  )

  const weightedControlArpu =
    campaignRoi.reduce((s, c) => s + c.controlArpu * c.controlCustomers, 0) /
    totalControlCustomers
  const weightedTestArpu =
    campaignRoi.reduce((s, c) => s + c.testArpu * c.testCustomers, 0) /
    totalTestCustomers
  const customerLiftPct =
    ((weightedTestArpu - weightedControlArpu) / weightedControlArpu) * 100

  const totalDistributed = couponRedemption.reduce(
    (s, c) => s + c.distributed,
    0,
  )
  const totalRedeemed = couponRedemption.reduce((s, c) => s + c.redeemed, 0)
  const portfolioRedemption = (totalRedeemed / totalDistributed) * 100

  const incrementalCustomers = Math.round(
    totalIncrementalRevenue / weightedControlArpu,
  )

  const spark = (base: number, range: number, len = 14) =>
    Array.from({ length: len }, (_, i) =>
      Math.round((base + Math.sin(i / 2.2) * range + (srand(0, range) - range / 2)) * 100) /
      100,
    )

  return [
    {
      label: "増分売上",
      value: `¥${Math.round(totalIncrementalRevenue / 10_000).toLocaleString("ja-JP")}万`,
      change: 12.4,
      changeLabel: "前回テスト比",
      positiveIsGood: true,
      sparklineData: spark(
        totalIncrementalRevenue / 14,
        totalIncrementalRevenue / 80,
      ),
    },
    {
      label: "顧客リフト",
      value: `${customerLiftPct >= 0 ? "+" : ""}${customerLiftPct.toFixed(1)}%`,
      change: customerLiftPct,
      changeLabel: "テスト vs コントロール ARPU",
      positiveIsGood: true,
      sparklineData: spark(customerLiftPct, 2.4),
    },
    {
      label: "クーポン消化率",
      value: `${portfolioRedemption.toFixed(1)}%`,
      change: 1.8,
      changeLabel: "前回テスト比",
      positiveIsGood: true,
      sparklineData: spark(portfolioRedemption, 1.6),
    },
    {
      label: "ポートフォリオ ROI",
      value: `${portfolioRoi >= 0 ? "+" : ""}${portfolioRoi.toFixed(0)}%`,
      change: 8.6,
      changeLabel: "前回テスト比",
      positiveIsGood: true,
      sparklineData: spark(portfolioRoi, 18),
    },
    {
      label: "増分顧客数",
      value: incrementalCustomers.toLocaleString("ja-JP"),
      change: 6.2,
      changeLabel: "前回テスト比",
      positiveIsGood: true,
      sparklineData: spark(incrementalCustomers / 14, incrementalCustomers / 60),
    },
  ]
}

export const headerKpis: KpiItem[] = buildKpis()

// ── フィルター選択肢 ──

export const channelOptions = [
  { label: "すべてのチャネル", value: "all" },
  { label: "メール", value: "email" },
  { label: "プッシュ通知", value: "push" },
  { label: "SMS", value: "sms" },
  { label: "アプリ内", value: "in-app" },
]

export const confidenceOptions = [
  { label: "すべての信頼度", value: "all" },
  { label: "高", value: "high" },
  { label: "中", value: "medium" },
  { label: "低", value: "low" },
]
