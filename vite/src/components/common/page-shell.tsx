import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { defineThemeVariant, useResolvedTheme } from "./squadbase-theme";

export interface PageShellProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="page-shell"
      className={cn("flex flex-col", className)}
      {...props}
    />
  ),
);
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
export interface PageShellHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellHeader = React.forwardRef<
  HTMLDivElement,
  PageShellHeaderProps
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

export interface PageShellHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellHeading = React.forwardRef<
  HTMLDivElement,
  PageShellHeadingProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-heading"
    className={cn("min-w-0", className)}
    {...props}
  />
));
PageShellHeading.displayName = "PageShellHeading";

export interface PageShellTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const PageShellTitle = React.forwardRef<
  HTMLHeadingElement,
  PageShellTitleProps
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

export interface PageShellDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const PageShellDescription = React.forwardRef<
  HTMLParagraphElement,
  PageShellDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="page-shell-description"
    className={cn("mt-1 text-sm text-muted-foreground", className)}
    {...props}
  />
));
PageShellDescription.displayName = "PageShellDescription";

export interface PageShellHeaderEndProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellHeaderEnd = React.forwardRef<
  HTMLDivElement,
  PageShellHeaderEndProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-header-end"
    className={cn("flex shrink-0 flex-col items-end gap-2", className)}
    {...props}
  />
));
PageShellHeaderEnd.displayName = "PageShellHeaderEnd";

export interface PageShellMetaProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellMeta = React.forwardRef<
  HTMLDivElement,
  PageShellMetaProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-meta"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PageShellMeta.displayName = "PageShellMeta";

export interface PageShellActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellActions = React.forwardRef<
  HTMLDivElement,
  PageShellActionsProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-actions"
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
));
PageShellActions.displayName = "PageShellActions";

export interface PageShellSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellSummary = React.forwardRef<
  HTMLDivElement,
  PageShellSummaryProps
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

