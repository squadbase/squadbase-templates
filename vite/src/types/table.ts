export type SortDirection = "asc" | "desc"

export interface SortConfig {
  /** Column key to sort by */
  key: string
  /** Sort direction */
  direction: SortDirection
}

export interface PaginationConfig {
  /** Current page index (0-based) */
  pageIndex: number
  /** Number of items per page */
  pageSize: number
  /** Total number of items */
  totalCount: number
}

export interface ColumnConfig<T = unknown> {
  /** Unique column key */
  key: string
  /** Display header label */
  label: string
  /** Whether this column is sortable */
  sortable?: boolean
  /** Whether this column is visible by default */
  defaultVisible?: boolean
  /** Column width (CSS value) */
  width?: string
  /** Custom cell renderer */
  render?: (value: unknown, row: T) => React.ReactNode
}

