import * as React from "react"
import { useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressCircleVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "w-12 h-12",
        md: "w-[72px] h-[72px]",
        lg: "w-24 h-24",
      },
    },
    defaultVariants: { size: "md" },
  }
)

// SVG geometry values only — numeric, so they stay as a lookup
const svgConfig = {
  sm: { viewBox: 48, r: 18, strokeWidth: 6 },
  md: { viewBox: 72, r: 28, strokeWidth: 8 },
  lg: { viewBox: 96, r: 38, strokeWidth: 10 },
} as const

export interface ProgressCircleProps
  extends VariantProps<typeof progressCircleVariants> {
  value: number
  color?: string
  children?: React.ReactNode
  className?: string
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  function ProgressCircle(
    { value, size = "md", color = "text-chart-1", children, className },
    ref
  ) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    const clampedValue = Math.min(100, Math.max(0, value))
    const { viewBox, r, strokeWidth } = svgConfig[size ?? "md"]
    const center = viewBox / 2
    const circumference = 2 * Math.PI * r
    const offset = circumference - (clampedValue / 100) * circumference

    return (
      <div
        ref={ref}
        data-slot="progress-circle"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clampedValue}%`}
        className={cn(progressCircleVariants({ size }), className)}
      >
        <svg
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            className="text-muted stroke-current"
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? offset : circumference}
            className={cn("stroke-current", color)}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              transition: "stroke-dashoffset 0.6s ease-in-out",
            }}
          />
        </svg>
        {children && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    )
  }
)
ProgressCircle.displayName = "ProgressCircle"

export { ProgressCircle }
