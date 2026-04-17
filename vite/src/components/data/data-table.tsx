"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type TableMeta,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { useResolvedTheme } from "../common/squadbase-theme"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataTableContextValue<TData> {
  table: TanstackTable<TData>
  selectedRows: TData[]
  hasSelection: boolean
  globalFilter: string
  setGlobalFilter: OnChangeFn<string>
  enableFiltering: boolean
  enablePagination: boolean
  enableRowSelection: boolean
  visibleColumnCount: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Sorting
  enableSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  // Filtering
  enableFiltering?: boolean
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>

  // Pagination
  enablePagination?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number

  // Row selection
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  // Column visibility
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>

  // Meta
  meta?: TableMeta<TData>

  // Styling
  className?: string

  // Children — required for compound usage
  children: React.ReactNode
}

interface DataTableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  showSearch?: boolean
  toolbar?: React.ReactNode
  bulkActions?: (selectedRows: unknown[]) => React.ReactNode
}

interface DataTableContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DataTablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  pageSizeOptions?: number[]
}

interface DataTableColumnVisibilityProps {
  /** 列IDをキーとしたラベルマップ。ヘッダーが文字列でない列のラベルを指定する */
  columnLabels?: Record<string, string>
  className?: string
}

interface DataTablePresetProps<TData, TValue> {
  // Data
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // Sorting
  enableSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  // Filtering
  enableFiltering?: boolean
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>

  // Pagination
  enablePagination?: boolean
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number

  // Row selection
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  // Column visibility
  enableColumnVisibility?: boolean
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  columnLabels?: Record<string, string>

  // Extension slots
  toolbar?: React.ReactNode
  bulkActions?: (selectedRows: TData[]) => React.ReactNode

  // Meta
  meta?: TableMeta<TData>

  // Styling
  className?: string
}

// ---------------------------------------------------------------------------
// Helper – use controlled value when provided, else fall back to internal state
// ---------------------------------------------------------------------------

function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: OnChangeFn<T>,
): [T, OnChangeFn<T>] {
  const [internalValue, setInternalValue] = React.useState<T>(defaultValue)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const setValue: OnChangeFn<T> = React.useCallback(
    (updaterOrValue) => {
      if (onChange) {
        onChange(updaterOrValue)
      }
      if (!isControlled) {
        setInternalValue(updaterOrValue as React.SetStateAction<T>)
      }
    },
    [onChange, isControlled],
  )

  return [value, setValue]
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DataTableContext = React.createContext<DataTableContextValue<unknown> | null>(null)

function useDataTable<TData>(): DataTableContextValue<TData> {
  const ctx = React.useContext(DataTableContext)
  if (!ctx) throw new Error("useDataTable must be used inside <DataTable>")
  return ctx as DataTableContextValue<TData>
}

// ---------------------------------------------------------------------------
// DataTable (Root)
// ---------------------------------------------------------------------------

function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  sorting: sortingProp,
  onSortingChange,
  enableFiltering = false,
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
  enablePagination = false,
  pagination: paginationProp,
  onPaginationChange,
  pageCount,
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  meta,
  className,
  children,
}: DataTableProps<TData, TValue>) {
  // -- State ----------------------------------------------------------------

  const [sorting, setSorting] = useControlledState<SortingState>(
    sortingProp,
    [],
    onSortingChange,
  )

  const [columnFilters, setColumnFilters] =
    useControlledState<ColumnFiltersState>(
      columnFiltersProp,
      [],
      onColumnFiltersChange,
    )

  const [globalFilter, setGlobalFilter] = useControlledState<string>(
    globalFilterProp,
    "",
    onGlobalFilterChange as OnChangeFn<string> | undefined,
  )

  const [rowSelection, setRowSelection] =
    useControlledState<RowSelectionState>(
      rowSelectionProp,
      {},
      onRowSelectionChange,
    )

  const [columnVisibility, setColumnVisibility] =
    useControlledState<VisibilityState>(
      columnVisibilityProp,
      {},
      onColumnVisibilityChange,
    )

  const [pagination, setPagination] = useControlledState<PaginationState>(
    paginationProp,
    { pageIndex: 0, pageSize: 10 },
    onPaginationChange,
  )

  // -- Selection column -----------------------------------------------------

  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "_select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="全て選択"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="行を選択"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

  // -- Table instance -------------------------------------------------------

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
      ...(enablePagination ? { pagination } : {}),
    },
    enableSorting,
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    ...(enablePagination
      ? { onPaginationChange: setPagination }
      : {}),
    ...(pageCount !== undefined ? { pageCount, manualPagination: true } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
    meta,
  })

  // -- Derived values -------------------------------------------------------

  const selectedRows = React.useMemo(
    () =>
      table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowSelection, data],
  )

  const hasSelection = selectedRows.length > 0

  // -- Context value --------------------------------------------------------

  const contextValue = React.useMemo<DataTableContextValue<TData>>(
    () => ({
      table,
      selectedRows,
      hasSelection,
      globalFilter,
      setGlobalFilter,
      enableFiltering,
      enablePagination,
      enableRowSelection,
      visibleColumnCount: allColumns.length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      table,
      selectedRows,
      hasSelection,
      globalFilter,
      setGlobalFilter,
      enableFiltering,
      enablePagination,
      enableRowSelection,
      allColumns.length,
      // table reference is stable (useReactTable returns the same object),
      // so we must track state changes explicitly to trigger consumer re-renders.
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    ],
  )

  // -- Render ---------------------------------------------------------------

  return (
    <DataTableContext.Provider value={contextValue as DataTableContextValue<unknown>}>
      <div data-slot="data-table" className={cn("space-y-4", className)}>
        {children}
      </div>
    </DataTableContext.Provider>
  )
}

