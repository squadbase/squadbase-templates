import * as React from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import "streamdown/styles.css"

import { cn } from "@/lib/utils"

export interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer({ content, className }, ref) {
    return (
      <div ref={ref} data-slot="markdown-renderer" className={cn("text-sm leading-relaxed", className)}>
        <Streamdown plugins={{ code }}>{content}</Streamdown>
      </div>
    )
  }
)

MarkdownRenderer.displayName = "MarkdownRenderer"
