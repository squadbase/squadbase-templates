"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  defineThemeVariant,
  useResolvedTheme,
} from "../common/squadbase-theme"

export interface FunnelStep {
  /** ステップのラベル（例: "ページビュー"） */
  label: string
  /** このステップの数値 */
  value: number
  /** Tailwind bg カラークラス（例: "bg-chart-1"）。未指定時は自動割り当て */
  color?: string
  /** クリック時のハンドラ */
  onClick?: () => void
}

const DEFAULT_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
] as const

const funnelStepsVariants = cva("flex w-full", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    theme: defineThemeVariant({
      default: "",
      shibuya: "",
    }),
  },
  compoundVariants: [
    { direction: "vertical", size: "sm", className: "gap-1" },
    { direction: "vertical", size: "md", className: "gap-1.5" },
    { direction: "vertical", size: "lg", className: "gap-2" },
    { direction: "horizontal", size: "sm", className: "gap-2" },
    { direction: "horizontal", size: "md", className: "gap-3" },
    { direction: "horizontal", size: "lg", className: "gap-4" },
  ],
  defaultVariants: {
    size: "md",
    direction: "vertical",
  },
})

const funnelBarVariants = cva("rounded-sm transition-[width] ease-out", {
  variants: {
    size: {
      sm: "h-6",
      md: "h-8",
      lg: "h-10",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

const funnelBarContainerHorizontalVariants = cva(
  "relative w-full overflow-hidden rounded-sm bg-muted flex items-end",
  {
    variants: {
      size: {
        sm: "h-20",
        md: "h-28",
        lg: "h-36",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const funnelLabelVariants = cva(
  "flex w-full items-center justify-between text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-sm",
      },
      theme: defineThemeVariant({
        default: "",
        shibuya: "",
      }),
    },
    defaultVariants: {
      size: "md",
    },
    compoundVariants: [
      { theme: "shibuya", className: "[&_[data-slot=funnel-value]]:font-mono" },
    ],
  }
)

const funnelConversionVariants = cva(
  "flex items-center text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-[10px]",
        md: "text-xs",
        lg: "text-xs",
      },
      direction: {
        vertical: "justify-end",
        horizontal: "shrink-0 justify-center self-center",
      },
    },
    compoundVariants: [
      { direction: "vertical", size: "sm", className: "py-0" },
      { direction: "vertical", size: "md", className: "py-0.5" },
      { direction: "vertical", size: "lg", className: "py-0.5" },
    ],
    defaultVariants: {
      size: "md",
      direction: "vertical",
    },
  }
)

export interface FunnelStepsProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof funnelStepsVariants> {
  /** ファネルステップの配列（先頭が最大幅） */
  data: FunnelStep[]
  /** ステップ間のコンバージョン率を表示する */
  showConversion?: boolean
  /** 値の表示フォーマット関数 */
  formatValue?: (value: number) => string
  /** マウント時のエントリアニメーションを有効にする */
  animate?: boolean
}

function defaultFormatValue(value: number): string {
  return value.toLocaleString()
}

function computeConversionRate(current: number, previous: number): string {
  if (previous === 0) return "--"
  return `${((current / previous) * 100).toFixed(1)}%`
}

const FunnelSteps = React.forwardRef<HTMLDivElement, FunnelStepsProps>(
  function FunnelSteps(
    {
      data,
      showConversion = false,
      formatValue = defaultFormatValue,
      animate = false,
      size = "md",
      direction = "vertical",
      className,
      ...props
    },
    ref
  ) {
    const theme = useResolvedTheme()
    const [mounted, setMounted] = useState(false)
    const isHorizontal = direction === "horizontal"

    useEffect(() => {
      if (animate) setMounted(true)
    }, [animate])

    const maxValue = data.length > 0 ? data[0].value : 0

    return (
      <div
        ref={ref}
        data-slot="funnel-steps"
        role="list"
        aria-label="ファネル"
        className={cn(
          funnelStepsVariants({ size, direction, theme }),
          className
        )}
        {...props}
      >
        {data.map((step, index) => {
          const percentage =
            maxValue > 0 ? (step.value / maxValue) * 100 : 0
          const barSize =
            step.value > 0 && percentage < 2 ? 2 : percentage
          const color =
            step.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
          const isClickable = !!step.onClick

          const barInteractionProps = isClickable
            ? {
                role: "button" as const,
                tabIndex: 0,
                onClick: step.onClick,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    step.onClick?.()
                  }
                },
              }
            : {}

          const barInteractionClasses = isClickable
            ? "cursor-pointer hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            : undefined

          return (
            <React.Fragment key={index}>
              {isHorizontal ? (
                <div
                  role="listitem"
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                  aria-label={`${step.label}: ${formatValue(step.value)}`}
                >
                  <span
                    data-slot="funnel-value"
                    className={cn(
                      "tabular-nums text-muted-foreground",
                      size === "sm" ? "text-xs" : "text-sm",
                      theme === "shibuya" && "font-mono"
                    )}
                  >
                    {formatValue(step.value)}
                  </span>
                  <div
                    className={funnelBarContainerHorizontalVariants({ size })}
                  >
                    <div
                      {...barInteractionProps}
                      className={cn(
                        "w-full rounded-sm transition-[height] ease-out",
                        color,
                        barInteractionClasses
                      )}
                      style={{
                        height: animate
                          ? mounted
                            ? `${barSize}%`
                            : "0%"
                          : `${barSize}%`,
                        transitionDuration: "0.5s",
                        transitionDelay: animate
                          ? `${index * 0.08}s`
                          : undefined,
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "w-full truncate text-center text-muted-foreground",
                      size === "sm" ? "text-[10px]" : "text-xs"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ) : (
                <div
                  role="listitem"
                  aria-label={`${step.label}: ${formatValue(step.value)}`}
                >
                  <div className={funnelLabelVariants({ size, theme })}>
                    <span className="truncate">{step.label}</span>
                    <span data-slot="funnel-value" className="tabular-nums">
                      {formatValue(step.value)}
                    </span>
                  </div>
                  <div className="relative w-full overflow-hidden rounded-sm bg-muted">
                    <div
                      {...barInteractionProps}
                      className={cn(
                        funnelBarVariants({ size }),
                        color,
                        barInteractionClasses
                      )}
                      style={{
                        width: animate
                          ? mounted
                            ? `${barSize}%`
                            : "0%"
                          : `${barSize}%`,
                        transitionDuration: "0.5s",
                        transitionDelay: animate
                          ? `${index * 0.08}s`
                          : undefined,
                      }}
                    />
                  </div>
                </div>
              )}
              {showConversion && index < data.length - 1 && (
                <div
                  className={funnelConversionVariants({ size, direction })}
                  aria-hidden="true"
                >
                  <span>
                    →{" "}
                    {computeConversionRate(
                      data[index + 1].value,
                      step.value
                    )}
                  </span>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)

FunnelSteps.displayName = "FunnelSteps"

export { FunnelSteps, funnelStepsVariants }
