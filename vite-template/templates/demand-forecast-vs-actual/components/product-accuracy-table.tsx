import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatSignedPercent } from "./chart-helpers"
import type {
  ProductForecastSeries,
  ErrorHeatmapCell,
} from "@/types/demand-forecast-vs-actual"
import { categoryLabels } from "@/lib/demand-forecast-vs-actual-mock-data"

interface ProductAccuracyTableProps {
  series: ProductForecastSeries[]
  cells: ErrorHeatmapCell[]
}

interface Row {
  productId: string
  productName: string
  categoryLabel: string
  mape: number
  bias: number
  totalActual: number
  totalForecast: number
}

function mapeBadgeClass(mape: number): string {
  if (mape <= 8)
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (mape >= 15)
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

export function ProductAccuracyTable({ series, cells }: ProductAccuracyTableProps) {
  const data = useMemo<Row[]>(() => {
    return series.map((s) => {
      const productCells = cells.filter((c) => c.productId === s.productId)
      const mape =
        productCells.reduce((sum, c) => sum + Math.abs(c.errorPct), 0) /
        Math.max(productCells.length, 1)
      const bias =
        productCells.reduce((sum, c) => sum + c.errorPct, 0) /
        Math.max(productCells.length, 1)
      const totalActual = s.points.reduce((sum, p) => sum + p.actualQty, 0)
      const totalForecast = s.points.reduce((sum, p) => sum + p.forecastQty, 0)
      return {
        productId: s.productId,
        productName: s.productName,
        categoryLabel: categoryLabels[s.category],
        mape: Math.round(mape * 10) / 10,
        bias: Math.round(bias * 10) / 10,
        totalActual,
        totalForecast,
      }
    })
  }, [series, cells])

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.productName}</span>
        ),
      },
      {
        accessorKey: "categoryLabel",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.categoryLabel}
          </span>
        ),
      },
      {
        accessorKey: "totalForecast",
        header: "Forecast (12wk)",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.totalForecast.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "totalActual",
        header: "Actual (12wk)",
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {row.original.totalActual.toLocaleString("en-US")}
          </div>
        ),
      },
      {
        accessorKey: "bias",
        header: "Bias",
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-muted-foreground">
            {formatSignedPercent(row.original.bias)}
          </div>
        ),
      },
      {
        accessorKey: "mape",
        header: "MAPE",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold tabular-nums",
                mapeBadgeClass(row.original.mape),
              )}
            >
              {row.original.mape.toFixed(1)}%
            </Badge>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="Per-Product Accuracy"
      description="Aggregate forecast vs actual and MAPE for each SKU"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
