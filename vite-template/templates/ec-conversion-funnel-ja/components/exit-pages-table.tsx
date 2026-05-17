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
import type { ExitPageRow } from "@/types/ec-conversion-funnel"

interface ExitPagesTableProps {
  data: ExitPageRow[]
}

const pageTypeVariant: Record<
  ExitPageRow["pageType"],
  "default" | "secondary" | "outline"
> = {
  checkout: "default",
  cart: "default",
  product: "secondary",
  category: "secondary",
  search: "outline",
  other: "outline",
}

const pageTypeLabel: Record<ExitPageRow["pageType"], string> = {
  checkout: "チェックアウト",
  cart: "カート",
  product: "商品",
  category: "カテゴリ",
  search: "検索",
  other: "その他",
}

export function ExitPagesTable({ data }: ExitPagesTableProps) {
  const sorted = [...data]
    .sort((a, b) => b.exitRate - a.exitRate)
    .slice(0, 10)

  return (
    <DashboardCardPreset
      title="離脱率 Top 10 ページ"
      description="離脱率の高いページ — 改修テストの優先候補"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ページ</TableHead>
            <TableHead>種別</TableHead>
            <TableHead className="text-right">セッション</TableHead>
            <TableHead className="text-right">離脱数</TableHead>
            <TableHead className="text-right">離脱率</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.pageId}>
              <TableCell>
                <div className="font-medium truncate max-w-[280px]">
                  {row.pagePath}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.pageId}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={pageTypeVariant[row.pageType]}>
                  {pageTypeLabel[row.pageType]}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.sessions.toLocaleString("ja-JP")}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.exits.toLocaleString("ja-JP")}
              </TableCell>
              <TableCell
                className={`text-right tabular-nums ${row.exitRate >= 40 ? "text-destructive" : row.exitRate >= 30 ? "text-amber-700" : "text-muted-foreground"}`}
              >
                {row.exitRate.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCardPreset>
  )
}
