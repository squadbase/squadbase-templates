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
  checkout: "Checkout",
  cart: "Cart",
  product: "Product",
  category: "Category",
  search: "Search",
  other: "Other",
}

export function ExitPagesTable({ data }: ExitPagesTableProps) {
  const sorted = [...data]
    .sort((a, b) => b.exitRate - a.exitRate)
    .slice(0, 10)

  return (
    <DashboardCardPreset
      title="Top 10 Exit Pages"
      description="Pages with the highest exit rate — prioritize friction fixes here"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Sessions</TableHead>
            <TableHead className="text-right">Exits</TableHead>
            <TableHead className="text-right">Exit Rate</TableHead>
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
                {row.sessions.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.exits.toLocaleString("en-US")}
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
