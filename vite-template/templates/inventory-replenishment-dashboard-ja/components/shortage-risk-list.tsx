import { AlertCircle } from "lucide-react"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatStockDays } from "./chart-helpers"
import type { ShortageRiskItem } from "@/types/inventory-replenishment-dashboard"

interface ShortageRiskListProps {
  data: ShortageRiskItem[]
}

function bufferTone(buffer: number): {
  label: string
  className: string
  rowClass: string
} {
  if (buffer < 0)
    return {
      label: "欠品リスク",
      className:
        "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      rowClass: "border-l-rose-500",
    }
  if (buffer < 3)
    return {
      label: "本日発注",
      className:
        "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      rowClass: "border-l-amber-500",
    }
  return {
    label: "監視",
    className:
      "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    rowClass: "border-l-sky-500",
  }
}

export function ShortageRiskList({ data }: ShortageRiskListProps) {
  if (data.length === 0) {
    return (
      <DashboardCardPreset
        title="欠品リスク SKU"
        description="在庫日数がリードタイムを下回る SKU"
      >
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          現在、欠品リスクの SKU はありません。
        </div>
      </DashboardCardPreset>
    )
  }

  return (
    <DashboardCardPreset
      title="欠品リスク SKU"
      description="バッファ日数 (在庫日数 - リードタイム) の小さい順 — マイナスは納品前に欠品の見込み"
    >
      <ul className="divide-y divide-border">
        {data.map((item) => {
          const tone = bufferTone(item.bufferDays)
          return (
            <li
              key={item.sku}
              className={cn(
                "flex items-start gap-3 border-l-4 py-3 pl-3 pr-2",
                tone.rowClass,
              )}
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.sku} · 日販 {item.dailySalesAvg.toFixed(1)} · リードタイム{" "}
                    {item.leadTimeDays} 日
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div className="text-sm">
                    <div className="font-semibold tabular-nums">
                      {formatStockDays(item.stockDays)}
                    </div>
                    <div
                      className={cn(
                        "text-xs tabular-nums",
                        item.bufferDays < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground",
                      )}
                    >
                      バッファ {item.bufferDays >= 0 ? "+" : ""}
                      {item.bufferDays.toFixed(1)} 日
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("whitespace-nowrap text-xs font-semibold", tone.className)}
                  >
                    {tone.label}
                  </Badge>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </DashboardCardPreset>
  )
}
