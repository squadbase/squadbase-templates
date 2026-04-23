"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterConfig, FilterOption, FilterValues } from "@/types/filter"

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface FilterBarContextValue {
  /** Current filter values (controlled from outside) */
  value: FilterValues
  /** Notify parent of a value change */
  onChange: (next: FilterValues) => void
  /** Optional clear callback — undefined means no clear button */
  onClear?: () => void
}

const FilterBarContext = React.createContext<FilterBarContextValue | null>(null)

function useFilterBar(): FilterBarContextValue {
  const ctx = React.useContext(FilterBarContext)
  if (!ctx) throw new Error("useFilterBar must be used within <FilterBar>")
  return ctx
}

/* ------------------------------------------------------------------ */
/*  filterBarVariants                                                  */
/* ------------------------------------------------------------------ */

const filterBarVariants = cva("flex flex-wrap items-center gap-2", {
  variants: {
    // Reserved for future layout variants (e.g. "compact", "stacked")
  },
  defaultVariants: {},
})

/* ------------------------------------------------------------------ */
/*  FilterBar (Root)                                                   */
/* ------------------------------------------------------------------ */

interface FilterBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof filterBarVariants> {
  value: FilterValues
  onChange: (values: FilterValues) => void
  onClear?: () => void
  className?: string
  children?: React.ReactNode
}

const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ value, onChange, onClear, className, children, ...props }, ref) => (
    <FilterBarContext.Provider value={{ value, onChange, onClear }}>
      <div
        ref={ref}
        role="search"
        aria-label="フィルター"
        data-slot="filter-bar"
        className={cn(filterBarVariants(), className)}
        {...props}
      >
        {children}
      </div>
    </FilterBarContext.Provider>
  ),
)
FilterBar.displayName = "FilterBar"

/* ------------------------------------------------------------------ */
/*  FilterBarSelect                                                    */
/* ------------------------------------------------------------------ */

interface FilterBarSelectProps {
  filterKey: string
  label: string
  options: FilterOption[]
  placeholder?: string
  className?: string
}

