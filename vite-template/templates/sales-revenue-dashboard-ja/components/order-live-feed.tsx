import { useEffect, useState } from "react"
import { ShoppingBag, MapPin } from "lucide-react"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "./chart-helpers"
import {
  seedLiveOrders,
  generateRandomLiveOrder,
} from "@/lib/sales-revenue-mock-data"
import type { LiveOrder, Channel } from "@/types/sales-revenue"

const MAX_VISIBLE = 20
const PUSH_INTERVAL_MS = 4000

const channelLabel: Record<Channel, string> = {
  direct: "直接",
  organic: "検索",
  paid_search: "広告",
  social: "SNS",
  email: "メール",
  affiliate: "アフィ",
}

function formatElapsed(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  if (sec < 60) return `${sec}秒前`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}分前`
  const hr = Math.floor(min / 60)
  return `${hr}時間前`
}

export function OrderLiveFeed() {
  const [orders, setOrders] = useState<LiveOrder[]>(seedLiveOrders)
  const [, setTick] = useState(0)

  // 疑似ストリーム: 数秒ごとに新規注文を push
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => {
        const next = generateRandomLiveOrder()
        return [next, ...prev].slice(0, MAX_VISIBLE)
      })
    }, PUSH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // 経過時間の表示更新
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <DashboardCardPreset
      title="ライブ注文フィード"
      description={`直近の注文 (最新${MAX_VISIBLE}件)`}
      actions={
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          LIVE
        </Badge>
      }
    >
      <div className="flex flex-col divide-y divide-border">
        {orders.map((order, i) => (
          <div
            key={order.orderId}
            className={cn(
              "flex items-center gap-3 py-2.5 px-1 transition-colors",
              i === 0 && "animate-in fade-in slide-in-from-top-1 duration-500",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{order.customerName}</span>
                <Badge variant="secondary" className="text-xs">
                  {order.category}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>{order.region}</span>
                <span>·</span>
                <span>{channelLabel[order.channel]}</span>
                <span>·</span>
                <span className="tabular-nums">
                  {formatElapsed(order.orderedAt)}
                </span>
              </div>
            </div>
            <div className="shrink-0 font-mono font-semibold tabular-nums">
              {formatCurrency(order.amount)}
            </div>
          </div>
        ))}
      </div>
    </DashboardCardPreset>
  )
}
