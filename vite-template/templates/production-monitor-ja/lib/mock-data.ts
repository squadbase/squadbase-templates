import type {
  LineOutputItem,
  PlanVsActualPoint,
  DefectRatePoint,
  KpiItem,
} from "@/types/production-monitor"

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

// production-monitor 用ユニークシード
const rng = seededRand(2027)

function srand(min: number, max: number): number {
  return min + rng() * (max - min)
}

// ── 生産ライン定義 (4 ライン、規模・品質を変えて差を出す) ──

interface LineSpec {
  id: string
  name: string
  basePlanned: number
  defectMeanPct: number
}

const LINE_SPECS: LineSpec[] = [
  { id: "line-a", name: "Aライン (組立)", basePlanned: 1200, defectMeanPct: 1.4 },
  { id: "line-b", name: "Bライン (プレス)", basePlanned: 980, defectMeanPct: 2.1 },
  { id: "line-c", name: "Cライン (塗装)", basePlanned: 760, defectMeanPct: 1.8 },
  { id: "line-d", name: "Dライン (梱包)", basePlanned: 1450, defectMeanPct: 0.9 },
]

// ── 日次計画 vs 実績 (直近 30 日、全ラインの合算) ──

const DAYS = 30

function generatePlanVsActual(): PlanVsActualPoint[] {
  const totalBasePlanned = LINE_SPECS.reduce((s, l) => s + l.basePlanned, 0)
  const points: PlanVsActualPoint[] = []
  for (let i = DAYS - 1; i >= 0; i--) {
    // 週末は計画を絞る (土曜は減量、日曜はさらに減量)
    const d = new Date(BASE_DATE)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const weekendFactor = dow === 0 ? 0.4 : dow === 6 ? 0.75 : 1.0
    const trend = 1 + (DAYS - 1 - i) * 0.0015
    const planned = Math.round(totalBasePlanned * weekendFactor * trend)
    const attainNoise = 0.9 + srand(0, 0.18)
    const actual = Math.round(planned * attainNoise)
    points.push({ date: dateStr(i), plannedQty: planned, actualQty: actual })
  }
  return points
}

export const planVsActualSeries: PlanVsActualPoint[] = generatePlanVsActual()

// ── 当日のライン別内訳 ──

function generateLineOutput(): LineOutputItem[] {
  // 当日の全体達成率をベースに、ライン別ノイズで分解
  const today = planVsActualSeries[planVsActualSeries.length - 1]
  const overallAttain = today.actualQty / today.plannedQty
  return LINE_SPECS.map((spec) => {
    const lineAttain = overallAttain * (0.88 + srand(0, 0.22))
    const plannedQty = spec.basePlanned
    const actualQty = Math.round(plannedQty * lineAttain)
    const defectRate = (spec.defectMeanPct + srand(-0.6, 0.6)) / 100
    const defectQty = Math.max(0, Math.round(actualQty * defectRate))
    return {
      line_id: spec.id,
      lineName: spec.name,
      plannedQty,
      actualQty,
      defectQty,
      attainmentPct: Math.round((actualQty / plannedQty) * 1000) / 10,
    }
  })
}

export const lineOutputToday: LineOutputItem[] = generateLineOutput()

// ── 不良率トレンド (直近 30 日、管理限界線つき) ──
// センターライン = 平均不良率、UCL/LCL = 平均 ± 3σ (p 管理図近似)

function generateDefectRateTrend(): DefectRatePoint[] {
  const rates: number[] = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const baseMean = 1.55 // ライン加重平均 (%)
    const drift = (DAYS - 1 - i) * -0.008 // 緩やかな改善トレンド
    const noise = srand(-0.45, 0.55)
    const r = Math.max(0.1, baseMean + drift + noise)
    rates.push(Math.round(r * 100) / 100)
  }
  const mean = rates.reduce((s, v) => s + v, 0) / rates.length
  const variance =
    rates.reduce((s, v) => s + (v - mean) ** 2, 0) / rates.length
  const sd = Math.sqrt(variance)
  const ucl = Math.round((mean + 3 * sd) * 100) / 100
  const lcl = Math.max(0, Math.round((mean - 3 * sd) * 100) / 100)
  const centerline = Math.round(mean * 100) / 100
  return rates.map((rate, idx) => ({
    date: dateStr(DAYS - 1 - idx),
    defectRatePct: rate,
    ucl,
    lcl,
    centerline,
    isOutOfControl: rate > ucl || rate < lcl,
  }))
}

export const defectRateTrend: DefectRatePoint[] = generateDefectRateTrend()

// ── 主要 KPI (ヘッダー直下の 4 枚) ──

function computeKpis(): KpiItem[] {
  const today = planVsActualSeries[planVsActualSeries.length - 1]
  const yesterday = planVsActualSeries[planVsActualSeries.length - 2]
  const pct = (now: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((now - prev) / prev) * 1000) / 10

  const attainmentToday = (today.actualQty / today.plannedQty) * 100
  const attainmentYesterday = (yesterday.actualQty / yesterday.plannedQty) * 100

  // 稼働率の近似値: 達成率を 70-100% レンジに圧縮した値
  const operatingToday = Math.min(99.5, 70 + attainmentToday * 0.25)
  const operatingYesterday = Math.min(99.5, 70 + attainmentYesterday * 0.25)

  const defectToday =
    defectRateTrend[defectRateTrend.length - 1].defectRatePct
  const defectYesterday =
    defectRateTrend[defectRateTrend.length - 2].defectRatePct

  return [
    {
      label: "日次生産数",
      value: `${today.actualQty.toLocaleString("ja-JP")}個`,
      change: pct(today.actualQty, yesterday.actualQty),
      changeLabel: "前日比",
      positiveIsGood: true,
      sparklineData: planVsActualSeries.slice(-14).map((d) => d.actualQty),
    },
    {
      label: "計画達成率",
      value: `${attainmentToday.toFixed(1)}%`,
      change:
        Math.round((attainmentToday - attainmentYesterday) * 10) / 10,
      changeLabel: "前日比",
      positiveIsGood: true,
      sparklineData: planVsActualSeries
        .slice(-14)
        .map((d) => (d.actualQty / d.plannedQty) * 100),
    },
    {
      label: "稼働率",
      value: `${operatingToday.toFixed(1)}%`,
      change:
        Math.round((operatingToday - operatingYesterday) * 10) / 10,
      changeLabel: "前日比",
      positiveIsGood: true,
      sparklineData: planVsActualSeries
        .slice(-14)
        .map((d) => Math.min(99.5, 70 + (d.actualQty / d.plannedQty) * 100 * 0.25)),
    },
    {
      label: "不良率",
      value: `${defectToday.toFixed(2)}%`,
      change: Math.round((defectToday - defectYesterday) * 100) / 100,
      changeLabel: "前日比",
      positiveIsGood: false,
      sparklineData: defectRateTrend.slice(-14).map((d) => d.defectRatePct),
    },
  ]
}

export const headerKpis: KpiItem[] = computeKpis()

// ── フィルター選択肢 ──

export const lineOptions = [
  { label: "全ライン", value: "all" },
  ...LINE_SPECS.map((l) => ({ label: l.name, value: l.id })),
]

export const shiftOptions = [
  { label: "全シフト", value: "all" },
  { label: "日勤", value: "day" },
  { label: "準夜勤", value: "swing" },
  { label: "夜勤", value: "night" },
]
