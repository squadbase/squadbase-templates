export interface TimePoint {
  date: string
  series1: number
  series2: number
}

export interface BarPoint {
  category: string
  value: number
}

export interface ScatterPoint {
  x: number
  y: number
  size: number
  label: string
}

export interface RadarPoint {
  axis: string
  current: number
  benchmark: number
}

export interface HeatmapCell {
  x: string
  y: string
  value: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
}
