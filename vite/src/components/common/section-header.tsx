import * as React from "react"

import { cn } from "@/lib/utils"

const headingStyles = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
} as const

export interface SectionHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "h4"
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, description, actions, className, as: Comp = "h2" }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="section-header"
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start",
          className
        )}
      >
        <div>
          <Comp className={headingStyles[Comp]}>{title}</Comp>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

export { SectionHeader }
