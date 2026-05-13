import type {
  PrePostPoint,
  CampaignRoiRow,
  CouponRedemptionRow,
  KpiItem,
} from "@/types/campaign-effectiveness-test"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Unique seed for this template
const rng = seededRand(7193)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Campaign roster ──

interface CampaignSpec {
  id: string
  name: string
  channel: "email" | "push" | "sms" | "in-app"
  // Average post-period ARPU lift vs control (in $)
  baseLift: number
  // Test-group reach size
  testSize: number
  // Coupon offer used by this campaign
  couponCode: string
  discountLabel: string
  // Per-customer marketing cost
  perCustomerCost: number
}

const CAMPAIGNS: CampaignSpec[] = [
  {
    id: "cmp-101",
    name: "Spring Refresh — Loyalty Email",
    channel: "email",
    baseLift: 11.4,
    testSize: 18_400,
    couponCode: "SPRING15",
    discountLabel: "15% off",
    perCustomerCost: 0.4,
  },
  {
    id: "cmp-102",
    name: "Win-back Push — 60-day Lapsed",
    channel: "push",
    baseLift: 8.2,
    testSize: 9_600,
    couponCode: "COMEBACK10",
    discountLabel: "$10 off $50",
    perCustomerCost: 0.18,
  },
  {
    id: "cmp-103",
    name: "App Exclusive — Free Shipping",
    channel: "in-app",
    baseLift: 6.1,
    testSize: 22_500,
    couponCode: "APPSHIP",
    discountLabel: "Free shipping",
    perCustomerCost: 0.32,
  },
  {
    id: "cmp-104",
    name: "VIP SMS — Early Access",
    channel: "sms",
    baseLift: 14.8,
    testSize: 4_200,
    couponCode: "VIPEARLY",
    discountLabel: "20% off",
    perCustomerCost: 0.95,
  },
  {
    id: "cmp-105",
    name: "Cart Recovery Push",
    channel: "push",
    baseLift: 9.6,
    testSize: 11_800,
    couponCode: "CART5",
    discountLabel: "$5 off",
    perCustomerCost: 0.22,
  },
  {
    id: "cmp-106",
    name: "Category Launch — Athleisure",
    channel: "email",
    baseLift: 4.7,
    testSize: 27_300,
    couponCode: "MOVE20",
    discountLabel: "20% off Athleisure",
    perCustomerCost: 0.35,
  },
  {
    id: "cmp-107",
    name: "Referral Reward Email",
    channel: "email",
    baseLift: 7.3,
    testSize: 6_900,
    couponCode: "REF25",
    discountLabel: "$25 referral credit",
    perCustomerCost: 0.55,
  },
]

const CHANNEL_LABEL: Record<CampaignSpec["channel"], string> = {
  email: "Email",
  push: "Push",
  sms: "SMS",
  "in-app": "In-app",
}

// ── Pre/post comparison: test vs control ARPU across 7 weeks (-3..+3) ──

const CONTROL_BASE_ARPU = 42

function buildPrePost(): PrePostPoint[] {
  const points: PrePostPoint[] = []
  // Aggregate lift across the campaign portfolio for the headline chart
  const portfolioLift =
    CAMPAIGNS.reduce((s, c) => s + c.baseLift * c.testSize, 0) /
    CAMPAIGNS.reduce((s, c) => s + c.testSize, 0)

  for (let w = -3; w <= 3; w++) {
    const phase = w < 0 ? "pre" : "post"
    const wave = Math.sin((w + 3) * 0.55) * 2.1
    const controlNoise = 0.92 + srand(0, 0.16)
    const testNoise = 0.92 + srand(0, 0.16)
    const control = CONTROL_BASE_ARPU * controlNoise + wave
    // In the pre-window, test ≈ control (no exposure yet).
    // In the post-window, test = control + portfolioLift, ramping up week-by-week.
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
      testRevenuePerCustomer: Math.round(test * 100) / 100,
      controlRevenuePerCustomer: Math.round(control * 100) / 100,
      phase,
    })
  }
  return points
}

export const prePostSeries: PrePostPoint[] = buildPrePost()

// ── ROI ranking table ──

