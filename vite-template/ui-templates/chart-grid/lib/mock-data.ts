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
  { category: "Item 1", value: 184_320 },
  { category: "Item 2", value: 162_480 },
  { category: "Item 3", value: 138_750 },
  { category: "Item 4", value: 121_900 },
  { category: "Item 5", value: 98_640 },
  { category: "Item 6", value: 87_220 },
  { category: "Item 7", value: 72_410 },
  { category: "Item 8", value: 54_220 },
]

export const scatterPoints: ScatterPoint[] = Array.from({ length: 28 }, (_, i) => ({
  x: 20 + Math.round(rand() * 80),
  y: 100 + Math.round(rand() * 900),
  size: 8 + Math.round(rand() * 22),
  label: `Item ${i + 1}`,
}))

export const radarAxes: RadarPoint[] = [
  { axis: "Axis 1", current: 82, benchmark: 70 },
  { axis: "Axis 2", current: 91, benchmark: 78 },
  { axis: "Axis 3", current: 64, benchmark: 75 },
  { axis: "Axis 4", current: 88, benchmark: 80 },
  { axis: "Axis 5", current: 73, benchmark: 65 },
  { axis: "Axis 6", current: 79, benchmark: 70 },
]

const HEATMAP_X = ["0", "1", "2", "3", "4", "5"]
const HEATMAP_Y = ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5", "Row 6", "Row 7"]
export const heatmapCells: HeatmapCell[] = HEATMAP_Y.flatMap((y, yi) =>
  HEATMAP_X.map((x, xi) => {
    const isPeak = xi >= 2 && xi <= 4 && yi < 5
    const base = isPeak ? 70 + rand() * 30 : 10 + rand() * 50
    return { x, y, value: Math.round(base) }
  }),
)

export const HEATMAP_X_AXIS = HEATMAP_X
export const HEATMAP_Y_AXIS = HEATMAP_Y
