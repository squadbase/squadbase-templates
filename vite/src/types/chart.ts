export interface ChartDataPoint {
  /** X-axis label or category */
  name: string
  /** Primary value */
  value: number
  /** Optional additional values for multi-series */
  [key: string]: string | number
}

export interface ChartConfig {
  /** Chart title */
  title?: string
  /** Chart height in pixels */
  height?: number
  /** Whether to show legend */
  showLegend?: boolean
  /** Whether to show tooltip */
  showTooltip?: boolean
  /** Color palette override */
  colors?: string[]
  /** Whether the chart is in loading state */
  loading?: boolean
}
