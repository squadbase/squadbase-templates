import type {
  AtRiskCustomer,
  ChurnRatePoint,
  FrequencyDeclineCell,
  KpiItem,
  RiskTier,
  Segment,
} from "@/types/churn-prediction-monitor"

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

// Unique seed for churn-prediction-monitor
const rng = seededRand(21)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ── At-risk customer list ──

const SEGMENTS: readonly Segment[] = ["enterprise", "mid", "smb"]

const CUSTOMER_NAMES = [
  "Acme Logistics",
  "Northwind Trading",
  "Globex Industrial",
  "Initech Software",
  "Umbra Analytics",
  "Hooli Cloud",
  "Vandelay Imports",
  "Stark Manufacturing",
  "Wonka Foods",
  "Wayne Energy",
  "Pied Piper Data",
  "Cyberdyne Robotics",
  "Tyrell Bio",
  "Soylent Health",
  "Massive Dynamic",
  "Aperture Labs",
  "Black Mesa Research",
  "Oscorp Materials",
  "Weyland Mining",
  "Gekko Capital",
  "Sterling Cooper Media",
  "Pearson Hardman Legal",
  "Dunder Mifflin Paper",
  "Bluth Construction",
] as const

function tierFromScore(score: number): RiskTier {
  if (score >= 80) return "critical"
  if (score >= 65) return "high"
  if (score >= 45) return "medium"
  return "low"
}

function generateAtRiskCustomers(): AtRiskCustomer[] {
  const rows: AtRiskCustomer[] = []
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const segment = pick(SEGMENTS)
    const daysSince = Math.round(srand(7, 95))
    const orderFreq = Math.round(srand(0.4, 8) * 10) / 10
    const freqDelta = Math.round(srand(-65, 8) * 10) / 10
    const supportTickets = Math.round(srand(0, 6))
    // Score weighting: recency, frequency drop, support load, segment value
    const recencyScore = Math.min(100, (daysSince / 90) * 100)
    const freqScore = Math.min(100, Math.max(0, -freqDelta * 1.4))
    const ticketScore = Math.min(100, supportTickets * 16)
    const segmentBoost =
      segment === "enterprise" ? 8 : segment === "mid" ? 4 : 0
    const raw =
      recencyScore * 0.42 +
      freqScore * 0.36 +
      ticketScore * 0.16 +
      segmentBoost * 0.06
    const score = Math.min(99, Math.max(5, Math.round(raw + srand(-4, 4))))
    rows.push({
      customer_id: `C-${(1000 + i).toString()}`,
      customer_name: CUSTOMER_NAMES[i],
      segment,
      last_order_date: dateStr(daysSince),
      days_since_last_order: daysSince,
      order_freq: orderFreq,
      freq_delta_pct: freqDelta,
      support_tickets: supportTickets,
      risk_score: score,
      risk_tier: tierFromScore(score),
    })
  }
  return rows.sort((a, b) => b.risk_score - a.risk_score)
}

export const atRiskCustomers: AtRiskCustomer[] = generateAtRiskCustomers()

// ── Frequency-decline heatmap (12 weeks × 4 risk tiers) ──

const RISK_TIERS: readonly RiskTier[] = ["critical", "high", "medium", "low"]

function generateFrequencyDecline(): FrequencyDeclineCell[] {
  const cells: FrequencyDeclineCell[] = []
  for (let week = 0; week < 12; week++) {
    for (const tier of RISK_TIERS) {
      // Critical tier shows the steepest week-over-week decline
      const base =
        tier === "critical"
          ? -22
          : tier === "high"
            ? -12
            : tier === "medium"
              ? -5
              : 1
      const trend = (11 - week) * 0.4 // older weeks = milder decline
      const noise = srand(-3.5, 3.5)
      const declinePct = Math.round((base + trend + noise) * 10) / 10
      const customers =
        tier === "critical"
          ? Math.round(srand(4, 12))
          : tier === "high"
            ? Math.round(srand(8, 22))
            : tier === "medium"
              ? Math.round(srand(18, 38))
              : Math.round(srand(40, 80))
      cells.push({
        weeksAgoBucket: week,
        riskTier: tier,
        declinePct,
        customers,
      })
    }
  }
  return cells
}

export const frequencyDecline: FrequencyDeclineCell[] = generateFrequencyDecline()

// ── Monthly churn-rate trend (last 12 months) ──

function generateChurnRateTrend(): ChurnRatePoint[] {
  const points: ChurnRatePoint[] = []
  const today = BASE_DATE
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    // Gentle downward churn trend over the year, plus seasonality + noise
    const seasonal = Math.sin(((d.getMonth() + 1) / 12) * Math.PI * 2) * 0.4
    const churnRate =
      Math.round((4.6 - (11 - i) * 0.08 + seasonal + srand(-0.35, 0.35)) * 100) /
      100
    const saveRate =
      Math.round((28 + (11 - i) * 0.7 + srand(-3, 3)) * 10) / 10
    const churnedCount = Math.round(srand(18, 42))
    points.push({ month, churnRate, saveRate, churnedCount })
  }
  return points
}

export const churnRateTrend: ChurnRatePoint[] = generateChurnRateTrend()

// ── Top-line KPIs (header summary) ──

function computeKpis(): KpiItem[] {
  const current = churnRateTrend[churnRateTrend.length - 1]
  const previous = churnRateTrend[churnRateTrend.length - 2]
  const riskCount = atRiskCustomers.filter(
    (c) => c.risk_tier === "critical" || c.risk_tier === "high",
  ).length
  const avgScore =
    atRiskCustomers.reduce((s, c) => s + c.risk_score, 0) /
    atRiskCustomers.length

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      label: "Churn Rate",
      value: `${current.churnRate.toFixed(2)}%`,
      change: pct(current.churnRate, previous.churnRate),
      changeLabel: "vs prev month",
      positiveIsGood: false,
      sparklineData: churnRateTrend.slice(-6).map((p) => p.churnRate),
    },
    {
      label: "At-Risk Customers",
      value: riskCount.toString(),
      change: pct(riskCount, riskCount - Math.round(srand(-2, 4))),
      changeLabel: "vs last week",
      positiveIsGood: false,
      sparklineData: [riskCount - 4, riskCount - 2, riskCount - 3, riskCount - 1, riskCount, riskCount + 1].map(
        (v) => Math.max(0, v),
      ),
    },
    {
      label: "Avg Risk Score",
      value: `${avgScore.toFixed(0)}/100`,
      change: Math.round(srand(-3, 5) * 10) / 10,
      changeLabel: "vs last week",
      positiveIsGood: false,
      sparklineData: [avgScore - 3, avgScore - 1, avgScore - 2, avgScore, avgScore + 1, avgScore + 2].map(
        (v) => Math.round(v),
      ),
    },
    {
      label: "Save Rate",
      value: `${current.saveRate.toFixed(1)}%`,
      change: pct(current.saveRate, previous.saveRate),
      changeLabel: "vs prev month",
      positiveIsGood: true,
      sparklineData: churnRateTrend.slice(-6).map((p) => p.saveRate),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── Filter options ──

export const segmentOptions = [
  { label: "All segments", value: "all" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Mid-market", value: "mid" },
  { label: "SMB", value: "smb" },
]

export const riskTierOptions = [
  { label: "All risk tiers", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
]
