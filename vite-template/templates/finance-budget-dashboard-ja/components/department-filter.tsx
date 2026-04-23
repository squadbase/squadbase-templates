import { ChevronRight } from "lucide-react"
import { DashboardCardPreset } from "@/components/common/dashboard-card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  budgetHierarchy,
  DEPARTMENTS,
} from "@/lib/finance-budget-mock-data"
import type { Department } from "@/types/finance-budget"

interface DepartmentFilterProps {
  selected: Department[]
  onChange: (next: Department[]) => void
}

interface TreeNode {
  id: string
  name: Department
  children: TreeNode[]
}

function buildTree(): TreeNode[] {
  const byId: Record<string, TreeNode> = {}
  budgetHierarchy.forEach((row) => {
    byId[row.department_id] = { id: row.department_id, name: row.department_name, children: [] }
  })
  const roots: TreeNode[] = []
  budgetHierarchy.forEach((row) => {
    const node = byId[row.department_id]
    if (row.parent_id && byId[row.parent_id]) {
      byId[row.parent_id].children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function TreeItem({
  node,
  depth,
  selected,
  onToggle,
}: {
  node: TreeNode
  depth: number
  selected: Department[]
  onToggle: (dept: Department) => void
}) {
  const checked = selected.includes(node.name)
  return (
    <>
      <label
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted cursor-pointer",
          checked && "bg-muted/70",
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {depth > 0 && (
          <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
        )}
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle(node.name)}
          aria-label={node.name}
        />
        <span className="flex-1 truncate">{node.name}</span>
      </label>
      {node.children.map((child) => (
        <TreeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selected={selected}
          onToggle={onToggle}
        />
      ))}
    </>
  )
}

export function DepartmentFilter({
  selected,
  onChange,
}: DepartmentFilterProps) {
  const tree = buildTree()
  const allSelected = selected.length === DEPARTMENTS.length

  const toggle = (dept: Department) => {
    onChange(
      selected.includes(dept)
        ? selected.filter((d) => d !== dept)
        : [...selected, dept],
    )
  }

  const toggleAll = () => {
    onChange(allSelected ? [] : [...DEPARTMENTS])
  }

  return (
    <DashboardCardPreset
      title="部門フィルター"
      description="選択した部門のみを集計に含めます"
    >
      <div className="space-y-1">
        <label className="flex items-center gap-2 rounded-md border-b px-2 py-1.5 text-sm font-medium cursor-pointer hover:bg-muted">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="すべての部門"
          />
          <span>すべての部門</span>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {selected.length} / {DEPARTMENTS.length}
          </span>
        </label>
        {tree.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            selected={selected}
            onToggle={toggle}
          />
        ))}
      </div>
    </DashboardCardPreset>
  )
}
