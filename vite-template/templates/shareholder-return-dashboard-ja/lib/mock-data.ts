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
// All monetary fields are denominated in 億円 (100 million JPY)

const BASE_YEAR = 2025
const YEARS = 10

// 配当利回りの算出に用いる参考株価 (円 / 株)。実データに差し替え可能。
const SHARE_PRICE = 4_200

function generateAnnualSeries(): AnnualPoint[] {
  const points: AnnualPoint[] = []
  for (let i = YEARS - 1; i >= 0; i--) {
    const fiscalYear = BASE_YEAR - i
    // 当期純利益 (億円) は年率約 6% で成長
    const netIncome = Math.round(420 * Math.pow(1.06, YEARS - 1 - i) * (0.94 + srand(0, 0.12)))
    // 配当性向は約 28% → 36% へ漸増
    const payoutTarget = 0.28 + ((YEARS - 1 - i) / (YEARS - 1)) * 0.08
    const dividendTotal = Math.round(netIncome * (payoutTarget + srand(-0.015, 0.015)))
    // 自社株買いは年によって実施有無が分かれる
    const buybackBase = i === 0 ? 90 : i === 2 ? 140 : i === 4 ? 70 : i === 6 ? 110 : i === 8 ? 40 : 0
    const buybackTotal = buybackBase
      ? Math.round(buybackBase * (0.92 + srand(0, 0.18)))
      : 0
    const payoutRatio = (dividendTotal / netIncome) * 100
    const buybackRatio = (buybackTotal / netIncome) * 100
    const totalReturnRatio = payoutRatio + buybackRatio
    // 配当利回り (%) = 1 株配当 / 株価
    const sharesOutstandingMm = 320 + srand(-3, 3)
    // 配当総額(億円) * 1e8 / 発行済株式数(百万株) * 1e6 = DPS(円)
    const dps = (dividendTotal * 1e8) / (sharesOutstandingMm * 1e6)
    const dividendYield = (dps / SHARE_PRICE) * 100
    points.push({
      fiscalYear,
      fiscalLabel: `${fiscalYear}年度`,
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

// ── 自社株買いイベント (タイムライン) ──

function generateBuybackEvents(): BuybackEvent[] {
  const events: BuybackEvent[] = []
  for (const point of annualSeries) {
    if (point.buybackTotal <= 0) continue
    const avgPrice = SHARE_PRICE * (0.92 + srand(0, 0.16))
    // 自社株買い額(億円) * 1e8 / 平均取得単価(円) = 取得株数
    const shares = Math.round((point.buybackTotal * 1e8) / avgPrice)
    const announcedAt = `${point.fiscalYear}-${String(2 + Math.floor(srand(0, 6))).padStart(2, "0")}-15`
    const status: BuybackEvent["status"] =
      point.fiscalYear === BASE_YEAR
        ? "in-progress"
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

// ── KPI (ヘッダー サマリー) ──

function computeKpis(): KpiItem[] {
  const latest = annualSeries[annualSeries.length - 1]
  const previous = annualSeries[annualSeries.length - 2]

  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  return [
    {
      id: "dividend-total",
      label: "配当総額",
      value: `${latest.dividendTotal.toLocaleString("ja-JP")}億円`,
      change: pct(latest.dividendTotal, previous.dividendTotal),
      changeLabel: "前年度比",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.dividendTotal),
    },
    {
      id: "dividend-yield",
      label: "配当利回り",
      value: `${latest.dividendYield.toFixed(2)}%`,
      change:
        Math.round((latest.dividendYield - previous.dividendYield) * 100) / 100,
      changeLabel: "前年度比",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.dividendYield),
    },
    {
      id: "buyback",
      label: "自社株買い額",
      value: `${latest.buybackTotal.toLocaleString("ja-JP")}億円`,
      change: pct(latest.buybackTotal, previous.buybackTotal),
      changeLabel: "前年度比",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.buybackTotal),
    },
    {
      id: "total-return-ratio",
      label: "総還元性向",
      value: `${latest.totalReturnRatio.toFixed(1)}%`,
      change:
        Math.round((latest.totalReturnRatio - previous.totalReturnRatio) * 10) /
        10,
      changeLabel: "前年度比",
      positiveIsGood: true,
      sparklineData: annualSeries.map((p) => p.totalReturnRatio),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()