function FilterBarSelect({
  filterKey,
  label,
  options,
  placeholder,
  className,
}: FilterBarSelectProps) {
  const { value, onChange } = useFilterBar()
  const handleChange = (selected: string) =>
    onChange({ ...value, [filterKey]: selected })

  return (
    <Select
      value={(value[filterKey] as string) ?? ""}
      onValueChange={handleChange}
    >
      <SelectTrigger
        size="sm"
        aria-label={label}
        data-slot="filter-bar-select"
        className={className}
      >
        <SelectValue placeholder={placeholder ?? label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
FilterBarSelect.displayName = "FilterBarSelect"

/* ------------------------------------------------------------------ */
/*  FilterBarMultiSelect                                               */
/* ------------------------------------------------------------------ */

interface FilterBarMultiSelectProps {
  filterKey: string
  label: string
  options: FilterOption[]
  placeholder?: string
  className?: string
}

function FilterBarMultiSelect({
  filterKey,
  label,
  options,
  placeholder,
  className,
}: FilterBarMultiSelectProps) {
  const { value, onChange } = useFilterBar()
  const selected = (value[filterKey] as string[] | undefined) ?? []

  const handleToggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((v) => v !== option)
      : [...selected, option]
    onChange({ ...value, [filterKey]: next.length > 0 ? next : undefined })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1", className)}
          aria-label={`${placeholder ?? label}${selected.length > 0 ? ` (${selected.length}件選択中)` : ""}`}
          data-slot="filter-bar-multi-select"
        >
          {placeholder ?? label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="size-3.5 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="flex flex-col gap-1" role="group" aria-label={label}>
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
            >
              <Checkbox
                checked={selected.includes(option.value)}
                disabled={option.disabled}
                onCheckedChange={() => handleToggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
FilterBarMultiSelect.displayName = "FilterBarMultiSelect"

/* ------------------------------------------------------------------ */
/*  FilterBarActiveChips                                               */
/* ------------------------------------------------------------------ */

interface FilterBarActiveChipsProps {
  /** Filter configs used to resolve option labels. If omitted, raw values are displayed. */
  filters?: FilterConfig[]
  className?: string
}

function FilterBarActiveChips({ filters, className }: FilterBarActiveChipsProps) {
  const { value, onChange } = useFilterBar()

  const getActiveChips = () => {
    const chips: {
      key: string
      filterLabel: string
      optionLabel: string
      optionValue?: string
      isMulti: boolean
    }[] = []

    for (const [key, v] of Object.entries(value)) {
      if (v === undefined || v === "") continue

      if (filters) {
        const filter = filters.find((f) => f.key === key)
        if (!filter) {
          // No matching config — render raw
          if (typeof v === "string") {
            chips.push({ key, filterLabel: key, optionLabel: v, isMulti: false })
          } else if (Array.isArray(v)) {
            for (const val of v) {
              chips.push({ key, filterLabel: key, optionLabel: val, optionValue: val, isMulti: true })
            }
          }
          continue
        }

        if (filter.type === "select" && typeof v === "string") {
          const option = filter.options?.find((o) => o.value === v)
          chips.push({
            key,
            filterLabel: filter.label,
            optionLabel: option?.label ?? v,
            isMulti: false,
          })
        } else if (filter.type === "multi-select" && Array.isArray(v)) {
          for (const val of v) {
            const option = filter.options?.find((o) => o.value === val)
            chips.push({
              key,
              filterLabel: filter.label,
              optionLabel: option?.label ?? val,
              optionValue: val,
              isMulti: true,
            })
          }
        }
      } else {
        // No configs — render raw values
        if (typeof v === "string") {
          chips.push({ key, filterLabel: key, optionLabel: v, isMulti: false })
        } else if (Array.isArray(v)) {
          for (const val of v) {
            chips.push({ key, filterLabel: key, optionLabel: val, optionValue: val, isMulti: true })
          }
        }
      }
    }

    return chips
  }

  const handleRemoveFilter = (key: string, optionValue?: string) => {
    if (optionValue !== undefined) {
      const current = (value[key] as string[] | undefined) ?? []
      const next = current.filter((v) => v !== optionValue)
      onChange({ ...value, [key]: next.length > 0 ? next : undefined })
    } else {
      onChange({ ...value, [key]: undefined })
    }
  }

  const activeChips = getActiveChips()

  if (activeChips.length === 0) return null

  return (
    <>
      {activeChips.map((chip) => (
        <Badge
          key={`${chip.key}-${chip.optionValue ?? "single"}`}
          variant="secondary"
          className={cn("gap-1 pr-1", className)}
          data-slot="filter-bar-chip"
        >
          <span className="text-muted-foreground text-xs">{chip.filterLabel}:</span>
          {chip.optionLabel}
          <button
            type="button"
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
            onClick={() => handleRemoveFilter(chip.key, chip.optionValue)}
            aria-label={`${chip.filterLabel}: ${chip.optionLabel} を削除`}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
    </>
  )
}
FilterBarActiveChips.displayName = "FilterBarActiveChips"

/* ------------------------------------------------------------------ */
/*  FilterBarClearButton                                               */
/* ------------------------------------------------------------------ */

interface FilterBarClearButtonProps {
  /** Override button label. Defaults to "クリア". */
  label?: string
  className?: string
}

function FilterBarClearButton({
  label = "クリア",
  className,
}: FilterBarClearButtonProps) {
  const { value, onClear } = useFilterBar()
  const hasActiveFilters = Object.values(value).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "",
  )
  if (!hasActiveFilters || !onClear) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 px-2 text-xs", className)}
      onClick={onClear}
      aria-label="すべてのフィルターをクリア"
      data-slot="filter-bar-clear-button"
    >
      {label}
    </Button>
  )
}
FilterBarClearButton.displayName = "FilterBarClearButton"

/* ------------------------------------------------------------------ */
/*  FilterBarPreset — pre-assembled compound pattern                   */
/* ------------------------------------------------------------------ */

interface FilterBarPresetProps {
  filters: FilterConfig[]
  value: FilterValues
  onChange: (values: FilterValues) => void
  onClear?: () => void
  className?: string
}

function FilterBarPreset({
  filters,
  value,
  onChange,
  onClear,
  className,
}: FilterBarPresetProps) {
  return (
    <FilterBar value={value} onChange={onChange} onClear={onClear} className={className}>
      {filters.map((filter) => {
        if (filter.type === "select") {
          return (
            <FilterBarSelect
              key={filter.key}
              filterKey={filter.key}
              label={filter.label}
              placeholder={filter.placeholder}
              options={filter.options ?? []}
            />
          )
        }
        if (filter.type === "multi-select") {
          return (
            <FilterBarMultiSelect
              key={filter.key}
              filterKey={filter.key}
              label={filter.label}
              placeholder={filter.placeholder}
              options={filter.options ?? []}
            />
          )
        }
        return null
      })}
      <FilterBarActiveChips filters={filters} />
      {onClear && <FilterBarClearButton />}
    </FilterBar>
  )
}
FilterBarPreset.displayName = "FilterBarPreset"

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export {
  FilterBar,
  FilterBarSelect,
  FilterBarMultiSelect,
  FilterBarActiveChips,
  FilterBarClearButton,
  FilterBarPreset,
  filterBarVariants,
}
export type {
  FilterBarProps,
  FilterBarSelectProps,
  FilterBarMultiSelectProps,
  FilterBarActiveChipsProps,
  FilterBarClearButtonProps,
  FilterBarPresetProps,
}
