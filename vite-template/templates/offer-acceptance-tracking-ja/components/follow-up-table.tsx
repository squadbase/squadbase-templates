import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTablePreset } from "@/components/data/data-table"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { StatusBadge } from "@/components/common/status-badge"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { statusLabels } from "@/lib/offer-acceptance-tracking-mock-data"
import type {
  FollowUpRow,
  FollowUpPriority,
  OfferStatus,
} from "@/types/offer-acceptance-tracking"

interface FollowUpTableProps {
  data: FollowUpRow[]
}

const statusColorMap: Record<OfferStatus, string> = {
  offered: "blue",
  considering: "yellow",
  accepted: "green",
  declined: "gray",
}

const priorityLabel: Record<FollowUpPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
}

function priorityBadgeClass(p: FollowUpPriority): string {
  if (p === "high")
    return "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (p === "medium")
    return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "border-slate-400/60 bg-slate-500/10 text-slate-700 dark:text-slate-300"
}

export function FollowUpTable({ data }: FollowUpTableProps) {
  const columns = useMemo<ColumnDef<FollowUpRow>[]>(
    () => [
      {
        accessorKey: "candidate_id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.candidate_id}
          </span>
        ),
      },
      {
        accessorKey: "candidate_name",
        header: "候補者",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.candidate_name}</span>
        ),
      },
      {
        accessorKey: "department",
        header: "部署",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.department}
          </span>
        ),
      },
      {
        accessorKey: "recruiter",
        header: "リクルーター",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.recruiter}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "ステータス",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            label={statusLabels[row.original.status]}
            colorMap={statusColorMap}
          />
        ),
      },
      {
        accessorKey: "priority",
        header: "優先度",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold",
              priorityBadgeClass(row.original.priority),
            )}
          >
            {priorityLabel[row.original.priority]}
          </Badge>
        ),
      },
      {
        accessorKey: "daysUntilDeadline",
        header: "残日数",
        cell: ({ row }) => {
          const v = row.original.daysUntilDeadline
          const tone =
            v <= 3
              ? "text-destructive"
              : v <= 7
                ? "text-amber-700"
                : "text-muted-foreground"
          return (
            <div className={cn("text-right font-semibold tabular-nums", tone)}>
              {v >= 0 ? `${v}日` : `${Math.abs(v)}日超過`}
            </div>
          )
        },
      },
      {
        accessorKey: "note",
        header: "推奨アクション",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.note}</span>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardCardPreset
      title="個別フォロー要否リスト"
      description="進行中の内定者を優先度・期限の近さでソートしたフォロー対象一覧"
    >
      <DataTablePreset columns={columns} data={data} enableSorting />
    </DashboardCardPreset>
  )
}
