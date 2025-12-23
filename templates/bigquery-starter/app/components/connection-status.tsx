"use client";

import { useBigQueryStatus } from "@/hooks/use-bigquery-status";
import { useBigQueryDatabases } from "@/hooks/use-bigquery-databases";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function ConnectionStatus() {
  const { data: status, isLoading: isStatusLoading } = useBigQueryStatus();
  const { data: databases, isLoading: isDatabasesLoading, error } = useBigQueryDatabases();

  const isLoading = isStatusLoading || (status?.configured && isDatabasesLoading);

  if (isLoading) {
    return (
      <div className="h-20 bg-muted rounded-lg animate-pulse" />
    );
  }

  // Check if environment variables are not configured
  if (!status?.configured) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-lg bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                Setup Required
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                BigQuery connection is not configured. Run <span className="px-2 py-0.5 bg-destructive/10 rounded text-destructive font-mono text-sm font-semibold">Setup BigQuery</span> to create a connection and get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Environment variables are configured but connection failed
  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-lg bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                Connection Error
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Failed to connect to BigQuery. Please check your connection settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-6">
      <Card className="border-2 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-50">
                ✅ BigQuery Connected
              </p>
              <p className="text-sm text-green-700 dark:text-green-200">
                Access to {databases?.length || 0} datasets
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export a hook to check if setup is complete (for conditional rendering in parent)
export function useIsBigQuerySetupComplete() {
  const { data: status, isLoading: isStatusLoading } = useBigQueryStatus();
  const { data: databases, isLoading: isDatabasesLoading, error } = useBigQueryDatabases();

  const isLoading = isStatusLoading || (status?.configured && isDatabasesLoading);
  const isConfigured = status?.configured ?? false;
  const isConnected = isConfigured && !error && databases !== undefined;

  return {
    isLoading,
    isConfigured,
    isConnected,
  };
}
