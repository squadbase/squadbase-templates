import { useQuery } from "@tanstack/react-query";
import type { BigQueryStatusResponse } from "@/app/api/bigquery/status/route";

async function fetchBigQueryStatus(): Promise<BigQueryStatusResponse> {
  const response = await fetch("/api/bigquery/status");
  if (!response.ok) {
    throw new Error("Failed to fetch BigQuery status");
  }
  return response.json();
}

export function useBigQueryStatus() {
  return useQuery({
    queryKey: ["bigquery-status"],
    queryFn: fetchBigQueryStatus,
  });
}
