import type {
  FunnelStep,
  ConversionTrendPoint,
  LossReasonItem,
  LossReason,
  KpiItem,
} from "@/types/quote-to-order-conversion"

const BASE_DATE = new Date("2024-03-15")

function ym(monthsAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(167)
function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── Aggregate counts ──

const ISSUED = 482
const WON = 138
const LOST = ISSUED - WON

// ── Funnel ──

function buildFunnel(): FunnelStep[] {
  const responded = Math.round(ISSUED * 0.84)
  const negotiated = Math.round(ISSUED * 0.52)
  const won = WON
  const steps = [
    { step: "Quotes Issued", count: ISSUED },
    { step: "Customer Responded", count: responded },
    { step: "Negotiation Started", count: negotiated },
    { step: "Won", count: won },
  ]
  return steps.map((s, i) => ({
    step: s.step,
    count: s.count,
    rate: Math.round((s.count / ISSUED) * 1000) / 10,
    conversionFromPrev:
      i === 0
        ? 100
        : Math.round((s.count / steps[i - 1].count) * 1000) / 10,
  }))
}

export const funnel: FunnelStep[] = buildFunnel()

// ── Monthly conversion trend ──

function buildTrend(): ConversionTrendPoint[] {
  const points: ConversionTrendPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const issued = Math.round(36 + srand(0, 18))
    const conversionPct = 24 + Math.sin((11 - i) * 0.6) * 4 + srand(-2, 2)
    const won = Math.round((issued * conversionPct) / 100)
    const avgLeadTimeDays = Math.round(18 + srand(-4, 6))
    points.push({
      month: ym(i),
      issued,
      won,
      conversionPct: Math.round(conversionPct * 10) / 10,
      avgLeadTimeDays,
    })
  }
  return points
}

export const conversionTrend: ConversionTrendPoint[] = buildTrend()

// ── Loss reasons (treemap data) ──

const LOSS_REASON_SHARES: Record<LossReason, number> = {
  Price: 0.34,
  Timing: 0.18,
  Competitor: 0.21,
  "Spec Mismatch": 0.12,
  "No Decision": 0.1,
  Other: 0.05,
}

function buildLossReasons(): LossReasonItem[] {
  const items: LossReasonItem[] = (Object.keys(LOSS_REASON_SHARES) as LossReason[]).map(
    (reason) => {
      const count = Math.round(LOST * LOSS_REASON_SHARES[reason])
      const avgQuoteValue = 28_000 + srand(0, 22_000)
      const amount = Math.round(count * avgQuoteValue)
      return {
        reason,
        count,
        amount,
        share: Math.round(LOSS_REASON_SHARES[reason] * 1000) / 10,
      }
    },
  )
  return items.sort((a, b) => b.count - a.count)
}

export const lossReasons: LossReasonItem[] = buildLossReasons()

// ── KPIs ──

function computeKpis(): KpiItem[] {
  const conversionPct = (WON / ISSUED) * 100
  const avgLeadTime =
    conversionTrend.reduce((s, p) => s + p.avgLeadTimeDays, 0) /
    conversionTrend.length
  const topLossShare = lossReasons[0].share

  return [
    {
      label: "Quotes Issued",
      value: `${ISSUED}`,
      change: 4.2,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: conversionTrend.map((p) => p.issued),
    },
    {
      label: "Orders Won",
      value: `${WON}`,
      change: 6.1,
      changeLabel: "vs prev period",
      positiveIsGood: true,
      sparklineData: conversionTrend.map((p) => p.won),
    },
    {
      label: "Conversion Rate",
      value: `${conversionPct.toFixed(1)}%`,
      change: 1.8,
      changeLabel: "pp vs prev",
      positiveIsGood: true,
      sparklineData: conversionTrend.map((p) => p.conversionPct),
    },
    {
      label: "Avg Lead Time",
      value: `${avgLeadTime.toFixed(1)}d`,
      change: -1.2,
      changeLabel: "vs prev period",
      positiveIsGood: false,
      sparklineData: conversionTrend.map((p) => p.avgLeadTimeDays),
    },
    {
      label: "Top Loss Reason",
      value: `${topLossShare.toFixed(1)}%`,
      change: 0,
      changeLabel: lossReasons[0].reason,
      positiveIsGood: false,
      sparklineData: lossReasons.map((r) => r.share),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()
