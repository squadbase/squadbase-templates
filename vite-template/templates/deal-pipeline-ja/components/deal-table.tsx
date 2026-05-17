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
  { label: "期日", value: "date" },
  { label: "金額", value: "amount" },
  { label: "優先度", value: "priority" },
]

const stageVariant: Record<string, "default" | "secondary" | "outline"> = {
  リード: "outline",
  適格: "outline",
  提案: "secondary",
  交渉: "secondary",
  受注: "default",
}

const priorityClass: Record<string, string> = {
  high: "text-destructive",
  medium: "text-amber-700",
  low: "text-muted-foreground",
}

const priorityLabel: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
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
      title="案件一覧"
      description="優先度・オーナー・期日付きの上位案件"
      actions={
        <SegmentedControl
          size="sm"
          options={sortOptions}
          value={sortBy}
          onChange={(v) => setSortBy(v as "date" | "amount" | "priority")}
          ariaLabel="案件ソート"
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>案件</TableHead>
            <TableHead>ステージ</TableHead>
            <TableHead>オーナー</TableHead>
            <TableHead className="text-right">金額</TableHead>
            <TableHead className="text-right">加重</TableHead>
            <TableHead>クローズ</TableHead>
            <TableHead>優先度</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.dealId}>
              <TableCell>
                <div className="font-medium">{row.dealName}</div>
                <div className="text-xs text-muted-foreground">{row.dealId}</div>
              </TableCell>
              <TableCell>
                <Badge variant={stageVariant[row.stage]}>{row.stage}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.owner}</TableCell>
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
                    ? `${Math.abs(row.daysToClose)}日超過`
                    : `あと${row.daysToClose}日`}
                </div>
              </TableCell>
              <TableCell className={priorityClass[row.priority]}>
                <span className="text-sm">{priorityLabel[row.priority]}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
