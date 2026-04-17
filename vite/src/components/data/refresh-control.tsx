import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getRelativeTimeString } from "@/lib/freshness"

interface RefreshControlProps {
  onRefresh: () => void | Promise<void>
  lastUpdatedAt?: Date | null
  isRefreshing?: boolean
  autoRefreshInterval?: number | null
  showLastUpdated?: boolean
  size?: "sm" | "default"
  className?: string
}

export const RefreshControl = React.forwardRef<HTMLDivElement, RefreshControlProps>(
  function RefreshControl({
    onRefresh,
    lastUpdatedAt,
    isRefreshing = false,
    autoRefreshInterval = null,
    showLastUpdated = true,
    size = "default",
    className,
  }, ref) {
    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

    const handleRefresh = React.useCallback(() => {
      if (!isRefreshing) {
        onRefresh()
      }
    }, [isRefreshing, onRefresh])

    React.useEffect(() => {
      if (autoRefreshInterval && autoRefreshInterval > 0) {
        intervalRef.current = setInterval(() => {
          onRefresh()
        }, autoRefreshInterval * 1000)

        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
      }
    }, [autoRefreshInterval, onRefresh])

    const buttonSize = size === "sm" ? "sm" : "default"
    const buttonAriaLabel = isRefreshing ? "更新中" : "データを更新"

    return (
      <div ref={ref} data-slot="refresh-control" className={cn("flex items-center gap-2", className)}>
        {showLastUpdated && lastUpdatedAt && (
          <span className="text-xs text-muted-foreground">
            {getRelativeTimeString(lastUpdatedAt)}
          </span>
        )}
        <Button
          variant="outline"
          size={buttonSize}
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label={buttonAriaLabel}
          aria-busy={isRefreshing}
        >
          <RefreshCw
            className={cn(
              size === "sm" ? "size-3.5" : "size-4",
              isRefreshing && "animate-spin"
            )}
            aria-hidden="true"
          />
          {size !== "sm" && (
            <span>{isRefreshing ? "更新中..." : "更新"}</span>
          )}
        </Button>
      </div>
    )
  }
)

RefreshControl.displayName = "RefreshControl"
