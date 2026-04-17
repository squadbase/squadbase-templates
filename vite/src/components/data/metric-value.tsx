import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  defineThemeVariant,
  useResolvedTheme,
} from "../common/squadbase-theme";

const metricValueVariants = cva("font-medium tracking-tight", {
  variants: {
    size: {
      sm: "text-base",
      md: "text-2xl",
      lg: "text-3xl",
      xl: "text-4xl",
    },
    theme: defineThemeVariant({
      default: "",
      shibuya: "font-mono",
    }),
  },
  defaultVariants: {
    size: "md",
  },
});

const MetricValue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof metricValueVariants>
>(({ className, size, ...props }, ref) => {
  const theme = useResolvedTheme();
  return (
    <div
      ref={ref}
      data-slot="metric-value"
      className={cn("my-4", metricValueVariants({ size, theme }), className)}
      {...props}
    />
  );
});
MetricValue.displayName = "MetricValue";

const MetricUnit = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="metric-unit"
    className={cn("text-sm font-normal text-muted-foreground", className)}
    {...props}
  />
));
MetricUnit.displayName = "MetricUnit";

export { MetricValue, MetricUnit, metricValueVariants };
