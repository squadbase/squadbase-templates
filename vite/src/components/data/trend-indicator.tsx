"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendDirection } from "@/types/metric";
import { cva } from "class-variance-authority";
import {
  defineThemeVariant,
  useResolvedTheme,
} from "../common/squadbase-theme";

interface TrendIndicatorProps {
  value: number;
  direction: TrendDirection;
  positiveIsGood?: boolean;
  className?: string;
}

const trendIndicatorVariants = cva(
  "inline-flex items-center gap-0.5 text-sm font-medium",
  {
    variants: {
      theme: defineThemeVariant({
        default: "",
        shibuya: "font-mono",
      }),
      sentiment: {
        positive: "",
        negative: "",
        neutral: "text-muted-foreground",
      },
    },
    compoundVariants: [
      { theme: "default", sentiment: "positive", className: "text-chart-1" },
      { theme: "default", sentiment: "negative", className: "text-primary" },
      {
        theme: "shibuya",
        sentiment: "positive",
        className: "text-emerald-600 dark:text-emerald-400",
      },
      {
        theme: "shibuya",
        sentiment: "negative",
        className: "text-red-600",
      },
    ],
    defaultVariants: {
      theme: "default",
      sentiment: "neutral",
    },
  },
);

const TrendIndicator = React.forwardRef<HTMLSpanElement, TrendIndicatorProps>(
  ({ value, direction, positiveIsGood = true, className }, ref) => {
    const theme = useResolvedTheme();

    const isGood =
      direction === "neutral" ? null : (direction === "up") === positiveIsGood;

    const sentiment =
      isGood === null ? "neutral" : isGood ? "positive" : "negative";

    const Icon =
      direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;

    const ariaLabel =
      direction === "neutral"
        ? `変化なし ${value}%`
        : direction === "up"
          ? `${value}% 増加`
          : `${value}% 減少`;

    return (
      <span
        ref={ref}
        data-slot="trend-indicator"
        className={cn(trendIndicatorVariants({ theme, sentiment }), className)}
        aria-label={ariaLabel}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{value}%</span>
      </span>
    );
  },
);
TrendIndicator.displayName = "TrendIndicator";

export { TrendIndicator };
