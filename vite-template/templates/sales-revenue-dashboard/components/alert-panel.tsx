import { AlertTriangle, AlertCircle, Info, Settings } from "lucide-react"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { alertEvents } from "@/lib/sales-revenue-mock-data"
import type { AlertEvent, AlertSeverity } from "@/types/sales-revenue"

const severityConfig: Record<
  AlertSeverity,
  { icon: typeof AlertCircle; tone: string; label: string; border: string }
> = {
  critical: {
    icon: AlertCircle,
    tone: "text-red-600 dark:text-red-400",
    border: "border-l-red-500",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    tone: "text-amber-600 dark:text-amber-400",
    border: "border-l-amber-500",
    label: "Warning",
  },
  info: {
    icon: Info,
    tone: "text-sky-600 dark:text-sky-400",
    border: "border-l-sky-500",
    label: "Info",
  },
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function AlertRow({ alert }: { alert: AlertEvent }) {
  const cfg = severityConfig[alert.severity]
  const Icon = cfg.icon
  return (
    <div
      className={cn(
        "flex gap-3 border-l-4 pl-3 pr-1 py-2.5",
        cfg.border,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", cfg.tone)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{alert.title}</span>
          <Badge variant="outline" className={cn("text-xs", cfg.tone)}>
            {cfg.label}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {alert.description}
        </p>
        <div className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
          {formatTime(alert.firedAt)}
        </div>
      </div>
    </div>
  )
}

export function AlertPanel() {
  return (
    <DashboardCardPreset
      title="Alerts"
      description="Business alerts for metrics crossing thresholds"
      actions={
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Settings className="size-3.5" />
          Thresholds
        </Button>
      }
    >
      <div className="flex flex-col gap-1">
        {alertEvents.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </DashboardCardPreset>
  )
}
