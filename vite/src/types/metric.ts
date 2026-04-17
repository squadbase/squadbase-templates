export type TrendDirection = "up" | "down" | "neutral"

export type MetricVariant = "default" | "primary" | "accent" | "muted"

export interface MetricItem {
  /** Unique identifier for the metric */
  id: string
  /** Display label for the metric */
  label: string
  /** Current value (formatted string or number) */
  value: string | number
  /** Optional unit suffix (e.g. "円", "%", "件") */
  unit?: string
  /** Trend direction */
  trend?: TrendDirection
  /** Trend change value */
  trendValue?: number
  /** Optional description or subtitle */
  description?: string
  /** Whether higher values are positive (default: true) */
  positiveIsGood?: boolean
  /** Visual emphasis variant */
  variant?: MetricVariant
}
