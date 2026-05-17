import type {
  CustomerRankingItem,
  ParetoPoint,
  ChurnCandidate,
  KpiItem,
  AbcClass,
  ChurnRiskLevel,
} from "@/types/customer-sales-dashboard"

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

// Unique seed per template slug — customer-sales-dashboard
const rng = seededRand(23)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Customer master (seeded mock) ──

const SEGMENTS = ["Enterprise", "Mid-Market", "SMB", "Strategic"] as const

const CUSTOMER_NAMES = [
  "Aurora Analytics",
  "Beacon Logistics",
  "Cascade Foods",
  "Delta Retail Co.",
  "Evergreen Health",
  "Foundry Supply",
  "Granite Industrial",
  "Harbor Apparel",
  "Ivory Hotels",
  "Junction Telecom",
  "Keystone Pharma",
  "Lumen Studios",
  "Meridian Manufacturing",
  "Northstar Energy",
  "Orion Robotics",
  "Pioneer Grocers",
  "Quantum Materials",
  "Redwood Beverages",
  "Summit Construction",
  "Tundra Outdoors",
  "Unity Software",
  "Valor Insurance",
  "Westfield Realty",
]

// ── Generate ranking items ──

function generateRanking(): CustomerRankingItem[] {
  // Use a Pareto-like distribution so a small group accounts for most revenue
  const raw = CUSTOMER_NAMES.map((name, i) => {
    const seg = SEGMENTS[i % SEGMENTS.length]
    // Decreasing base with noise — index 0 is largest
    const base = 480_000 * Math.pow(0.85, i)
    const noise = 0.78 + srand(0, 0.44)
    const currentRevenue = Math.round(base * noise)
    const yoyDelta = -0.18 + srand(0, 0.42)
    const prevYearRevenue = Math.round(currentRevenue / (1 + yoyDelta))
    const orderCount = Math.max(1, Math.round(currentRevenue / (3200 + srand(0, 1800))))
    const daysSinceLastOrder = Math.max(
      1,
      Math.round(srand(2, 14) + (i > 14 ? srand(20, 110) : 0)),
    )
    const lastOrderDate = dateStr(daysSinceLastOrder)
    const yoyChange = Math.round(yoyDelta * 1000) / 10
    const churnRisk: ChurnRiskLevel =
      daysSinceLastOrder > 90
        ? "high"
        : daysSinceLastOrder > 45
          ? "watch"
          : "low"
    return {
      customerId: `C-${1000 + i}`,
      customerName: name,
      segment: seg,
      currentRevenue,
      prevYearRevenue,
      yoyChange,
      orderCount,
      lastOrderDate,
      daysSinceLastOrder,
      churnRisk,
    }
  })

  // Sort by current revenue desc for ranking & ABC
  const sorted = [...raw].sort((a, b) => b.currentRevenue - a.currentRevenue)
  const total = sorted.reduce((s, r) => s + r.currentRevenue, 0)

  let cum = 0
  return sorted.map((r, i) => {
    cum += r.currentRevenue
    const pct = (cum / total) * 100
    const abcClass: AbcClass = pct <= 70 ? "A" : pct <= 90 ? "B" : "C"
    return {
      rank: i + 1,
      customerId: r.customerId,
      customerName: r.customerName,
      segment: r.segment,
      currentRevenue: r.currentRevenue,
      prevYearRevenue: r.prevYearRevenue,
      yoyChange: r.yoyChange,
      orderCount: r.orderCount,
      lastOrderDate: r.lastOrderDate,
      daysSinceLastOrder: r.daysSinceLastOrder,
      abcClass,
      churnRisk: r.churnRisk,
    }
  })
}

export const customerRanking: CustomerRankingItem[] = generateRanking()

// ── Pareto points ──

function generatePareto(): ParetoPoint[] {
  const total = customerRanking.reduce((s, r) => s + r.currentRevenue, 0)
  let cum = 0
  return customerRanking.map((r) => {
    cum += r.currentRevenue
    return {
      customerId: r.customerId,
      customerName: r.customerName,
      revenue: r.currentRevenue,
      cumulativeRevenue: cum,
      cumulativePct: Math.round((cum / total) * 1000) / 10,
      abcClass: r.abcClass,
    }
  })
}

export const paretoSeries: ParetoPoint[] = generatePareto()

// ── Churn candidates (sorted by days since last order, desc) ──

function generateChurnCandidates(): ChurnCandidate[] {
  return customerRanking
    .filter((r) => r.churnRisk !== "low")
    .map((r) => ({
      customerId: r.customerId,
      customerName: r.customerName,
      segment: r.segment,
      lastOrderDate: r.lastOrderDate,
      daysSinceLastOrder: r.daysSinceLastOrder,
      prevYearRevenue: r.prevYearRevenue,
      riskLevel: r.churnRisk,
    }))
    .sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder)
}

export const churnCandidates: ChurnCandidate[] = generateChurnCandidates()

// ── Top-line KPIs (header summary) ──

function computeKpis(): KpiItem[] {
  const totalRevenue = customerRanking.reduce((s, r) => s + r.currentRevenue, 0)
  const totalPrev = customerRanking.reduce((s, r) => s + r.prevYearRevenue, 0)
  const yoy = ((totalRevenue - totalPrev) / totalPrev) * 100

  // Top-5 concentration share
  const top5Revenue = customerRanking
    .slice(0, 5)
    .reduce((s, r) => s + r.currentRevenue, 0)
  const top5Share = (top5Revenue / totalRevenue) * 100

  const churnFlagCount = customerRanking.filter(
    (r) => r.churnRisk !== "low",
  ).length

  return [
    {
      label: "Customer Revenue (period)",
      value: `$${(totalRevenue / 1_000_000).toFixed(2)}M`,
      change: Math.round(yoy * 10) / 10,
      changeLabel: "vs last year",
      positiveIsGood: true,
      sparklineData: customerRanking.slice(0, 14).map((r) => r.currentRevenue),
    },
    {
      label: "YoY Growth",
      value: `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`,
      change: Math.round(yoy * 10) / 10,
      changeLabel: "vs last year",
      positiveIsGood: true,
      sparklineData: customerRanking
        .slice(0, 14)
        .map((r) =>
          r.prevYearRevenue === 0
            ? 0
            : ((r.currentRevenue - r.prevYearRevenue) / r.prevYearRevenue) * 100,
        ),
    },
    {
      label: "Top-5 Concentration",
      value: `${top5Share.toFixed(1)}%`,
      change: 0,
      changeLabel: "share of revenue",
      positiveIsGood: false,
      sparklineData: customerRanking
        .slice(0, 10)
        .map((r) => (r.currentRevenue / totalRevenue) * 100),
    },
    {
      label: "Churn-Risk Accounts",
      value: `${churnFlagCount}`,
      change: 0,
      changeLabel: `of ${customerRanking.length} accounts`,
      positiveIsGood: false,
      sparklineData: customerRanking.map((r) => r.daysSinceLastOrder),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const segmentOptions = [
  { label: "All segments", value: "all" },
  ...SEGMENTS.map((s) => ({ label: s, value: s.toLowerCase().replace(/[^a-z]/g, "-") })),
]
