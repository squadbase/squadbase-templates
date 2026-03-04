"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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

interface MultiSelectOption {
  label: string
  value: string
}

interface MultiSelectProps {
  placeholder?: string
  options?: MultiSelectOption[]
  disabled?: boolean
  name?: string
  width?: string
  className?: string
}

function MultiSelect({
  placeholder = "Select...",
  options = [],
  disabled = false,
  name,
  width = "300px",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>([])

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const remove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected((prev) => prev.filter((v) => v !== value))
  }

  const selectedLabels = selected.map(
    (v) => options.find((o) => o.value === v)?.label ?? v
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-auto min-h-9 justify-between font-normal",
            selected.length === 0 && "text-muted-foreground",
            className
          )}
          style={{ width: width || "300px" }}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span>{placeholder}</span>
            ) : (
              selected.map((v, i) => (
                <Badge key={v} variant="secondary" className="gap-1 pr-1">
                  {selectedLabels[i]}
                  <span
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-full opacity-60 hover:opacity-100"
                    onClick={(e) => remove(v, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelected((prev) => prev.filter((sv) => sv !== v))
                      }
                    }}
                  >
                    <XIcon className="size-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: width || "300px" }}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggle(option.value)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {name && (
        <input type="hidden" name={name} value={selected.join(",")} />
      )}
    </Popover>
  )
}

export { MultiSelect }
