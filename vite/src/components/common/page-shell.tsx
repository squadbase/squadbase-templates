import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { defineThemeVariant, useResolvedTheme } from "./squadbase-theme";

const PageShell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell"
    className={cn("flex flex-col", className)}
    {...props}
  />
));
PageShell.displayName = "PageShell";

const pageShellHeaderVariants = cva(
  "grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-6",
  {
    variants: {
      theme: defineThemeVariant({
        default: "px-6 py-12 border-b",
        shibuya: "px-6 pt-6",
      }),
    },
    defaultVariants: {
      theme: "default",
    },
  },
);
const PageShellHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const theme = useResolvedTheme();
  return (
    <div
      ref={ref}
      data-slot="page-shell-header"
      className={cn(pageShellHeaderVariants({ theme }), className)}
      {...props}
    />
  );
});
PageShellHeader.displayName = "PageShellHeader";

const PageShellHeading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-heading"
    className={cn("min-w-0", className)}
    {...props}
  />
));
PageShellHeading.displayName = "PageShellHeading";

const PageShellTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    data-slot="page-shell-title"
    className={cn(
      "text-2xl font-bold tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
PageShellTitle.displayName = "PageShellTitle";

const PageShellDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="page-shell-description"
    className={cn("mt-1 text-sm text-muted-foreground", className)}
    {...props}
  />
));
PageShellDescription.displayName = "PageShellDescription";

const PageShellHeaderEnd = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-header-end"
    className={cn("flex shrink-0 flex-col items-end gap-2", className)}
    {...props}
  />
));
PageShellHeaderEnd.displayName = "PageShellHeaderEnd";

const PageShellMeta = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-meta"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PageShellMeta.displayName = "PageShellMeta";

const PageShellActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-actions"
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
));
PageShellActions.displayName = "PageShellActions";

const PageShellSummary = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-summary"
    className={cn(
      "col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
      className,
    )}
    {...props}
  />
));
PageShellSummary.displayName = "PageShellSummary";

const pageShellSummaryCardVariants = cva(
  "relative flex items-start gap-3 rounded-lg border px-4 py-3 text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:mt-0.5",
  {
    variants: {
      theme: defineThemeVariant({
        default: "bg-background",
        shibuya: "shadow-none",
      }),
      accent: {
        default: "text-card-foreground",
        accent:
          "border-[var(--chart-1)] bg-white bg-linear-to-r from-[var(--chart-1)]/5 to-[var(--chart-1)]/5 [&>svg]:text-[var(--chart-1)]",
        amber:
          "border-amber-500 bg-amber-50 [&>svg]:text-amber-600 dark:border-amber-800 dark:[&>svg]:text-amber-400",
        blue: "border-blue-500 bg-blue-50 [&>svg]:text-blue-600 dark:border-blue-800 dark:[&>svg]:text-blue-400",
        emerald:
          "border-emerald-500 bg-emerald-50 [&>svg]:text-emerald-600 dark:border-emerald-800 dark:[&>svg]:text-emerald-400",
        red: "border-red-500 bg-red-50 [&>svg]:text-red-600 dark:border-red-800 dark:[&>svg]:text-red-400",
        violet:
          "border-violet-500 bg-violet-50 [&>svg]:text-violet-600 dark:border-violet-800 dark:[&>svg]:text-violet-400",
        orange:
          "border-orange-500 bg-orange-50 [&>svg]:text-orange-600 dark:border-orange-800 dark:[&>svg]:text-orange-400",
        cyan: "border-cyan-500 bg-cyan-50 [&>svg]:text-cyan-600 dark:border-cyan-800 dark:[&>svg]:text-cyan-400",
        slate:
          "border-slate-500 bg-slate-50 [&>svg]:text-slate-600 dark:border-slate-800 dark:[&>svg]:text-slate-400",
      },
    },
    compoundVariants: [
      { theme: "shibuya", accent: "default", className: "bg-card" },
      {
        theme: "shibuya",
        accent: "accent",
        className: "border-[var(--chart-1)]/40 bg-[var(--chart-1)]/5",
      },
      {
        theme: "shibuya",
        accent: "amber",
        className: "border-amber-300 bg-amber-50 dark:bg-amber-950/50",
      },
      {
        theme: "shibuya",
        accent: "blue",
        className: "border-blue-300 bg-blue-50 dark:bg-blue-950/50",
      },
      {
        theme: "shibuya",
        accent: "emerald",
        className: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50",
      },
      {
        theme: "shibuya",
        accent: "red",
        className: "border-red-300 bg-red-50 dark:bg-red-950/50",
      },
      {
        theme: "shibuya",
        accent: "violet",
        className: "border-violet-300 bg-violet-50 dark:bg-violet-950/50",
      },
      {
        theme: "shibuya",
        accent: "orange",
        className: "border-orange-300 bg-orange-50 dark:bg-orange-950/50",
      },
      {
        theme: "shibuya",
        accent: "cyan",
        className: "border-cyan-300 bg-cyan-50 dark:bg-cyan-950/50",
      },
      {
        theme: "shibuya",
        accent: "slate",
        className: "border-slate-300 bg-slate-50 dark:bg-slate-950/50",
      },
    ],
    defaultVariants: {
      theme: "default",
      accent: "default",
    },
  },
);

const PageShellSummaryCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof pageShellSummaryCardVariants>
>(({ className, accent, ...props }, ref) => {
  const theme = useResolvedTheme();
  return (
    <div
      ref={ref}
      data-slot="page-shell-summary-card"
      className={cn(pageShellSummaryCardVariants({ theme, accent }), className)}
      {...props}
    />
  );
});
PageShellSummaryCard.displayName = "PageShellSummaryCard";

const PageShellContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-content"
    className={cn("flex-1 p-6 bg-page-content", className)}
    {...props}
  />
));
PageShellContent.displayName = "PageShellContent";

export {
  PageShell,
  PageShellHeader,
  PageShellHeading,
  PageShellTitle,
  PageShellDescription,
  PageShellHeaderEnd,
  PageShellMeta,
  PageShellActions,
  PageShellSummary,
  PageShellSummaryCard,
  pageShellSummaryCardVariants,
  PageShellContent,
};
