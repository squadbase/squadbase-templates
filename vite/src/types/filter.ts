import type React from "react"

export interface FilterOption {
  label: string
  value: string
  count?: number
  disabled?: boolean
}

export type FilterType = "select" | "multi-select" | "date-range" | "search"

export interface FilterConfig {
  /** Unique key for this filter */
  key: string
  /** Display label */
  label: string
  /** Filter input type */
  type: FilterType
  /** Available options (for select/multi-select) */
  options?: FilterOption[]
  /** Placeholder text */
  placeholder?: string
  /** Default value */
  defaultValue?: string | string[]
}

export type FilterValues = Record<string, string | string[] | undefined>

export interface SegmentOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}