DataTable.displayName = "DataTable"

// ---------------------------------------------------------------------------
// DataTableToolbar
// ---------------------------------------------------------------------------

const DataTableToolbar = React.forwardRef<HTMLDivElement, DataTableToolbarProps>(
  ({ showSearch, toolbar, bulkActions, className, ...props }, ref) => {
    const {
      globalFilter,
      setGlobalFilter,
      hasSelection,
      selectedRows,
      enableFiltering,
    } = useDataTable()

    const showSearchEffective = showSearch ?? enableFiltering

    const hasContent =
      showSearchEffective ||
      toolbar != null ||
      (hasSelection && bulkActions != null)

    if (!hasContent) return null

    return (
      <div
        ref={ref}
        data-slot="data-table-toolbar"
        className={cn("flex flex-wrap items-center gap-2", className)}
        {...props}
      >
        {showSearchEffective && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm pl-8"
            />
          </div>
        )}
        {toolbar}
        {hasSelection && bulkActions && (
          <div className="ml-auto flex items-center gap-2">
            {bulkActions(selectedRows)}
          </div>
        )}
      </div>
    )
  },
)

DataTableToolbar.displayName = "DataTableToolbar"

// ---------------------------------------------------------------------------
// DataTableContent
// ---------------------------------------------------------------------------