export const pageShellSummaryCardVariants = cva(
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
          "border-[var(--chart-1)]/30 bg-white bg-linear-to-r from-[var(--chart-1)]/5 to-[var(--chart-1)]/5 [&>svg]:text-[var(--chart-1)]",
        amber:
          "border-amber-300 bg-amber-50 [&>svg]:text-amber-600 dark:border-amber-800 dark:[&>svg]:text-amber-400",
        blue: "border-blue-300 bg-blue-50 [&>svg]:text-blue-600 dark:border-blue-800 dark:[&>svg]:text-blue-400",
        emerald:
          "border-emerald-300 bg-emerald-50 [&>svg]:text-emerald-600 dark:border-emerald-800 dark:[&>svg]:text-emerald-400",
        red: "border-red-300 bg-red-50 [&>svg]:text-red-600 dark:border-red-800 dark:[&>svg]:text-red-400",
        violet:
          "border-violet-300 bg-violet-50 [&>svg]:text-violet-600 dark:border-violet-800 dark:[&>svg]:text-violet-400",
        orange:
          "border-orange-300 bg-orange-50 [&>svg]:text-orange-600 dark:border-orange-800 dark:[&>svg]:text-orange-400",
        cyan: "border-cyan-300 bg-cyan-50 [&>svg]:text-cyan-600 dark:border-cyan-800 dark:[&>svg]:text-cyan-400",
        slate:
          "border-slate-300 bg-slate-50 [&>svg]:text-slate-600 dark:border-slate-800 dark:[&>svg]:text-slate-400",
        gray: "border-gray-300 bg-gray-50 [&>svg]:text-gray-600 dark:border-gray-800 dark:[&>svg]:text-gray-400",
        zinc: "border-zinc-300 bg-zinc-50 [&>svg]:text-zinc-600 dark:border-zinc-800 dark:[&>svg]:text-zinc-400",
        neutral:
          "border-neutral-300 bg-neutral-50 [&>svg]:text-neutral-600 dark:border-neutral-800 dark:[&>svg]:text-neutral-400",
        stone:
          "border-stone-300 bg-stone-50 [&>svg]:text-stone-600 dark:border-stone-800 dark:[&>svg]:text-stone-400",
        yellow:
          "border-yellow-300 bg-yellow-50 [&>svg]:text-yellow-600 dark:border-yellow-800 dark:[&>svg]:text-yellow-400",
        lime: "border-lime-300 bg-lime-50 [&>svg]:text-lime-600 dark:border-lime-800 dark:[&>svg]:text-lime-400",
        green:
          "border-green-300 bg-green-50 [&>svg]:text-green-600 dark:border-green-800 dark:[&>svg]:text-green-400",
        teal: "border-teal-300 bg-teal-50 [&>svg]:text-teal-600 dark:border-teal-800 dark:[&>svg]:text-teal-400",
        sky: "border-sky-300 bg-sky-50 [&>svg]:text-sky-600 dark:border-sky-800 dark:[&>svg]:text-sky-400",
        indigo:
          "border-indigo-300 bg-indigo-50 [&>svg]:text-indigo-600 dark:border-indigo-800 dark:[&>svg]:text-indigo-400",
        purple:
          "border-purple-300 bg-purple-50 [&>svg]:text-purple-600 dark:border-purple-800 dark:[&>svg]:text-purple-400",
        fuchsia:
          "border-fuchsia-300 bg-fuchsia-50 [&>svg]:text-fuchsia-600 dark:border-fuchsia-800 dark:[&>svg]:text-fuchsia-400",
        pink: "border-pink-300 bg-pink-50 [&>svg]:text-pink-600 dark:border-pink-800 dark:[&>svg]:text-pink-400",
        rose: "border-rose-300 bg-rose-50 [&>svg]:text-rose-600 dark:border-rose-800 dark:[&>svg]:text-rose-400",
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
      {
        theme: "shibuya",
        accent: "gray",
        className: "border-gray-300 bg-gray-50 dark:bg-gray-950/50",
      },
      {
        theme: "shibuya",
        accent: "zinc",
        className: "border-zinc-300 bg-zinc-50 dark:bg-zinc-950/50",
      },
      {
        theme: "shibuya",
        accent: "neutral",
        className: "border-neutral-300 bg-neutral-50 dark:bg-neutral-950/50",
      },
      {
        theme: "shibuya",
        accent: "stone",
        className: "border-stone-300 bg-stone-50 dark:bg-stone-950/50",
      },
      {
        theme: "shibuya",
        accent: "yellow",
        className: "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/50",
      },
      {
        theme: "shibuya",
        accent: "lime",
        className: "border-lime-300 bg-lime-50 dark:bg-lime-950/50",
      },
      {
        theme: "shibuya",
        accent: "green",
        className: "border-green-300 bg-green-50 dark:bg-green-950/50",
      },
      {
        theme: "shibuya",
        accent: "teal",
        className: "border-teal-300 bg-teal-50 dark:bg-teal-950/50",
      },
      {
        theme: "shibuya",
        accent: "sky",
        className: "border-sky-300 bg-sky-50 dark:bg-sky-950/50",
      },
      {
        theme: "shibuya",
        accent: "indigo",
        className: "border-indigo-300 bg-indigo-50 dark:bg-indigo-950/50",
      },
      {
        theme: "shibuya",
        accent: "purple",
        className: "border-purple-300 bg-purple-50 dark:bg-purple-950/50",
      },
      {
        theme: "shibuya",
        accent: "fuchsia",
        className: "border-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-950/50",
      },
      {
        theme: "shibuya",
        accent: "pink",
        className: "border-pink-300 bg-pink-50 dark:bg-pink-950/50",
      },
      {
        theme: "shibuya",
        accent: "rose",
        className: "border-rose-300 bg-rose-50 dark:bg-rose-950/50",
      },
    ],
    defaultVariants: {
      theme: "default",
      accent: "default",
    },
  },
);

export interface PageShellSummaryCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageShellSummaryCardVariants> {}

export const PageShellSummaryCard = React.forwardRef<
  HTMLDivElement,
  PageShellSummaryCardProps
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

export interface PageShellContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const PageShellContent = React.forwardRef<
  HTMLDivElement,
  PageShellContentProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="page-shell-content"
    className={cn("flex-1 p-6 bg-page-content", className)}
    {...props}
  />
));
PageShellContent.displayName = "PageShellContent";
