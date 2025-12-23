import { useQuery } from "@tanstack/react-query";
import type { SchemaRecord } from "@/app/api/bigquery/schemas/route";

export function useBigQuerySchemas(databaseName?: string) {
  return useQuery<SchemaRecord[]>({
    queryKey: ["bigquery-schemas", databaseName],
    queryFn: async () => {
      if (!databaseName) {
        return [];
      }

      const response = await fetch(
        `/api/bigquery/schemas?database=${encodeURIComponent(databaseName)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schemas");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!databaseName,
  });
}