const DataTableContent = React.forwardRef<HTMLDivElement, DataTableContentProps>(
  ({ className, ...props }, ref) => {
    const { table, visibleColumnCount } = useDataTable()
    const theme = useResolvedTheme()

    return (
      <div
        ref={ref}
        data-slot="data-table-content"
        className={cn("overflow-x-auto", theme === "shibuya" && "font-mono", className)}
        {...props}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-sort={
                          header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                              ? "descending"
                              : "none"
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-4" />
                        ) : (
                          <ArrowUpDown className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  },
)

DataTableContent.displayName = "DataTableContent"

// ---------------------------------------------------------------------------
// DataTablePagination
// ---------------------------------------------------------------------------

const DataTablePagination = React.forwardRef<HTMLDivElement, DataTablePaginationProps>(
  ({ pageSizeOptions = [10, 20, 50], className, ...props }, ref) => {
    const { table } = useDataTable()

    const totalRows = table.getFilteredRowModel().rows.length
    const currentPageSize = table.getState().pagination.pageSize
    const currentPageIndex = table.getState().pagination.pageIndex
    const rangeStart = currentPageIndex * currentPageSize + 1
    const rangeEnd = Math.min(
      (currentPageIndex + 1) * currentPageSize,
      totalRows,
    )

    return (
      <div
        ref={ref}
        data-slot="data-table-pagination"
        className={cn("flex flex-wrap items-center justify-between gap-4", className)}
        {...props}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {totalRows}件中 {rangeStart} - {rangeEnd} を表示
          </span>
          <Select
            value={String(currentPageSize)}
            onValueChange={(value) =>
              table.setPageSize(Number(value))
            }
          >
            <SelectTrigger size="sm" className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}件
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            最初
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            前へ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            次へ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            最後
          </Button>
        </div>
      </div>
    )
  },
)

DataTablePagination.displayName = "DataTablePagination"

// ---------------------------------------------------------------------------
// DataTableColumnVisibility
// ---------------------------------------------------------------------------

const DataTableColumnVisibility = React.forwardRef<
  HTMLButtonElement,
  DataTableColumnVisibilityProps
>(({ columnLabels, className }, ref) => {
  const { table } = useDataTable()

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide())

  if (hideableColumns.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          size="sm"
          data-slot="data-table-column-visibility"
          className={cn(className)}
        >
          <Columns3 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {hideableColumns.map((column) => {
          const label =
            columnLabels?.[column.id] ??
            (typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id)
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) =>
                column.toggleVisibility(!!checked)
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

DataTableColumnVisibility.displayName = "DataTableColumnVisibility"

// ---------------------------------------------------------------------------
// DataTablePreset — convenience wrapper preserving the old monolithic API
// ---------------------------------------------------------------------------

function DataTablePreset<TData, TValue>({
  columns,
  data,
  enableSorting,
  sorting,
  onSortingChange,
  enableFiltering,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  enablePagination,
  pagination,
  onPaginationChange,
  pageCount,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  enableColumnVisibility = false,
  columnVisibility,
  onColumnVisibilityChange,
  columnLabels,
  toolbar,
  bulkActions,
  meta,
  className,
}: DataTablePresetProps<TData, TValue>) {
  const toolbarSlot =
    toolbar || enableColumnVisibility ? (
      <>
        {toolbar}
        {enableColumnVisibility && (
          <DataTableColumnVisibility columnLabels={columnLabels} />
        )}
      </>
    ) : undefined

  return (
    <DataTable<TData, TValue>
      columns={columns}
      data={data}
      enableSorting={enableSorting}
      sorting={sorting}
      onSortingChange={onSortingChange}
      enableFiltering={enableFiltering}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      enablePagination={enablePagination}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={pageCount}
      enableRowSelection={enableRowSelection}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      meta={meta}
      className={className}
    >
      <DataTableToolbar
        showSearch={enableFiltering}
        toolbar={toolbarSlot}
        bulkActions={bulkActions as ((selectedRows: unknown[]) => React.ReactNode) | undefined}
      />
      <DataTableContent />
      {enablePagination && <DataTablePagination />}
    </DataTable>
  )
}

DataTablePreset.displayName = "DataTablePreset"

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  DataTable,
  DataTableToolbar,
  DataTableContent,
  DataTablePagination,
  DataTableColumnVisibility,
  DataTablePreset,
  useDataTable,
  type DataTableProps,
  type DataTableToolbarProps,
  type DataTableContentProps,
  type DataTablePaginationProps,
  type DataTableColumnVisibilityProps,
  type DataTablePresetProps,
}

// Backwards compatibility alias
export { DataTablePreset as DataTableCompat }
