'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useGoogleAnalyticsStatus } from "@/hooks/use-google-analytics-status";

export function GoogleAnalyticsSetupAlert() {
  const { data, isLoading } = useGoogleAnalyticsStatus();

  if (isLoading || data?.isConfigured) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-2 py-4">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        Google Analytics Not Configured
      </AlertTitle>
      <AlertDescription className="text-base mt-1">
        Please configure Google Analytics to view this dashboard. Visit the{" "}
        <Link href="/home" className="underline font-semibold hover:no-underline">
          Setup page
        </Link>{" "}
        to get started.
      </AlertDescription>
    </Alert>
  );
}
