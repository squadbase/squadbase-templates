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

const ISSUED = 482
const WON = 138
const LOST = ISSUED - WON

function buildFunnel(): FunnelStep[] {
  const responded = Math.round(ISSUED * 0.84)
  const negotiated = Math.round(ISSUED * 0.52)
  const won = WON
  const steps = [
    { step: "見積発行", count: ISSUED },
    { step: "顧客返答", count: responded },
    { step: "交渉開始", count: negotiated },
    { step: "受注", count: won },
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

const LOSS_REASON_SHARES: Record<LossReason, number> = {
  価格: 0.34,
  タイミング: 0.18,
  競合: 0.21,
  仕様不一致: 0.12,
  決裁不能: 0.1,
  その他: 0.05,
}

function buildLossReasons(): LossReasonItem[] {
  const items: LossReasonItem[] = (Object.keys(LOSS_REASON_SHARES) as LossReason[]).map(
    (reason) => {
      const count = Math.round(LOST * LOSS_REASON_SHARES[reason])
      const avgQuoteValue = 2_800_000 + srand(0, 2_200_000)
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

function computeKpis(): KpiItem[] {
  const conversionPct = (WON / ISSUED) * 100
  const avgLeadTime =
    conversionTrend.reduce((s, p) => s + p.avgLeadTimeDays, 0) /
    conversionTrend.length
  const topLossShare = lossReasons[0].share

  return [
    {
      label: "見積件数",
      value: `${ISSUED}`,
      change: 4.2,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: conversionTrend.map((p) => p.issued),
    },
    {
      label: "受注件数",
      value: `${WON}`,
      change: 6.1,
      changeLabel: "前期比",
      positiveIsGood: true,
      sparklineData: conversionTrend.map((p) => p.won),
    },
    {
      label: "転換率",
      value: `${conversionPct.toFixed(1)}%`,
      change: 1.8,
      changeLabel: "前期比 (pp)",
      positiveIsGood: true,
      sparklineData: conversionTrend.map((p) => p.conversionPct),
    },
    {
      label: "平均リードタイム",
      value: `${avgLeadTime.toFixed(1)}日`,
      change: -1.2,
      changeLabel: "前期比",
      positiveIsGood: false,
      sparklineData: conversionTrend.map((p) => p.avgLeadTimeDays),
    },
    {
      label: "失注理由トップ",
      value: `${topLossShare.toFixed(1)}%`,
      change: 0,
      changeLabel: lossReasons[0].reason,
      positiveIsGood: false,
      sparklineData: lossReasons.map((r) => r.share),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()
