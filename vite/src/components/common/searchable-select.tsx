import * as React from "react"
import { CheckIcon, ChevronDownIcon, LoaderIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

export interface SearchableSelectProps {
  options: SelectOptions
  value?: string
  onChange?: (value: string | undefined) => void
  onSearch?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  isLoading?: boolean
  disabled?: boolean
  clearable?: boolean
  className?: string
}

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "選択してください",
  searchPlaceholder = "検索...",
  emptyText = "見つかりませんでした",
  isLoading = false,
  disabled = false,
  clearable = true,
  className,
}, ref) {
  const [open, setOpen] = React.useState(false)

  const allOptions = React.useMemo(() => flattenOptions(options), [options])
  const selectedOption = React.useMemo(
    () => allOptions.find((opt) => opt.value === value),
    [allOptions, value]
  )

  function handleSelect(selectedValue: string) {
    onChange?.(selectedValue === value ? undefined : selectedValue)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(undefined)
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
            value === option.value ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    ))
  }

  return (
    <div ref={ref} data-slot="searchable-select">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && value && (
              <span
                role="button"
                tabIndex={0}
                aria-label="クリア"
                className="rounded-sm opacity-50 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as unknown as React.MouseEvent)
                  }
                }}
              >
                <XIcon className="size-3.5" />
              </span>
            )}
            <ChevronDownIcon className="size-4 opacity-50" />
          </span>
        </Button>
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

SearchableSelect.displayName = "SearchableSelect"

export { SearchableSelect }
