"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  defineThemeVariant,
  useResolvedTheme,
} from "../common/squadbase-theme";

export type TrackerStatus = "success" | "warning" | "error" | "muted";

export interface TrackerItem {
  id?: string;
  tooltip: string;
  /** ステータスに基づくテーマ連動カラー */
  status?: TrackerStatus;
  /** カスタムカラーのフォールバック（CSS 色値）。status が優先される */
  color?: string;
}

export interface TrackerProps {
  data: TrackerItem[];
  hoverEffect?: boolean;
  className?: string;
}

const trackerBarVariants = cva("h-8 flex-1 rounded-sm", {
  variants: {
    theme: defineThemeVariant({
      default: "",
      shibuya: "",
    }),
    status: {
      success: "",
      warning: "",
      error: "",
      muted: "",
    },
  },
  compoundVariants: [
    { theme: "default", status: "success", className: "bg-green-500" },
    { theme: "default", status: "warning", className: "bg-yellow-500" },
    { theme: "default", status: "error", className: "bg-red-500" },
    { theme: "default", status: "muted", className: "bg-muted-foreground/30" },
    {
      theme: "shibuya",
      status: "success",
      className: "bg-emerald-600 dark:bg-emerald-500",
    },
    {
      theme: "shibuya",
      status: "warning",
      className: "bg-yellow-600 dark:bg-amber-300",
    },
    { theme: "shibuya", status: "error", className: "bg-red-600" },
    { theme: "shibuya", status: "muted", className: "bg-muted-foreground/20" },
  ],
  defaultVariants: {
    theme: "default",
    status: "muted",
  },
});

export const Tracker = React.forwardRef<HTMLDivElement, TrackerProps>(
  function Tracker({ data, hoverEffect = true, className }, ref) {
    const theme = useResolvedTheme();

    return (
      <TooltipProvider>
        <div
          ref={ref}
          data-slot="tracker"
          className={cn("flex w-full items-center gap-px", className)}
          role="list"
          aria-label="ステータス履歴"
        >
          {data.map((item, index) => (
            <Tooltip key={item.id ?? index}>
              <TooltipTrigger asChild>
                <div
                  role="listitem"
                  tabIndex={0}
                  aria-label={item.tooltip}
                  className={cn(
                    item.status
                      ? trackerBarVariants({ theme, status: item.status })
                      : "h-8 flex-1 rounded-sm",
                    hoverEffect &&
                      "hover:scale-y-150 transition-transform duration-300",
                  )}
                  style={
                    item.status ? undefined : { backgroundColor: item.color }
                  }
                />
              </TooltipTrigger>
              <TooltipContent>{item.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  },
);

Tracker.displayName = "Tracker";
