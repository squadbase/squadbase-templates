import { subMonths, format } from "date-fns"
import type { KpiItem, TrendPoint, TopItemRow } from "@/types/ui-template-kpi-chart-simple"

const MONTHS = 12
const BASE_MONTH = new Date("2025-03-01")

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(77)

// ── Trend series (monthly MRR waterfall) ──────────────────────────────────────
export const trendSeries: TrendPoint[] = Array.from({ length: MONTHS }, (_, i) => {
  const date = subMonths(BASE_MONTH, MONTHS - 1 - i)
  const baseMrr = 180_000 + i * 14_500
  const noise = (rand() - 0.5) * 8_000
  const mrr = Math.round(baseMrr + noise)
  const newMrr = Math.round(18_000 + i * 800 + (rand() - 0.5) * 3_000)
  const churnedMrr = Math.round(mrr * (0.018 + (rand() - 0.5) * 0.006))
  return {
    date: format(date, "yyyy-MM"),
    mrr,
    newMrr,
    churnedMrr,
  }
})

function buildSparkline(values: number[], length = 12): number[] {
  return values.slice(-length)
}

const latestMrr = trendSeries[trendSeries.length - 1].mrr
const prevMrr = trendSeries[trendSeries.length - 2].mrr
const mrrChange = ((latestMrr - prevMrr) / prevMrr) * 100

const latestNewMrr = trendSeries[trendSeries.length - 1].newMrr
const prevNewMrr = trendSeries[trendSeries.length - 2].newMrr
const newMrrChange = ((latestNewMrr - prevNewMrr) / prevNewMrr) * 100

const latestChurnedMrr = trendSeries[trendSeries.length - 1].churnedMrr
const churnRate = (latestChurnedMrr / latestMrr) * 100
const prevChurnRate =
  (trendSeries[trendSeries.length - 2].churnedMrr /
    trendSeries[trendSeries.length - 2].mrr) *
  100
const churnChange = churnRate - prevChurnRate

const arr = latestMrr * 12
const prevArr = prevMrr * 12
const arrChange = ((arr - prevArr) / prevArr) * 100

export const headerKpis: KpiItem[] = [
  {
    id: "mrr",
    label: "MRR",
    value: `$${(latestMrr / 1_000).toFixed(1)}K`,
    change: parseFloat(mrrChange.toFixed(1)),
    changeLabel: "前月比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.mrr)),
  },
  {
    id: "arr",
    label: "ARR",
    value: `$${(arr / 1_000_000).toFixed(2)}M`,
    change: parseFloat(arrChange.toFixed(1)),
    changeLabel: "前月比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.mrr * 12)),
  },
  {
    id: "churn-rate",
    label: "解約率 (MRR)",
    value: `${churnRate.toFixed(2)}%`,
    change: parseFloat(churnChange.toFixed(2)),
    changeLabel: "前月比 pt",
    positiveIsGood: false,
    sparklineData: buildSparkline(
      trendSeries.map((p) => parseFloat(((p.churnedMrr / p.mrr) * 100).toFixed(2))),
    ),
  },
  {
    id: "new-mrr",
    label: "新規 MRR",
    value: `$${(latestNewMrr / 1_000).toFixed(1)}K`,
    change: parseFloat(newMrrChange.toFixed(1)),
    changeLabel: "前月比",
    positiveIsGood: true,
    sparklineData: buildSparkline(trendSeries.map((p) => p.newMrr)),
  },
]

// ── Top plans table ───────────────────────────────────────────────────────────
export const topItems: TopItemRow[] = [
  { id: "plan-01", plan: "Enterprise Plus",   tier: "Enterprise", mrr: 98_400,  seats: 320, churnRate: 0.8 },
  { id: "plan-02", plan: "Business Pro",      tier: "Business",   mrr: 74_200,  seats: 610, churnRate: 1.4 },
  { id: "plan-03", plan: "Business Starter",  tier: "Business",   mrr: 52_800,  seats: 890, churnRate: 2.1 },
  { id: "plan-04", plan: "Growth",            tier: "Growth",     mrr: 38_600,  seats: 1_240, churnRate: 2.8 },
  { id: "plan-05", plan: "Startup",           tier: "Growth",     mrr: 24_100,  seats: 2_050, churnRate: 3.5 },
  { id: "plan-06", plan: "Team",              tier: "SMB",        mrr: 18_750,  seats: 3_120, churnRate: 4.2 },
  { id: "plan-07", plan: "Professional",      tier: "SMB",        mrr: 14_320,  seats: 1_870, churnRate: 3.9 },
  { id: "plan-08", plan: "Essentials",        tier: "SMB",        mrr: 9_840,   seats: 4_560, churnRate: 5.1 },
  { id: "plan-09", plan: "Free Trial Conv.",  tier: "Self-serve", mrr: 6_200,   seats: 8_900, churnRate: 7.3 },
  { id: "plan-10", plan: "Legacy Basic",      tier: "Self-serve", mrr: 3_480,   seats: 2_340, churnRate: 9.6 },
]
