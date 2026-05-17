import { addDays, format } from "date-fns"
import type {
  TimePoint,
  BarPoint,
  ScatterPoint,
  RadarPoint,
  HeatmapCell,
} from "@/types/ui-template-chart-grid"

const BASE_DATE = new Date("2024-03-31")
const DAYS = 30

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(123)

export const timeSeries: TimePoint[] = Array.from({ length: DAYS }, (_, i) => {
  const date = addDays(BASE_DATE, i - DAYS + 1)
  const base1 = 1_800_000 + i * 22_000 + (rand() - 0.5) * 400_000
  const base2 = 1_200_000 + i * 18_000 + (rand() - 0.5) * 350_000
  return {
    date: format(date, "yyyy-MM-dd"),
    series1: Math.max(800_000, Math.round(base1)),
    series2: Math.max(600_000, Math.round(base2)),
  }
})

export const barSeries: BarPoint[] = [
  { category: "セグメントA", value: 18_432_000 },
  { category: "セグメントB", value: 16_248_000 },
  { category: "セグメントC", value: 13_875_000 },
  { category: "セグメントD", value: 12_190_000 },
  { category: "セグメントE", value: 9_864_000 },
  { category: "セグメントF", value: 8_722_000 },
  { category: "セグメントG", value: 7_241_000 },
  { category: "セグメントH", value: 5_422_000 },
]

export const scatterPoints: ScatterPoint[] = Array.from({ length: 28 }, (_, i) => ({
  x: 20 + Math.round(rand() * 80),
  y: 100 + Math.round(rand() * 900),
  size: 8 + Math.round(rand() * 22),
  label: `アイテム ${i + 1}`,
}))

export const radarAxes: RadarPoint[] = [
  { axis: "スピード", current: 82, benchmark: 70 },
  { axis: "品質", current: 91, benchmark: 78 },
  { axis: "コスト", current: 64, benchmark: 75 },
  { axis: "カバレッジ", current: 88, benchmark: 80 },
  { axis: "導入", current: 73, benchmark: 65 },
  { axis: "サポート", current: 79, benchmark: 70 },
]

const HEATMAP_X = ["0時", "4時", "8時", "12時", "16時", "20時"]
const HEATMAP_Y = ["月", "火", "水", "木", "金", "土", "日"]
export const heatmapCells: HeatmapCell[] = HEATMAP_Y.flatMap((y, yi) =>
  HEATMAP_X.map((x, xi) => {
    const isPeak = xi >= 2 && xi <= 4 && yi < 5
    const base = isPeak ? 70 + rand() * 30 : 10 + rand() * 50
    return { x, y, value: Math.round(base) }
  }),
)

export const HEATMAP_X_AXIS = HEATMAP_X
export const HEATMAP_Y_AXIS = HEATMAP_Y
