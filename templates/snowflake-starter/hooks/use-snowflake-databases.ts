"use client";

import { useQuery } from "@tanstack/react-query";
import type { SnowflakeDatabaseRecord } from "@/app/api/snowflake/databases/route";

interface SnowflakeDatabasesResponse {
  data: SnowflakeDatabaseRecord[];
}

async function fetchSnowflakeDatabases(): Promise<SnowflakeDatabaseRecord[]> {
  const response = await fetch("/api/snowflake/databases");

  if (!response.ok) {
    throw new Error("データベース一覧の取得に失敗しました");
  }

  const result: SnowflakeDatabasesResponse = await response.json();
  return result.data;
}

export function useSnowflakeDatabases() {
  return useQuery({
    queryKey: ["snowflake-databases"],
    queryFn: fetchSnowflakeDatabases,
  });
}
