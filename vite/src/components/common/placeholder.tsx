import * as React from "react";

import { cn } from "@/lib/utils";

export interface PlaceholderProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Marks sample (not-yet-real) data on a template screen.
 *
 * Renders an inline `<span>`, so it is safe inside `<p>` headings/descriptions
 * (unlike `Skeleton`, which is a block `<div>`). The `animate-pulse` + muted
 * styling signals "this is placeholder data — swap in your real values".
 * Override size/weight via `className` (e.g. `text-2xl font-bold`).
 */
export const Placeholder = React.forwardRef<HTMLSpanElement, PlaceholderProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="placeholder"
      className={cn(
        "inline-block animate-pulse text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
Placeholder.displayName = "Placeholder";
