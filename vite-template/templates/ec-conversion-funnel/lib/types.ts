export type FunnelStageId = "visit" | "view" | "cart" | "purchase"

export type DeviceType = "desktop" | "mobile" | "tablet"

// ── Raw schema (matches ticket's expected input data) ──
// session_id, event_type, product_id, device, timestamp
export interface SessionEventRow {
  session_id: string
  event_type: "visit" | "view" | "add_to_cart" | "purchase"
  product_id: string | null
  device: DeviceType
  timestamp: string
}

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface FunnelStepData {
  id: FunnelStageId
  label: string
  value: number
}

export interface DeviceCvrPoint {
  device: DeviceType
  sessions: number
  viewRate: number
  cartRate: number
  purchaseRate: number
  overallCvr: number
}

export interface ExitPageRow {
  pageId: string
  pagePath: string
  pageType: "product" | "category" | "cart" | "checkout" | "search" | "other"
  sessions: number
  exits: number
  exitRate: number
}

export interface DashboardFilters {
  dateRange: { from: Date | undefined; to: Date | undefined }
  device: string | undefined
}
