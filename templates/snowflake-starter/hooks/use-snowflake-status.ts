import { useQuery } from "@tanstack/react-query";
import type { SnowflakeStatusResponse } from "@/app/api/snowflake/status/route";

async function fetchSnowflakeStatus(): Promise<SnowflakeStatusResponse> {
  const response = await fetch("/api/snowflake/status");
  if (!response.ok) {
    throw new Error("Failed to fetch Snowflake status");
  }
  return response.json();
}

export function useSnowflakeStatus() {
  return useQuery({
    queryKey: ["snowflake-status"],
    queryFn: fetchSnowflakeStatus,
  });
}
