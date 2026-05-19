import { useState } from "react"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SegmentedControl } from "@/components/common/segmented-control"
import { formatCurrency } from "./chart-helpers"
import type { DealRecord } from "@/types/deal-pipeline"

interface DealTableProps {
  data: DealRecord[]
}

const sortOptions = [
  { label: "Close date", value: "date" },
  { label: "Amount", value: "amount" },
  { label: "Priority", value: "priority" },
]

const stageVariant: Record<string, "default" | "secondary" | "outline"> = {
  Lead: "outline",
  Qualified: "outline",
  Proposal: "secondary",
  Negotiation: "secondary",
  "Closed Won": "default",
}

const priorityClass: Record<string, string> = {
  high: "text-destructive",
  medium: "text-amber-700",
  low: "text-muted-foreground",
}

const priorityRank: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function DealTable({ data }: DealTableProps) {
  const [sortBy, setSortBy] = useState<"date" | "amount" | "priority">("date")
  const sorted = [...data]
    .sort((a, b) => {
      if (sortBy === "date") return a.daysToClose - b.daysToClose
      if (sortBy === "amount") return b.amount - a.amount
      return priorityRank[a.priority] - priorityRank[b.priority]
    })
    .slice(0, 14)

  return (
    <DashboardCardPreset
      title="Deal List"
      description="Top deals with priority, owner, and expected close date"
      actions={
        <SegmentedControl
          size="sm"
          options={sortOptions}
          value={sortBy}
          onChange={(v) => setSortBy(v as "date" | "amount" | "priority")}
          ariaLabel="Sort deals"
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Weighted</TableHead>
            <TableHead>Close</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.dealId}>
              <TableCell>
                <div className="font-medium">{row.dealName}</div>
                <div className="text-xs text-muted-foreground">
                  {row.dealId}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={stageVariant[row.stage]}>{row.stage}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.owner}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.amount, { short: true })}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.weightedAmount, { short: true })}
              </TableCell>
              <TableCell>
                <div className="text-sm">{row.expectedCloseDate}</div>
                <div
                  className={`text-xs ${row.daysToClose < 0 ? "text-destructive" : row.daysToClose <= 7 ? "text-amber-700" : "text-muted-foreground"}`}
                >
                  {row.daysToClose < 0
                    ? `${Math.abs(row.daysToClose)}d overdue`
                    : `in ${row.daysToClose}d`}
                </div>
              </TableCell>
              <TableCell className={priorityClass[row.priority]}>
                <span className="text-sm capitalize">{row.priority}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
