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
  const base1 = 18_000 + i * 220 + (rand() - 0.5) * 4_000
  const base2 = 12_000 + i * 180 + (rand() - 0.5) * 3_500
  return {
    date: format(date, "yyyy-MM-dd"),
    series1: Math.max(8_000, Math.round(base1)),
    series2: Math.max(6_000, Math.round(base2)),
  }
})

export const barSeries: BarPoint[] = [
  { category: "Segment A", value: 184_320 },
  { category: "Segment B", value: 162_480 },
  { category: "Segment C", value: 138_750 },
  { category: "Segment D", value: 121_900 },
  { category: "Segment E", value: 98_640 },
  { category: "Segment F", value: 87_220 },
  { category: "Segment G", value: 72_410 },
  { category: "Segment H", value: 54_220 },
]

export const scatterPoints: ScatterPoint[] = Array.from({ length: 28 }, (_, i) => ({
  x: 20 + Math.round(rand() * 80),
  y: 100 + Math.round(rand() * 900),
  size: 8 + Math.round(rand() * 22),
  label: `Item ${i + 1}`,
}))

export const radarAxes: RadarPoint[] = [
  { axis: "Speed", current: 82, benchmark: 70 },
  { axis: "Quality", current: 91, benchmark: 78 },
  { axis: "Cost", current: 64, benchmark: 75 },
  { axis: "Coverage", current: 88, benchmark: 80 },
  { axis: "Adoption", current: 73, benchmark: 65 },
  { axis: "Support", current: 79, benchmark: 70 },
]

const HEATMAP_X = ["00", "04", "08", "12", "16", "20"]
const HEATMAP_Y = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const heatmapCells: HeatmapCell[] = HEATMAP_Y.flatMap((y, yi) =>
  HEATMAP_X.map((x, xi) => {
    const isPeak = xi >= 2 && xi <= 4 && yi < 5
    const base = isPeak ? 70 + rand() * 30 : 10 + rand() * 50
    return { x, y, value: Math.round(base) }
  }),
)

export const HEATMAP_X_AXIS = HEATMAP_X
export const HEATMAP_Y_AXIS = HEATMAP_Y
