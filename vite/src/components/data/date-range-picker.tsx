"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns"
import { ja } from "date-fns/locale"
import type { DateRange as RdpDateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { DateRange, PresetItem } from "@/types/date"

export const defaultPresets: PresetItem[] = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date()
      return { from: startOfDay(today), to: endOfDay(today) }
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = subDays(new Date(), 1)
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
    },
  },
  {
    label: "Last 7 days",
    getValue: () => {
      const today = new Date()
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) }
    },
  },
  {
    label: "Last 14 days",
    getValue: () => {
      const today = new Date()
      return { from: startOfDay(subDays(today, 13)), to: endOfDay(today) }
    },
  },
  {
    label: "Last 30 days",
    getValue: () => {
      const today = new Date()
      return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) }
    },
  },
  {
    label: "Last 90 days",
    getValue: () => {
      const today = new Date()
      return { from: startOfDay(subDays(today, 89)), to: endOfDay(today) }
    },
  },
  {
    label: "This month",
    getValue: () => {
      const today = new Date()
      return { from: startOfMonth(today), to: endOfDay(today) }
    },
  },
  {
    label: "Last month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    },
  },
]

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  presets?: PresetItem[]
  showPresets?: boolean
  maxDate?: Date
  minDate?: Date
  placeholder?: string
  disabled?: boolean
  className?: string
  align?: "start" | "center" | "end"
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      onChange,
      presets = defaultPresets,
      showPresets = true,
      maxDate,
      minDate,
      placeholder = "Select date range",
      disabled = false,
      className,
      align = "start",
    },
    ref
  ) {
    const [open, setOpen] = React.useState(false)
    const isMobile = useIsMobile()

    const handleCalendarSelect = React.useCallback(
      (range: RdpDateRange | undefined) => {
        onChange?.({ from: range?.from, to: range?.to })
      },
      [onChange]
    )

    const handlePresetClick = React.useCallback(
      (preset: PresetItem) => {
        const range = preset.getValue()
        onChange?.(range)
        setOpen(false)
      },
      [onChange]
    )

    const formatDateRange = () => {
      if (!value?.from) return placeholder
      if (!value.to) return format(value.from, "yyyy/MM/dd", { locale: ja })
      return `${format(value.from, "yyyy/MM/dd", { locale: ja })} - ${format(value.to, "yyyy/MM/dd", { locale: ja })}`
    }

    const calendarSelected: RdpDateRange | undefined =
      value?.from ? { from: value.from, to: value.to ?? undefined } : undefined

    return (
      <div ref={ref} data-slot="date-range-picker">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              aria-label={formatDateRange()}
              aria-expanded={open}
              className={cn(
                "w-auto justify-start text-left font-normal",
                !value?.from && "text-muted-foreground",
                className
              )}
            >
              <CalendarIcon className="size-4" aria-hidden="true" />
              <span>{formatDateRange()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align={align}
            className={cn(
              "p-0",
              isMobile ? "flex flex-col w-auto" : "flex w-auto"
            )}
          >
            {showPresets && (
              <div className={cn(
                "flex flex-col gap-1 p-3",
                isMobile ? "border-b" : "border-r"
              )}>
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}
            <div className="p-3">
              <Calendar
                mode="range"
                numberOfMonths={isMobile ? 1 : 2}
                selected={calendarSelected}
                onSelect={handleCalendarSelect}
                disabled={(date) => {
                  if (maxDate && date > maxDate) return true
                  if (minDate && date < minDate) return true
                  return false
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
export type { DateRangePickerProps }
