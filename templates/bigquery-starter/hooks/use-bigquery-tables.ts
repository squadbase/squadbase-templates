import { useQuery } from "@tanstack/react-query";
import type { TableRecord } from "@/app/api/bigquery/tables/route";

export function useBigQueryTables(databaseName?: string, schemaName?: string) {
  return useQuery<TableRecord[]>({
    queryKey: ["bigquery-tables", databaseName, schemaName],
    queryFn: async () => {
      if (!databaseName || !schemaName) {
        return [];
      }

      const response = await fetch(
        `/api/bigquery/tables?database=${encodeURIComponent(
          databaseName
        )}&schema=${encodeURIComponent(schemaName)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tables and views");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!databaseName && !!schemaName,
  });
}
