"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  placeholder?: string
  disabled?: boolean
  name?: string
  width?: string
  className?: string
  onSelect?: (range: DateRange | undefined) => void
}

function DateRangePicker({
  value,
  placeholder = "Pick a date range",
  disabled = false,
  name,
  width = "300px",
  className,
  onSelect,
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>()
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback((selected: DateRange | undefined) => {
    setRange(selected)
    if (selected?.to) {
      setOpen(false)
      onSelect?.(selected)
    }
    // from のみ選択中: 内部 range state だけ更新 → 再描画なし → Popover 維持
  }, [onSelect])

  const displayRange = value ?? range

  const displayText = React.useMemo(() => {
    if (!displayRange?.from) return null
    if (!displayRange.to) return format(displayRange.from, "PPP")
    return `${format(displayRange.from, "PPP")} – ${format(displayRange.to, "PPP")}`
  }, [displayRange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !displayRange?.from && "text-muted-foreground",
            className
          )}
          style={{ width: width || "300px" }}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayText ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={displayRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
      {name && displayRange?.from && (
        <input
          type="hidden"
          name={name}
          value={JSON.stringify({
            from: displayRange.from.toISOString(),
            to: displayRange.to?.toISOString(),
          })}
        />
      )}
    </Popover>
  )
}

export { DateRangePicker }
