"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  placeholder?: string
  disabled?: boolean
  name?: string
  width?: string
  className?: string
  onSelect?: (date: Date | undefined) => void
}

function DatePicker({
  value,
  placeholder = "Pick a date",
  disabled = false,
  name,
  width = "240px",
  className,
  onSelect,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback((selected: Date | undefined) => {
    setDate(selected)
    setOpen(false)
    onSelect?.(selected)
  }, [onSelect])

  const displayDate = value ?? date

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !displayDate && "text-muted-foreground",
            className
          )}
          style={{ width: width || "240px" }}
        >
          <CalendarIcon className="mr-2 size-4" />
          {displayDate ? format(displayDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
      {name && displayDate && (
        <input type="hidden" name={name} value={displayDate.toISOString()} />
      )}
    </Popover>
  )
}

export { DatePicker }