function buildCampaignRoi(): CampaignRoiRow[] {
  return CAMPAIGNS.map((cmp) => {
    const testCustomers = cmp.testSize
    // Control sized to ~25% of test in the holdout
    const controlCustomers = Math.round(cmp.testSize * (0.22 + srand(0, 0.08)))
    const controlArpu = CONTROL_BASE_ARPU * (0.94 + srand(0, 0.12))
    const liftNoise = 0.85 + srand(0, 0.3)
    const liftPerCustomer = cmp.baseLift * liftNoise
    const testArpu = controlArpu + liftPerCustomer
    const incrementalRevenue = liftPerCustomer * testCustomers
    const cost = cmp.perCustomerCost * testCustomers
    const roi = ((incrementalRevenue - cost) / cost) * 100

    // Confidence band: large test-size + healthy lift → high; small/marginal → low
    const sampleScore = Math.log10(testCustomers) - 3
    const liftScore = liftPerCustomer / 3
    const score = sampleScore + liftScore
    const confidence: CampaignRoiRow["confidence"] =
      score > 2.6 ? "high" : score > 1.4 ? "medium" : "low"

    return {
      campaignId: cmp.id,
      campaignName: cmp.name,
      channel: CHANNEL_LABEL[cmp.channel],
      testCustomers,
      controlCustomers,
      testArpu: Math.round(testArpu * 100) / 100,
      controlArpu: Math.round(controlArpu * 100) / 100,
      incrementalArpu: Math.round(liftPerCustomer * 100) / 100,
      incrementalRevenue: Math.round(incrementalRevenue),
      cost: Math.round(cost),
      roi: Math.round(roi * 10) / 10,
      confidence,
    }
  }).sort((a, b) => b.roi - a.roi)
}

export const campaignRoi: CampaignRoiRow[] = buildCampaignRoi()

// ── Coupon redemption table ──

function buildCouponRedemption(): CouponRedemptionRow[] {
  return CAMPAIGNS.map((cmp) => {
    const distributed = cmp.testSize
    // Higher per-customer cost campaigns tend to be premium → lower redemption,
    // higher AOV when redeemed.
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
    const avgOrderValue = 58 + srand(0, 64)
    // Discount cost ≈ 12% of AOV averaged across coupon types
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
      redemptionRate: Math.round(redemptionRate * 1000) / 10, // → percent w/ 1 decimal
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      netRevenue,
    }
  }).sort((a, b) => b.redemptionRate - a.redemptionRate)
}

export const couponRedemption: CouponRedemptionRow[] = buildCouponRedemption()

// ── Header KPIs ──

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

  // Sparklines — illustrative shape, all formatted as numbers so the type matches
  const spark = (base: number, range: number, len = 14) =>
    Array.from({ length: len }, (_, i) =>
      Math.round((base + Math.sin(i / 2.2) * range + (srand(0, range) - range / 2)) * 100) /
      100,
    )

  return [
    {
      label: "Incremental Revenue",
      value: `$${Math.round(totalIncrementalRevenue).toLocaleString("en-US")}`,
      change: 12.4,
      changeLabel: "vs prev test",
      positiveIsGood: true,
      sparklineData: spark(
        totalIncrementalRevenue / 14,
        totalIncrementalRevenue / 80,
      ),
    },
    {
      label: "Customer Lift",
      value: `${customerLiftPct >= 0 ? "+" : ""}${customerLiftPct.toFixed(1)}%`,
      change: customerLiftPct,
      changeLabel: "test vs control ARPU",
      positiveIsGood: true,
      sparklineData: spark(customerLiftPct, 2.4),
    },
    {
      label: "Coupon Redemption",
      value: `${portfolioRedemption.toFixed(1)}%`,
      change: 1.8,
      changeLabel: "vs prev test",
      positiveIsGood: true,
      sparklineData: spark(portfolioRedemption, 1.6),
    },
    {
      label: "Portfolio ROI",
      value: `${portfolioRoi >= 0 ? "+" : ""}${portfolioRoi.toFixed(0)}%`,
      change: 8.6,
      changeLabel: "vs prev test",
      positiveIsGood: true,
      sparklineData: spark(portfolioRoi, 18),
    },
    {
      label: "Incremental Customers",
      value: incrementalCustomers.toLocaleString("en-US"),
      change: 6.2,
      changeLabel: "vs prev test",
      positiveIsGood: true,
      sparklineData: spark(incrementalCustomers / 14, incrementalCustomers / 60),
    },
  ]
}

export const headerKpis: KpiItem[] = buildKpis()

// ── Filter options ──

export const channelOptions = [
  { label: "All channels", value: "all" },
  { label: "Email", value: "email" },
  { label: "Push", value: "push" },
  { label: "SMS", value: "sms" },
  { label: "In-app", value: "in-app" },
]

export const confidenceOptions = [
  { label: "All confidence levels", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
]
