"use client";

import { useQuery } from "@tanstack/react-query";
import type { BigQueryDatabaseRecord } from "@/app/api/bigquery/databases/route";

interface BigQueryDatabasesResponse {
  data: BigQueryDatabaseRecord[];
}

async function fetchBigQueryDatabases(): Promise<BigQueryDatabaseRecord[]> {
  const response = await fetch("/api/bigquery/databases");

  if (!response.ok) {
    throw new Error("データセット一覧の取得に失敗しました");
  }

  const result: BigQueryDatabasesResponse = await response.json();
  return result.data;
}

export function useBigQueryDatabases() {
  return useQuery({
    queryKey: ["bigquery-databases"],
    queryFn: fetchBigQueryDatabases,
  });
}
