import * as React from "react"
import { Columns3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColumnVisibilityItem {
  id: string
  label: string
}

interface ColumnVisibilityProps {
  columns: ColumnVisibilityItem[]
  visibility: Record<string, boolean>
  onChange: (visibility: Record<string, boolean>) => void
  className?: string
}

// ---------------------------------------------------------------------------
// ColumnVisibility
// ---------------------------------------------------------------------------

const ColumnVisibility = React.forwardRef<HTMLButtonElement, ColumnVisibilityProps>(
  ({ columns, visibility, onChange, className }, ref) => {
  const handleToggle = React.useCallback(
    (id: string, checked: boolean) => {
      onChange({ ...visibility, [id]: checked })
    },
    [visibility, onChange],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={ref} variant="outline" size="sm" data-slot="column-visibility" className={cn(className)}>
          <Columns3 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {columns.map((col) => {
          const isVisible =
            visibility[col.id] === undefined || visibility[col.id] === true
          return (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={isVisible}
              onCheckedChange={(checked) =>
                handleToggle(col.id, !!checked)
              }
            >
              {col.label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
},
)

ColumnVisibility.displayName = "ColumnVisibility"

export {
  ColumnVisibility,
  type ColumnVisibilityProps,
  type ColumnVisibilityItem,
}
