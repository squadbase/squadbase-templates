"use client";

import { useIsBigQuerySetupComplete } from "@/app/components/connection-status";
import { DatabaseExplorer } from "@/app/components/database-explorer";

export function DatabaseExplorerSection() {
  const { isLoading, isConnected } = useIsBigQuerySetupComplete();

  if (isLoading) {
    return (
      <div className="h-48 bg-muted rounded-lg animate-pulse" />
    );
  }

  // Only show Database Explorer when BigQuery is connected
  if (!isConnected) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-6 md:p-8">
      {/* Database Explorer Section Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Database Explorer
          </h2>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Navigate through your BigQuery databases and drill down into schemas, tables, and views.
          Click on any database to expand and explore its contents.
        </p>
      </div>

      <DatabaseExplorer />
    </div>
  );
}
