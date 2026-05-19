import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatStockDays } from "./chart-helpers"
import type {
  SkuStockItem,
  StockTier,
  Category,
} from "@/types/inventory-replenishment-dashboard"

interface StockDaysTableProps {
  data: SkuStockItem[]
}

const TIER_LABELS: Record<StockTier, string> = {
  stockout: "欠品",
  critical: "在庫薄 (危険)",
  low: "在庫薄",
  healthy: "適正",
  excess: "過剰",
}

const CATEGORY_LABELS: Record<Category, string> = {
  apparel: "アパレル",
  accessories: "アクセサリー",
  footwear: "シューズ",
  home: "ホーム",
}

function tierBadgeClass(tier: StockTier): string {
  switch (tier) {
    case "stockout":
      return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "critical":
      return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "low":
      return "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    case "healthy":
      return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "excess":
      return "border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-300"
  }
}

function stockDaysClass(tier: StockTier): string {
  switch (tier) {
    case "stockout":
    case "critical":
      return "text-rose-600 dark:text-rose-400 font-semibold"
    case "low":
      return "text-amber-600 dark:text-amber-400 font-medium"
    case "excess":
      return "text-violet-600 dark:text-violet-400"
    default:
      return "text-foreground"
  }
}

export function StockDaysTable({ data }: StockDaysTableProps) {
  const columns = useMemo<ColumnDef<SkuStockItem>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.sku}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {CATEGORY_LABELS[row.original.category]}
          </span>
        ),
      },
      {
        accessorKey: "stock_qty",
        header: "在庫数",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.stock_qty.toLocaleString("ja-JP")}
          </div>
        ),
      },
      {
        accessorKey: "daily_sales_avg",
        header: "日販",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.daily_sales_avg.toFixed(1)}
          </div>
        ),
      },
      {
        accessorKey: "lead_time_days",
        header: "リードタイム",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {row.original.lead_time_days} 日
          </div>
        ),
      },
      {
        accessorKey: "stockDays",
        header: "在庫日数",
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right tabular-nums",
              stockDaysClass(row.original.tier),
            )}
          >
            {formatStockDays(row.original.stockDays)}
          </div>
        ),
      },
      {
        accessorKey: "tier",
        header: "ステータス",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              tierBadgeClass(row.original.tier),
            )}
          >
            {TIER_LABELS[row.original.tier]}
          </Badge>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="SKU別 在庫日数"
      description="SKU 単位の在庫日数 — 発注点に対する閾値カラーリングで在庫状態を可視化"
    >
      <DataTablePreset
        columns={columns}
        data={data}
        enableSorting
        enablePagination
      />
    </DashboardCardPreset>
  )
}
