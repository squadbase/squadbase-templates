// ── Enum / Literal types ──

export type StockTier = "stockout" | "critical" | "low" | "healthy" | "excess"
export type Category = "apparel" | "accessories" | "footwear" | "home"

// ── Raw data schema (matches ticket's expected input data) ──
// sku, stock_qty, daily_sales_avg, lead_time_days

export interface InventoryRow {
  sku: string
  stock_qty: number
  daily_sales_avg: number
  lead_time_days: number
}

// ── Display / derived types ──

export interface SkuStockItem extends InventoryRow {
  name: string
  category: Category
  unitCost: number
  stockDays: number
  reorderPoint: number
  recommendedOrderQty: number
  tier: StockTier
  excessValue: number
}

export interface KpiItem {
  label: string
  value: string
  change: number
  changeLabel: string
  positiveIsGood: boolean
  sparklineData: number[]
}

export interface ShortageRiskItem {
  sku: string
  name: string
  stockDays: number
  leadTimeDays: number
  bufferDays: number
  dailySalesAvg: number
}

export interface StockDaysBucket {
  bucket: string
  skuCount: number
  tier: StockTier
}

// ── Filter state ──

export interface DashboardFilters {
  category: string | undefined
  tier: string | undefined
}
