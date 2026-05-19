import type {
  AnnualPoint,
  BuybackEvent,
  KpiItem,
} from "@/types/shareholder-return-dashboard"

// ── Helpers ──

function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRand(31)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── 10-year annual series ──

const BASE_YEAR = 2025
const YEARS = 10

// Approximate share price used to derive dividend yield (USD per share).
// Net income figures below are in USD millions; per-share economics here
// are illustrative only — replace with real data in production.
const SHARE_PRICE = 42

function generateAnnualSeries(): AnnualPoint[] {
  const points: AnnualPoint[] = []
  for (let i = YEARS - 1; i >= 0; i--) {
    const fiscalYear = BASE_YEAR - i
    // Net income (USD millions) grows ~6%/yr with noise
    const netIncome = Math.round(420 * Math.pow(1.06, YEARS - 1 - i) * (0.94 + srand(0, 0.12)))
    // Dividend payout ratio drifts from ~28% to ~36% over the decade
    const payoutTarget = 0.28 + ((YEARS - 1 - i) / (YEARS - 1)) * 0.08
    const dividendTotal = Math.round(netIncome * (payoutTarget + srand(-0.015, 0.015)))
    // Buybacks are lumpy — only some years see meaningful repurchases
    const buybackBase = i === 0 ? 90 : i === 2 ? 140 : i === 4 ? 70 : i === 6 ? 110 : i === 8 ? 40 : 0
    const buybackTotal = buybackBase
      ? Math.round(buybackBase * (0.92 + srand(0, 0.18)))
      : 0
    const payoutRatio = (dividendTotal / netIncome) * 100
    const buybackRatio = (buybackTotal / netIncome) * 100
    const totalReturnRatio = payoutRatio + buybackRatio
    // Dividend yield (%) — dividend per share / price, with a simple
    // illustrative DPS proxy derived from dividend total
    const sharesOutstandingMm = 320 + srand(-3, 3)
    const dps = dividendTotal / sharesOutstandingMm
    const dividendYield = (dps / SHARE_PRICE) * 100
    points.push({
      fiscalYear,
      fiscalLabel: `FY${fiscalYear}`,
      dividendTotal,
      buybackTotal,
      netIncome,
      payoutRatio,
      buybackRatio,
      totalReturnRatio,
      dividendYield,
    })
  }
  return points
}

export const annualSeries: AnnualPoint[] = generateAnnualSeries()

// ── Buyback events (timeline) ──

function generateBuybackEvents(): BuybackEvent[] {
  const events: BuybackEvent[] = []
  for (const point of annualSeries) {
    if (point.buybackTotal <= 0) continue
    // Avg buyback price hovers around share price
    const avgPrice = SHARE_PRICE * (0.92 + srand(0, 0.16))
    const shares = Math.round((point.buybackTotal * 1_000_000) / avgPrice)
    const announcedAt = `${point.fiscalYear}-${String(2 + Math.floor(srand(0, 6))).padStart(2, "0")}-15`
    const status: BuybackEvent["status"] =
      point.fiscalYear === BASE_YEAR
        ? "in-progress"
        : point.fiscalYear === BASE_YEAR - 1
          ? "completed"
          : "completed"
    events.push({
      id: `buyback-${point.fiscalYear}`,
      fiscalYear: point.fiscalYear,
      announcedAt,
      amount: point.buybackTotal,
      shares,
      status,
    })
  }
  return events
}

export const buybackEvents: BuybackEvent[] = generateBuybackEvents()

// ── KPIs (header summary) ──

function computeKpis(): KpiItem[] {
  const latest = annualSeries[annualSeries.length - 1]
  const previous = annualSeries[annualSeries.length - 2]

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      id: "dividend-total",
      label: "Dividend Total",
      value: `$${latest.dividendTotal.toLocaleString("en-US")}M`,
      change: pct(latest.dividendTotal, previous.dividendTotal),
      changeLabel: "vs prior FY",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.dividendTotal),
    },
    {
      id: "dividend-yield",
      label: "Dividend Yield",
      value: `${latest.dividendYield.toFixed(2)}%`,
      change:
        Math.round((latest.dividendYield - previous.dividendYield) * 100) / 100,
      changeLabel: "vs prior FY",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.dividendYield),
    },
    {
      id: "buyback",
      label: "Share Buyback",
      value: `$${latest.buybackTotal.toLocaleString("en-US")}M`,
      change: pct(latest.buybackTotal, previous.buybackTotal),
      changeLabel: "vs prior FY",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.buybackTotal),
    },
    {
      id: "total-return-ratio",
      label: "Total Payout Ratio",
      value: `${latest.totalReturnRatio.toFixed(1)}%`,
      change:
        Math.round((latest.totalReturnRatio - previous.totalReturnRatio) * 10) /
        10,
      changeLabel: "vs prior FY",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.totalReturnRatio),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()
