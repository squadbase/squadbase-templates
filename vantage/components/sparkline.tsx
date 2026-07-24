import * as React from "react"
import { useEffect, useState } from "react"

import { cn } from "@squadbase/vantage/ui"

/**
 * Inline trend micro-chart. Deliberately not an `EChart` — a sparkline sits
 * inside table cells and KPI cards by the dozen, where a full ECharts instance
 * per cell would be wasteful. This renders a single stateless `<svg>`.
 */

export type SparklineVariant = "line" | "bar"

export interface SparklineDataPoint {
  value: number
  label?: string
}

export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  data: SparklineDataPoint[]
  variant?: SparklineVariant
  height?: number
  /** Tailwind text-colour class; drives both stroke and fill via `currentColor`. */
  color?: string
  area?: boolean
  animate?: boolean
  className?: string
}

const VB_WIDTH = 100

/** Map raw values onto SVG y-coordinates (inverted, padded). */
function normalizeData(values: number[], height: number, vPad = 2): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const drawHeight = height - vPad * 2
  if (range === 0) return values.map(() => vPad + drawHeight / 2)
  return values.map((v) => height - vPad - ((v - min) / range) * drawHeight)
}

function buildLinePath(ys: number[]): string {
  if (ys.length === 0) return ""
  const step = ys.length > 1 ? VB_WIDTH / (ys.length - 1) : 0
  return ys
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${y.toFixed(2)}`)
    .join(" ")
}

function buildAreaPath(ys: number[], height: number): string {
  if (ys.length === 0) return ""
  const step = ys.length > 1 ? VB_WIDTH / (ys.length - 1) : 0
  const lastX = ((ys.length - 1) * step).toFixed(2)
  return `${buildLinePath(ys)} L${lastX},${height} L0,${height} Z`
}

interface BarRect {
  x: number
  y: number
  w: number
  h: number
}

function buildBarRects(ys: number[], height: number, gap = 1): BarRect[] {
  const barW = Math.max(1, VB_WIDTH / ys.length - gap)
  return ys.map((y, i) => ({ x: i * (barW + gap), y, w: barW, h: height - y }))
}

export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(function Sparkline(
  {
    data,
    variant = "line",
    height = 40,
    color = "text-chart-1",
    area = false,
    animate = false,
    className,
    ...props
  },
  ref,
) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (animate) setMounted(true)
  }, [animate])

  if (data.length === 0) return null

  const ys = normalizeData(
    data.map((d) => d.value),
    height,
  )

  return (
    <svg
      ref={ref}
      data-slot="sparkline"
      viewBox={`0 0 ${VB_WIDTH} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden="true"
      className={cn("overflow-visible", className)}
      {...props}
    >
      {variant === "line" && (
        <>
          {area && (
            <path
              d={buildAreaPath(ys, height)}
              strokeWidth={0}
              className={cn("fill-current opacity-15", color)}
            />
          )}
          <path
            d={buildLinePath(ys)}
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={animate ? 1 : undefined}
            strokeDasharray={animate ? 1 : undefined}
            strokeDashoffset={animate ? (mounted ? 0 : 1) : undefined}
            className={cn("stroke-current", color)}
            style={animate ? { transition: "stroke-dashoffset 0.6s ease-in-out" } : undefined}
          />
        </>
      )}

      {variant === "bar" &&
        buildBarRects(ys, height).map((rect, i) => (
          <rect
            key={i}
            x={rect.x}
            y={animate ? (mounted ? rect.y : height) : rect.y}
            width={rect.w}
            height={animate ? (mounted ? rect.h : 0) : rect.h}
            rx={0.5}
            className={cn("fill-current", color)}
            style={
              animate
                ? {
                    transition: `height 0.4s ease-out ${i * 0.02}s, y 0.4s ease-out ${i * 0.02}s`,
                  }
                : undefined
            }
          />
        ))}
    </svg>
  )
})
