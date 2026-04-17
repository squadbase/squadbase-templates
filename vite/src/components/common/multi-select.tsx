"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, LoaderIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  type SelectOption,
  type SelectOptions,
  isGroupedOptions,
  flattenOptions,
} from "./select-types"

export interface MultiSelectProps {
  options: SelectOptions
  value: string[]
  onChange?: (value: string[]) => void
  onSearch?: (query: string) => void
  maxCount?: number
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(function MultiSelect({
  options,
  value,
  onChange,
  onSearch,
  maxCount = 3,
  placeholder = "選択してください",
  searchPlaceholder = "検索...",
  emptyText = "見つかりませんでした",
  isLoading = false,
  disabled = false,
  className,
}, ref) {
  const [open, setOpen] = React.useState(false)
  const listId = React.useId()

  const allOptions = React.useMemo(() => flattenOptions(options), [options])
  const selectedOptions = React.useMemo(
    () => allOptions.filter((opt) => value.includes(opt.value)),
    [allOptions, value]
  )

  function handleSelect(selectedValue: string) {
    if (value.includes(selectedValue)) {
      onChange?.(value.filter((v) => v !== selectedValue))
    } else {
      onChange?.([...value, selectedValue])
    }
  }

  function handleRemove(e: React.MouseEvent, removedValue: string) {
    e.stopPropagation()
    onChange?.(value.filter((v) => v !== removedValue))
  }

  function renderOptions(items: SelectOption[]) {
    return items.map((option) => (
      <CommandItem
        key={option.value}
        value={option.value}
        keywords={[option.label]}
        disabled={option.disabled}
        onSelect={handleSelect}
      >
        {option.icon && <option.icon className="size-4 shrink-0" />}
        <span className="flex-1 truncate">
          {option.label}
          {option.description && (
            <span className="ml-2 text-xs text-muted-foreground">
              {option.description}
            </span>
          )}
        </span>
        <CheckIcon
          className={cn(
            "size-4 shrink-0",
            value.includes(option.value) ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    ))
  }

  const visibleBadges = selectedOptions.slice(0, maxCount)
  const overflowCount = selectedOptions.length - maxCount

  return (
    <div ref={ref} data-slot="multi-select">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          className={cn(
            "inline-flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-1.5 text-sm shadow-xs outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            className
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {visibleBadges.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="shrink-0 gap-1 pr-1"
                  >
                    <span className="max-w-[120px] truncate">
                      {option.label}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`${option.label}を削除`}
                      className="rounded-sm opacity-50 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      onClick={(e) => handleRemove(e, option.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleRemove(
                            e as unknown as React.MouseEvent,
                            option.value
                          )
                        }
                      }}
                    >
                      <XIcon className="size-3" />
                    </span>
                  </Badge>
                ))}
                {overflowCount > 0 && (
                  <Badge variant="secondary" className="shrink-0">
                    +{overflowCount}件
                  </Badge>
                )}
              </>
            )}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={!onSearch}>
          <CommandInput
            placeholder={searchPlaceholder}
            onValueChange={onSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {isGroupedOptions(options)
                  ? options.map((group) => (
                      <CommandGroup key={group.label} heading={group.label}>
                        {renderOptions(group.options)}
                      </CommandGroup>
                    ))
                  : renderOptions(options)}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </div>
  )
})

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
