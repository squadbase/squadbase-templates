import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { SegmentOption } from "@/types/filter"

const segmentedControlVariants = cva("", {
  variants: {
    size: {
      sm: "h-7 px-2 text-xs gap-1",
      default: "h-9 px-3 text-sm gap-1.5",
      lg: "h-11 px-4 text-base gap-2",
    },
  },
  defaultVariants: { size: "default" },
})

interface SegmentedControlProps extends VariantProps<typeof segmentedControlVariants> {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
  fullWidth?: boolean
  ariaLabel?: string
  className?: string
}

const SegmentedControl = React.forwardRef<
  React.ElementRef<typeof ToggleGroup>,
  SegmentedControlProps
>(function SegmentedControl(
  {
    options,
    value,
    onChange,
    size = "default",
    fullWidth = false,
    ariaLabel,
    className,
  },
  ref
) {
  return (
    <ToggleGroup
      ref={ref}
      data-slot="segmented-control"
      type="single"
      value={value}
      onValueChange={(v) => {
        // Prevent deselecting the current value
        if (v) onChange(v)
      }}
      variant="outline"
      aria-label={ariaLabel}
      className={cn(fullWidth && "w-full", className)}
    >
      {options.map((option) => {
        const Icon = option.icon
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-label={option.label}
            className={cn(
              segmentedControlVariants({ size }),
              fullWidth && "flex-1"
            )}
          >
            {Icon && <Icon className={cn(size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4")} aria-hidden="true" />}
            {option.label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
})
SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
export type { SegmentedControlProps }
