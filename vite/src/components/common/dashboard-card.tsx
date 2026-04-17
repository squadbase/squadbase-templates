"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  defineThemeVariant,
  useResolvedTheme,
} from "@/components/common/squadbase-theme";

/* ------------------------------------------------------------------ */
/*  DashboardCard (Root)                                               */
/* ------------------------------------------------------------------ */

const dashboardCardVariants = cva(
  "group rounded-lg border bg-card text-card-foreground px-1 py-1",
  {
    variants: {
      theme: defineThemeVariant({
        default: "",
        shibuya: "bg-muted border-none shadow-none",
      }),
    },
    defaultVariants: {
      theme: "default",
    },
  },
);

const DashboardCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof dashboardCardVariants>
>(({ className, theme: themeProp, ...props }, ref) => {
  const resolvedTheme = useResolvedTheme(themeProp ?? undefined);
  return (
    <div
      ref={ref}
      data-slot="dashboard-card"
      className={cn(
        dashboardCardVariants({ theme: resolvedTheme }),
        className,
      )}
      {...props}
    />
  );
});
DashboardCard.displayName = "DashboardCard";

/* ------------------------------------------------------------------ */
/*  DashboardCardHeader                                                */
/* ------------------------------------------------------------------ */

const dashboardCardHeaderVariants = cva(
  "flex flex-row items-start justify-between gap-4",
  {
    variants: {
      theme: defineThemeVariant({
        default: "py-3 px-3",
        shibuya: "py-1.5 px-3 text-muted-foreground",
      }),
    },
    defaultVariants: {
      theme: "default",
    },
  },
);

const DashboardCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const resolvedTheme = useResolvedTheme();
  return (
    <div
      ref={ref}
      data-slot="dashboard-card-header"
      className={cn(
        dashboardCardHeaderVariants({ theme: resolvedTheme }),
        className,
      )}
      {...props}
    />
  );
});
DashboardCardHeader.displayName = "DashboardCardHeader";

/* ------------------------------------------------------------------ */
/*  DashboardCardTitle                                                 */
/* ------------------------------------------------------------------ */
const dashboardCardTitleVariants = cva("text-sm font-semibold leading-none", {
  variants: {
    theme: defineThemeVariant({
      default: "tracking-tight",
      shibuya: "tracking-wide",
    }),
  },
  defaultVariants: {
    theme: "default",
  },
});

const DashboardCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const theme = useResolvedTheme();
  return (
    <h3
      ref={ref}
      data-slot="dashboard-card-title"
      className={cn(dashboardCardTitleVariants({ theme }), className)}
      {...props}
    />
  );
});
DashboardCardTitle.displayName = "DashboardCardTitle";

/* ------------------------------------------------------------------ */
/*  DashboardCardDescription                                           */
/* ------------------------------------------------------------------ */

const DashboardCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="dashboard-card-description"
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
));
DashboardCardDescription.displayName = "DashboardCardDescription";

/* ------------------------------------------------------------------ */
/*  DashboardCardAction                                                */
/* ------------------------------------------------------------------ */

const DashboardCardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dashboard-card-action"
    className={cn("ml-auto shrink-0", className)}
    {...props}
  />
));
DashboardCardAction.displayName = "DashboardCardAction";

/* ------------------------------------------------------------------ */
/*  DashboardCardContent                                               */
/* ------------------------------------------------------------------ */
const dashboardCardContentVariants = cva("p-3", {
  variants: {
    theme: defineThemeVariant({
      default: "",
      shibuya: "bg-card rounded-xl shadow-xs",
    }),
  },
  defaultVariants: {
    theme: "default",
  },
});
const DashboardCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const resolvedTheme = useResolvedTheme();
  return (
    <div
      ref={ref}
      data-slot="dashboard-card-content"
      className={cn(
        dashboardCardContentVariants({ theme: resolvedTheme }),
        className,
      )}
      {...props}
    />
  );
});
DashboardCardContent.displayName = "DashboardCardContent";

/* ------------------------------------------------------------------ */
/*  DashboardCardFooter                                                */
/* ------------------------------------------------------------------ */

const DashboardCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dashboard-card-footer"
    className={cn("flex items-center py-1.5 px-3", className)}
    {...props}
  />
));
DashboardCardFooter.displayName = "DashboardCardFooter";

/* ------------------------------------------------------------------ */
/*  DashboardCardSkeleton                                              */
/* ------------------------------------------------------------------ */

function DashboardCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-slot="dashboard-card-skeleton"
      className={cn(
        "rounded-lg border bg-dashboard-card border-dashboard-card-border shadow-sm p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 pb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DashboardCardPreset                                                */
/* ------------------------------------------------------------------ */

interface DashboardCardPresetProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof dashboardCardVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

function DashboardCardPreset({
  title,
  description,
  actions,
  footer,
  children,
  headerClassName,
  contentClassName,
  footerClassName,
  className,
  ...props
}: DashboardCardPresetProps) {
  const hasHeader = title || description || actions;
  return (
    <DashboardCard className={className} {...props}>
      {hasHeader && (
        <DashboardCardHeader className={headerClassName}>
          {(title || description) && (
            <div>
              {title && <DashboardCardTitle>{title}</DashboardCardTitle>}
              {description && (
                <DashboardCardDescription>
                  {description}
                </DashboardCardDescription>
              )}
            </div>
          )}
          {actions && <DashboardCardAction>{actions}</DashboardCardAction>}
        </DashboardCardHeader>
      )}
      {children && (
        <DashboardCardContent className={contentClassName}>
          {children}
        </DashboardCardContent>
      )}
      {footer && (
        <DashboardCardFooter className={footerClassName}>
          {footer}
        </DashboardCardFooter>
      )}
    </DashboardCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardAction,
  DashboardCardContent,
  DashboardCardFooter,
  DashboardCardSkeleton,
  DashboardCardPreset,
  dashboardCardVariants,
};
